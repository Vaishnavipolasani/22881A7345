import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  useTheme,
} from '@mui/material';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { Link, BarChart3 } from 'lucide-react';

export const Header: React.FC = () => {
  const theme = useTheme();
  const location = useLocation();

  return (
    <AppBar position="static" elevation={2}>
      <Toolbar>
        <Box display="flex" alignItems="center" flexGrow={1}>
          <Link size={24} color={theme.palette.primary.contrastText} />
          <Typography
            variant="h5"
            component="h1"
            sx={{
              ml: 1,
              fontWeight: 600,
              color: theme.palette.primary.contrastText,
            }}
          >
            URL Shorten
          </Typography>
        </Box>

        <Box display="flex" gap={1}>
          <IconButton
            component={RouterLink}
            to="/"
            color={location.pathname === '/' ? 'secondary' : 'inherit'}
            sx={{
              borderRadius: 2,
              px: 2,
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              },
            }}
          >
            <Link size={20} />
            <Typography variant="body2" sx={{ ml: 0.5, display: { xs: 'none', sm: 'block' } }}>
              Shorten
            </Typography>
          </IconButton>

          <IconButton
            component={RouterLink}
            to="/stats"
            color={location.pathname === '/stats' ? 'secondary' : 'inherit'}
            sx={{
              borderRadius: 2,
              px: 2,
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              },
            }}
          >
            <BarChart3 size={20} />
            <Typography variant="body2" sx={{ ml: 0.5, display: { xs: 'none', sm: 'block' } }}>
              Analytics
            </Typography>
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
};