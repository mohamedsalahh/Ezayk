import React from 'react';
import Box from '@mui/material/Box';
import { Discuss } from 'react-loader-spinner';

const style = {
  display: 'flex',
  height: '100%',
  width: '100%',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: '#F5F3F4',
};

function Loading() {
  return (
    <Box sx={{ ...style }}>
      <Discuss
        visible={true}
        height='150'
        width='150'
        ariaLabel='comment-loading'
        wrapperStyle={{}}
        wrapperClass='comment-wrapper'
        colors={['#0D1B2A', '#1B263B']}
      />
    </Box>
  );
}

export default Loading;
