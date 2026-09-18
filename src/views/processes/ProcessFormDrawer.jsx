import React, { useState, useEffect } from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  TextField,
  Button,
  Divider,
  MenuItem,
  List,
  ListItem,
  ListItemSecondaryAction,
  Tooltip,
  Stack,
} from '@mui/material';
import {
  Close as CloseIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';

const drawerWidth = { xs: '100%', sm: 480 };

const stepTypes = [
  { value: 'video', label: 'Video' },
  { value: 'audio', label: 'Audio' },
  { value: 'text', label: 'Text' },
  { value: 'faq', label: 'FAQ' },
  { value: 'quiz', label: 'Quiz' },
];

// Example existing quizzes for demo; replace with real data from props or redux
const existingQuizzes = [
  { id: 'quiz1', name: 'Safety Quiz' },
  { id: 'quiz2', name: 'HR Compliance Quiz' },
  { id: 'quiz3', name: 'Operations Quiz' },
];

function StepContentInput({ step, onChange }) {
  // Local states for file inputs only
  const [videoFile, setVideoFile] = useState(null);
  const [audioFile, setAudioFile] = useState(null);
  const [faqs, setFaqs] = useState(() => {
    try {
      return step.content ? JSON.parse(step.content) : [];
    } catch {
      return [];
    }
  });

  const updateFaqs = (newFaqs) => {
    setFaqs(newFaqs);
    onChange(JSON.stringify(newFaqs));
  };

  const addFaq = () => updateFaqs([...faqs, { question: '', answer: '' }]);
  const removeFaq = (index) => updateFaqs(faqs.filter((_, i) => i !== index));
  const updateFaqQuestion = (index, value) => {
    const newFaqs = [...faqs];
    newFaqs[index].question = value;
    updateFaqs(newFaqs);
  };
  const updateFaqAnswer = (index, value) => {
    const newFaqs = [...faqs];
    newFaqs[index].answer = value;
    updateFaqs(newFaqs);
  };

  const handleVideoFileChange = (e) => {
    const file = e.target.files[0];
    setVideoFile(file);
    // For demo just use file name; integrate real upload logic if required
    onChange(file ? file.name : '');
  };

  const handleAudioFileChange = (e) => {
    const file = e.target.files[0];
    setAudioFile(file);
    onChange(file ? file.name : '');
  };

  switch (step.type) {
    case 'video':
      return (
        <Box sx={{ mt: 1 }}>
          <Typography variant="subtitle2" gutterBottom>Video URL or upload file</Typography>
          <TextField
            label="Video URL"
            value={typeof step.content === 'string' && !videoFile ? step.content : ''}
            onChange={(e) => onChange(e.target.value)}
            fullWidth
            margin="normal"
          />
          <Button variant="outlined" component="label" sx={{ mt: 1 }}>
            Upload Video File
            <input hidden accept="video/*" type="file" onChange={handleVideoFileChange} />
          </Button>
          {videoFile && <Typography variant="caption" sx={{ ml: 1 }}>Selected file: {videoFile.name}</Typography>}
        </Box>
      );
    case 'audio':
      return (
        <Box sx={{ mt: 1 }}>
          <Typography variant="subtitle2" gutterBottom>Audio URL or upload file</Typography>
          <TextField
            label="Audio URL"
            value={typeof step.content === 'string' && !audioFile ? step.content : ''}
            onChange={(e) => onChange(e.target.value)}
            fullWidth
            margin="normal"
          />
          <Button variant="outlined" component="label" sx={{ mt: 1 }}>
            Upload Audio File
            <input hidden accept="audio/*" type="file" onChange={handleAudioFileChange} />
          </Button>
          {audioFile && <Typography variant="caption" sx={{ ml: 1 }}>Selected file: {audioFile.name}</Typography>}
        </Box>
      );
    case 'faq':
      return (
        <Box sx={{ mt: 1 }}>
          <Typography variant="subtitle2" gutterBottom>FAQs (Add question and answer pairs)</Typography>
          <List dense>
            {faqs.map((faq, i) => (
              <ListItem
                key={i}
                sx={{ flexDirection: 'column', alignItems: 'stretch', mb: 1 }}
                secondaryAction={
                  <Tooltip title="Remove FAQ">
                    <IconButton edge="end" color="error" onClick={() => removeFaq(i)} size="small">
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                }
              >
                <TextField
                  label="Question"
                  value={faq.question}
                  onChange={(e) => updateFaqQuestion(i, e.target.value)}
                  fullWidth
                  required
                  margin="dense"
                />
                <TextField
                  label="Answer"
                  value={faq.answer}
                  onChange={(e) => updateFaqAnswer(i, e.target.value)}
                  fullWidth
                  multiline
                  rows={2}
                  required
                  margin="dense"
                  sx={{ mt: 1 }}
                />
              </ListItem>
            ))}
          </List>
          <Button variant="outlined" onClick={addFaq} startIcon={<AddIcon />}>
            Add FAQ
          </Button>
        </Box>
      );
    case 'quiz':
      return (
        <Box sx={{ mt: 1 }}>
          <Typography variant="subtitle2" gutterBottom>Select existing quiz</Typography>
          <TextField
            select
            label="Quiz"
            value={step.content || ''}
            onChange={(e) => onChange(e.target.value)}
            fullWidth
          >
            {existingQuizzes.map((quiz) => (
              <MenuItem key={quiz.id} value={quiz.id}>
                {quiz.name}
              </MenuItem>
            ))}
          </TextField>
        </Box>
      );
    case 'text':
    default:
      return (
        <TextField
          label="Text Content"
          value={step.content}
          onChange={(e) => onChange(e.target.value)}
          multiline
          rows={4}
          fullWidth
          margin="normal"
          placeholder="Enter text content here"
        />
      );
  }
}

export default function ProcessFormDrawer({ open, onClose, onSubmitCreate, onSubmitUpdate, processData }) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('Active');
  const [steps, setSteps] = useState([]);

  React.useEffect(() => {
    if (processData) {
      setName(processData.name || '');
      setCategory(processData.category || '');
      setStatus(processData.status || 'Active');
      setSteps(processData.steps || []);
    } else {
      setName('');
      setCategory('');
      setStatus('Active');
      setSteps([]);
    }
  }, [processData, open]);

  const handleAddStep = () => {
    setSteps((prev) => [...prev, { id: Date.now(), type: 'text', title: '', content: '' }]);
  };

  const handleStepChange = (index, field, value) => {
    setSteps((prev) => {
      const newSteps = [...prev];
      newSteps[index][field] = value;
      return newSteps;
    });
  };

  const handleRemoveStep = (index) => {
    setSteps((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    const submission = { name, category, status, steps };
    if (processData?.processId) {
      onSubmitUpdate(processData.processId, submission);
    } else {
      onSubmitCreate(submission);
    }
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { width: { xs: '100%', sm: 480 } } }}
      ModalProps={{ keepMounted: true }}
    >
      <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h5" component="h2">
            {processData ? 'Edit Process' : 'New Process'}
          </Typography>
          <IconButton onClick={onClose} size="large">
            <CloseIcon />
          </IconButton>
        </Box>

        <Box component="form" sx={{ overflowY: 'auto', flexGrow: 1 }}>
          <TextField
            label="Process Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            required
            margin="normal"
          />
          <TextField
            label="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            fullWidth
            required
            margin="normal"
          />
          <TextField
            select
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            fullWidth
            margin="normal"
          >
            <MenuItem value="Active">Active</MenuItem>
            <MenuItem value="Inactive">Inactive</MenuItem>
          </TextField>

          <Divider sx={{ my: 2 }} />

          <Typography variant="h6" gutterBottom>
            Steps
          </Typography>

          {steps.map((step, index) => (
            <Box
              key={step.id}
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                mb: 2,
                p: 2,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <TextField
                  select
                  label="Step Type"
                  value={step.type}
                  onChange={(e) => handleStepChange(index, 'type', e.target.value)}
                  sx={{ width: 160 }}
                >
                  {stepTypes.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  label="Step Title"
                  value={step.title}
                  onChange={(e) => handleStepChange(index, 'title', e.target.value)}
                  sx={{ flexGrow: 1 }}
                  required
                />

                <Tooltip title="Remove Step">
                  <IconButton onClick={() => handleRemoveStep(index)} color="error" size="large">
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </Box>

              <StepContentInput
                step={step}
                onChange={(content) => handleStepChange(index, 'content', content)}
              />
            </Box>
          ))}

          <Button variant="outlined" startIcon={<AddIcon />} onClick={handleAddStep} sx={{ mt: 1 }}>
            Add Step
          </Button>
        </Box>

        <Box sx={{ pt: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Button onClick={onClose} sx={{ mr: 2 }}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSubmit} disabled={!name || steps.length === 0}>
            {processData ? 'Update Process' : 'Create Process'}
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
}
