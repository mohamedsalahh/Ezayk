import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';

import Loading from '../../pages/Loading';
import useRefreshToken from '../../hooks/useRefreshToken';
import useAuth from '../../hooks/useAuth';

const TryLogin = () => {
  const [isLoading, setIsLoading] = useState(true);
  const refresh = useRefreshToken();
  const { accessToken } = useAuth();

  useEffect(() => {
    let isMounted = true;

    const verifyRefreshToken = async () => {
      await refresh();

      isMounted && setIsLoading(false);
    };

    !accessToken ? verifyRefreshToken() : setIsLoading(false);

    return () => (isMounted = false);
  }, []);

  return <>{isLoading ? <Loading /> : <Outlet />}</>;
};

export default TryLogin;
