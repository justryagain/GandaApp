describe("Protected /home page", () => {
  const signupUrl = "/api/auth/signup";
  const loginUrl = "/api/auth/login";
  const homeUrl = "/home";
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
            method: "POST",
            url: loginUrl,
            form: true,
            body: { email, password: pwd, _csrf: csrf },
          })
        )
      )
    );

  // --- Tests ---
  it("redirects to /login if no cookie", () => {
    cy.visit(homeUrl, { failOnStatusCode: false });
    cy.url().should("include", "/login");
  });

  it("redirects to /login if cookie is invalid/expired", () => {
    cy.setCookie(AUTH_COOKIE, "fake-session", { path: "/" });
    cy.visit(homeUrl, { failOnStatusCode: false });
    cy.url().should("include", "/login");
  });

  it("loads successfully with valid session cookie", () => {
    createUser().its("status").should("eq", 201);
    loginUser().its("status").should("eq", 200);

    cy.getCookie(AUTH_COOKIE).should("exist");

    cy.visit(homeUrl);
    cy.contains("Welcome").should("exist");
  });
});
