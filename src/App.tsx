import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline, Box } from '@mui/material';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Header } from './components/Header';
import { HomePage } from './pages/HomePage';
import { StatisticsPage } from './components/StatisticsPage';
import { RedirectPage } from './components/RedirectPage';
import { logger } from './utils/logger';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#9c27b0',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
  },
});

function App() {
  React.useEffect(() => {
    logger.info('Application initialized', { timestamp: new Date().toISOString() }, 'App');
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ErrorBoundary>
        <Router>
          <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50' }}>
            <Header />
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/stats" element={<StatisticsPage />} />
              <Route path="/r/:shortCode" element={<RedirectPage />} />
            </Routes>
          </Box>
        </Router>
      </ErrorBoundary>
    </ThemeProvider>
  );
}

export default App;