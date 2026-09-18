import React, { useState } from 'react';
import { Box, Button, TextField, Typography } from '@mui/material';

export default function TestPaperForm({ testPaper, onSubmit }) {
  const [title, setTitle] = useState(testPaper?.title || '');
  const [description, setDescription] = useState(testPaper?.description || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ title, description });
  };

  return (
    <Box component="form" noValidate autoComplete="off" onSubmit={handleSubmit} sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>Create / Edit Test Paper</Typography>
      <TextField
        label="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        fullWidth
        required
        sx={{ mb: 2 }}
      />
      <TextField
        label="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        multiline
        rows={3}
        fullWidth
        sx={{ mb: 2 }}
      />
      {/* TODO: Add question builder UI */}
      <Button type="submit" variant="contained" color="primary">
        Save Test Paper
      </Button>
    </Box>
  );
}
