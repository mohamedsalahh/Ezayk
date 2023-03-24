import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import useMediaQuery from '@mui/material/useMediaQuery';
import SvgIcon from '@mui/material/SvgIcon';
import Alert from '@mui/material/Alert';
import TextField from '@mui/material/TextField';
import LoadingButton from '@mui/lab/LoadingButton';

import { ReactComponent as ResetPasswordImg } from '../assets/reset-password-1.svg';
import useAuth from '../hooks/useAuth';
import axios from '../api/axios';
import Loading from './Loading';

const style = {
  display: 'flex',
  height: '100%',
  width: '100%',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: '#F5F3F4',
};

function ResetPassword() {
  const [errMsg, setErrMsg] = useState('');
  const { user, isLogedin } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);

  const minWidth = useMediaQuery('(min-width:800px)');

  const sendResetPasswordEmail = async (event) => {
    event.preventDefault();

    setErrMsg('');

    const formData = new FormData(event.target);
    const dataArray = [...formData];
    const data = Object.fromEntries(dataArray);

    try {
      setIsLoading(true);
      await axios.post('/auth/forgot-password', data);
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
      if (!err?.response || err.response?.status >= 500) {
        setErrMsg('Something went wrong');
      } else {
        setErrMsg(err.response?.data?.data?.message);
      }
    }
  };

  useEffect(() => {
    let isMounted = true;

    const sendEamilIfUserLogedin = async () => {
      isMounted && setIsPageLoading(true);

      if (isLogedin) {
        try {
          await axios.post('/auth/forgot-password', { email: user?.email });
        } catch (err) {
          setErrMsg('Something went wrong');
        }
      }

      isMounted && setIsPageLoading(false);
    };
    sendEamilIfUserLogedin();

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
          {errMsg && <Alert severity='error'>{errMsg}</Alert>}
          <Typography variant={minWidth ? 'h3' : 'h5'} sx={{ fontWeight: 'bold' }}>
            Reset your password
          </Typography>
          <SvgIcon
            component={ResetPasswordImg}
            inheritViewBox
            sx={{ width: 100, height: 100, margin: 2 }}
          />
          {user?.email && !errMsg ? (
            <>
              <Typography sx={{ marginTop: 4 }} align='center' variant={minWidth ? 'h5' : ''}>
                An email sent to <b>{user.email}</b>, click on
              </Typography>
              <Typography align='center' variant={minWidth ? 'h5' : ''}>
                the button in it to reset your password.
              </Typography>
            </>
          ) : (
            <Box
              component='form'
              onSubmit={sendResetPasswordEmail}
              noValidate
              sx={{ marginTop: 4 }}
            >
              <TextField
                margin='normal'
                required
                fullWidth
                id='email'
                label='Email Address'
                name='email'
                autoComplete='email'
                autoFocus
                onChange={() => {
                  setErrMsg('');
                }}
              />
              <LoadingButton
                type='submit'
                fullWidth
                variant='contained'
                loading={isLoading}
                sx={{ mt: 3, mb: 2 }}
              >
                Send
              </LoadingButton>
            </Box>
          )}
        </Stack>
      </Box>
    </Box>
  );
}

export default ResetPassword;
