import * as React from 'react';
import { Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Box, Grid, Chip } from '@mui/material';
import { Link } from 'react-router';
import { useSelection } from '../context/SelectionContext';
import { DataService } from '../services/data.service';
import { Holding } from '../types';

export default function IndianEquities() {
  const { selectedMemberId } = useSelection();
  const [holdings, setHoldings] = React.useState<Holding[]>([]);

  React.useEffect(() => {
    const fetchHoldings = async () => {
      const data = await DataService.getHoldingsForMember(selectedMemberId, 'EQUITY');
      setHoldings(data.filter(h => h.currency === 'INR'));
    };
    fetchHoldings();
  }, [selectedMemberId]);

  // Calculations
  const totalInvested = holdings.reduce((acc, h) => acc + (h.quantity * h.averagePrice), 0);
  const totalCurrentValue = holdings.reduce((acc, h) => acc + (h.quantity * (h.lastPrice || 0)), 0);
  
  const totalDayChange = holdings.reduce((acc, h) => acc + (h.quantity * (h.dayChange || 0)), 0);
  const previousValue = totalCurrentValue - totalDayChange;
  const totalDayChangePercent = previousValue ? (totalDayChange / previousValue) * 100 : 0;

  const totalChange = totalCurrentValue - totalInvested;
  const totalChangePercent = totalInvested ? (totalChange / totalInvested) * 100 : 0;

  const getColor = (value: number) => value >= 0 ? 'success.main' : 'error.main';
  const getSign = (value: number) => value >= 0 ? '+' : '';

  const getVerdictColor = (verdict: string) => {
      switch (verdict) {
          case 'BUY': return 'success';
          case 'ACCUMULATE': return 'info';
          case 'HOLD': return 'warning';
          case 'TRIM': return 'warning';
          case 'SELL': return 'error';
          default: return 'default';
      }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Indian Equities
      </Typography>

      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
            <Paper sx={{ p: 2 }}>
                <Typography color="text.secondary" variant="overline">Total Invested</Typography>
                <Typography variant="h6">₹{totalInvested.toLocaleString(undefined, { maximumFractionDigits: 0 })}</Typography>
            </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
            <Paper sx={{ p: 2 }}>
                <Typography color="text.secondary" variant="overline">Current Value</Typography>
                <Typography variant="h6">₹{totalCurrentValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</Typography>
            </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
            <Paper sx={{ p: 2 }}>
                <Typography color="text.secondary" variant="overline">Day's Change</Typography>
                <Typography variant="h6" color={getColor(totalDayChange)}>
                    {getSign(totalDayChange)}₹{Math.abs(totalDayChange).toLocaleString(undefined, { maximumFractionDigits: 0 })} ({totalDayChangePercent.toFixed(2)}%)
                </Typography>
            </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
            <Paper sx={{ p: 2 }}>
                <Typography color="text.secondary" variant="overline">Total Return</Typography>
                <Typography variant="h6" color={getColor(totalChange)}>
                    {getSign(totalChange)}₹{Math.abs(totalChange).toLocaleString(undefined, { maximumFractionDigits: 0 })} ({totalChangePercent.toFixed(2)}%)
                </Typography>
            </Paper>
        </Grid>
      </Grid>

      <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
        <Table sx={{ minWidth: 650 }} aria-label="portfolio table">
          <TableHead sx={{ bgcolor: 'action.hover' }}>
            <TableRow>
              <TableCell>Asset</TableCell>
              <TableCell align="center">Rating</TableCell>
              <TableCell align="right">Position</TableCell>
              <TableCell align="right">Price / Day Chg</TableCell>
              <TableCell align="right">Total Returns</TableCell>
              <TableCell align="right">Current Value</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {holdings.map((row) => {
                const invested = row.quantity * row.averagePrice;
                const current = row.quantity * (row.lastPrice || 0);
                const dayChangeVal = row.quantity * (row.dayChange || 0);
                const returns = current - invested;
                const returnsPercent = invested ? (returns / invested) * 100 : 0;
                const analysis = row.analysis;

                return (
                  <TableRow
                    key={row.id}
                    hover
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell component="th" scope="row">
                      <Link to={`/equity/${row.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                        <Box sx={{ cursor: 'pointer' }}>
                            <Typography variant="subtitle2" fontWeight="bold" sx={{ color: 'primary.main', textDecoration: 'underline' }}>
                                {row.symbol}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block', maxWidth: 200 }}>
                                {row.name}
                            </Typography>
                        </Box>
                      </Link>
                    </TableCell>
                    
                    <TableCell align="center">
                        {analysis ? (
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                                <Chip 
                                    label={analysis.verdict} 
                                    color={getVerdictColor(analysis.verdict) as any} 
                                    size="small" 
                                    sx={{ fontWeight: 'bold', height: 20, fontSize: '0.65rem' }} 
                                />
                                <Typography variant="caption" sx={{ fontSize: '0.65rem', color: 'text.secondary' }}>
                                    Q:{analysis.scores.quality} • M:{analysis.scores.momentum}
                                </Typography>
                            </Box>
                        ) : (
                            <Typography variant="caption" color="text.disabled">-</Typography>
                        )}
                    </TableCell>

                    <TableCell align="right">
                        <Typography variant="body2" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                            {row.quantity}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                            Avg: {row.averagePrice.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                        </Typography>
                    </TableCell>

                    <TableCell align="right">
                        <Typography variant="body2" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                            {row.lastPrice?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                        </Typography>
                        <Box sx={{ color: getColor(dayChangeVal), display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                             <Typography variant="caption" fontWeight="medium" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                                {getSign(dayChangeVal)}{Math.abs(dayChangeVal).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                             </Typography>
                             <Typography variant="caption" sx={{ fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
                                ({row.dayChangePercent?.toFixed(2)}%)
                             </Typography>
                        </Box>
                    </TableCell>

                    <TableCell align="right">
                         <Box sx={{ color: getColor(returns), display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                             <Typography variant="body2" fontWeight="medium" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                                {getSign(returns)}{Math.abs(returns).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                             </Typography>
                             <Typography variant="caption" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                                {returnsPercent.toFixed(2)}%
                             </Typography>
                        </Box>
                    </TableCell>

                    <TableCell align="right">
                        <Typography variant="subtitle2" fontWeight="bold" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                            {current.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                        </Typography>
                    </TableCell>
                  </TableRow>
                );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

