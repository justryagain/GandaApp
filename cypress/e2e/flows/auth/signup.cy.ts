describe("Auth: Signup Flow", () => {
  const signupUrl = "/api/auth/signup";

  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();

    const email = `test+${Cypress._.random(1e6)}@test.com`;
    const password = "Password123!";

    cy.wrap(email, { log: false }).as("email");
    cy.wrap(password, { log: false }).as("password");

    cy.task("deleteFirebaseUser", email);

    cy.request("/api/test/csrf").then((res) => {
      cy.setCookie("csrf", res.body.csrf);
      cy.wrap(res.body.csrf).as("csrfToken");
    });
  });

  afterEach(() => {
    cy.get<string>("@email").then((email) =>
      cy.task("deleteFirebaseUser", email)
    );
    cy.clearCookies();
    cy.clearLocalStorage();
  });

  // --- Helpers ---
  const signupUser = (overrides: Partial<Record<string, string>> = {}) => {
    return cy.get<string>("@csrfToken").then((csrf) =>
      cy.get<string>("@email").then((email) =>
        cy.get<string>("@password").then((pwd) =>
          cy.request({
            log: false,
            method: "POST",
            url: signupUrl,
            failOnStatusCode: false,
            form: true,
            body: {
              first: "Test",
              last: "User",
              email,
              password: pwd,
              confirm: pwd,
              _csrf: csrf,
              ...overrides,
            },
          })
        )
      )
    );
  };

  // --- Tests ---
  describe("failure paths", () => {
    it("rejects invalid CSRF with 400", () => {
      signupUser({ _csrf: "force-bad" })
        .its("status")
        .should("eq", 400);
    });

    it("rejects missing fields with 422", () => {
      signupUser({ first: "", last: "", email: "", password: "", confirm: "" })
        .its("status")
        .should("eq", 422);
    });

    it("rejects weak password with 422", () => {
      signupUser({ password: "weakpass", confirm: "weakpass" })
        .its("status")
        .should("eq", 422);
    });

    it("rejects mismatched passwords with 422", () => {
      signupUser({ confirm: "Mismatch123!" })
        .its("status")
        .should("eq", 422);
    });

    it("rejects duplicate email with 409", () => {
      signupUser().its("status").should("eq", 201);
      signupUser().its("status").should("eq", 409);
    });
  });

  describe("happy paths", () => {
    it("creates a new account with 201", () => {
      signupUser().its("status").should("eq", 201);
    });
  });
});
