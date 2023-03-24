import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import useMediaQuery from '@mui/material/useMediaQuery';
import SvgIcon from '@mui/material/SvgIcon';
import { useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';

import { ReactComponent as EmailConfirmationImge } from '../assets/email-confirmation-2.svg';
import useAuth from '../hooks/useAuth';
import useLogout from '../hooks/useLogout';
import useAxiosPrivate from '../hooks/useAxiosPrivate';
import Loading from './Loading';

const style = {
  display: 'flex',
  height: '100%',
  width: '100%',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: '#F5F3F4',
};

function ConfirmEmail() {
  const [errMsg, setErrMsg] = useState('');
  const { user, isLogedin } = useAuth();
  const [isPageLoading, setIsPageLoading] = useState(true);
  const navigate = useNavigate();
  const logout = useLogout();
  const axiosPrivate = useAxiosPrivate();

  const minWidth = useMediaQuery('(min-width:800px)');

  const resendConfirmationEmail = async () => {
    setErrMsg('');
    try {
      await axiosPrivate.get('/auth//confirm-email');
    } catch (err) {
      setErrMsg('Something went wrong, try login again!');
    }
  };

  useEffect(() => {
    let isMounted = true;

    isMounted && setIsPageLoading(true);

    if (!isLogedin) {
      navigate('/login', { replace: true });
    }
    if (user?.isEmailConfirmed) {
      navigate('/', { replace: true });
    }

    isMounted && setIsPageLoading(false);

    return () => (isMounted = false);
  }, []);

  return isPageLoading ? (
    <Loading />
  ) : (
    <Box sx={{ ...style }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Stack justifyContent='center' alignItems='center'>
          <Typography variant={minWidth ? 'h3' : 'h5'} sx={{ fontWeight: 'bold' }}>
            You're almost there!
          </Typography>
          <SvgIcon
            component={EmailConfirmationImge}
            inheritViewBox
            sx={{ width: 100, height: 100, margin: 2 }}
          />
          <Typography variant={minWidth ? 'h5' : ''}>To start using Ezayk, click on the</Typography>
          <Typography variant={minWidth ? 'h5' : ''}>
            verification button in the email we sent to
          </Typography>
          <Typography variant={minWidth ? 'h5' : ''} sx={{ fontWeight: 'bold' }}>
            <b>{user?.email}</b>
          </Typography>
          <Typography variant={minWidth ? 'h5' : ''} sx={{ marginTop: 2 }}>
            Didn’t receive the email?
          </Typography>
          <Button variant='text' onClick={resendConfirmationEmail}>
            Resend email
          </Button>
          <Button
            variant='outlined'
            onClick={async () => {
              await logout();
              navigate('/login');
            }}
            sx={{ marginTop: 4 }}
          >
            Log out
          </Button>
          {errMsg && <Alert severity='error'>{errMsg}</Alert>}
        </Stack>
      </Box>
    </Box>
  );
}

export default ConfirmEmail;
