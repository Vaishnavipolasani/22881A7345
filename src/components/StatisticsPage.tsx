import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Box,
  Chip,
  Divider,
  Button,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Grid,
} from '@mui/material';
import { ContentCopy, Refresh, Delete } from '@mui/icons-material';
import { ExternalLink } from 'lucide-react';
import { ShortenedUrl } from '../types';
import { urlService } from '../utils/urlService';
import { logger } from '../utils/logger';

export const StatisticsPage: React.FC = () => {
  const [urls, setUrls] = useState<ShortenedUrl[]>([]);
  const [loading, setLoading] = useState(true);

  const loadUrls = () => {
    logger.info('Loading URLs for statistics page', null, 'StatisticsPage');
    setLoading(true);
    try {
      const allUrls = urlService.getAllUrls();
      setUrls(allUrls);
      logger.info('URLs loaded successfully', { count: allUrls.length }, 'StatisticsPage');
    } catch (error) {
      logger.error('Failed to load URLs', error, 'StatisticsPage');
    } finally {
      setLoading(false);
    }
  };

  const cleanupExpiredUrls = () => {
    logger.info('Cleaning up expired URLs', null, 'StatisticsPage');
    const deletedCount = urlService.deleteExpiredUrls();
    loadUrls();
    logger.info('Expired URLs cleanup completed', { deletedCount }, 'StatisticsPage');
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      logger.info('URL copied to clipboard from stats page', { url: text }, 'StatisticsPage');
    } catch (error) {
      logger.error('Failed to copy URL to clipboard', error, 'StatisticsPage');
    }
  };

  const handleUrlClick = (shortCode: string, originalUrl: string) => {
    logger.info('User clicked shortened URL from stats page', { shortCode, originalUrl }, 'StatisticsPage');
    window.open(`/r/${shortCode}`, '_blank');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getTotalClicks = () => {
    return urls.reduce((total, url) => total + url.clicks.length, 0);
  };

  const getActiveUrls = () => {
    return urls.filter(url => !url.isExpired).length;
  };

  const getExpiredUrls = () => {
    return urls.filter(url => url.isExpired).length;
  };

  useEffect(() => {
    loadUrls();
  }, []);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography>Loading statistics...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          URL Analytics & Statistics
        </Typography>
        <Box gap={2} display="flex">
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={loadUrls}
          >
            Refresh
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<Delete />}
            onClick={cleanupExpiredUrls}
          >
            Clean Expired
          </Button>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Total URLs
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 600 }}>
                {urls.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Active URLs
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 600, color: 'success.main' }}>
                {getActiveUrls()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Expired URLs
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 600, color: 'error.main' }}>
                {getExpiredUrls()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Total Clicks
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 600, color: 'primary.main' }}>
                {getTotalClicks()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {urls.length === 0 ? (
        <Alert severity="info">
          No URLs have been shortened yet. Go to the main page to create some shortened URLs.
        </Alert>
      ) : (
        urls.map((url) => (
          <Card key={url.id} sx={{ mb: 3 }} elevation={2}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                <Box flexGrow={1}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    {url.shortCode}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Original URL:
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{ wordBreak: 'break-all', mb: 2 }}
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
                        onClick={() => copyToClipboard(url.shortUrl)}
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

                  <Box display="flex" gap={1} flexWrap="wrap" mb={2}>
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
                      label={url.isExpired ? 'Expired' : 'Active'}
                      size="small"
                      color={url.isExpired ? 'error' : 'success'}
                    />
                    <Chip
                      label={`${url.clicks.length} clicks`}
                      size="small"
                      color="primary"
                    />
                  </Box>
                </Box>
              </Box>

              {url.clicks.length > 0 && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    Click Analytics
                  </Typography>
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Timestamp</TableCell>
                          <TableCell>Source</TableCell>
                          <TableCell>Location</TableCell>
                          <TableCell>User Agent</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {url.clicks.map((click) => (
                          <TableRow key={click.id}>
                            <TableCell>
                              {formatDate(click.timestamp)}
                            </TableCell>
                            <TableCell>
                              <Chip label={click.source} size="small" variant="outlined" />
                            </TableCell>
                            <TableCell>
                              <Chip label={click.location} size="small" color="primary" variant="outlined" />
                            </TableCell>
                            <TableCell sx={{ maxWidth: 200 }}>
                              <Typography
                                variant="caption"
                                sx={{
                                  display: 'block',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                }}
                                title={click.userAgent}
                              >
                                {click.userAgent}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </>
              )}
            </CardContent>
          </Card>
        ))
      )}
    </Container>
  );
};