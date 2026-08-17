import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { loginUser } from "../../services/authService";
import { useAuth } from "../../context/AuthContext";
import logo from "../../assets/logo.svg";

type FormData = {
  email: string;
  password: string;
};

type FormErrors = {
  email: string;
  password: string;
};

export default function LoginPage() {
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<FormErrors>({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors: FormErrors = { email: "", password: "" };

    if (!formData.email.trim()) {
      newErrors.email = "Email Address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.values(newErrors).every((error) => error === "");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setServerError("");

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const data = await loginUser({
        email: formData.email,
        password: formData.password,
      });
      login(data.user, data.accessToken);
      navigate(`/dashboard/${data.user.role.toLowerCase()}`);
    } catch (error) {
      setServerError(
        error instanceof Error
          ? error.message
          : "An unexpected error occurred.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#003049] px-4 py-8">
      <div className="flex items-center gap-2 mb-8">
        <img src={logo} alt="WholesaleHub" className="w-10 h-10" />
        <span className="text-white font-bold text-lg">WholesaleHub</span>
      </div>

      <div className="flex items-center justify-center">
        <div className="bg-white w-full max-w-md rounded-lg shadow-md p-8">
          <h1 className="text-2xl font-bold mb-2 text-center text-[#003049]">
            Welcome Back
          </h1>
          <p className="text-center text-gray-500 mb-6">
            Sign in to your WholesaleHub account
          </p>

          {serverError && (
            <p className="bg-red-100 text-red-700 text-sm p-2 rounded mb-4">
              {serverError}
            </p>
          )}

          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-4"
            noValidate
          >
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full border rounded p-2 ${errors.email ? "border-red-500" : ""}`}
                placeholder="you@example.com"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full border rounded p-2 pr-10 ${errors.password ? "border-red-500" : ""}`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
              )}
            </div>

            <div className="text-right -mt-2">
              <Link
                to="/forgot-password"
                className="text-sm text-[#f77f00] hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#f77f00] text-white font-semibold py-2 rounded mt-2 hover:bg-[#d62828] transition disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="text-sm text-center mt-4 text-gray-600">
            Don't have an account?{" "}
            <Link to="/" className="text-[#f77f00] font-medium hover:underline">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
