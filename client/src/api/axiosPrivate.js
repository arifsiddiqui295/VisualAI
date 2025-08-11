import axios from "axios";
import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import useRefreshToken from "../hooks/useRefreshToken.js";

const axiosPrivate = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});

const useAxiosPrivate = () => {
  const { accessToken } = useAuth();
  const refresh = useRefreshToken();

  useEffect(() => {
    const requestInterceptor = axiosPrivate.interceptors.request.use(
      async (config) => {
        if (!config.headers["Authorization"]) {
          if (accessToken) {
            config.headers["Authorization"] = `Bearer ${accessToken}`;
          } else {
            const newAccessToken = await refresh();
            config.headers["Authorization"] = `Bearer ${newAccessToken}`;
          }
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    const responseInterceptor = axiosPrivate.interceptors.response.use(
      (res) => res,
      async (err) => {
        const prevRequest = err?.config;
        if (err?.response?.status === 401 && !prevRequest?.sent) {
          prevRequest.sent = true;
          const newAccessToken = await refresh();
          prevRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
          return axiosPrivate(prevRequest);
        }
        return Promise.reject(err);
      }
    );

    return () => {
      axiosPrivate.interceptors.request.eject(requestInterceptor);
      axiosPrivate.interceptors.response.eject(responseInterceptor);
    };
  }, [accessToken, refresh]);

  return axiosPrivate;
};

export default useAxiosPrivate;
