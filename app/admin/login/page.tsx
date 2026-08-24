"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

export default function AdminLoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          identifier,
          password,
          remember,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(
          data.message || "Invalid username/email or password."
        );
        setLoading(false);
        return;
      }

      window.location.href = "/admin";
    } catch (error) {
      console.error("Login error:", error);

      setError(
        "Unable to connect to the server. Please try again."
      );

      setLoading(false);
    }
  }

  return (
    <main className="admin-login-v2">
      {/* Background decoration */}
      <div className="login-v2-glow login-v2-glow-one" />
      <div className="login-v2-glow login-v2-glow-two" />

      <div className="login-v2-container">

        {/* =========================
            LEFT PANEL
        ========================= */}

        <section className="login-v2-showcase">

          <div className="showcase-top">
            <Link
              href="/"
              className="showcase-logo"
            >
              VB
            </Link>

            <span className="showcase-label">
              PRIVATE WORKSPACE
            </span>
          </div>

          <div className="showcase-content">

            <span className="showcase-eyebrow">
              VIVEK BHATT
            </span>

            <h1>
              Welcome
              <br />
              <span>back.</span>
            </h1>

            <p>
              Your portfolio command center is ready.
              Sign in to manage your projects, monitor
              visitor activity and keep your professional
              presence up to date.
            </p>

            {/* Decorative visual */}

            <div className="login-visual">

              <div className="visual-circle circle-one" />
              <div className="visual-circle circle-two" />
              <div className="visual-circle circle-three" />

              <div className="visual-core">
                <span>VB</span>
              </div>

              <div className="visual-tag visual-tag-one">
                <span />
                PROJECTS
              </div>

              <div className="visual-tag visual-tag-two">
                <span />
                ANALYTICS
              </div>

              <div className="visual-tag visual-tag-three">
                <span />
                PORTFOLIO
              </div>

            </div>

          </div>

          <div className="showcase-footer">
            <span>
              © 2026 Vivek Bhatt
            </span>

            <span>
              DATA ANALYST • DEVELOPER
            </span>
          </div>

        </section>

        {/* =========================
            RIGHT LOGIN PANEL
        ========================= */}

        <section className="login-v2-form-panel">

          <div className="login-v2-form-wrapper">

            <div className="login-form-heading">

              <div className="secure-badge">
                <span className="secure-dot" />
                SECURE ADMIN ACCESS
              </div>

              <h2>
                Sign in
              </h2>

              <p>
                Enter your credentials to continue
                to your private workspace.
              </p>

            </div>

            <form
              onSubmit={handleLogin}
              className="login-v2-form"
            >

              {/* Username / Email */}

              <div className="login-field">

                <label htmlFor="identifier">
                  Username or Email
                </label>

                <div className="login-input-wrap">

                  <span className="input-icon">
                    @
                  </span>

                  <input
                    id="identifier"
                    type="text"
                    value={identifier}
                    onChange={(event) =>
                      setIdentifier(event.target.value)
                    }
                    placeholder="Enter username or email"
                    autoComplete="username"
                    required
                  />

                </div>

              </div>

              {/* Password */}

              <div className="login-field">

                <div className="password-label-row">

                  <label htmlFor="password">
                    Password
                  </label>

                  <button
                    type="button"
                    className="forgot-button"
                    onClick={() =>
                      setError(
                        "Please contact the portfolio owner to reset the admin password."
                      )
                    }
                  >
                    Forgot password?
                  </button>

                </div>

                <div className="login-input-wrap">

                  <span className="input-icon">
                    ◆
                  </span>

                  <input
                    id="password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    value={password}
                    onChange={(event) =>
                      setPassword(event.target.value)
                    }
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    required
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() =>
                      setShowPassword(!showPassword)
                    }
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>

                </div>

              </div>

              {/* Remember */}

              <label className="remember-row">

                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(event) =>
                    setRemember(event.target.checked)
                  }
                />

                <span>
                  Remember me
                </span>

              </label>

              {/* Error */}

              {error && (
                <div className="login-v2-error">
                  <span>!</span>
                  <p>{error}</p>
                </div>
              )}

              {/* Submit */}

              <button
                type="submit"
                className="login-v2-submit"
                disabled={loading}
              >
                <span>
                  {loading
                    ? "Signing in..."
                    : "Sign in"}
                </span>

                {!loading && (
                  <span className="submit-arrow">
                    →
                  </span>
                )}
              </button>

            </form>

            {/* Security message */}

            <div className="login-security">

              <div className="security-icon">
                ✓
              </div>

              <div>
                <strong>
                  Private & Secure
                </strong>

                <span>
                  Your session is protected with
                  an HTTP-only secure cookie.
                </span>
              </div>

            </div>

            <Link
              href="/"
              className="login-back"
            >
              ← Return to portfolio
            </Link>

          </div>

        </section>

      </div>
    </main>
  );
}