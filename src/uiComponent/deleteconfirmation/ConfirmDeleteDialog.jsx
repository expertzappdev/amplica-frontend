import React from 'react';
import {
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button
} from '@mui/material';


export default function ConfirmDeleteDialog({ open, onClose, onConfirm, itemName }) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="confirm-delete-dialog-title"
      aria-describedby="confirm-delete-dialog-description"
    >
      <DialogTitle id="confirm-delete-dialog-title">Confirm Deletion</DialogTitle>
      <DialogContent>
        <DialogContentText id="confirm-delete-dialog-description">
          Are you sure you want to delete "<strong>{itemName || 'this item'}</strong>"? This action cannot be undone.
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} color="secondary" variant="outlined">
          Cancel
        </Button>
        <Button onClick={onConfirm} color="error" variant="contained" autoFocus>
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
}
