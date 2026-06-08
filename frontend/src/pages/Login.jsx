import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { User, Lock, LogIn } from "lucide-react";
import Logo from "../components/Logo";
import InputField from "../components/InputField";
import { loginUser } from "../services/api";

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({ username: "", password: "" });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!form.username.trim()) newErrors.username = "Username is required";
    if (!form.password) newErrors.password = "Password is required";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await loginUser(form.username, form.password);

      if (res.data.success) {
        toast.success("Welcome back!", {
          style: {
            borderRadius: "8px",
            background: "#1e293b",
            color: "#f8fafc",
            fontSize: "14px",
          },
          iconTheme: { primary: "#6366f1", secondary: "#fff" },
        });
        navigate("/dashboard");
      }
    } catch (error) {
      const message =
        error.response?.data?.message || "Invalid username or password";
      toast.error(message, {
        style: {
          borderRadius: "8px",
          background: "#1e293b",
          color: "#f8fafc",
          fontSize: "14px",
        },
        iconTheme: { primary: "#ef4444", secondary: "#fff" },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4 py-12">
      {/* Top accent bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-indigo-600" />

      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 px-8 py-10 sm:px-10 sm:py-12">
          {/* Header */}
          <div className="flex flex-col items-center text-center mb-8">
            <Logo size="md" />
            <h1 className="mt-5 text-xl font-bold text-slate-900 tracking-tight">
              TDC Matchmaker Dashboard
            </h1>
            <p className="mt-1.5 text-sm text-slate-500">
              Internal Matchmaker Portal
            </p>
          </div>

          <div className="border-t border-slate-100 mb-8" />

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <InputField
              id="username"
              label="Username"
              type="text"
              value={form.username}
              onChange={handleChange("username")}
              placeholder="Enter your username"
              icon={User}
              error={errors.username}
              autoComplete="username"
            />

            <InputField
              id="password"
              label="Password"
              type="password"
              value={form.password}
              onChange={handleChange("password")}
              placeholder="Enter your password"
              icon={Lock}
              error={errors.password}
              autoComplete="current-password"
            />

            <button
              id="sign-in-button"
              type="submit"
              disabled={isSubmitting}
              className={`
                w-full flex items-center justify-center gap-2 rounded-lg px-4 py-2.5
                text-sm font-semibold text-white
                bg-indigo-600 hover:bg-indigo-700
                focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:ring-offset-2
                transition-colors duration-150
                ${isSubmitting ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}
              `}
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing in…
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4" />
                  Sign In
                </>
              )}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} TDC Matchmaker · All rights reserved
        </p>
      </div>
    </div>
  );
}
