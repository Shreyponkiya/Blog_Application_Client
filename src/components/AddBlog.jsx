import {jwtDecode} from "jwt-decode"; // Import jwt-decode
import React, { useState } from "react";
import { useFormik } from "formik";
import axios from "axios";

const AddBlog = () => {
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false)
  const Backend_URL = import.meta.env.VITE_BACKEND_URL ; // Added quotes around the URL

  const initialValues = {
    title: "",
    body: "",
  };

  const {
    values,
    handleSubmit,
    handleBlur,
    handleChange,
  } = useFormik({
    initialValues,
    onSubmit: async (values) => {
      if (!imageUrl) {
        alert("Please upload an image first.");
        return;
      }

      await handlePostData({ ...values, coverImageURL: imageUrl });
    },
  });

  const handleChangeImage = async (event) => {
    const file = event.target.files[0];

    if (!file) return;
    setUploading(true);  // Show a loading state during upload

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "blog-image"); // Replace with your Cloudinary preset

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
    const { title, body, coverImageURL } = values;
    const token = localStorage.getItem("token");

  
    if (!token) {
      alert("Please log in to add a blog.");
      return;
    }
  
    try {
      // Decode the token to get userId
      const decodedToken = jwtDecode(token);
      const userId = decodedToken._id; // Ensure your token contains userId
      await axios.post(`${Backend_URL}/blog/addblog`, { // Updated to use Backend_URL
        title,
        body,
        createdBy: userId, // Send extracted userId
        coverImageURL,
      }, {
        headers: { Authorization: `Bearer ${token}` } // Send token in headers
      });
  
      alert("Blog added successfully!");
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to add blog.");
    }
  };
  

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 w-1/3">
        <h1 className="text-3xl font-bold mb-4">Welcome to BLoGify</h1>
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="file">Image</label>
            <input
              type="file"
              id="file"
              name="file"
              className="border border-gray-300 rounded px-4 py-2 w-full"
              onChange={handleChangeImage}
              onBlur={handleBlur}
            />
            {uploading && <p>Uploading image...</p>}
            {imageUrl && (
              <img src={imageUrl} alt="Uploaded" className="mt-2 w-40" />
            )}
          </div>
          <div>
            <label htmlFor="title">Title</label>
            <input
              type="text"
              id="title"
              name="title"
              className="border border-gray-300 rounded px-4 py-2 w-full"
              value={values.title}
              onChange={handleChange}
              onBlur={handleBlur}
            />
          </div>
          <div>
            <label htmlFor="body">Body</label>
            <textarea
              id="body"
              className="border border-gray-300 rounded px-4 py-2 w-full"
              name="body"
              value={values.body}
              onChange={handleChange}
              onBlur={handleBlur}
            ></textarea>
          </div>
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            type="submit"
            disabled={uploading}
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddBlog;
