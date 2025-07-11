import {LATEST_API_VERSION} from '@shopify/shopify-api';

import {
  TEST_SHOP,
  TEST_SHOP_NAME,
  getThrownResponse,
  setUpEmbeddedFlow,
  mockGraphqlRequest,
} from '../../../../__test-helpers';
import * as redirect from '../../helpers/redirect-to-install-page';

import * as responses from './mock-responses';

it('scopes api is available without any future flags', async () => {
  // GIVEN & WHEN
  const {scopes} = await setUpEmbeddedFlow();

  // THEN
  expect(scopes).toBeDefined();
});

it('when scopes are empty the request is not redirected', async () => {
  // GIVEN
  const {scopes} = await setUpEmbeddedFlow();
  const spyRedirect = jest.spyOn(redirect, 'redirectToInstallPage');

  // WHEN
  const response = await scopes.request([]);

  // THEN
  expect(response).toBeUndefined();
  expect(spyRedirect).not.toHaveBeenCalled();
});

it('when all the scopes are already granted the request is not redirected', async () => {
  // GIVEN
  const {scopes} = await setUpEmbeddedFlow();
  const spyRedirect = jest.spyOn(redirect, 'redirectToInstallPage');
  await mockGraphqlRequest()({
    status: 200,
    responseContent: responses.WITH_GRANTED_AND_DECLARED,
  });

  // WHEN
  const response = await scopes.request(['read_orders', 'write_customers']);

  // THEN
  expect(response).toBeUndefined();
  expect(spyRedirect).not.toHaveBeenCalled();
});

it('when the shop is invalid the query to check the granted scopes returns an error', async () => {
  // GIVEN
  const {scopes, session} = await setUpEmbeddedFlow();
  session.shop = `${TEST_SHOP_NAME}.invalid-domain.com`;
  await mockGraphqlRequest(
    LATEST_API_VERSION,
    session.shop,
  )({
    status: 400,
    responseContent: responses.WITH_GRANTED_AND_DECLARED,
  });

  // WHEN / THEN
  await expect(scopes.request(['write_products'])).rejects.toEqual(
    expect.objectContaining({
      status: 400,
    }),
  );
});

describe('request from an embedded app', () => {
  it('redirects to install URL when successful', async () => {
    // GIVEN
    const {scopes, request} = await setUpEmbeddedFlow();
    await mockGraphqlRequest()({
      status: 200,
      responseContent: responses.WITH_GRANTED_AND_DECLARED,
    });

    // WHEN
    const response = await getThrownResponse(
      async () =>
        scopes.request(['write_products', 'read_orders', 'write_customers']),
      request,
    );

    // THEN
    expect(response.status).toEqual(401);
    const reuthorizeHeader = response.headers.get(
      'x-shopify-api-request-failure-reauthorize-url',
    );
    expect(reuthorizeHeader).not.toBeUndefined();
    const location = new URL(reuthorizeHeader!);
    expect(location.hostname).toBe(TEST_SHOP);
    expect(location.pathname).toBe('/admin/oauth/install');
    const locationParams = location.searchParams;
    expect(locationParams.get('optional_scopes')).toBe(
      'write_products,read_orders,write_customers',
    );
  });
});
