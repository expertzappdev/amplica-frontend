import React from 'react';
import { RadioGroup, FormControlLabel, Radio, Typography, Box } from '@mui/material';

export default function QuizQuestion({ question, selectedAnswer, onSelectAnswer }) {
  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h6">{question.text}</Typography>
      <RadioGroup
        value={selectedAnswer}
        onChange={(e) => onSelectAnswer(e.target.value)}
      >
        {question.options.map((opt, idx) => (
          <FormControlLabel
            key={idx}
            value={opt}
            control={<Radio />}
            label={opt}
          />
        ))}
      </RadioGroup>
    </Box>
  );
}
