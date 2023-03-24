import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import useMediaQuery from '@mui/material/useMediaQuery';
import SvgIcon from '@mui/material/SvgIcon';
import Alert from '@mui/material/Alert';
import LoadingButton from '@mui/lab/LoadingButton';
import IconButton from '@mui/material/IconButton';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import InputAdornment from '@mui/material/InputAdornment';
import FormControl from '@mui/material/FormControl';
import { AiFillEye } from 'react-icons/ai';
import { AiFillEyeInvisible } from 'react-icons/ai';
import { useParams, useNavigate } from 'react-router-dom';

import { ReactComponent as ResetPasswordImg } from '../assets/reset-password-2.svg';
import axios from '../api/axios';

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]).{5,}$/;

const style = {
  display: 'flex',
  height: '100%',
  width: '100%',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: '#F5F3F4',
};

function SetNewPassword() {
  const { token } = useParams();
  const [errMsg, setErrMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [validPasswrod, setValidPassword] = useState(true);
  const navigate = useNavigate();

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const sentNewPassword = async (event) => {
    event.preventDefault();

    setErrMsg('');
    const formData = new FormData(event.target);
    const dataArray = [...formData];
    const data = Object.fromEntries(dataArray);

    const isPasswordValid = PASSWORD_REGEX.test(data?.password);
    setValidPassword(isPasswordValid);
    if (!isPasswordValid) {
      setErrMsg(
        "Invalid password, it shouldn't be less than 5 and at least has one digit, one symbol, one uppercase letter, and one lowercase letter"
      );
      return;
    }

    try {
      setIsLoading(true);
      await axios.post(`/auth/reset-password/${token}`, data);
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

  const minWidth = useMediaQuery('(min-width:800px)');

  return (
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
          <Box component='form' onSubmit={sentNewPassword} noValidate sx={{ marginTop: 4 }}>
            <FormControl required fullWidth margin='normal' variant='outlined'>
              <InputLabel htmlFor='password'>Password</InputLabel>
              <OutlinedInput
                autoFocus
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
              Reset
            </LoadingButton>
          </Box>
        </Stack>
      </Box>
    </Box>
  );
}

export default SetNewPassword;
