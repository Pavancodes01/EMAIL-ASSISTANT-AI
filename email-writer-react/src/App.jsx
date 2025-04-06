import axios from 'axios';
import { useState } from 'react';
import './App.css';
import {
  Box,
  CircularProgress,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  Button,
} from '@mui/material';

function App() {
  const [emailContent, setEmailContent] = useState('');
  const [tone, setTone] = useState('');
  const [generatedReply, setGeneratedReply] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isValidEmail, setIsValidEmail] = useState(false);

  const handleSubmit = async (event) => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.post("http://localhost:8081/api/email/generate", {
        emailContent,
        tone,
      });
      if (typeof response.data === 'string') {
        setGeneratedReply(response.data);
      } else {
        setGeneratedReply(JSON.stringify(response.data));
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateClick = () => {
    if (emailContent.trim() || tone) {
      handleSubmit();
    } else {
      setError("Please fill out all fields before submitting");
    }
  };

  const handleChange = () => {
    if (emailContent.trim()) {
      setIsValidEmail(true);
    } else {
      setIsValidEmail(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom>
        Email Reply Generator
      </Typography>
      <Box sx={{ mx: 3 }}>
        <TextField
          fullWidth
          multiline
          rows={6}
          variant="outlined"
          label="Original Email Content"
          value={emailContent || ''}
          onChange={(e) => {
            setEmailContent(e.target.value);
            handleChange();
          }}
          sx={{ mb: 2 }}
          helperText={isValidEmail ? '' : 'Email content is required'}
          error={!isValidEmail}
        />
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Tone (Optional)</InputLabel>
          <Select
            value={tone || ''}
            label="Tone (Optional)"
            onChange={(e) => setTone(e.target.value)}
          >
            <MenuItem value="">None</MenuItem>
            <MenuItem value="professional">Professional</MenuItem>
            <MenuItem value="casual">Casual</MenuItem>
            <MenuItem value="friendly">Friendly</MenuItem>
          </Select>
        </FormControl>
        <Button
          variant="contained"
          onClick={handleGenerateClick}
          disabled={!emailContent || loading || !tone}
          fullWidth
        >
          {loading ? (
            <CircularProgress size={24} />
          ) : (
            "Generate Reply"
          )}
        </Button>
      </Box>

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      {generatedReply && (
        <Box sx={{ mt: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Generated Reply:
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={6}
            variant="outlined"
            value={generatedReply || ''}
            inputProps={{ readonly: true }}
          />
          <Button
            variant="outlined"
            sx={{ mt: 2 }}
            onClick={() => navigator.clipboard.writeText(generatedReply)}
          >
            Copy to Clipboard
          </Button>
        </Box>
      )}
    </Container>
  );
}

export default App;