import React from 'react';
import Container from '@mui/material/Container';

import useAuth from '../hooks/useAuth';

function Main() {
  const { user } = useAuth();
  return (
    <div>
      <div>{user.username}</div>
      <div>{user.email}</div>
    </div>
  );
}

export default Main;
