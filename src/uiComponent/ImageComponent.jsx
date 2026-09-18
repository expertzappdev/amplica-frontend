import React, { useState, useEffect, useRef } from 'react';
import { Box } from '@mui/material';

const ImageComponent = ({
  src,
  alt,
  aspectRatio = '16/9', // e.g., '16/9', '4/3', '1/1' or a number like 1.77
  placeholderText = 'Loading...',
  onErrorImage, 
  sx,
  imgSx,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef(null);
  const placeholderRef = useRef(null);

  const calculatePaddingBottom = () => {
    if (typeof aspectRatio === 'number') {
      return `${(1 / aspectRatio) * 100}%`;
    }
    const [width, height] = aspectRatio.split('/').map(Number);
    if (width && height) {
      return `${(height / width) * 100}%`;
    }
    return '56.25%';
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: '0px 0px 100px 0px',
      }
    );

    if (placeholderRef.current) {
      observer.observe(placeholderRef.current);
    }

    return () => {
      if (placeholderRef.current) {
        observer.unobserve(placeholderRef.current);
      }
    };
  }, []);

  const handleError = () => {
    setHasError(true);
  };

  const showPlaceholder = !isVisible || (hasError && !onErrorImage);
  const showActualImage = isVisible && !hasError;
  const showErrorImage = isVisible && hasError && onErrorImage;

  return (
    <Box
      ref={placeholderRef}
      sx={{
        position: 'relative',
        overflow: 'hidden',
        width: '100%',
        paddingBottom: calculatePaddingBottom(),
        backgroundColor: showPlaceholder ? placeholderColor : 'transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...sx,
      }}
    >
      {showPlaceholder && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#888',
            fontSize: '0.9rem',
          }}
        >
          {placeholderText}
        </Box>
      )}
      {showActualImage && (
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          onError={handleError}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: isVisible ? 1 : 0,
            transition: 'opacity 0.3s ease-in-out',
            ...imgSx,
          }}
        />
      )}
      {showErrorImage && (
        typeof onErrorImage === 'string' ? (
          <img
            src={onErrorImage}
            alt="Error placeholder"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              ...imgSx,
            }}
          />
        ) : (
          <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
            {onErrorImage}
          </Box>
        )
      )}
    </Box>
  );
};

/*
// How to use ImageComponent:
//
// import ImageComponent from './ImageComponent'; // Adjust path
//
// function MyPage() {
//   return (
//     <Box sx={{ maxWidth: '500px', margin: '20px auto' }}>
//       <Typography variant="h5" gutterBottom>Lazy Loaded Image with Aspect Ratio</Typography>
//       <ImageComponent
//         src="https://plus.unsplash.com/premium_photo-1673292293048-6680c5065510?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
//         alt="A beautiful landscape"
//         aspectRatio="16/9" // or 16/9, 1/1, etc.
//         placeholderText="Loading image..."
//         onErrorImage="https://via.placeholder.com/500x281.png?text=Image+Failed+to+Load" // URL to a fallback image
//         sx={{ borderRadius: '8px', boxShadow: 3 }}
//         imgSx={{ objectFit: 'cover' }}
//       />
//       <Box sx={{ height: '100vh' }} /> {/* To enable scrolling for lazy load testing * /}
//       <Typography variant="h5" gutterBottom>Another Image</Typography>
//       <ImageComponent
//         src="https://images.unsplash.com/photo-1715749262854-3c3bb298522f?q=80&w=1964&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
//         alt="Abstract art"
//         aspectRatio="4/3"
//         placeholderColor="#e0e0e0"
//       />
//        <ImageComponent
//         src="https://nonexistentimage.example.com/image.jpg" // This will cause an error
//         alt="Error test"
//         aspectRatio="1/1"
//         placeholderText="Trying to load..."
//         onErrorImage={<Box sx={{width: '100%', height: '100%', backgroundColor: 'lightcoral', display:'flex', alignItems: 'center', justifyContent: 'center'}}>Error Component</Box>}
//       />
//     </Box>
//   );
// }
*/

export default ImageComponent;