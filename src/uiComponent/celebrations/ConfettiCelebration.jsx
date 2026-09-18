import React, { useState, useEffect } from 'react';
import Confetti from 'react-confetti';
import { useWindowSize } from '@uidotdev/usehooks';

export default function ConfettiCelebration({ isActive, duration = 5000, onComplete }) {
  const { width, height } = useWindowSize(); 
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (isActive) {
      setIsRunning(true);
      const timer = setTimeout(() => {
        setIsRunning(false);
        if (onComplete) {
          onComplete();
        }
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isActive, duration, onComplete]);

  if (!isRunning || !width || !height) {
    return null;
  }

  return (
    <Confetti
      width={width}
      height={height}
      recycle={false}
      numberOfPieces={isActive ? 200 : 0}
      gravity={0.1}
      // You can customize colors, opacity, etc.
      // colors={['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5']}
      onConfettiComplete={(confettiInstance) => {
        // This callback is when a single confetti particle instance completes its lifecycle,
        // not when all confetti is done. We use the timer for overall duration.
        // You could potentially stop it here if needed: confettiInstance.reset();
      }}
      style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 9999 }}
    />
  );
}





// ====================== How to use ConfettiCelebration ===========================

// import React, { useState } from 'react';
// import ConfettiCelebration from './components/celebrations/ConfettiCelebration'; // Adjust path
// import Button from '@mui/material/Button';

// export default function MyAchievingComponent() {
//   const [showConfetti, setShowConfetti] = useState(false);

//   const handleAchievement = () => {
//     // ... your achievement logic ...
//     setShowConfetti(true);
//     console.log("Achievement unlocked!");
//   };

//   const handleConfettiComplete = () => {
//     setShowConfetti(false); // Reset for next time
//     console.log("Confetti finished!");
//   };

//   return (
//     <div>
//       <Button variant="contained" onClick={handleAchievement}>
//         Complete Achievement!
//       </Button>
//       <ConfettiCelebration isActive={showConfetti} duration={5000} onComplete={handleConfettiComplete} />
//       {/* Other content */}
//     </div>
//   );
// }