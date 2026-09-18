import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    LinearProgress,
    IconButton,
    Fade,
    useTheme,
    alpha
} from '@mui/material';
import {
    Refresh as RefreshIcon,
    Close as CloseIcon,
    ErrorOutline as ErrorIcon,
    WifiOff as OfflineIcon,
    BugReport as BugIcon
} from '@mui/icons-material';

const ErrorBoundary = ({
    error,
    onRetry,
    onDismiss,
    autoRetryDelay = 3000,
    maxRetries = 3,
    showInline = false,
    title,
    showImage = true,
}) => {
    const theme = useTheme();
    const [countdown, setCountdown] = useState(autoRetryDelay / 1000);
    const [retryCount, setRetryCount] = useState(0);
    const [isRetrying, setIsRetrying] = useState(false);

    useEffect(() => {
        if (!error || retryCount >= maxRetries || isRetrying) return;

        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    handleAutoRetry();
                    return autoRetryDelay / 1000;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [error, retryCount, maxRetries, isRetrying, autoRetryDelay]);

    const handleAutoRetry = () => {
        setIsRetrying(true);
        setRetryCount(prev => prev + 1);

        setTimeout(() => {
            onRetry?.();
            setIsRetrying(false);
            setCountdown(autoRetryDelay / 1000);
        }, 500);
    };

    const handleManualRetry = () => {
        setIsRetrying(true);

        setTimeout(() => {
            onRetry?.();
            setIsRetrying(false);
            setRetryCount(prev => prev + 1);
            setCountdown(autoRetryDelay / 1000);
        }, 500);
    };

    if (!error) return null;

    const progressValue = ((autoRetryDelay / 1000 - countdown) / (autoRetryDelay / 1000)) * 100;
    const canAutoRetry = retryCount < maxRetries;

    // Determine error type for appropriate messaging and icons
    const getErrorType = () => {
        const errorMsg = typeof error === 'string' ? error.toLowerCase() : error?.message?.toLowerCase() || '';

        if (errorMsg.includes('network') || errorMsg.includes('fetch') || errorMsg.includes('connection')) {
            return { type: 'network', icon: OfflineIcon, color: theme.palette.warning.main };
        }
        if (errorMsg.includes('timeout') || errorMsg.includes('abort')) {
            return { type: 'timeout', icon: ErrorIcon, color: theme.palette.error.main };
        }
        return { type: 'general', icon: BugIcon, color: theme.palette.error.main };
    };

    const errorType = getErrorType();
    const ErrorIconComponent = errorType.icon;

    const getErrorTitle = () => {
        if (title) return title;

        switch (errorType.type) {
            case 'network':
                return 'Connection Problem';
            case 'timeout':
                return 'Request Timeout';
            default:
                return 'Something Went Wrong';
        }
    };

    const getErrorMessage = () => {
        const errorMsg = typeof error === 'string' ? error : error?.message || 'An unexpected error occurred';

        switch (errorType.type) {
            case 'network':
                return 'Please check your internet connection and try again.';
            case 'timeout':
                return 'The request took too long to complete. Please try again.';
            default:
                return errorMsg;
        }
    };

    return (
        <Fade in={true}>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: showInline ? 3 : 4,
                    mt: showInline ? 2 : 3,
                    mb: showInline ? 1 : 2,
                    // borderRadius: 3,
                    // background: `linear-gradient(135deg, ${alpha(theme.palette.error.light, 0.03)} 0%, ${alpha(theme.palette.error.light, 0.08)} 100%)`,
                    // border: `1px solid ${alpha(theme.palette.error.main, 0.12)}`,
                    position: 'relative',
                    // maxWidth: showInline ? '100%' : 480,
                    mx: 'auto',
                    textAlign: 'center',
                }}
            >
                {showImage && !showInline && (
                    <Box
                        sx={{
                            width: 120,
                            height: 120,
                            borderRadius: '50%',
                            backgroundColor: alpha(errorType.color, 0.1),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mb: 3,
                            position: 'relative',
                            '&::before': {
                                content: '""',
                                position: 'absolute',
                                width: '100%',
                                height: '100%',
                                borderRadius: '50%',
                                border: `2px solid ${alpha(errorType.color, 0.2)}`,
                                animation: 'pulse 2s infinite',
                            },
                            '@keyframes pulse': {
                                '0%': {
                                    transform: 'scale(1)',
                                    opacity: 1,
                                },
                                '100%': {
                                    transform: 'scale(1.1)',
                                    opacity: 0,
                                },
                            },
                        }}
                    >
                        <ErrorIconComponent
                            sx={{
                                fontSize: 48,
                                color: errorType.color,
                            }}
                        />
                    </Box>
                )}

                {/* Inline Icon */}
                {showInline && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <ErrorIconComponent
                            sx={{
                                fontSize: 32,
                                color: errorType.color,
                                mr: 2,
                            }}
                        />
                        <Typography
                            variant="h6"
                            sx={{
                                fontWeight: 600,
                                color: theme.palette.text.primary,
                                fontSize: '1.1rem',
                            }}
                        >
                            {getErrorTitle()}
                        </Typography>
                    </Box>
                )}

                {/* Error Title - Only for non-inline */}
                {!showInline && (
                    <Typography
                        variant="h5"
                        sx={{
                            fontWeight: 700,
                            color: theme.palette.text.primary,
                            mb: 1,
                            fontSize: '1.5rem',
                        }}
                    >
                        {getErrorTitle()}
                    </Typography>
                )}

                {/* Error Message */}
                <Typography
                    variant="body1"
                    sx={{
                        color: theme.palette.text.secondary,
                        mb: canAutoRetry ? 3 : 2,
                        lineHeight: 1.5,
                        maxWidth: 360,
                        fontSize: showInline ? '0.9rem' : '1rem',
                    }}
                >
                    {getErrorMessage()}
                </Typography>

                {/* Auto Retry Progress */}
                {canAutoRetry && (
                    <Box sx={{ width: '100%', maxWidth: 280, mb: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Typography
                                variant="caption"
                                sx={{
                                    color: theme.palette.text.secondary,
                                    fontSize: '0.75rem',
                                    fontWeight: 500,
                                }}
                            >
                                {isRetrying ? 'Retrying...' : `Auto-retry in ${countdown}s`}
                            </Typography>
                            <Typography
                                variant="caption"
                                sx={{
                                    color: theme.palette.text.secondary,
                                    fontSize: '0.75rem',
                                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                    px: 1,
                                    py: 0.5,
                                    borderRadius: 1,
                                }}
                            >
                                {retryCount + 1}/{maxRetries}
                            </Typography>
                        </Box>

                        <LinearProgress
                            variant="determinate"
                            value={isRetrying ? undefined : progressValue}
                            sx={{
                                height: 6,
                                borderRadius: 3,
                                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                '& .MuiLinearProgress-bar': {
                                    borderRadius: 3,
                                    background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
                                },
                            }}
                        />
                    </Box>
                )}

                {/* Action Buttons */}
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
                    <Button
                        variant="outlined"
                        color="secondary"
                        onClick={handleManualRetry}
                        disabled={isRetrying}
                        startIcon={<RefreshIcon />}
                    >
                        {isRetrying ? 'Retrying...' : 'Try Again'}
                    </Button>

                    {retryCount >= maxRetries && (
                        <Button
                            variant="contained" 
                            color="primary" 
                            onClick={() => window.location.reload()}
                        >
                            Refresh Page
                        </Button>
                    )}
                </Box>

                {/* Max Retries Message */}
                {retryCount >= maxRetries && (
                    <Typography
                        variant="caption"
                        sx={{
                            color: theme.palette.text.secondary,
                            mt: 2,
                            fontSize: '0.75rem',
                            fontStyle: 'italic',
                        }}
                    >
                        Maximum retry attempts reached. You can refresh the page or contact support if the problem persists.
                    </Typography>
                )}
            </Box>
        </Fade>
    );
};

export default ErrorBoundary;
