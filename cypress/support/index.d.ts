export { };

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

interface CheckApiOptions {
  allowed?: HttpMethod[];
  allowEmptyPost?: boolean;
}

declare global {
  namespace Cypress {
    interface Chainable {
      health(): Chainable<void>;

      checkApi(
        route: string,
        options?: CheckApiOptions
      ): Chainable<void>;

      login(email: string, password: string): Chainable<void>;

      signup(
        first: string,
        last: string,
        email: string,
        password: string
      ): Chainable<void>;

      apiRequestWithCsrf<T = unknown>(
        options: Partial<Cypress.RequestOptions>
      ): Chainable<Cypress.Response<T>>;
    }
  }
}
