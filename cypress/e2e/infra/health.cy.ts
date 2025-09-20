describe("Health", () => {
  it("API responds ok", () => {
    cy.health();
  });
});