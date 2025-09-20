"use client";

import { useRouter } from "next/navigation";
import Icon from "@/components/Icons";
import { useState } from "react";
import "@/styles/auth.css";

type SignupData = {
  first?: string;
  last?: string;
  email?: string;
};

export default function SignupForm({ signupData, csrf, error }: { signupData: SignupData; csrf: string;error?: string; }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

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

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    const res = await fetch("/api/auth/signup", {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      // Success → go to login page
      router.push("/login?checkEmail=1");
    } else {
      const { error } = await res.json();

      if (error === "Invalid CSRF token") router.push("/signup?e=csrf");
      else if (error === "Missing or invalid fields")
        router.push("/signup?e=invalid");
      else if (error === "Passwords do not match")
        router.push("/signup?e=nomatch");
      else if (error === "User already exists")
        router.push("/signup?e=exists");
      else if (error.includes("Password does not meet"))
        router.push("/signup?e=weak-password");
      else router.push("/signup?e=fail");
    }

    setLoading(false);
  }

  return (
    <main className="align">
      <div className="grid">
        {msg && (
          <p className="text--center" style={{ color: "#ffb3b3" }}>
            {msg}
          </p>
        )}

        <form
          onSubmit={handleSubmit}
          method="POST"
          action="/api/auth/signup"
          className="form login"
          autoComplete="off"
        >
          <h1 className="hidden">Create account</h1>

          <div className="form__field">
            <label htmlFor="signup__first">
              <Icon name="user" fontSize="small" className="text-gray-500" />	
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
              <Icon name="user" fontSize="small" className="text-gray-500" />
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
              <Icon name="email" fontSize="small" className="text-gray-500" />
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
              <Icon name="lock" fontSize="small" className="text-gray-500" />
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
              <Icon name="lock" fontSize="small" className="text-gray-500" />
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
          <Icon name="arrow-right" fontSize="small" className="text-gray-500" />
        </p>
      </div>
    </main>
  );
}
