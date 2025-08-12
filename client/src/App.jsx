// main.jsx or App.jsx
import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css'
import NProgress from "nprogress";
import "nprogress/nprogress.css";

// Import your pages/components
import Home from './pages/Home';
import CreatePost from './pages/CreatePost';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Profile from './pages/Profile';
import { useAuth } from './context/AuthContext';
import axios from './api/axios'
import ProtectedRoute from './components/ProtectedRoute';
import Loader from "./components/Loader";
import Navbar from './components/Navbar';
import ModifyImagePage from './pages/ModifyImagePage';
const App = () => {
  const { setAccessToken, setUser, setLoading, loading } = useAuth();


  useEffect(() => {
    const restoreSession = async () => {
      // console.log("Restoring session..."); // ✅

      try {
        const refreshRes = await axios.post("/users/refresh", {}, { withCredentials: true });
        // console.log("Refresh response = ", refreshRes.data); // ✅

        const newAccessToken = refreshRes.data.accessToken;
        // console.log(newAccessToken)
        setAccessToken(newAccessToken);

        const userRes = await axios.post(
          "/users/checkUser",
          {}, // empty body
          {
            headers: { Authorization: `Bearer ${newAccessToken}` },
          }
        );
        // console.log("userRes", userRes)
        setUser(userRes.data.user);
      } catch (err) {
        console.log("Session restore failed:", err?.response?.data || err.message);
        setAccessToken(null);
        setUser(null);
      } finally {
        setLoading(false);
        NProgress.done()
      }
    };
    restoreSession();
  }, []);

  if (loading) {
    return <div>Loading...</div>; // or a full screen loader
  }

  return (
    <BrowserRouter>
      <Loader />
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/modify" element={
          <ProtectedRoute>
            <ModifyImagePage />
          </ProtectedRoute>
        } />
        <Route path="/post" element={
          <ProtectedRoute>
            < CreatePost />
          </ProtectedRoute>
        } />
        <Route path="/profile/:username" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />

        <Route path="*" element={<div className="text-white text-center mt-10">404 - Page Not Found</div>} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
