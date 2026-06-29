import { test, expect } from "@playwright/test";

test.describe("WebSocket Interception", () => {
  test("mocks a WebSocket connection and responds to client messages", async ({
    page,
  }) => {
    // 1. Intercept the WebSocket connection BEFORE it is created
    await page.routeWebSocket("wss://mock-socket.iopic.world/stream", (ws) => {
      // Handle incoming messages from the browser (the client)
      ws.onMessage((message) => {
        console.log(`Received from client: ${message}`);

        if (message === "SYNC_REQUEST") {
          // Send a mocked response back to the browser
          ws.send(JSON.stringify({ status: "SYNC_COMPLETE", velocity: 8.09 }));
        }
      });
    });

    await page.goto("/");

    // 2. Simulate the frontend application connecting to the WebSocket
    await page.evaluate(() => {
      const socket = new WebSocket("wss://mock-socket.iopic.world/stream");

      socket.onopen = () => {
        socket.send("SYNC_REQUEST"); // Trigger the mock server we set up above
      };

      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.status === "SYNC_COMPLETE") {
          // Create a DOM element to signify successful WebSocket communication
          const div = document.createElement("div");
          div.id = "ws-status";
          div.innerText = `Velocity: ${data.velocity}V`;
          document.body.appendChild(div);
        }
      };
    });

    // 3. Verify the frontend correctly processed the mocked WebSocket message
    const statusElement = page.locator("#ws-status");
    await expect(statusElement).toHaveText("Velocity: 8.09V");
  });

  test("simulates a dropped WebSocket connection and verifies error handling", async ({
    page,
  }) => {
    // 1. Intercept the WebSocket connection
    await page.routeWebSocket("wss://mock-socket.iopic.world/stream", (ws) => {
      ws.onMessage((message) => {
        if (message === "SYNC_REQUEST") {
          // 2. Simulate a sudden server crash or connection drop by closing the socket
          ws.close();
        }
      });
    });

    await page.goto("/");

    // 3. Simulate the frontend application connecting and handling the sudden closure
    await page.evaluate(() => {
      const socket = new WebSocket("wss://mock-socket.iopic.world/stream");
      socket.onopen = () => socket.send("SYNC_REQUEST");

      socket.onclose = () => {
        // Simulate the frontend rendering an error state when the socket drops unexpectedly
        const div = document.createElement("div");
        div.id = "ws-error";
        div.innerText = "ERROR: Connection lost. Reconnecting...";
        document.body.appendChild(div);
      };
    });

    // 4. Verify the frontend successfully caught the drop and updated the UI
    const errorElement = page.locator("#ws-error");
    await expect(errorElement).toHaveText(
      "ERROR: Connection lost. Reconnecting...",
    );
  });

  test("mocks a GraphQL subscription over WebSockets", async ({ page }) => {
    // 1. Intercept the WebSocket connection for the GraphQL endpoint
    await page.routeWebSocket(
      "wss://graphql.iopic.world/subscriptions",
      (ws) => {
        ws.onMessage((message) => {
          const parsed = JSON.parse(message as string);

          // Handle the standard 'graphql-ws' protocol handshake
          if (parsed.type === "connection_init") {
            ws.send(JSON.stringify({ type: "connection_ack" }));
          }

          // Handle the actual subscription request
          if (parsed.type === "subscribe") {
            const subscriptionId = parsed.id;

            // Send the initial mocked data payload back to the client
            ws.send(
              JSON.stringify({
                id: subscriptionId,
                type: "next",
                payload: {
                  data: {
                    onSystemUpdate: {
                      velocity: 9.99,
                      status: "OVERDRIVE",
                    },
                  },
                },
              }),
            );
          }
        });
      },
    );

    await page.goto("/");

    // 2. Simulate the frontend initiating a GraphQL subscription
    await page.evaluate(() => {
      // Modern GraphQL clients use the 'graphql-transport-ws' sub-protocol
      const socket = new WebSocket(
        "wss://graphql.iopic.world/subscriptions",
        "graphql-transport-ws",
      );

      socket.onopen = () => {
        // 1. Send the initialization payload
        socket.send(JSON.stringify({ type: "connection_init" }));
      };

      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.type === "connection_ack") {
          // 2. Once acknowledged, send the actual GraphQL subscription query
          socket.send(
            JSON.stringify({
              id: "sub-1", // The client generates a unique ID for this active subscription
              type: "subscribe",
              payload: {
                query: "subscription { onSystemUpdate { velocity status } }",
              },
            }),
          );
        } else if (data.type === "next") {
          // 3. Receive the streamed data and render it to the DOM
          const div = document.createElement("div");
          div.id = "graphql-sub-result";
          div.innerText = `GQL Velocity: ${data.payload.data.onSystemUpdate.velocity}V`;
          document.body.appendChild(div);
        }
      };
    });

    // 3. Verify the frontend processed the mocked GraphQL subscription data
    const resultElement = page.locator("#graphql-sub-result");
    await expect(resultElement).toHaveText("GQL Velocity: 9.99V");
  });

  test("simulates a WebSocket connection error during initialization", async ({
    page,
  }) => {
    // 1. Intercept the connection and immediately close it with an error code
    await page.routeWebSocket("wss://mock-socket.iopic.world/error", (ws) => {
      // Closing immediately with a 1011 code simulates a server crashing or rejecting the handshake
      ws.close({ code: 1011, reason: "Internal Server Error" });
    });

    await page.goto("/");

    // 2. Simulate the frontend attempting to connect
    await page.evaluate(() => {
      const socket = new WebSocket("wss://mock-socket.iopic.world/error");

      socket.onerror = () => {
        const div = document.createElement("div");
        div.id = "ws-fail";
        div.innerText = "ERROR: Failed to establish WebSocket connection.";
        document.body.appendChild(div);
      };
    });

    // 3. Verify the frontend correctly triggered the onerror handler
    const failElement = page.locator("#ws-fail");
    await expect(failElement).toHaveText(
      "ERROR: Failed to establish WebSocket connection.",
    );
  });
});
