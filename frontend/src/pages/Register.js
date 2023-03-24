import { useState } from 'react';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import { IoMdLock } from 'react-icons/io';
import { Link, useNavigate } from 'react-router-dom';
import { AiFillEye } from 'react-icons/ai';
import { AiFillEyeInvisible } from 'react-icons/ai';
import IconButton from '@mui/material/IconButton';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import InputAdornment from '@mui/material/InputAdornment';
import FormControl from '@mui/material/FormControl';
import LoadingButton from '@mui/lab/LoadingButton';

import axios from '../api/axios';
import useAuth from '../hooks/useAuth';

const style = {
  display: 'flex',
  height: '100%',
  width: '100%',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: '#F5F3F4',
};

const USERNAME_REGEX = /^[A-z][A-z0-9-_]{4,24}$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]).{5,}$/;
const EMAIL_REGEX =
  /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
const REGISTER_URL = '/auth/signup';

function Register() {
  const { setUser, setAccessToken, setIslogedin } = useAuth();
  const [validUsername, setValidUsername] = useState(true);
  const [validEmail, setValidEmail] = useState(true);
  const [validPasswrod, setValidPassword] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errMsg, setErrMsg] = useState('');
  const navigate = useNavigate();

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const formData = new FormData(event.target);
    const dataArray = [...formData];
    const data = Object.fromEntries(dataArray);

    const isUsernameValid = USERNAME_REGEX.test(data?.username);
    const isEmailValid = EMAIL_REGEX.test(data?.email);
    const isPasswordValid = PASSWORD_REGEX.test(data?.password);

    setValidUsername(isUsernameValid);
    setValidEmail(isEmailValid);
    setValidPassword(isPasswordValid);

    if (!isUsernameValid) {
      setErrMsg(
        'Invalid username, it must begin with a letter, and its length between 5 to 25. Use only letters, numbers, underscores, hyphens.'
      );
      return;
    }
    if (!isEmailValid) {
      setErrMsg('Invalid email');
      return;
    }
    if (!isPasswordValid) {
      setErrMsg(
        "Invalid password, it shouldn't be less than 5 and at least has one digit, one symbol, one uppercase letter, and one lowercase letter"
      );
      return;
    }
    try {
      setIsLoading(true);
      const response = await axios.post(REGISTER_URL, data, {
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
          Sign up
        </Typography>
        <Box component='form' noValidate onSubmit={handleSubmit} sx={{ marginTop: 3 }}>
          <TextField
            margin='normal'
            error={!validUsername}
            onChange={(event) => {
              setValidUsername(USERNAME_REGEX.test(event.target.value));
              setErrMsg('');
            }}
            name='username'
            required
            fullWidth
            id='username'
            label='username'
            autoComplete='given-name'
            autoFocus
          />
          <TextField
            margin='normal'
            error={!validEmail}
            onChange={(event) => {
              setValidEmail(EMAIL_REGEX.test(event.target.value));
              setErrMsg('');
            }}
            name='email'
            required
            fullWidth
            id='email'
            label='Email Address'
            type='email'
            autoComplete='email'
          />
          <FormControl required fullWidth margin='normal' variant='outlined'>
            <InputLabel htmlFor='password'>Password</InputLabel>
            <OutlinedInput
              id='password'
              name='password'
              label='Password'
              type={showPassword ? 'text' : 'password'}
              error={!validPasswrod}
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
              onChange={(event) => {
                setValidPassword(PASSWORD_REGEX.test(event.target.value));
                setErrMsg('');
              }}
              autoComplete='new-password'
            />
          </FormControl>
          <LoadingButton
            type='submit'
            fullWidth
            variant='contained'
            loading={isLoading}
            sx={{ mt: 3, mb: 2 }}
          >
            Sign Up
          </LoadingButton>
          <Grid container justifyContent='flex-end'>
            <Grid item>
              <Typography>
                Already have an account? <Link to='/login'>Sign in</Link>
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Box>
  );
}

export default Register;
