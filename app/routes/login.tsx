import * as React from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import {
  Button,
  Typography,
  Container,
  Paper,
  CircularProgress
} from '@mui/material';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnUrl = searchParams.get('returnUrl');
  const { currentUser, userProfile, loading } = useAuth();

  // Redirect logic
  React.useEffect(() => {
    if (currentUser) {
      if (returnUrl) {
        navigate(returnUrl);
      } else if (userProfile) {
        navigate('/dashboard');
      } else {
        navigate('/dashboard');
      }
    }
  }, [currentUser, userProfile, navigate, returnUrl]);

  if (loading) {
    return (
      <Container component="main" maxWidth="xs" sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Loading user data...</Typography>
      </Container>
    );
  }

  // If we are here, it means currentUser is null (which shouldn't happen with the mock immediately setting it,
  // but good for safety or if we add a delay to the mock later)
  // Or the useEffect hasn't fired yet.

  return (
    <Container component="main" maxWidth="xs" sx={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
      <Paper elevation={3} sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography component="h1" variant="h5" sx={{ mb: 2 }}>
          Welcome to FinPlan
        </Typography>
        <Typography variant="body1" sx={{ mb: 3 }}>
          Prototype Mode: Authentication is mocked.
        </Typography>
        <Button
          type="button"
          fullWidth
          variant="contained"
          onClick={() => window.location.reload()} // Reloading will trigger the AuthContext mock again if stuck
        >
          Enter App
        </Button>
      </Paper>
    </Container>
  );
}
