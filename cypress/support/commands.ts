declare global {
  namespace Cypress {
    interface Chainable {
      health(): Chainable<void>;
      checkApi(route: string, options?: { allowEmptyPost?: boolean }): Chainable<void>;
      login(email: string, password: string): Chainable<void>;
      signup(first: string, last: string, email: string, password: string): Chainable<void>;
      apiRequestWithCsrf<T = any>(options: Partial<Cypress.RequestOptions>): Chainable<Cypress.Response<T>>;
    }
  }
}

Cypress.Commands.add("checkApi", (
  route: string,
  options?: {
    allowed?: Array<"GET" | "POST" | "PUT" | "DELETE" | "PATCH">;
    allowEmptyPost?: boolean;
  }
) => {
  const allMethods: Array<"GET" | "POST" | "PUT" | "DELETE" | "PATCH"> = [
    "GET", "POST", "PUT", "DELETE", "PATCH",
  ];

  const allowed = options?.allowed ?? [];
  const forbidden = allMethods.filter((m) => !allowed.includes(m));

  // ✅ Check allowed verbs
  allowed.forEach((method) => {
    cy.request({ method, url: route, failOnStatusCode: false, body: {} })
      .its("status")
      .should((status) => {
        if (method === "GET") expect(status).to.eq(200);

        else if (method === "POST" && !options?.allowEmptyPost) {
          expect(status).to.eq(400);
        }
        else {
          expect(status).to.not.eq(405);
        }
      });
  });

  forbidden.forEach((method) => {
    cy.request({ method, url: route, failOnStatusCode: false, body: {} })
      .its("status")
      .should("eq", 405);
  });
});

Cypress.Commands.add("login", (email: string, password: string) => {
  cy.visit("/login");
  cy.get("#login__email").type(email);
  cy.get("#login__password").type(password);
  cy.get("form").submit();
});

Cypress.Commands.add("signup", (first: string, last: string, email: string, password: string) => {
  cy.visit("/signup");
  cy.get("#signup__first").type(first);
  cy.get("#signup__last").type(last);
  cy.get("#signup__email").type(email);
  cy.get("#signup__password").type(password);
  cy.get("#signup__confirm").type(password);
  cy.get("form").submit();
});

export { };
