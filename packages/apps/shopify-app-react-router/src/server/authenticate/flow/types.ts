import {Session} from '@shopify/shopify-api';

import type {AdminApiContext} from '../../clients';

export interface FlowContext {
  /**
   * A session with an offline token for the shop.
   *
   * Returned only if there is a session for the shop.
   *
   * @example
   * <caption>Shopify session for the Flow request.</caption>
   * <description>Use the session associated with this request.</description>
   * ```ts
   * // /app/routes/flow.tsx
   * import { ActionFunctionArgs } from "react-router";
   * import { authenticate } from "../shopify.server";
   *
   * export const action = async ({ request }: ActionFunctionArgs) => {
   *   const { session, admin } = await authenticate.flow(request);
   *
   *   console.log(session.id)
   *
   *   return new Response();
   * };
   * ```
   */
  session: Session;

  /**
   * The payload from the Flow request.
   *
   * @example
   * <caption>Flow payload.</caption>
   * <description>Get the request's POST payload.</description>
   * ```ts
   * // /app/routes/flow.tsx
   * import { ActionFunctionArgs } from "react-router";
   * import { authenticate } from "../shopify.server";
   *
   * export const action = async ({ request }: ActionFunctionArgs) => {
   *   const { payload } = await authenticate.flow(request);
   *   return new Response();
   * };
   * ```
   */
  payload: any;

  /**
   * An admin context for the Flow request.
   *
   * Returned only if there is a session for the shop.
   *
   * @example
   * <caption>Flow admin context.</caption>
   * <description>Use the `admin` object in the context to interact with the Admin API.</description>
   * ```ts
   * // /app/routes/flow.tsx
   * import { ActionFunctionArgs } from "react-router";
   * import { authenticate } from "../shopify.server";
   *
   * export async function action({ request }: ActionFunctionArgs) {
   *   const { admin } = await authenticate.flow(request);
   *
   *   const response = await admin?.graphql(
   *     `#graphql
   *     mutation populateProduct($input: ProductInput!) {
   *       productCreate(input: $input) {
   *         product {
   *           id
   *         }
   *       }
   *     }`,
   *     { variables: { input: { title: "Product Name" } } }
   *   );
   *
   *   const productData = await response.json();
   *   return ({ data: productData.data });
   * }
   * ```
   */
  admin: AdminApiContext;
}

export type AuthenticateFlow = (request: Request) => Promise<FlowContext>;
