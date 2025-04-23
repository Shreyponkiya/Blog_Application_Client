import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Home from "./component/Home";
import About from "./component/About";
import AddBlog from "./component/AddBlog";
import Navbar from "./component/navbar";
import Login from "./component/Login";
import Signup from "./component/Signup";
import Profile from "./component/Profile";
import PrivateRoute from "./component/PrivateRoute";
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
