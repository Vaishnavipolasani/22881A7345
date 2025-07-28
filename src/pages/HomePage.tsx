import React, { useState } from 'react';
import { Container, Box } from '@mui/material';
import { UrlForm } from '../components/UrlForm';
import { UrlResults } from '../components/UrlResults';
import { ShortenedUrl } from '../types';
import { logger } from '../utils/logger';

export const HomePage: React.FC = () => {
  const [shortenedUrls, setShortenedUrls] = useState<ShortenedUrl[]>([]);

  const handleUrlsShortened = (urls: ShortenedUrl[]) => {
    logger.info('URLs shortened successfully', { count: urls.length }, 'HomePage');
    setShortenedUrls(urls);
  };

  const handleClearResults = () => {
    logger.info('Clearing URL results', null, 'HomePage');
    setShortenedUrls([]);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ minHeight: '80vh' }}>
        <UrlForm onUrlsShortened={handleUrlsShortened} />
        <UrlResults urls={shortenedUrls} onClear={handleClearResults} />
      </Box>
    </Container>
  );
};