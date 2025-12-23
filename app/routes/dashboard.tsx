import * as React from 'react';
import { Typography, Grid, Paper, Box } from '@mui/material';
import { PieChart } from '@mui/x-charts/PieChart';
import { BarChart } from '@mui/x-charts/BarChart';
import { useSelection } from '../context/SelectionContext';
import { DataService } from '@core/services/data.service';
import { AssetAggregates } from '@core/types';

export default function Dashboard() {
  const { selectedMemberId } = useSelection();
  const [totalAssets, setTotalAssets] = React.useState<number>(0);
  const [totalLiabilities, setTotalLiabilities] = React.useState<number>(0);
  const [netWorth, setNetWorth] = React.useState<number>(0);
  const [dailyChange, setDailyChange] = React.useState<number>(0);
  const [aggregates, setAggregates] = React.useState<AssetAggregates | null>(null);
  const [categoryData, setCategoryData] = React.useState<{ label: string; value: number }[]>([]);

  React.useEffect(() => {
    const fetchDashboardData = async () => {
      const assets = await DataService.calculateTotalAssets(selectedMemberId);
      const liabilities = await DataService.calculateLiabilities(selectedMemberId);
      const worth = await DataService.calculateNetWorth(selectedMemberId);
      const change = await DataService.calculateDailyChange(selectedMemberId);
      const aggs = await DataService.getAssetAggregates(selectedMemberId);
      const catAggs = await DataService.getCategoryAggregates(selectedMemberId);

      setTotalAssets(assets);
      setTotalLiabilities(liabilities);
      setNetWorth(worth);
      setDailyChange(change);
      setAggregates(aggs);
      setCategoryData(catAggs);
    };
    fetchDashboardData();
  }, [selectedMemberId]);

  if (!aggregates) return null;

  const previousValue = totalAssets - dailyChange;
  const dailyChangePercent = previousValue ? (dailyChange / previousValue) * 100 : 0;
  const getColor = (value: number) => value >= 0 ? 'success.main' : 'error.main';
  const getSign = (value: number) => value >= 0 ? '+' : '';

  // Macro Asset Class Data
  const macroData = [
    { id: 0, value: aggregates.indianEquities + aggregates.usStocks, label: 'Direct Equity' },
    { id: 1, value: aggregates.mutualFunds, label: 'Mutual Funds' },
    { id: 2, value: aggregates.bankBalance + aggregates.fixedDeposits, label: 'Debt & Cash' },
    { id: 3, value: aggregates.commodities, label: 'Commodities' },
    { id: 4, value: aggregates.realEstate, label: 'Real Estate' },
  ]
    .filter(item => item.value > 0)
    .map(item => ({
      ...item,
      label: `${item.label} (${((item.value / aggregates.total) * 100).toFixed(1)}%)`
    }));

  const palette = [
    '#1b5e20', '#2e7d32', '#43a047', '#66bb6a', '#81c784', '#a5d6a7'
  ];

  return (
    <Box sx={{ pb: 4 }}>
      <Typography variant="h4" gutterBottom>Dashboard</Typography>
      
              {/* KPI Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
                  <Typography component="h2" variant="h6" color="primary" gutterBottom>Net Worth</Typography>
                  <Typography component="p" variant="h4">₹{netWorth.toLocaleString(undefined, { maximumFractionDigits: 0 })}</Typography>
                  <Typography color="text.secondary" sx={{ flex: 1 }}>on {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</Typography>
                </Paper>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
                  <Typography component="h2" variant="h6" color="primary" gutterBottom>Total Assets</Typography>
                  <Typography component="p" variant="h4">₹{totalAssets.toLocaleString(undefined, { maximumFractionDigits: 0 })}</Typography>
                </Paper>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
                  <Typography component="h2" variant="h6" color="primary" gutterBottom>Day's Change</Typography>
                  <Typography component="p" variant="h4" color={getColor(dailyChange)}>
                    {getSign(dailyChange)}₹{Math.abs(dailyChange).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </Typography>
                  <Typography variant="subtitle1" color={getColor(dailyChange)}>({dailyChangePercent.toFixed(2)}%)</Typography>
                </Paper>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
                  <Typography component="h2" variant="h6" color="primary" gutterBottom>Liabilities</Typography>
                  <Typography component="p" variant="h4">₹{totalLiabilities.toLocaleString()}</Typography>
                </Paper>
              </Grid>
            </Grid>
      
            <Grid container spacing={3}>
              {/* Macro Allocation (Donut) */}
              <Grid size={{ xs: 12, md: 5 }}>
                  <Paper sx={{ p: 2, height: 450, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <Typography variant="h6" gutterBottom>Asset Allocation</Typography>
                      <PieChart
                          colors={palette}
                          series={[{
                              data: macroData,
                              innerRadius: 80,
                              paddingAngle: 2,
                              cornerRadius: 5,
                              arcLabel: (item) => `${((item.value / aggregates.total) * 100).toFixed(0)}%`,
                              arcLabelMinAngle: 20,
                                                      highlightScope: { fade: 'global', highlight: 'item' },
                                                      faded: { innerRadius: 30, additionalRadius: -30, color: 'gray' },
                                                      valueFormatter: (item: { value: number }) => `₹${item.value.toLocaleString()}`,
                                                  }]}
                                                  height={350}
                                                                                                              slotProps={{
                                                                                                                  legend: { position: { vertical: 'middle', horizontal: 'end' } }
                                                                                                              }}                      />
                  </Paper>
              </Grid>
      
              {/* Micro Allocation (Bar Chart) */}
              <Grid size={{ xs: 12, md: 7 }}>            <Paper sx={{ p: 2, height: 450, display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h6" gutterBottom>Detailed Breakdown</Typography>
                {categoryData.length > 0 ? (
                    <BarChart
                        dataset={categoryData}
                        yAxis={[{ scaleType: 'band', dataKey: 'label' }]}
                        series={[{ dataKey: 'value', label: 'Value (INR)', color: '#2e7d32', valueFormatter: (v) => `₹${v?.toLocaleString()}` }]}
                        layout="horizontal"
                        margin={{ left: 100 }}
                        barLabel="value"
                    />
                ) : (
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                        <Typography color="text.secondary">No category data available.</Typography>
                    </Box>
                )}
            </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}