import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  Card,
  CardContent,
  Chip,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ReactPlayer from 'react-player';
import AudiotrackIcon from '@mui/icons-material/Audiotrack';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import QuizIcon from '@mui/icons-material/Quiz';

// Dummy quiz
const dummyQuizzes = {
  quiz1: {
    name: "Safety Quiz",
    questions: [
      { q: "What color is a stop sign?", options: ["Red", "Blue", "Green"], answer: "Red" },
      { q: "Emergency number?", options: ["112", "119"], answer: "112" }
    ]
  },
};

// Example process step renderers
function StepContent({ step }) {
  switch (step.type) {
    case 'video':
      return (
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>Video</Typography>
          {step.content && (
            <ReactPlayer url={step.content} controls width="100%" height="320px" />
          )}
        </Box>
      );
    case 'audio':
      return (
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>Audio</Typography>
          <audio controls src={step.content} style={{ width: '100%' }}>
            Your browser does not support the audio element.
          </audio>
        </Box>
      );
    case 'text':
      return (
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>Instruction</Typography>
          <Typography variant="body1">{step.content}</Typography>
        </Box>
      );
    case 'faq':
      let faqs = [];
      try { 
        faqs = JSON.parse(step.content) || [];
      } catch {
        faqs = [];
      }
      return (
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1 }}><HelpOutlineIcon fontSize="small" /> FAQ</Typography>
          {faqs.length === 0 && (
            <Typography variant="body2" color="text.secondary">No FAQ entries.</Typography>
          )}
          {faqs.length > 0 && faqs.map((faq, i) => (
            <Accordion key={i} sx={{ mb: 1 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle2">{faq.question}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2">{faq.answer}</Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      );
    case 'quiz':
      const quiz = dummyQuizzes[step.content];
      return (
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1 }}><QuizIcon sx={{ fontSize: 20, mr: 1 }}/>Quiz: {quiz?.name || "Unknown"}</Typography>
          <List>
            {(quiz?.questions || []).map((q, idx) => (
              <ListItem key={idx} sx={{ flexDirection: 'column', alignItems: 'flex-start', py: 1.5 }}>
                <ListItemText
                  primary={<Typography variant="body1">{idx + 1}. {q.q}</Typography>}
                  secondary={
                    <Box sx={{ mt: 0.5 }}>
                      {q.options.map(opt => (
                        <Chip
                          key={opt}
                          label={opt}
                          variant="outlined"
                          size="small"
                          color={opt === q.answer ? 'success' : 'default'}
                          sx={{ mr: 1, mb: 0.5 }}
                        />
                      ))}
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Box>
      );
    default:
      return <Typography variant="body2">Unsupported step type</Typography>;
  }
}

// Dummy process; replace with real data fetching logic or props
const dummyProcess = {
  processId: "P1",
  name: "Onboarding Process",
  category: "HR",
  status: "Active",
  startDate: "2025-08-01T00:00:00.000Z",
  endDate: "2025-08-31T00:00:00.000Z",
  steps: [
    { id: 1, type: "text", title: "Welcome", content: "Welcome to the HR onboarding process!" },
    { id: 2, type: "video", title: "Intro Video", content: "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4" },
    { id: 3, type: "audio", title: "Meet the Team Audio", content: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
    { id: 4, type: "faq", title: "Common Questions", content: JSON.stringify([{ question: "Business hours?", answer: "9am to 6pm IST" }]) },
    { id: 5, type: "quiz", title: "HR Policy Quiz", content: "quiz1" },
  ]
};

export default function ProcessDetailView({ process = dummyProcess }) {
  // Add fetch by processId logic here if from router, etc.
  return (
    <Box sx={{ maxWidth: '900px', mx: 'auto', p: { xs: 1, sm: 2 } }}>
      <Paper sx={{ p: { xs: 2, sm: 3 }, mb: 3, borderRadius: 3 }}>
        <Typography variant="h4" fontWeight={600}>{process.name}</Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{mb: 1}}>
          Category: <Chip label={process.category} size="small" sx={{ ml: 0.5 }}/>
          <Chip
            label={process.status}
            color={process.status === "Active" ? "success" : "default"}
            size="small"
            sx={{ ml: 2 }}
          />
        </Typography>
        <Typography variant="body2">
          <b>Start:</b> {process.startDate && new Date(process.startDate).toLocaleDateString()}
          &nbsp; | &nbsp;
          <b>End:</b> {process.endDate && new Date(process.endDate).toLocaleDateString()}
        </Typography>
      </Paper>

      {/* Steps */}
      {process.steps && process.steps.length > 0 ? (
        process.steps.map((step, idx) => (
          <Card key={step.id} sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Step {idx + 1}: {step.title}
              </Typography>
              <Divider sx={{ mb: 2 }}/>
              <StepContent step={step} />
            </CardContent>
          </Card>
        ))
      ) : (
        <Typography variant="body2" color="text.secondary">
          No steps defined for this process.
        </Typography>
      )}
    </Box>
  );
}
