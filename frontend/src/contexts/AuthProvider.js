import { createContext, useState, useMemo } from 'react';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState({});
  const [accessToken, setAccessToken] = useState();
  const [isLogedin, setIslogedin] = useState(false);

  const authObject = useMemo(() => {
    return {
      user,
      setUser,
      accessToken,
      setAccessToken,
      isLogedin,
      setIslogedin,
    };
  }, [user, setUser, accessToken, setAccessToken, isLogedin, setIslogedin]);

  return <AuthContext.Provider value={authObject}>{children}</AuthContext.Provider>;
};

export default AuthContext;
