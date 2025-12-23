import * as React from 'react';
import { Typography, Grid, Paper, Box } from '@mui/material';
import { PieChart } from '@mui/x-charts/PieChart';
import { useSelection } from '../context/SelectionContext';
import { DataService } from '../services/data.service';
import { AssetAggregates } from '../types';
import { sampleData } from '~/data/financial-data';

export default function Dashboard() {
  const { selectedMemberId } = useSelection();
  const [totalAssets, setTotalAssets] = React.useState<number>(0);
  const [totalLiabilities, setTotalLiabilities] = React.useState<number>(0);
  const [netWorth, setNetWorth] = React.useState<number>(0);
  const [dailyChange, setDailyChange] = React.useState<number>(0);
  const [aggregates, setAggregates] = React.useState<AssetAggregates | null>(null);

  React.useEffect(() => {
    const fetchDashboardData = async () => {
      const assets = await DataService.calculateTotalAssets(selectedMemberId);
      const liabilities = await DataService.calculateLiabilities(selectedMemberId);
      const worth = await DataService.calculateNetWorth(selectedMemberId);
      const change = await DataService.calculateDailyChange(selectedMemberId);
      const aggs = await DataService.getAssetAggregates(selectedMemberId);

      setTotalAssets(assets);
      setTotalLiabilities(liabilities);
      setNetWorth(worth);
      setDailyChange(change);
      setAggregates(aggs);
    };
    fetchDashboardData();
  }, [selectedMemberId]);

  if (!aggregates) return null;

  const previousValue = totalAssets - dailyChange;
  const dailyChangePercent = previousValue ? (dailyChange / previousValue) * 100 : 0;
  const getColor = (value: number) => value >= 0 ? 'success.main' : 'error.main';
  const getSign = (value: number) => value >= 0 ? '+' : '';

  const chartData = [
    { id: 0, value: aggregates.bankBalance, label: 'Bank Balance' },
    { id: 1, value: aggregates.fixedDeposits, label: 'Fixed Deposits' },
    { id: 2, value: aggregates.indianEquities, label: 'Indian Equities' },
    { id: 3, value: aggregates.mutualFunds, label: 'Indian Mutual Funds' },
    { id: 4, value: aggregates.usStocks, label: 'US Stocks' },
    { id: 5, value: aggregates.realEstate, label: 'Real Estate' },
  ]
    .filter(item => item.value > 0)
    .map(item => ({
      ...item,
      label: `${item.label} (${((item.value / aggregates.total) * 100).toFixed(1)}%)`
    }));

  const palette = [
    '#1b5e20', // Darkest Green
    '#2e7d32', // Primary
    '#43a047',
    '#66bb6a',
    '#81c784',
    '#a5d6a7', // Lightest Green
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
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
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              Total Assets
            </Typography>
            <Typography component="p" variant="h4">
              ₹{totalAssets.toLocaleString()}
            </Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              Day's Change
            </Typography>
            <Typography component="p" variant="h4" color={getColor(dailyChange)}>
              {getSign(dailyChange)}₹{Math.abs(dailyChange).toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </Typography>
            <Typography variant="subtitle1" color={getColor(dailyChange)}>
               ({dailyChangePercent.toFixed(2)}%)
            </Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
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
      <Paper sx={{ p: 2, height: 400, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        {chartData.length > 0 ? (
          <PieChart
            colors={palette}
            series={[
              {
                data: chartData,
                innerRadius: 70,
                paddingAngle: 2,
                cornerRadius: 5,
                arcLabel: (item) => `${((item.value / aggregates.total) * 100).toFixed(0)}%`,
                arcLabelMinAngle: 20,
                highlightScope: { faded: 'global', highlighted: 'item' },
                faded: { innerRadius: 30, additionalRadius: -30, color: 'gray' },
                valueFormatter: (item: { value: number }) => `₹${item.value.toLocaleString()}`,
              },
            ]}
            height={350}
            slotProps={{
                legend: {
                    direction: 'column',
                    position: { vertical: 'middle', horizontal: 'right' },
                    padding: 0,
                    labelStyle: {
                        fontSize: 12,
                    },
                }
            }}
          />
        ) : (
           <Typography color="text.secondary">No asset data available to display.</Typography>
        )}
      </Paper>
    </Box>
  );
}
