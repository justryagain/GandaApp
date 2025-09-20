"use client";

import "@/styles/auth.css";
import { useState } from "react";
import Icon from "@/components/Icons";
import { notFound } from "next/navigation";

export default function LoginForm({
  csrf,
  error,
  checkEmail,
}: {
  csrf: string;
  error?: string;
  checkEmail?: string;
}) {

  const [errMessage, setErrMessage] = useState("");
  const [loading, setLoading] = useState(false);

  let errorMessage = "";
  switch (error) {
    case "csrf": errorMessage = "Session expired. Please try again."; break;
    case "invalid": errorMessage = "Please check your inputs."; break;
    case "creds": errorMessage = "Invalid email or password."; break;
    case "verify": errorMessage = "Please verify your email before signing in. We’ve sent a verification link to your inbox."; break;
  }

  const infoMessage = checkEmail === "1" ? "Almost there! Confirm your email to activate your account and sign in." : "";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrMessage("");

    const form = new FormData(e.currentTarget);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        body: form,
      });

      if (res.ok) {
        window.location.href = "/";
      } else {
        const data = await res.json();
        setErrMessage(data.message || "Login failed");
      }
    } catch (err) {
      console.error(err);
      setErrMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="align">
      <div className="grid">
        {errorMessage && (
          <p className="text--center" style={{ color: "#ffb3b3" }}>
            {errorMessage}
          </p>
        )}
        {infoMessage && (
          <p className="text--center" style={{ color: "#ffffff" }}>
            {infoMessage}
          </p>
        )}
        {errMessage && (
          <p className="text--center" style={{ color: "#ffb3b3" }}>
            {errMessage}
          </p>
        )}

        <form onSubmit={handleSubmit} className="form login" autoComplete="off">
          <div className="form__field">
            <label htmlFor="login__email">
              <Icon name="user" fontSize="small" className="text-gray-500" />
            </label>
            <input
              id="login__email"
              type="email"
              name="email"
              className="form__input"
              placeholder="Email"
              required
              autoComplete="username"
              maxLength={254}
            />
          </div>

          <div className="form__field">
            <label htmlFor="login__password">
              <Icon name="lock" fontSize="small" className="text-gray-500" />
              <span className="hidden">Password</span>
            </label>
            <input
              id="login__password"
              type="password"
              name="password"
              className="form__input"
              placeholder="Password"
              required
              autoComplete="current-password"
              maxLength={256}
            />
          </div>

          <input type="hidden" name="_csrf" value={csrf} />

          <div className="form__field">
            <input
              type="submit"
              value={loading ? "Logging in..." : "Log In"}
              disabled={loading}
            />
          </div>
        </form>

        <p className="text--center">
          Not a member? <a href="/signup">Sign up now</a>{" "}
          <Icon name="arrow-right" fontSize="small" className="text-gray-500" />
        </p>
      </div>
    </main>
  );
}