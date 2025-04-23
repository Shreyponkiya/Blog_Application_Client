import React, { useState } from "react";
import { useFormik } from "formik";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const navigate = useNavigate();
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // State for signup loading
  const Backend_URL = import.meta.env.VITE_BACKEND_URL ; // Added quotes around the URL

  const initialValues = {
    username: "",
    email: "",
    password: "",
    profile_image: "",
  };

  const { values, handleSubmit, handleBlur, handleChange, errors } = useFormik({
    initialValues,
    onSubmit: async (values) => {
      if (!imageUrl) {
        alert("Please upload an image first.");
        return;
      }
      setIsSubmitting(true); // Start loading
      await handlePostData(values);
      setIsSubmitting(false); // Stop loading after request completes
    },
  });

  const handleChangeImage = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true); // Show a loading state during upload
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "profile_photo"); // Replace with your Cloudinary preset

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/dvzavo3c8/image/upload`, // Replace with your Cloudinary cloud name
        {
          method: "POST",
          body: formData,
        }
      );
      const data = await response.json();
      setImageUrl(data.secure_url);
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setUploading(false);
    }
  };

  const handlePostData = async (values) => {
    
    const data = {
      fullname: values.username,
      email: values.email,
      password: values.password,
      profileImage: imageUrl,
    };

    try {
      const response = await axios.post(`${Backend_URL}/user/signup`, data);
      alert("Signup Successful!");
      navigate("/login");
    } catch (error) {
      console.error("Error sending data:", error);
      alert("Signup failed, please try again.");
    }
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="w-3/4 h-3/4 bg-white shadow-lg rounded-lg p-8">
        <h1 className="text-3xl font-bold mb-4">Welcome to BLoGify, Signup</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="image"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Profile Image:
            </label>
            <input
              type="file"
              id="image"
              name="profile_image"
              required
              className="border border-gray-300 rounded-lg py-2 px-4 w-full"
              onChange={handleChangeImage}
              onBlur={handleBlur}
            />
            {uploading && <p className="text-sm text-gray-500">Uploading...</p>}
          </div>
          <div className="mb-4">
            <label
              htmlFor="username"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Username:
            </label>
            <input
              type="text"
              id="username"
              name="username"
              required
              className="border border-gray-300 rounded-lg py-2 px-4 w-full"
              onChange={handleChange}
              onBlur={handleBlur}
              value={values.username}
            />
            {errors.username && (
              <div className="text-red-500 text-sm mt-1">{errors.username}</div>
            )}
          </div>
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
            {errors.email && (
              <div className="text-red-500 text-sm mt-1">{errors.email}</div>
            )}
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
            {errors.password && (
              <div className="text-red-500 text-sm mt-1">{errors.password}</div>
            )}
          </div>
          <button
            type="submit"
            className={`rounded-lg py-2 px-4 w-full flex justify-center items-center transition-colors duration-300 
    ${
      isSubmitting
        ? "bg-blue-300 text-gray-700 cursor-not-allowed"
        : "bg-blue-500 hover:bg-blue-600 text-white"
    }`}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Signing Up..." : "Sign Up"}
          </button>
        </form>
        <div className="mt-4">
          <a href="/login" className="text-blue-500">
            Already have an account? Login
          </a>
        </div>
      </div>
    </div>
  );
};

export default Signup;
