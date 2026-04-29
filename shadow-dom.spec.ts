import { test, expect } from "@playwright/test";

test.describe("Shadow DOM Interactions", () => {
  test("automatically pierces open Shadow DOM roots to find and interact with elements", async ({
    page,
  }) => {
    await page.goto("/");

    // 1. Inject a Custom Web Component with an encapsulated Shadow DOM for testing
    await page.evaluate(() => {
      class CustomButton extends HTMLElement {
        constructor() {
          super();
          // Create an 'open' shadow root
          const shadow = this.attachShadow({ mode: "open" });
          shadow.innerHTML = `
            <div class="shadow-container">
              <button id="shadow-btn">Execute Shadow Action</button>
            </div>
          `;
        }
      }
      customElements.define("custom-button", CustomButton);
      document.body.appendChild(document.createElement("custom-button"));
    });

    // 2. Interact with the button INSIDE the Shadow DOM using standard locators!
    // Playwright natively crosses the shadow boundary without any extra syntax.
    const shadowButton = page.getByRole("button", {
      name: "Execute Shadow Action",
    });

    await expect(shadowButton).toBeVisible();
    await shadowButton.click();
  });
});
