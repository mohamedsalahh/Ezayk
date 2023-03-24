import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import useMediaQuery from '@mui/material/useMediaQuery';
import SvgIcon from '@mui/material/SvgIcon';
import Button from '@mui/material/Button';
import { useParams, useNavigate } from 'react-router-dom';

import Loading from './Loading';
import axios from '../api/axios';
import { ReactComponent as EmailConfirmationImge } from '../assets/email-confirmation-1.svg';
import { ReactComponent as LoginImg } from '../assets/login.svg';
import { ReactComponent as HomePageImge } from '../assets/home-page.svg';

const style = {
  display: 'flex',
  height: '100%',
  width: '100%',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: '#F5F3F4',
};

function ConfirmEmailToken() {
  const [isPageLoading, setPageIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const { token } = useParams();
  const navigate = useNavigate();

  const minWidth = useMediaQuery('(min-width:800px)');

  useEffect(() => {
    let isMounted = true;

    const confirmEmail = async () => {
      try {
        await axios.post(`/auth/confirm-email/${token}`);
        isMounted && setPageIsLoading(false);
      } catch (err) {
        isMounted && setPageIsLoading(false);
        isMounted && setError(true);
      }
    };

    confirmEmail();

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
        <Stack justifyContent={'center'} alignItems={'center'}>
          <Typography variant={minWidth ? 'h3' : 'h5'} sx={{ fontWeight: 'bold' }}>
            Verifying your email...
          </Typography>
          <SvgIcon
            component={EmailConfirmationImge}
            inheritViewBox
            sx={{ width: 100, height: 100, margin: 5 }}
          />
          {error ? (
            <>
              <Typography variant={minWidth ? 'h5' : ''}>Something went wrong.</Typography>
              <Typography variant={minWidth ? 'h5' : ''}>
                Login again and try the new email sent to you.
              </Typography>
            </>
          ) : (
            <>
              <Typography variant={minWidth ? 'h5' : ''}>
                Your email is verified successfully,
              </Typography>
              <Typography variant={minWidth ? 'h5' : ''}>
                your are ready now to enjoy with our app.
              </Typography>
            </>
          )}
          <Button
            sx={{ width: 100, height: 100, margin: 5 }}
            onClick={() => {
              navigate(error ? '/login' : '/', { replace: true });
            }}
          >
            <SvgIcon
              component={error ? LoginImg : HomePageImge}
              inheritViewBox
              sx={{ width: 100, height: 100, margin: 5 }}
            />
          </Button>
        </Stack>
      </Box>
    </Box>
  );
}

export default ConfirmEmailToken;
