
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '@/services/userApiService';
import { Box, Button, CircularProgress, Container, InputLabel, Link, Paper, TextField, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { t } from 'i18next';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const success = await loginUser(username, password);
      if (success) {
        navigate('/');
      }
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container
      component="main"
      maxWidth="xs"
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
      }}
    >
      <Paper
        elevation={3}
        sx={{ p: 4, width: "100%", textAlign: "center", borderRadius: 2 }}
      >
        <Typography variant="h5" fontWeight="bold">
          Login to Teppo
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Enter your credentials to continue
        </Typography>

        <Box component="form" onSubmit={handleLogin} sx={{ mt: 3 }}>
          <TextField
            fullWidth
            label={t('form_email')}
            variant="outlined"
            margin="normal"
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <TextField
            fullWidth
            label={t('form_password')}
            variant="outlined"
            margin="normal"
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {errorMessage && (
            <Typography color="error" variant="body2" sx={{ mt: 1 }}>
              {errorMessage}
            </Typography>
          )}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
            disabled={isLoading}
          >
            {isLoading ? <CircularProgress size={24} /> : t('login_button')}
          </Button>

          <Typography variant="body2" sx={{ mt: 2 }}>
            {t('dont_have_an_account')}{" "}
            <Link href="/register" color="primary">
              {t('register_button')}
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default LoginPage;
