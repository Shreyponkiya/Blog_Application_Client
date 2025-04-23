import React from "react";

const About = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
      <div className="bg-white shadow-lg rounded-lg p-8 max-w-4xl space-y-6">
        <h1 className="text-4xl font-bold text-center text-blue-600">
          About Blogify - Your Personal Blogging Space
        </h1>
        
        <p className="text-gray-700 text-lg text-center">
          Welcome to <span className="font-semibold">Blogify</span>, the ultimate platform where users can 
          express their thoughts, share experiences, and connect with a like-minded community. Unlike 
          traditional blogging platforms, Blogify is tailored for **personal blogging**, ensuring that only 
          the owner has full control over their content.
        </p>

        {/* Blogify Introduction */}
        <div className="space-y-3">
          <h2 className="text-2xl font-semibold text-gray-900">✨ What is Blogify?</h2>
          <p className="text-gray-700 text-lg">
            Blogify is a simple, intuitive, and feature-rich blogging platform designed for individuals who 
            want to maintain their **personal blog space**. Whether you are a writer, a thinker, or just 
            someone who enjoys documenting their journey, Blogify provides the perfect environment for you 
            to share your ideas without interference.
          </p>
        </div>

        {/* Features Section */}
        <div className="space-y-3">
          <h2 className="text-2xl font-semibold text-gray-900">🚀 Features of Blogify</h2>
          <p className="text-gray-700 text-lg">
            Blogify is packed with powerful features that make blogging effortless and engaging.
          </p>
          <ul className="list-disc list-inside text-gray-700 text-lg space-y-2">
            <li><strong>🔑 Secure Authentication:</strong> Users can **sign up, log in, and log out** securely.</li>
            <li><strong>👤 Personal User Profile:</strong> Manage your **profile details, profile picture, and personal information**.</li>
            <li><strong>✍️ Create & Publish Blogs:</strong> Easily **write and publish** blogs to share your thoughts with the world.</li>
            <li><strong>📝 Edit Blogs:</strong> Update your blogs at any time to refine your ideas and enhance your content.</li>
            <li><strong>🗑️ Delete Blogs:</strong> Remove blogs that are no longer relevant or useful.</li>
            <li><strong>👀 View Personal Blogs:</strong> Unlike social blogging platforms, **only you** have full control over your blogs.</li>
            <li><strong>❤️ Like & Comment:</strong> Users can **engage** with blogs by **liking and commenting** on posts.</li>
            <li><strong>🔄 Real-Time Interaction:</strong> See the **likes and comments** on your blogs in real time.</li>
          </ul>
        </div>

        {/* Why Choose Blogify? */}
        <div className="space-y-3">
          <h2 className="text-2xl font-semibold text-gray-900">🤔 Why Choose Blogify?</h2>
          <p className="text-gray-700 text-lg">
            Unlike platforms like LinkedIn, where anyone can engage with your content, **Blogify focuses on 
            personal blogging**. This means:
          </p>
          <ul className="list-disc list-inside text-gray-700 text-lg space-y-2">
            <li>📌 **Only you** can create, edit, and delete your blogs.</li>
            <li>📌 Your blog remains **safe from external modifications**.</li>
            <li>📌 Readers can **like and comment**, but cannot alter your posts.</li>
            <li>📌 Your profile acts as **a personal blogging space**, not a public discussion forum.</li>
          </ul>
        </div>

        {/* Who Can Use Blogify? */}
        <div className="space-y-3">
          <h2 className="text-2xl font-semibold text-gray-900">👥 Who Can Use Blogify?</h2>
          <p className="text-gray-700 text-lg">
            Blogify is designed for **writers, content creators, students, professionals, and anyone who 
            loves to share their thoughts**. Whether you want to maintain a **personal diary**, document 
            **travel experiences**, or create **technical blogs**, Blogify is for you!
          </p>
        </div>

        {/* How to Get Started? */}
        <div className="space-y-3">
          <h2 className="text-2xl font-semibold text-gray-900">🚀 How to Get Started?</h2>
          <p className="text-gray-700 text-lg">
            Getting started with Blogify is simple:
          </p>
          <ul className="list-disc list-inside text-gray-700 text-lg space-y-2">
            <li>✅ **Sign Up** with your email and create an account.</li>
            <li>✅ **Set up your profile** with a profile picture and bio.</li>
            <li>✅ **Start blogging** by creating your first blog.</li>
            <li>✅ **Engage** with other blogs by **liking and commenting**.</li>
          </ul>
        </div>

        {/* Conclusion */}
        <p className="text-gray-700 text-lg text-center">
          Join **Blogify** today and become part of a community that values **personal expression and creativity**. 🚀✨
        </p>
      </div>
    </div>
  );
};

export default About;
