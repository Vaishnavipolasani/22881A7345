import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Chip,
  Alert,
  Snackbar,
  Divider,
  IconButton,
  Tooltip,
} from '@mui/material';
import { ContentCopy, CheckCircle } from '@mui/icons-material';
import { ExternalLink } from 'lucide-react';
import { ShortenedUrl } from '../types';
import { logger } from '../utils/logger';

interface UrlResultsProps {
  urls: ShortenedUrl[];
  onClear: () => void;
}

export const UrlResults: React.FC<UrlResultsProps> = ({ urls, onClear }) => {
  const [copiedUrl, setCopiedUrl] = useState<string>('');
  const [showSnackbar, setShowSnackbar] = useState(false);

  const copyToClipboard = async (text: string, shortCode: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedUrl(shortCode);
      setShowSnackbar(true);
      logger.info('URL copied to clipboard', { shortCode }, 'UrlResults');
    } catch (error) {
      logger.error('Failed to copy URL to clipboard', error, 'UrlResults');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getTimeUntilExpiry = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diffMs = expiry.getTime() - now.getTime();
    
    if (diffMs <= 0) return 'Expired';
    
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) return `${diffDays}d ${diffHours % 24}h`;
    if (diffHours > 0) return `${diffHours}h ${diffMins % 60}m`;
    return `${diffMins}m`;
  };

  const handleUrlClick = (shortCode: string, originalUrl: string) => {
    logger.info('User clicked shortened URL', { shortCode, originalUrl }, 'UrlResults');
    window.open(`/r/${shortCode}`, '_blank');
  };

  if (urls.length === 0) {
    return null;
  }

  return (
    <>
      <Card elevation={3} sx={{ mt: 3 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              Shortened URLs ({urls.length})
            </Typography>
            <Button variant="outlined" onClick={onClear}>
              Clear Results
            </Button>
          </Box>

          {urls.map((url, index) => (
            <Box key={url.id}>
              <Box sx={{ py: 2 }}>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                  <Box flexGrow={1} mr={2}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Original URL:
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        wordBreak: 'break-all',
                        mb: 1,
                      }}
                    >
                      {url.originalUrl}
                    </Typography>

                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Short URL:
                    </Typography>
                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                      <Typography
                        variant="body1"
                        sx={{
                          color: 'primary.main',
                          fontWeight: 500,
                          cursor: 'pointer',
                          '&:hover': { textDecoration: 'underline' },
                        }}
                        onClick={() => handleUrlClick(url.shortCode, url.originalUrl)}
                      >
                        {url.shortUrl}
                      </Typography>
                      <Tooltip title="Copy to clipboard">
                        <IconButton
                          size="small"
                          onClick={() => copyToClipboard(url.shortUrl, url.shortCode)}
                        >
                          <ContentCopy fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Open in new tab">
                        <IconButton
                          size="small"
                          onClick={() => handleUrlClick(url.shortCode, url.originalUrl)}
                        >
                          <ExternalLink fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>

                    <Box display="flex" gap={1} flexWrap="wrap">
                      <Chip
                        label={`Created: ${formatDate(url.createdAt)}`}
                        size="small"
                        variant="outlined"
                      />
                      <Chip
                        label={`Expires: ${formatDate(url.expiresAt)}`}
                        size="small"
                        variant="outlined"
                        color={url.isExpired ? 'error' : 'default'}
                      />
                      <Chip
                        label={`Time left: ${getTimeUntilExpiry(url.expiresAt)}`}
                        size="small"
                        color={url.isExpired ? 'error' : 'success'}
                      />
                      <Chip
                        label={`Clicks: ${url.clicks.length}`}
                        size="small"
                        color="primary"
                      />
                    </Box>
                  </Box>
                </Box>
              </Box>
              {index < urls.length - 1 && <Divider />}
            </Box>
          ))}
        </CardContent>
      </Card>

      <Snackbar
        open={showSnackbar}
        autoHideDuration={3000}
        onClose={() => setShowSnackbar(false)}
        message={`URL copied to clipboard!`}
        action={
          <IconButton size="small" color="inherit" onClick={() => setShowSnackbar(false)}>
            <CheckCircle fontSize="small" />
          </IconButton>
        }
      />
    </>
  );
};