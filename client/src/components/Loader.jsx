// components/Loader.jsx
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import NProgress from "nprogress";
import "nprogress/nprogress.css";

const Loader = () => {
  const location = useLocation();

  useEffect(() => {
    NProgress.start(); // Start on route change
    NProgress.configure({ showSpinner: false }); // disable spinner

    return () => {
      NProgress.done(); // ✅ Stop when route has changed
    };
  }, [location.pathname]); // Trigger effect on pathname change

  return null; // No UI needed
};

export default Loader;
