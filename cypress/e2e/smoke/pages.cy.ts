describe("Smoke: Core Pages", () => {
  it("Login page renders", () => {
    cy.request("/login").its("status").should("eq", 200);
    cy.visit("/login");
    cy.get("form.login").should("exist");
    cy.contains("Log In");
  });

  it("Signup page renders", () => {
    cy.request("/signup").its("status").should("eq", 200);
    cy.visit("/signup");
    cy.get("form.login").should("exist");
    cy.contains("Create Account");
  });

  it("Home redirects when not logged in", () => {
    cy.visit("/home");
    cy.url().should("include", "/login");
  });

  it("Unknown route shows 404 page", () => {
    cy.request({ url: "/does-not-exist", failOnStatusCode: false })
      .its("status")
      .should("eq", 404);
  });
});
