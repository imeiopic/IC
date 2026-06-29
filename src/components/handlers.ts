// @ts-ignore - msw package not installed
import { graphql, http, HttpResponse } from "msw";

// 1. Create a linked GraphQL instance for your custom endpoint
const customGraphql = graphql.link("https://api.iopic.world/graphql");

export const handlers = [
  // Mock the invitation verification endpoint from Homepage.vue
  http.get("/api/verify-invitation", () => {
    return HttpResponse.json({ isValid: true });
  }),

  // 2. Mocking a GraphQL Query on the Custom Endpoint
  // Intercepts a query operation named "GetUserProfile" ONLY at the linked URL
  customGraphql.query("GetUserProfile", ({ query, variables }) => {
    // You return a standard GraphQL response shape: { data: { ... } }
    return HttpResponse.json({
      data: {
        user: {
          id: variables.userId || "default-id",
          name: "Vector Genesis",
          level: "Vector",
        },
      },
    });
  }),

  // 3. Mocking a GraphQL Mutation on the Custom Endpoint
  // Intercepts a mutation operation named "UpdateUserStatus" ONLY at the linked URL
  customGraphql.mutation("UpdateUserStatus", ({ query, variables }) => {
    return HttpResponse.json({
      data: {
        updateStatus: { success: true, newStatus: variables.status },
      },
    });
  }),
];
