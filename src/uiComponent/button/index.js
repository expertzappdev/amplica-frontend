import * as React from 'react';
// import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import "./style.css"
import CircularProgress from '@mui/material/CircularProgress';
export default function BasicButtons(props) {
  const buttonStyle = {
    width: props.width || 'auto', // Use the provided width or set a default value
  };
  return (
    <>
    <div className='Buttons'>
      <div>
      <Button color="primary" style={buttonStyle}  variant="contained" onClick={props.openModal || props.handleSaveClick}>  {props.loading ? <CircularProgress size={20} color="inherit" /> : props.name}</Button>
      </div>
      <div>
      {props.cancel && <Button variant="outlined" onClick={props.handleCancelClick}>{props.cancel}</Button>}
      </div>
      </div>
    </>
  );
}