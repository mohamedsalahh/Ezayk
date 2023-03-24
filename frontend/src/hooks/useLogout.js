import useAuth from './useAuth';
import useAxiosPrivate from './useAxiosPrivate';

const useLogout = () => {
  const { setUser, setAccessToken, setIslogedin } = useAuth();
  const axiosPrivate = useAxiosPrivate();

  const logout = async () => {
    setUser({});
    setAccessToken();
    setIslogedin(false);
    try {
      await axiosPrivate.post('/auth/logout');
    } catch (err) {
      console.log(err);
    }
  };

  return logout;
};

export default useLogout;
