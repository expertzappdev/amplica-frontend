import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Chip } from '@mui/material';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import LogoutIcon from '@mui/icons-material/Logout';
import {
  selectIsImpersonating,
  selectImpersonatedCompanyName,
  selectImpersonatedCompanyId,
  exitImpersonationRequest,
} from '../redux/features/auth/authSlice';

/**
 * ImpersonationBanner
 * Renders a persistent sticky banner at the top of the app when the
 * Super Admin is impersonating a company. All audit actions during this
 * session are logged under the Super Admin's UserId.
 */
export default function ImpersonationBanner() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const isImpersonating = useSelector(selectIsImpersonating);
  const companyName = useSelector(selectImpersonatedCompanyName);
  const companyId = useSelector(selectImpersonatedCompanyId);
  const originalToken = useSelector((state) => state.auth.originalToken);

  if (!isImpersonating) return null;

  const handleExit = () => {
    dispatch(
      exitImpersonationRequest({
        originalToken,
        onSuccess: () => navigate('/super-admin/companies'),
      })
    );
  };

  return (
    <Box
      id="impersonation-banner"
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: { xs: 2, sm: 3 },
        py: 0.75,
        background: 'linear-gradient(90deg, #b45309 0%, #d97706 50%, #b45309 100%)',
        boxShadow: '0 2px 8px rgba(180,83,9,0.4)',
        gap: 2,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
        <WarningAmberRoundedIcon sx={{ color: '#fff', fontSize: 20 }} />
        <Typography variant="body2" sx={{ color: '#fff', fontWeight: 600, whiteSpace: 'nowrap' }}>
          Impersonating:
        </Typography>
        <Chip
          label={companyName || `Company #${companyId}`}
          size="small"
          sx={{
            backgroundColor: 'rgba(255,255,255,0.2)',
            color: '#fff',
            fontWeight: 700,
            fontSize: '0.8rem',
            border: '1px solid rgba(255,255,255,0.4)',
          }}
        />
        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.85)', display: { xs: 'none', sm: 'inline' } }}>
          All changes are logged under your Super Admin ID
        </Typography>
      </Box>
      <Button
        id="exit-impersonation-btn"
        size="small"
        variant="contained"
        startIcon={<LogoutIcon sx={{ fontSize: 16 }} />}
        onClick={handleExit}
        sx={{
          backgroundColor: '#fff',
          color: '#b45309',
          fontWeight: 700,
          fontSize: '0.78rem',
          whiteSpace: 'nowrap',
          flexShrink: 0,
          px: 1.5,
          py: 0.4,
          '&:hover': { backgroundColor: 'rgba(255,255,255,0.88)' },
        }}
      >
        Exit Impersonation
      </Button>
    </Box>
  );
}
