import React from 'react';
import { useNavigate } from 'react-router';
import {
  Box,
  Button,
  Container,
  Grid,
  Typography,
  AppBar,
  Toolbar,
  Stack,
  Card,
  CardContent,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  ShowChart as ChartIcon,
  Security as SecurityIcon,
  Group as FamilyIcon,
  AutoGraph as InsightsIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

export default function LandingPage() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { currentUser } = useAuth();

  const handleGetStarted = () => {
    if (currentUser) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Header */}
      <AppBar position="static" color="transparent" elevation={0} sx={{ bgcolor: 'white' }}>
        <Container maxWidth="lg">
          <Toolbar disableGutters>
            <Typography variant="h6" color="primary" sx={{ flexGrow: 1, fontWeight: 700 }}>
              FinPlan AI
            </Typography>
            <Button color="inherit" onClick={() => navigate('/login')}>
              Login
            </Button>
            <Button 
              variant="contained" 
              color="primary" 
              sx={{ ml: 2 }}
              onClick={handleGetStarted}
            >
              Get Started
            </Button>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Hero Section */}
      <Box sx={{ 
        pt: 10, 
        pb: 10, 
        background: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
        color: 'white'
      }}>
        <Container maxWidth="md">
          <Stack spacing={4} alignItems="center" textAlign="center">
            <Typography variant={isMobile ? "h3" : "h2"} component="h1" fontWeight="800">
              Master Your Wealth with AI
            </Typography>
            <Typography variant="h5" sx={{ opacity: 0.9, maxWidth: '800px' }}>
              The intelligent financial planner for your entire family. Track assets, manage investments, and plan for the future with data-driven insights.
            </Typography>
            <Button 
              variant="contained" 
              color="secondary" 
              size="large" 
              sx={{ 
                px: 5, 
                py: 1.5, 
                fontSize: '1.2rem',
                bgcolor: 'white',
                color: 'primary.main',
                '&:hover': {
                  bgcolor: 'grey.100',
                }
              }}
              onClick={handleGetStarted}
            >
              {currentUser ? 'Go to Dashboard' : 'Start Your Journey'}
            </Button>
          </Stack>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h4" component="h2" align="center" gutterBottom sx={{ mb: 6, fontWeight: 700, color: 'text.primary' }}>
          Why Choose FinPlan?
        </Typography>
        <Grid container spacing={4}>
          <FeatureCard 
            icon={<FamilyIcon fontSize="large" color="primary" />}
            title="Family-First Tracking"
            description="Manage finances for your entire household in one place. Link members, assign roles, and view consolidated net worth."
          />
          <FeatureCard 
            icon={<ChartIcon fontSize="large" color="primary" />}
            title="Global Asset Coverage"
            description="Track Stocks (India & US), Mutual Funds, Fixed Deposits, Real Estate, and more. Multi-currency support included."
          />
          <FeatureCard 
            icon={<InsightsIcon fontSize="large" color="primary" />}
            title="AI-Powered Insights"
            description="Get personalized recommendations and automated analysis of your portfolio health and diversification."
          />
        </Grid>
      </Container>

      {/* Footer */}
      <Box component="footer" sx={{ py: 4, bgcolor: 'grey.900', color: 'grey.400', mt: 'auto' }}>
        <Container maxWidth="lg">
          <Typography variant="body2" align="center">
            © {new Date().getFullYear()} FinPlan AI. All rights reserved.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <Grid size={{ xs: 12, md: 4 }}>
      <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', p: 2, transition: '0.3s', '&:hover': { transform: 'translateY(-5px)', boxShadow: 6 } }}>
        <CardContent>
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
            {icon}
          </Box>
          <Typography variant="h6" component="h3" gutterBottom fontWeight="bold">
            {title}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {description}
          </Typography>
        </CardContent>
      </Card>
    </Grid>
  );
}
