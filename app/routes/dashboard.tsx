import { Typography, Grid, Paper, Box } from '@mui/material';

export default function Dashboard() {
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
                     $1,234,567
                  </Typography>
                  <Typography color="text.secondary" sx={{ flex: 1 }}>
                     on 15 March, 2024
                  </Typography>
               </Paper>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
               <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
                  <Typography component="h2" variant="h6" color="primary" gutterBottom>
                     Total Assets
                  </Typography>
                  <Typography component="p" variant="h4">
                     $1,500,000
                  </Typography>
               </Paper>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
               <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
                  <Typography component="h2" variant="h6" color="primary" gutterBottom>
                     Liabilities
                  </Typography>
                  <Typography component="p" variant="h4">
                     $265,433
                  </Typography>
               </Paper>
            </Grid>
         </Grid>
      </Box>
   );
}
