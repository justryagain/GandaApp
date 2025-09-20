describe("Auth: Login Flow", () => {
  const signupUrl = "/api/auth/signup";
  const loginUrl = "/api/auth/login";
  const AUTH_COOKIE = "__session";

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
  const createUser = () =>
    cy.get<string>("@csrfToken").then((csrf) =>
      cy.get<string>("@email").then((email) =>
        cy.get<string>("@password").then((pwd) =>
          cy.request({
            log: false,
            method: "POST",
            url: signupUrl,
            form: true,
            body: {
              first: "Test",
              last: "User",
              email,
              password: pwd,
              confirm: pwd,
              _csrf: csrf,
            },
          })
        )
      )
    );

  const loginUser = (overrides: Partial<Record<string, string>> = {}) =>
    cy.get<string>("@csrfToken").then((csrf) =>
      cy.get<string>("@email").then((email) =>
        cy.get<string>("@password").then((pwd) =>
          cy.request({
            log: false,
            method: "POST",
            url: loginUrl,
            failOnStatusCode: false,
            form: true,
            body: {
              email,
              password: pwd,
              _csrf: csrf,
              ...overrides,
            },
          })
        )
      )
    );

  // --- Tests ---
  describe("failure paths", () => {
    it("rejects invalid CSRF with 400", () => {
      loginUser({ _csrf: "force-bad" })
        .its("status")
        .should("eq", 400);
    });

    it("rejects missing fields with 422", () => {
      loginUser({ email: "", password: "" })
        .its("status")
        .should("eq", 422);
    });

    it("rejects bad email format with 422", () => {
      loginUser({ email: "user@bad" })
        .its("status")
        .should("eq", 422);
    });

    it("rejects non-existent user with 401", () => {
      loginUser().its("status").should("eq", 401);
    });

    it("rejects wrong password with 401", () => {
      createUser().its("status").should("eq", 201);
      loginUser({ password: "WrongPass123!" })
        .its("status")
        .should("eq", 401);
    });
  });

  describe("happy paths", () => {
    it("logs in successfully with 200 and sets cookie", () => {
      createUser().its("status").should("eq", 201);
      loginUser().then((resp) => {
        expect(resp.status).to.eq(200);

        const setCookie = resp.headers["set-cookie"] || [];
        const cookieStr = Array.isArray(setCookie)
          ? setCookie.join(";")
          : String(setCookie || "");
        expect(cookieStr).to.include(`${AUTH_COOKIE}=`);

        cy.getCookie(AUTH_COOKIE).should("exist");
      });
    });

    it("accepts case-insensitive email with 200", () => {
      createUser().its("status").should("eq", 201);
      cy.get<string>("@email").then((email) => {
        loginUser({ email: email.toUpperCase() })
          .its("status")
          .should("eq", 200);
      });
    });
  });
});
