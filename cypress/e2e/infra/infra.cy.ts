describe("Infra: General checks", () => {
  const AUTH_ROUTES = [
    "/api/auth/login",
    "/api/auth/signup",
    "/api/auth/logout",
  ];

  // --- Security headers ---
  it("returns basic security headers", () => {
    cy.request("/").then((res) => {
      expect(res.headers).to.have.property("x-frame-options");
      expect(res.headers["x-frame-options"]).to.match(/DENY|SAMEORIGIN/);

      expect(res.headers).to.have.property("x-content-type-options");
      expect(res.headers["x-content-type-options"]).to.eq("nosniff");

      // optional: only warn if missing, don’t fail test
      if (res.headers["x-xss-protection"]) {
        expect(res.headers["x-xss-protection"]).to.match(/0|1/);
      }
    });
  });

  // --- 404 handler ---
  it("returns 404 on unknown route", () => {
    cy.request({
      url: "/this-route-should-not-exist",
      failOnStatusCode: false,
    }).its("status").should("eq", 404);
  });

  // --- Method safety on auth routes ---
  AUTH_ROUTES.forEach((route) => {
    it(`${route} rejects unexpected HTTP verbs`, () => {
      ["PUT", "PATCH", "DELETE"].forEach((method) => {
        cy.request({
          method,
          url: route,
          failOnStatusCode: false,
        }).its("status").should("eq", 405);
      });
    });
  });
});
