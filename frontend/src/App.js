import CssBaseline from '@mui/material/CssBaseline';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import useMediaQuery from '@mui/material/useMediaQuery';
import { Routes, Route } from 'react-router-dom';

import Main from './pages/Main';
import Register from './pages/Register';
import Login from './pages/Login';
import ConfirmEmail from './pages/ConfirmEmail';
import ConfirmEmailToken from './pages/ConfirmEmailToken';
import TryLogin from './components/auth/TrytLogin';
import RequireAuth from './components/auth/RequireAuth';
import ResetPassword from './pages/ResetPassword';
import SetNewPassword from './pages/SetNewPassword';

function App() {
  const minWidth = useMediaQuery('(min-width:800px)');

  const style = {
    position: !minWidth ? 'fixed' : 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: minWidth ? '80%' : '100%',
    height: minWidth ? '90%' : '100%',
    boxShadow: minWidth ? 24 : 0,
    outline: 0,
  };

  return (
    <>
      <CssBaseline />
      <Container maxWidth='false' disableGutters>
        <Box sx={{ backgroundColor: '#d3d3d3', height: '100vh' }}>
          <Box sx={{ ...style }}>
            <Routes>
              <Route path='login' element={<Login />} />
              <Route path='register' element={<Register />} />
              {/* <Route path='error' element={<Error />} /> */}
              <Route path='confirm-email/:token' element={<ConfirmEmailToken />} />
              <Route path='reset-password/:token' element={<SetNewPassword />} />

              <Route element={<TryLogin />}>
                <Route path='confirm-email' element={<ConfirmEmail />} />
                <Route path='reset-password' element={<ResetPassword />} />
                <Route element={<RequireAuth />}>
                  <Route path='/' element={<Main />} />
                </Route>
              </Route>

              {/* catch all */}
              {/* <Route path='*' element={<NotFound />} /> */}
              {/* </Route> */}
            </Routes>
          </Box>
        </Box>
      </Container>
    </>
  );
}

export default App;
