import { useState } from 'react';
import Avatar from '@mui/material/Avatar';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { IoMdLock } from 'react-icons/io';
import { AiFillEye } from 'react-icons/ai';
import { AiFillEyeInvisible } from 'react-icons/ai';
import { Link, useNavigate } from 'react-router-dom';
import IconButton from '@mui/material/IconButton';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import InputAdornment from '@mui/material/InputAdornment';
import FormControl from '@mui/material/FormControl';
import LoadingButton from '@mui/lab/LoadingButton';

import useAuth from '../hooks/useAuth';
import axios from '../api/axios';

const LOGIN_URL = '/auth/login';

const style = {
  display: 'flex',
  height: '100%',
  width: '100%',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: '#F5F3F4',
};

function Login() {
  const [errMsg, setErrMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { setUser, setAccessToken, setIslogedin } = useAuth();
  const navigate = useNavigate();

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    const formData = new FormData(event.target);
    const dataArray = [...formData];
    const data = Object.fromEntries(dataArray);

    try {
      const response = await axios.post(LOGIN_URL, data, {
        withCredentials: true,
      });
      setUser(response?.data?.data?.user);
      setAccessToken(response?.data?.data?.accessToken);
      setIslogedin(true);
      setIsLoading(false);
      navigate('/', { replace: true });
    } catch (err) {
      setIsLoading(false);
      if (!err?.response || err.response?.status >= 500) {
        setErrMsg('Something went wrong');
      } else {
        setErrMsg(err.response?.data?.data?.message);
      }
    }
  };

  return (
    <Box sx={{ ...style }}>
      <Box
        sx={{
          marginTop: 8,
          padding: 5,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {errMsg && <Alert severity='error'>{errMsg}</Alert>}
        <Avatar sx={{ margin: 1, backgroundColor: '#013A63' }}>
          <IoMdLock />
        </Avatar>
        <Typography component='h1' variant='h5'>
          Sign in
        </Typography>
        <Box component='form' onSubmit={handleSubmit} noValidate sx={{ marginTop: 1 }}>
          <TextField
            margin='normal'
            required
            fullWidth
            id='email'
            label='Email Address / Username'
            name='email'
            autoComplete='email'
            autoFocus
            onChange={() => {
              setErrMsg('');
            }}
          />
          <FormControl required fullWidth margin='normal' variant='outlined'>
            <InputLabel htmlFor='password'>Password</InputLabel>
            <OutlinedInput
              id='password'
              name='password'
              label='Password'
              type={showPassword ? 'text' : 'password'}
              autoComplete='current-password'
              endAdornment={
                <InputAdornment position='end'>
                  <IconButton
                    aria-label='toggle password visibility'
                    onClick={handleClickShowPassword}
                    edge='end'
                  >
                    {showPassword ? <AiFillEye /> : <AiFillEyeInvisible />}
                  </IconButton>
                </InputAdornment>
              }
              onChange={() => {
                setErrMsg('');
              }}
            />
          </FormControl>
          <LoadingButton
            type='submit'
            fullWidth
            variant='contained'
            loading={isLoading}
            sx={{ mt: 3, mb: 2 }}
          >
            Sign In
          </LoadingButton>
          <Grid container>
            <Grid item xs>
              <Link to='/reset-password'>Forgot password?</Link>
            </Grid>
            <Grid item>
              <Typography>
                Don't have an account? <Link to='/register'>Sign Up</Link>
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Box>
  );
}

export default Login;
