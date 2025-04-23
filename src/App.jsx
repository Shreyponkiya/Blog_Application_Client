import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Home from "./components/Home";
import About from "./components/About";
import AddBlog from "./components/AddBlog";
import Navbar from "./components/navbar";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Profile from "./components/Profile";
import PrivateRoute from "./components/PrivateRoute";
import "./App.css";

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/profile" element={<Profile />} />

          {/* Protected Route */}
          <Route element={<PrivateRoute />}>
            <Route path="/addblog" element={<AddBlog />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
