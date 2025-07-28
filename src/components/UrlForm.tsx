import React, { useState } from 'react';
import {
  Card,
  CardContent,
  TextField,
  Button,
  Box,
  Typography,
  Alert,
  CircularProgress,
  Chip,
  Grid,
} from '@mui/material';
import { Add, Remove } from '@mui/icons-material';
import { logger } from '../utils/logger';
import { urlService } from '../utils/urlService';
import { validateUrlFormData } from '../utils/validation';
import { UrlFormData, ValidationError, ShortenedUrl } from '../types';

interface UrlFormProps {
  onUrlsShortened: (urls: ShortenedUrl[]) => void;
}

export const UrlForm: React.FC<UrlFormProps> = ({ onUrlsShortened }) => {
  const [forms, setForms] = useState<UrlFormData[]>([
    { originalUrl: '', validityMinutes: 30, customShortcode: '' }
  ]);
  const [errors, setErrors] = useState<Record<number, ValidationError[]>>({});
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState<string>('');

  const addForm = () => {
    if (forms.length < 5) {
      setForms([...forms, { originalUrl: '', validityMinutes: 30, customShortcode: '' }]);
      logger.info('Added new URL form', { formCount: forms.length + 1 }, 'UrlForm');
    }
  };

  const removeForm = (index: number) => {
    if (forms.length > 1) {
      const newForms = forms.filter((_, i) => i !== index);
      setForms(newForms);
      
      // Clean up errors for removed form
      const newErrors = { ...errors };
      delete newErrors[index];
      
      // Reindex remaining errors
      const reindexedErrors: Record<number, ValidationError[]> = {};
      Object.keys(newErrors).forEach(key => {
        const oldIndex = parseInt(key);
        if (oldIndex > index) {
          reindexedErrors[oldIndex - 1] = newErrors[oldIndex];
        } else if (oldIndex < index) {
          reindexedErrors[oldIndex] = newErrors[oldIndex];
        }
      });
      
      setErrors(reindexedErrors);
      logger.info('Removed URL form', { formCount: newForms.length, removedIndex: index }, 'UrlForm');
    }
  };

  const updateForm = (index: number, field: keyof UrlFormData, value: string | number) => {
    const newForms = [...forms];
    newForms[index] = { ...newForms[index], [field]: value };
    setForms(newForms);

    // Clear errors for this field
    if (errors[index]) {
      const newErrors = { ...errors };
      newErrors[index] = newErrors[index].filter(error => error.field !== field);
      if (newErrors[index].length === 0) {
        delete newErrors[index];
      }
      setErrors(newErrors);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setGlobalError('');
    setErrors({});

    logger.info('Starting URL shortening process', { formCount: forms.length }, 'UrlForm');

    try {
      // Validate all forms
      const allErrors: Record<number, ValidationError[]> = {};
      let hasErrors = false;

      forms.forEach((form, index) => {
        const formErrors = validateUrlFormData(form);
        if (formErrors.length > 0) {
          allErrors[index] = formErrors;
          hasErrors = true;
        }
      });

      if (hasErrors) {
        setErrors(allErrors);
        setLoading(false);
        return;
      }

      // Shorten all URLs
      const shortenedUrls: ShortenedUrl[] = [];
      
      for (let i = 0; i < forms.length; i++) {
        const form = forms[i];
        try {
          const shortenedUrl = urlService.shortenUrl(
            form.originalUrl.trim(),
            form.validityMinutes || 30,
            form.customShortcode?.trim() || undefined
          );
          shortenedUrls.push(shortenedUrl);
        } catch (error) {
          logger.error('Failed to shorten URL', { error, form, index: i }, 'UrlForm');
          throw new Error(`Failed to shorten URL ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      logger.info('All URLs shortened successfully', { count: shortenedUrls.length }, 'UrlForm');
      onUrlsShortened(shortenedUrls);

      // Reset forms
      setForms([{ originalUrl: '', validityMinutes: 30, customShortcode: '' }]);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to shorten URLs';
      setGlobalError(errorMessage);
      logger.error('URL shortening failed', error, 'UrlForm');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card elevation={3}>
      <CardContent>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
          Shorten Your URLs
        </Typography>

        {globalError && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {globalError}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          {forms.map((form, index) => (
            <Card
              key={index}
              variant="outlined"
              sx={{
                mb: 2,
                border: errors[index] ? '1px solid #f44336' : '1px solid #e0e0e0',
              }}
            >
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6" sx={{ fontWeight: 500 }}>
                    URL #{index + 1}
                  </Typography>
                  {forms.length > 1 && (
                    <Button
                      size="small"
                      color="error"
                      startIcon={<Remove />}
                      onClick={() => removeForm(index)}
                    >
                      Remove
                    </Button>
                  )}
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Original URL"
                      placeholder="https://example.com"
                      value={form.originalUrl}
                      onChange={(e) => updateForm(index, 'originalUrl', e.target.value)}
                      error={errors[index]?.some(e => e.field === 'originalUrl')}
                      helperText={errors[index]?.find(e => e.field === 'originalUrl')?.message}
                      required
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Validity (minutes)"
                      type="number"
                      value={form.validityMinutes || ''}
                      onChange={(e) => updateForm(index, 'validityMinutes', parseInt(e.target.value) || 30)}
                      error={errors[index]?.some(e => e.field === 'validityMinutes')}
                      helperText={errors[index]?.find(e => e.field === 'validityMinutes')?.message || 'Default: 30 minutes'}
                      inputProps={{ min: 1, max: 525600 }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Custom Shortcode (optional)"
                      placeholder="e.g., mylink"
                      value={form.customShortcode}
                      onChange={(e) => updateForm(index, 'customShortcode', e.target.value)}
                      error={errors[index]?.some(e => e.field === 'customShortcode')}
                      helperText={errors[index]?.find(e => e.field === 'customShortcode')?.message || '3-20 alphanumeric characters'}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          ))}

          <Box display="flex" justifyContent="space-between" alignItems="center" mt={3}>
            <Box>
              {forms.length < 5 && (
                <Button
                  variant="outlined"
                  startIcon={<Add />}
                  onClick={addForm}
                  sx={{ mr: 2 }}
                >
                  Add URL ({forms.length}/5)
                </Button>
              )}
              <Chip
                label={`${forms.length} URL${forms.length > 1 ? 's' : ''} to shorten`}
                color="primary"
                variant="outlined"
              />
            </Box>

            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={loading || forms.every(f => !f.originalUrl.trim())}
              sx={{
                minWidth: 120,
                py: 1.5,
              }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Shorten URLs'
              )}
            </Button>
          </Box>
        </form>
      </CardContent>
    </Card>
  );
};