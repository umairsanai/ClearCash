import { useEffect, useState, type FormEvent } from "react";
import validator from "validator";
import { api } from "../api";
import { useUser } from "../context";
import { navigate } from "../router";
import logoUrl from "../../assets/logo.png";

type AuthMode = "login" | "signup";

function GoogleLoginButton() {
  function startGoogleLogin() {
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/google/login`;
  }

  return (
    <button
      type="button"
      className="google-login-btn"
      onClick={startGoogleLogin}
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 262">
        <path
          fill="#4285F4"
          d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622 38.755 30.023 2.685.268c24.659-22.774 38.875-56.282 38.875-96.027"
        />
        <path
          fill="#34A853"
          d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055-34.523 0-63.824-22.773-74.269-54.25l-1.531.13-40.298 31.187-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1"
        />
        <path
          fill="#FBBC05"
          d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82 0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602l42.356-32.782"
        />
        <path
          fill="#EB4335"
          d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0 79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251"
        />
      </svg>
      <span>Login with Google</span>
    </button>
  );
}

export function AuthPage() {
  const { user, refreshUser } = useUser();
  const [mode, setMode] = useState<AuthMode>("login");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  useEffect(() => {
    if (user) navigate("/");
  }, [user]);

  function switchMode() {
    setMode((currentMode) => (currentMode === "login" ? "signup" : "login"));
    setError("");
    setMessage("");
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");
    setMessage("");

    const formData = new FormData(event.currentTarget);
    const getValue = (name: string) => String(formData.get(name) ?? "").trim();
    const password = String(formData.get("password") ?? "");

    try {
      if (!password) throw new Error("Password is required.");

      if (mode === "login") {
        const username = getValue("username");
        if (!username) throw new Error("Username is required.");

        await api.login(username, password);
        await refreshUser();
        setMessage("Looks good. Redirecting...");
        navigate("/");
        return;
      }

      const name = getValue("name");
      const email = getValue("email");
      const username = getValue("username");
      const phone = getValue("phone");

      if (!name) throw new Error("Full name is required.");
      if (!validator.isEmail(email))
        throw new Error("Please enter a valid email address.");
      if (!username) throw new Error("Username is required.");
      if (phone.replace(/\D/g, "").length < 11)
        throw new Error("Phone number looks too short.");
      if (password.length < 6)
        throw new Error("Password should be at least 6 characters.");

      await api.signup({ name, email, username, phone, password });
      await refreshUser();
      setMessage("Account created. Redirecting...");
      navigate("/");
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "We couldn't complete that request. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const isLogin = mode === "login";
  const submitLabel = isSubmitting
    ? isLogin
      ? "Signing in..."
      : "Creating account..."
    : isLogin
      ? "Login"
      : "Sign up";

  return (
    <div className="auth-shell">
      <header className="auth-header">
        <nav className="header-nav">
          <div className="header-logo">
            <img
              className="logo-icon"
              src={logoUrl}
              alt="ClearCash logo"
            />
            <h1 id="app-name">ClearCash</h1>
          </div>
          <div className="header-cta">
            <button
              type="button"
              className="ghost-link"
              onClick={() => navigate("/")}
            >
              Go to app
            </button>
          </div>
        </nav>
      </header>

      <main className="auth-main">
        <section className="auth-card" aria-labelledby="auth-title">
          <div className="auth-card-header">
            <p className="chip">{isLogin ? "Welcome back" : "Start now"}</p>
            <h2 id="auth-title">{isLogin ? "Login" : "Create account"}</h2>
            <p className="subtitle">
              {isLogin
                ? "Use your ClearCash username and password."
                : "Set up your ClearCash account in minutes."}
            </p>
          </div>

          <form onSubmit={(event) => void submit(event)} noValidate>
            <div className="auth-fields">
              {!isLogin && (
                <>
                  <div className="form-group">
                    <label htmlFor="signup-name">Full name</label>
                    <input
                      id="signup-name"
                      name="name"
                      autoComplete="name"
                      placeholder="Jane Doe"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="signup-email">Email</label>
                    <input
                      id="signup-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      placeholder="jane@email.com"
                      required
                    />
                  </div>
                </>
              )}
              <div className="form-group">
                <label htmlFor="auth-username">Username</label>
                <input
                  id="auth-username"
                  name="username"
                  autoComplete="username"
                  placeholder={isLogin ? "Username" : "janedoe"}
                  required
                />
              </div>
              {!isLogin && (
                <div className="form-group">
                  <label htmlFor="signup-phone">Phone number</label>
                  <input
                    id="signup-phone"
                    name="phone"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="0300 1234567"
                    required
                  />
                </div>
              )}
              <div className="form-group">
                <label htmlFor="auth-password">Password</label>
                <div className="password-field">
                  <input
                    id="auth-password"
                    name="password"
                    type={isPasswordVisible ? "text" : "password"}
                    autoComplete={isLogin ? "current-password" : "new-password"}
                    placeholder={
                      isLogin ? "Enter your password" : "Create a password"
                    }
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    aria-label="Toggle password visibility"
                    onClick={() => setIsPasswordVisible((current) => !current)}
                  >
                    <i
                      className={`fas fa-eye${isPasswordVisible ? "-slash" : ""}`}
                    />
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className={`primary-btn${isSubmitting ? " is-loading" : ""}`}
              disabled={isSubmitting}
            >
              <span className="btn-label">{submitLabel}</span>
              <span className="btn-spinner" aria-hidden="true" />
            </button>
            {error ? (
              <p className="form-message is-error" role="alert">
                {error}
              </p>
            ) : (
              <p
                className={`form-message${message ? " is-success" : ""}`}
                role="status"
              >
                {message}
              </p>
            )}
            <p className="switch-text">
              <span>{isLogin ? "New here?" : "Already have an account?"}</span>
              <button type="button" className="link-btn" onClick={switchMode}>
                {isLogin ? "Create an account" : "Back to login"}
              </button>
            </p>
            {isLogin && <GoogleLoginButton />}
          </form>
        </section>
      </main>
    </div>
  );
}
