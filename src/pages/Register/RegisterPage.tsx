import { useState } from "react";
import { Link } from "react-router-dom";
import "./RegisterPage.css";

type FormData = {
  fullName: string;
  businessName: string;
  email: string;
  password: string;
  confirmPassword: string;
};

type FormErrors = {
  fullName: string;
  businessName: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export default function RegisterPage() {
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    businessName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<FormErrors>({
    fullName: "",
    businessName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const validateForm = () => {
    const newErrors: FormErrors = {
      fullName: "",
      businessName: "",
      email: "",
      password: "",
      confirmPassword: "",
    };

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email Address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = "Confirm Password is required";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);

    return Object.values(newErrors).every((error) => error === "");
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (validateForm()) {
      console.log("Registration Successful", formData);

      // API integration goes here in the next task
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <h1>Create Account</h1>
        <p>Create your WholesaleHub account</p>

        <form onSubmit={handleSubmit} noValidate>

          <div className="form-group">
            <label htmlFor="fullName">Full Name</label>
            <input
              id="fullName"
              type="text"
              name="fullName"
              placeholder="Enter your full name"
              value={formData.fullName}
              onChange={handleChange}
              required
            />
            <small className="error">{errors.fullName}</small>
          </div>

          <div className="form-group">
            <label htmlFor="businessName">
              Business Name (Optional)
            </label>
            <input
              id="businessName"
              type="text"
              name="businessName"
              placeholder="Enter business name"
              value={formData.businessName}
              onChange={handleChange}
            />
            <small className="error">{errors.businessName}</small>
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              name="email"
              placeholder="Enter email address"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <small className="error">{errors.email}</small>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              name="password"
              placeholder="Enter password"
              value={formData.password}
              onChange={handleChange}
            />
            <small className="error">{errors.password}</small>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              name="confirmPassword"
              placeholder="Confirm password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
            <small className="error">
              {errors.confirmPassword}
            </small>
          </div>

          <button type="submit" className="register-btn">
            Create Account
          </button>

          <p className="signin-link">
            Already have an account?{" "}
            <Link to="/login">Sign In</Link>
          </p>

        </form>
      </div>
    </div>
  );
}