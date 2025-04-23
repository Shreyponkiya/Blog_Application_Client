import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { useNavigate } from "react-router-dom";
const Navbar = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUser();
  }, []);

  const token = localStorage.getItem("token");
  const handleLogout = () => {
    localStorage.removeItem("token");
    document.location.reload(); // Reload the page to reflect the logout
  };

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return navigate("/login");
      const decodedToken = jwtDecode(token);
      setUser([decodedToken]);
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-16 bg-gray-800 flex justify-between items-center px-4 py-10 rounded-b-sm text-white">
      <div className="text-2xl font-semibold flex justify-between items-center w-full">
        <div>
          <ul className="flex space-x-8 gap-8 text-center items-center">
            <li className="text-5xl font-bold pr-20 pl-1">BLoGify</li>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/about">About us</Link>
            </li>
            <li>
              <Link to="/addblog">Add Blog</Link>
            </li>
          </ul>
        </div>
        <div>
          <ul className="flex text-center items-center">
            {token ? (
              <li className="flex space-x-8 gap-6 text-center items-center mr-3">
                {user && (
                  <div className="flex flex-col items-center">
                    <Link to="/profile" className="text-white text-2xl"><img src={user[0].profileImageURL} className="h-12" alt="" /></Link>
                  </div>
                )}
              </li>
            ) : (
              <li className="flex space-x-8 gap-6 text-center items-center mr-3">
                <Link to="/login" className="text-white text-2xl">
                  Login
                </Link>
                <Link to="/signup" className="text-white">
                  <button className="border border-white rounded-2xl py-1.5 px-4 text-xl">
                    signup
                  </button>
                </Link>
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
