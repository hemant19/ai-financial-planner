import { Typography, Grid, Paper, Box } from '@mui/material';
import { useSelection } from '../context/SelectionContext';
import { DataService } from '../services/data.service';

export default function Dashboard() {
  const { selectedMemberId } = useSelection();

  const totalAssets = DataService.calculateTotalAssets(selectedMemberId);
  const totalLiabilities = DataService.calculateLiabilities(selectedMemberId);
  const netWorth = DataService.calculateNetWorth(selectedMemberId);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
             <Typography component="h2" variant="h6" color="primary" gutterBottom>
                Net Worth
             </Typography>
             <Typography component="p" variant="h4">
                ₹{netWorth.toLocaleString()}
             </Typography>
             <Typography color="text.secondary" sx={{ flex: 1 }}>
                on {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
             </Typography>
          </Paper>
        </Grid>
         <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
             <Typography component="h2" variant="h6" color="primary" gutterBottom>
                Total Assets
             </Typography>
             <Typography component="p" variant="h4">
                ₹{totalAssets.toLocaleString()}
             </Typography>
          </Paper>
        </Grid>
         <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
             <Typography component="h2" variant="h6" color="primary" gutterBottom>
                Liabilities
             </Typography>
             <Typography component="p" variant="h4">
                ₹{totalLiabilities.toLocaleString()}
             </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
