it("/api/test/csrf responds appropriately", () => {
  if (Cypress.env("APP_ENV") !== "test") {
    cy.request({ url: "/api/test/csrf", failOnStatusCode: false }).then((res) => {
      expect(res.status).to.eq(404);
      expect(res.body).to.have.property("error", "Not found");
    });
  } else {
    cy.request("/api/test/csrf").then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.have.property("csrf");
      expect(res.body.csrf).to.be.a("string").and.not.be.empty;
    });
  }
});
