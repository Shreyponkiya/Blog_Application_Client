import React, { useState, useContext, useEffect } from "react";
import { useFormik } from "formik";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
const Login = () => {
  const { isAuthenticated, login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false); // State for loading
  const Backend_URL = import.meta.env.VITE_BACKEND_URL ; // Added quotes around the URL

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/"); // Redirect if already logged in
    }
  }, [isAuthenticated, navigate]);

  const initialValues = {
    email: "",
    password: "",
  };

  const { values, handleSubmit, handleBlur, handleChange } = useFormik({
    initialValues,
    onSubmit: async (values) => {
      setLoading(true); // Start loading
      await loginUser(values);
      setLoading(false); // Stop loading after request completes
    },
  });

  const loginUser = async (values) => {
    const data = {
      email: values.email,
      password: values.password,
    };
    try {
      const response = await axios.post(`${Backend_URL}/user/signin`, data);
      alert("Login Successful!"); // Add a success message
      localStorage.setItem("token", response.data.token); // Store token if needed
      navigate("/"); // Redirect to home page
      document.location.reload();
    } catch (error) {
      console.error("Login failed:", error.response?.data || error.message);
      alert(error.response?.data?.error || "Login failed");
    }
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="w-3/4 h-3/4 bg-white shadow-lg rounded-lg p-8">
        <h1 className="text-3xl font-bold mb-4">Welcome to BLoGify, Login</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Email:
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              className="border border-gray-300 rounded-lg py-2 px-4 w-full"
              onChange={handleChange}
              onBlur={handleBlur}
              value={values.email}
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="password"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Password:
            </label>
            <input
              type="password"
              id="password"
              name="password"
              required
              className="border border-gray-300 rounded-lg py-2 px-4 w-full"
              onChange={handleChange}
              onBlur={handleBlur}
              value={values.password}
            />
          </div>
          <button
            type="submit"
            className="bg-blue-500 text-white rounded-lg py-2 px-4 w-full flex justify-center items-center"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        <div className="mt-4">
          <a href="/signup" className="text-blue-500">
            Don't have an account? Sign up
          </a>
        </div>
      </div>
    </div>
  );
};

export default Login;
