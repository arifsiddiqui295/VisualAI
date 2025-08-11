import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useEffect } from "react";

const useRefreshToken = () => {
  const { setAccessToken } = useAuth();

  const refresh = async () => {
    const res = await axios.post(
      "/users/refresh",
      {},
      { withCredentials: true }
    );
    // console.log("res", res);
    setAccessToken(res.data.accessToken);
    return res.data.accessToken;
  };

  return refresh;
};
export default useRefreshToken;
