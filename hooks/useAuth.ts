import { useState } from "react";

const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const getCode = async () => {};

  const verifyCode = async () => {
    setIsAuthenticated(true);
  };

  const getJwt = async () => {};

  const checkAuth = () => {
    return isAuthenticated;
  };

  const signOut = async () => {
    setIsAuthenticated(false);
  };

  return {
    isAuthenticated,
    getCode,
    verifyCode,
    getJwt,
    signOut,
    checkAuth,
  };
};

export default useAuth;
