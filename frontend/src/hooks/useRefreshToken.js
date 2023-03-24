import axios from '../api/axios';
import useAuth from './useAuth';

const useRefreshToken = () => {
  const { setUser, setAccessToken, setIslogedin } = useAuth();

  const refresh = async () => {
    try {
      const response = await axios.get('/auth/token', {
        withCredentials: true,
      });

      setUser(response.data?.data?.user);
      setAccessToken(response.data?.data?.accessToken);
      setIslogedin(true);
      return {
        accessToken: response.data?.data?.accessToken,
        user: response.data?.data?.user,
        isLogedin: true,
      };
    } catch (err) {
      setUser({});
      setAccessToken('');
      setIslogedin(false);
      return undefined;
    }
  };
  return refresh;
};

export default useRefreshToken;
