import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '@/services/userApiService';
import { Box, Button, CircularProgress, Container, Link, Paper, TextField, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { t } from 'i18next';

const RegisterPage = () => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      const success = await registerUser(email, username, password);
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
          {t('register_title')}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {t('register_description')}
        </Typography>

        <Box component="form" onSubmit={handleRegister} sx={{ mt: 3 }}>
          <TextField
            fullWidth
            label={t('form_email')}
            variant="outlined"
            margin="normal"
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <TextField
            fullWidth
            label={t('form_username')}
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

          <TextField
            fullWidth
            label={t('form_confirm_password')}
            variant="outlined"
            margin="normal"
            id="confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
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
            {isLoading ? <CircularProgress size={24} /> : t('register_button')}
          </Button>

          <Typography variant="body2" sx={{ mt: 2 }}>
            {t('already_have_account')}{" "}
            <Link href="/login" color="primary">
              {t('login_button')}
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default RegisterPage;