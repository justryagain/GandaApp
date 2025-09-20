describe("Auth: Logout Flow", () => {
  const signupUrl = "/api/auth/signup";
  const loginUrl = "/api/auth/login";
  const logoutUrl = "/api/auth/logout";
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

  const loginUser = () =>
    cy.get<string>("@csrfToken").then((csrf) =>
      cy.get<string>("@email").then((email) =>
        cy.get<string>("@password").then((pwd) =>
          cy.request({
            log: false,
            method: "POST",
            url: loginUrl,
            form: true,
            body: { email, password: pwd, _csrf: csrf },
          })
        )
      )
    );

  const logoutUser = (overrides: Partial<Record<string, string>> = {}) =>
    cy.get<string>("@csrfToken").then((csrf) =>
      cy.request({
        log: false,
        method: "POST",
        url: logoutUrl,
        form: true,
        followRedirect: false,
        failOnStatusCode: false,
        body: { _csrf: csrf, ...overrides },
      })
    );

  // --- Tests ---
  describe("failure paths", () => {
    it("rejects invalid CSRF with 400", () => {
      logoutUser({ _csrf: "force-bad" })
        .its("status")
        .should("eq", 400);
    });
  });

  describe("happy paths", () => {
    it("logs out successfully with 200 and clears cookie", () => {
      createUser().its("status").should("eq", 201);
      loginUser().its("status").should("eq", 200);

      cy.getCookie(AUTH_COOKIE).should("exist");

      logoutUser().then((resp) => {
        expect(resp.status).to.eq(200);
        expect(resp.body).to.have.property("success", true);
      });

      cy.getCookie(AUTH_COOKIE).should("not.exist");
    });

    it("returns success even if no session cookie exists", () => {
      logoutUser().then((resp) => {
        expect(resp.status).to.eq(200);
        expect(resp.body).to.have.property("success", true);
      });

      cy.getCookie(AUTH_COOKIE).should("not.exist");
    });

    it("handles double logout gracefully", () => {
      createUser().its("status").should("eq", 201);
      loginUser().its("status").should("eq", 200);
      logoutUser().its("status").should("eq", 200);

      logoutUser().then((resp) => {
        expect(resp.status).to.eq(200);
        expect(resp.body).to.have.property("success", true);
      });

      cy.getCookie(AUTH_COOKIE).should("not.exist");
    });
  });
});
