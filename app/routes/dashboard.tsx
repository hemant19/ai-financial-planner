import * as React from 'react';
import { Typography, Grid, Paper, Box } from '@mui/material';
import { useSelection } from '../context/SelectionContext';
import { DataService } from '../services/data.service';
import { AssetAggregates } from '../types';
import { sampleData } from '~/data/financial-data';

export default function Dashboard() {
  const { selectedMemberId } = useSelection();
  const [totalAssets, setTotalAssets] = React.useState<number>(0);
  const [totalLiabilities, setTotalLiabilities] = React.useState<number>(0);
  const [netWorth, setNetWorth] = React.useState<number>(0);
  const [aggregates, setAggregates] = React.useState<AssetAggregates | null>(null);

  React.useEffect(() => {
    const fetchDashboardData = async () => {
      const assets = await DataService.calculateTotalAssets(selectedMemberId);
      const liabilities = await DataService.calculateLiabilities(selectedMemberId);
      const worth = await DataService.calculateNetWorth(selectedMemberId);
      const aggs = await DataService.getAssetAggregates(selectedMemberId);

      setTotalAssets(assets);
      setTotalLiabilities(liabilities);
      setNetWorth(worth);
      setAggregates(aggs);
    };
    fetchDashboardData();
  }, [selectedMemberId]);

  if (!aggregates) return null;

  console.log(sampleData.holdings.map((h) => h.symbol).join("\n\t"))
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

      <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>
        Asset Allocation
      </Typography>
      <Grid container spacing={3}>
        {[
          { label: 'Bank Balance', value: aggregates.bankBalance },
          { label: 'Fixed Deposits', value: aggregates.fixedDeposits },
          { label: 'Indian Equities', value: aggregates.indianEquities },
          { label: 'Indian Mutual Funds', value: aggregates.mutualFunds },
          { label: 'US Stocks', value: aggregates.usStocks },
          { label: 'Real Estate', value: aggregates.realEstate },
        ].map((item) => (
          <Grid key={item.label} size={{ xs: 12, sm: 6, md: 4 }}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="overline" color="text.secondary">
                {item.label}
              </Typography>
              <Typography variant="h6">
                ₹{item.value.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {aggregates.total > 0 ? ((item.value / aggregates.total) * 100).toFixed(1) : 0}% of total
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
