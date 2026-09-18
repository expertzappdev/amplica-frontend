import React from 'react';
import { Box, Typography, List, ListItem, ListItemText, Collapse, IconButton } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

export default function QuizResult({ results }) {
  const [openIndexes, setOpenIndexes] = React.useState({});

  const toggleOpen = (index) => {
    setOpenIndexes((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const correctCount = results.filter(r => r.isCorrect).length;

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Score: {correctCount} out of {results.length}
      </Typography>
      <List>
        {results.map((res, idx) => (
          <React.Fragment key={idx}>
            <ListItem button onClick={() => toggleOpen(idx)}>
              <ListItemText
                primary={res.question}
                secondary={`Your answer: ${res.userAnswer} | Correct answer: ${res.correctAnswer}`}
                sx={{ color: res.isCorrect ? 'success.main' : 'error.main' }}
              />
              {openIndexes[idx] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </ListItem>
            <Collapse in={openIndexes[idx]} timeout="auto" unmountOnExit>
              <Box sx={{ pl: 4, pb: 2 }}>
                <Typography variant="body2" color="text.secondary">{res.explanation}</Typography>
              </Box>
            </Collapse>
          </React.Fragment>
        ))}
      </List>
    </Box>
  );
}
