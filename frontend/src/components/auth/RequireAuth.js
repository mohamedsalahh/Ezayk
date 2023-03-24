import { useLocation, Navigate, Outlet } from 'react-router-dom';

import useAuth from '../../hooks/useAuth';

const RequireAuth = () => {
  const { user, isLogedin, accessToken } = useAuth();
  const location = useLocation();

  return user?.isEmailConfirmed === false ? (
    <Navigate to='/confirm-email' state={{ from: location }} replace />
  ) : isLogedin ? (
    <Outlet />
  ) : accessToken ? (
    <Navigate to='/unauthorized' state={{ from: location }} replace /> //todo: add this route
  ) : (
    <Navigate to='/login' state={{ from: location }} replace />
  );
};

export default RequireAuth;
