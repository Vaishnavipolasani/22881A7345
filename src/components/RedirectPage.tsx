import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Typography, Alert, CircularProgress, Box } from '@mui/material';
import { urlService } from '../utils/urlService';
import { logger } from '../utils/logger';

export const RedirectPage: React.FC = () => {
  const { shortCode } = useParams<{ shortCode: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const handleRedirect = () => {
      if (!shortCode) {
        setError('Invalid short URL');
        setLoading(false);
        return;
      }

      logger.info('Processing redirect request', { shortCode }, 'RedirectPage');

      try {
        const result = urlService.trackClick(shortCode);
        
        if (result.success) {
          logger.info('Redirect successful', { shortCode, originalUrl: result.originalUrl }, 'RedirectPage');
          // Perform redirect
          window.location.href = result.originalUrl;
        } else {
          logger.warn('Redirect failed', { shortCode, error: result.error }, 'RedirectPage');
          setError(result.error || 'Failed to redirect');
          setLoading(false);
        }
      } catch (error) {
        logger.error('Redirect error', { error, shortCode }, 'RedirectPage');
        setError('An unexpected error occurred');
        setLoading(false);
      }
    };

    // Small delay to show loading state
    const timer = setTimeout(handleRedirect, 500);
    return () => clearTimeout(timer);
  }, [shortCode]);

  if (loading) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Box display="flex" flexDirection="column" alignItems="center" gap={3}>
          <CircularProgress size={60} />
          <Typography variant="h5" align="center">
            Redirecting...
          </Typography>
          <Typography variant="body1" color="text.secondary" align="center">
            Please wait while we redirect you to the original URL.
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Alert severity="error">
        <Typography variant="h6" gutterBottom>
          Redirect Failed
        </Typography>
        <Typography variant="body1">
          {error}
        </Typography>
      </Alert>
    </Container>
  );
};