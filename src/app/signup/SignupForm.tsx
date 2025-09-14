"use client";

import { useState } from "react";
import "../auth.css";

export default function SignupForm({ signupData, csrf, error }: { signupData: any; csrf: string;error?: string; }) {
  const [password, setPassword] = useState("");

  const validRules = {
    lowerCase: /[a-z]/.test(password),
    upperCase: /[A-Z]/.test(password),
    oneNumber: /\d/.test(password),
    charactersCount: password.length >= 8,
  };

  const msg =
    error === "csrf" ? "Session expired. Try again."
    : error === "invalid" ? "Please check your inputs."
    : error === "nomatch" ? "Passwords do not match."
    : error === "exists" ? "Account already exists or cannot be created."
    : null;

  return (
    <main className="align">
      <div className="grid">
        {msg && (
          <p className="text--center" style={{ color: "#ffb3b3" }}>
            {msg}
          </p>
        )}

        <form
          method="POST"
          action="/api/auth/signup"
          className="form login"
          autoComplete="off"
        >
          <h1 className="hidden">Create account</h1>

          <div className="form__field">
            <label htmlFor="signup__first">
              <svg className="icon" aria-hidden="true">
                <use xlinkHref="#icon-user" />
              </svg>
              <span className="hidden">First name</span>
            </label>
            <input
              id="signup__first"
              type="text"
              name="first"
              defaultValue={signupData.first || ""}
              className="form__input"
              placeholder="First name"
              required
              maxLength={80}
              autoComplete="given-name"
            />
          </div>

          <div className="form__field">
            <label htmlFor="signup__last">
              <svg className="icon" aria-hidden="true">
                <use xlinkHref="#icon-user" />
              </svg>
              <span className="hidden">Last name</span>
            </label>
            <input
              id="signup__last"
              type="text"
              name="last"
              defaultValue={signupData.last || ""}
              className="form__input"
              placeholder="Last name"
              required
              maxLength={80}
              autoComplete="family-name"
            />
          </div>

          <div className="form__field">
            <label htmlFor="signup__email">
              <svg className="icon" aria-hidden="true">
                <use xlinkHref="#icon-user" />
              </svg>
              <span className="hidden">Email</span>
            </label>
            <input
              id="signup__email"
              type="email"
              name="email"
              defaultValue={signupData.email || ""}
              className="form__input"
              placeholder="Email"
              required
              autoComplete="email"
              maxLength={254}
            />
          </div>

          {/* Password input */}
          <div className="form__field">
            <label htmlFor="signup__password">
              <svg className="icon" aria-hidden="true">
                <use xlinkHref="#icon-lock" />
              </svg>
              <span className="hidden">Password</span>
            </label>
            <input
              id="signup__password"
              type="password"
              name="password"
              className="form__input"
              placeholder="Password"
              required
              autoComplete="new-password"
              minLength={8}
              maxLength={256}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
		  
          {/* Confirm password */}
          <div className="form__field">
            <label htmlFor="signup__confirm">
              <svg className="icon" aria-hidden="true">
                <use xlinkHref="#icon-lock" />
              </svg>
              <span className="hidden">Confirm Password</span>
            </label>
            <input
              id="signup__confirm"
              type="password"
              name="confirm"
              className="form__input"
              placeholder="Confirm password"
              required
              autoComplete="new-password"
              minLength={8}
              maxLength={256}
            />
          </div>
		  
		  {/* Password validation rules */}
		  {password.length > 0 && (
		    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6 text-xs opacity-80 my-3">
			  <div className="flex items-center">
			    <div
				  className={`w-2 h-2 rounded-full mr-2 ${
				    validRules.upperCase ? "bg-green-500" : "bg-gray-400"
				  }`}
			    />
			    <span>Uppercase [A-Z]</span>
			  </div>

			  <div className="flex items-center">
			    <div
				  className={`w-2 h-2 rounded-full mr-2 ${
				    validRules.lowerCase ? "bg-green-500" : "bg-gray-400"
				  }`}
			    />
			    <span>Lowercase [a-z]</span>
			  </div>

			  <div className="flex items-center">
			    <div
				  className={`w-2 h-2 rounded-full mr-2 ${
				    validRules.oneNumber ? "bg-green-500" : "bg-gray-400"
				  }`}
			    />
			    <span>Number [0-9]</span>
			  </div>

			  <div className="flex items-center">
			    <div
				  className={`w-2 h-2 rounded-full mr-2 ${
				    validRules.charactersCount ? "bg-green-500" : "bg-gray-400"
				  }`}
			    />
			    <span>Length [+8]</span>
			  </div>
		    </div>
		  )}

          <input type="hidden" name="_csrf" value={csrf} />

          <div className="form__field">
            <input type="submit" value="Create Account" />
          </div>
        </form>

        <p className="text--center">
          Already have an account? <a href="/login">Sign in</a>{" "}
          <svg className="icon" aria-hidden="true">
            <use xlinkHref="#icon-arrow-right" />
          </svg>
        </p>
      </div>

      {/* inline SVG icons */}
      <svg xmlns="http://www.w3.org/2000/svg" className="icons" aria-hidden="true">
        <symbol id="icon-arrow-right" viewBox="0 0 1792 1792">
          <path d="M1600 960q0 54-37 91l-651 651q-39 37-91 37-51 0-90-37l-75-75q-38-38-38-91t38-91l293-293H245q-52 0-84.5-37.5T128 1024V896q0-53 32.5-90.5T245 768h704L656 474q-38-36-38-90t38-90l75-75q38-38 90-38 53 0 91 38l651 651q37 35 37 90z" />
        </symbol>
		<symbol id="icon-user" viewBox="0 0 1792 1792">
          <path d="M1600 1405q0 120-73 189.5t-194 69.5H459q-121 0-194-69.5T192 1405q0-53 3.5-103.5t14-109T236 1084t43-97.5 62-81 85.5-53.5T538 832q9 0 42 21.5t74.5 48 108 48T896 971t133.5-21.5 108-48 74.5-48 42-21.5q61 0 111.5 20t85.5 53.5 62 81 43 97.5 26.5 108.5 14 109 3.5 103.5zm-320-893q0 159-112.5 271.5T896 896 624.5 783.5 512 512t112.5-271.5T896 128t271.5 112.5T1280 512z" />
        </symbol>
        <symbol id="icon-lock" viewBox="0 0 1792 1792">
          <path d="M640 768h512V576q0-106-75-181t-181-75-181 75-75 181v192zm832 96v576q0 40-28 68t-68 28H416q-40 0-68-28t-28-68V864q-0-40 28-68t68-28h32V576q0-184 132-316t316-132 316 132 132 316v192h32q40 0 68 28t28 68z" />
        </symbol>
      </svg>
    </main>
  );
}
