import * as React from 'react';
import { useParams, useNavigate } from 'react-router';
import { 
  Typography, Box, Paper, Grid, Chip, Divider, LinearProgress, 
  Button, Tooltip, IconButton, Card, CardContent 
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { DataService } from '@core/services/data.service';
import { Holding } from '@core/types';

const MetricExplanation: Record<string, string> = {
  roe: "Return on Equity (ROE) measures a company's profitability. >15% is considered efficient.",
  debtToEquity: "Debt-to-Equity ratio. < 50% indicates a safe, low-leverage balance sheet.",
  peRatio: "Price-to-Earnings Ratio. Lower is generally 'cheaper', but too high (>80) can mean overvalued.",
  revenueGrowth: "Year-over-year revenue growth. Consistent positive growth indicates a healthy business.",
  fiftyDMA: "50-Day Moving Average. If Price > 50DMA, the short-term trend is UP.",
  twoHundredDMA: "200-Day Moving Average. If 50DMA > 200DMA (Golden Cross), long-term trend is UP.",
  rsi: "Relative Strength Index (0-100). 30-70 is normal. >70 is Overbought (price might drop), <30 is Oversold.",
  fiftyTwoWeekHigh: "52-Week High. Trading near highs often indicates strong momentum."
};

export default function EquityDetail() {
  const { holdingId } = useParams();
  const navigate = useNavigate();
  const [holding, setHolding] = React.useState<Holding | null>(null);

  React.useEffect(() => {
    if (holdingId) {
      DataService.getHolding(holdingId).then((h) => setHolding(h || null));
    }
  }, [holdingId]);

  if (!holding) {
    return <Box sx={{ p: 3 }}>Loading...</Box>;
  }

  const analysis = holding.analysis;
  
  const getScoreColor = (score: number) => {
    if (score >= 7) return 'success';
    if (score >= 4) return 'warning';
    return 'error';
  };

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
    <Box sx={{ pb: 8 }}>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ mb: 2 }}>
        Back to Portfolio
      </Button>

      {/* Header Section */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container alignItems="center" spacing={2}>
          <Grid size={{ xs: 12, md: 8 }}>
            <Typography variant="h4" fontWeight="bold">
              {holding.name}
            </Typography>
            <Typography variant="h6" color="text.secondary">
              {holding.symbol} • {holding.assetClass === 'US_EQUITY' ? 'US Market' : 'NSE/BSE'}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }} sx={{ textAlign: { md: 'right' } }}>
            <Typography variant="h3">
              {holding.currency === 'USD' ? '$' : '₹'}{holding.lastPrice?.toLocaleString()}
            </Typography>
            <Typography 
              variant="subtitle1" 
              color={(holding.dayChange || 0) >= 0 ? 'success.main' : 'error.main'}
            >
              {(holding.dayChange || 0) >= 0 ? '+' : ''}
              {holding.dayChange?.toLocaleString()} ({(holding.dayChangePercent || 0).toFixed(2)}%)
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {analysis ? (
        <>
          {/* Verdict & Scores */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Paper sx={{ p: 3, height: '100%', textAlign: 'center', bgcolor: 'action.hover' }}>
                <Typography variant="overline">Analyst Verdict</Typography>
                <Box sx={{ mt: 2, mb: 2 }}>
                  <Chip 
                    label={analysis.verdict} 
                    color={getVerdictColor(analysis.verdict) as any} 
                    sx={{ fontSize: '1.5rem', height: 48, px: 2, fontWeight: 'bold' }} 
                  />
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Based on a dual-engine analysis of Fundamentals (Quality) and Technicals (Momentum).
                </Typography>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Paper sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Quality Score: {analysis.scores.quality}/10
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={analysis.scores.quality * 10} 
                  color={getScoreColor(analysis.scores.quality)}
                  sx={{ height: 10, borderRadius: 5, mb: 2 }}
                />
                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                  Target: 12-15% returns.
                </Typography>
                <Box component="ul" sx={{ pl: 2, mt: 1 }}>
                  {analysis.signals.filter(s => ['High ROE', 'Low Debt', 'Growing Revenue', 'Reasonable Val', 'Expensive Valuation'].includes(s)).map(s => (
                    <li key={s}><Typography variant="body2">{s}</Typography></li>
                  ))}
                </Box>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Paper sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Momentum Score: {analysis.scores.momentum}/10
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={analysis.scores.momentum * 10} 
                  color={getScoreColor(analysis.scores.momentum)}
                  sx={{ height: 10, borderRadius: 5, mb: 2 }}
                />
                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                  Target: 20-25% returns (Satellite).
                </Typography>
                <Box component="ul" sx={{ pl: 2, mt: 1 }}>
                  {analysis.signals.filter(s => !['High ROE', 'Low Debt', 'Growing Revenue', 'Reasonable Val', 'Expensive Valuation'].includes(s)).map(s => (
                    <li key={s}><Typography variant="body2">{s}</Typography></li>
                  ))}
                </Box>
              </Paper>
            </Grid>
          </Grid>

          {/* Metrics Deep Dive */}
          <Typography variant="h5" sx={{ mb: 2, mt: 4 }}>
            Metric Deep Dive
          </Typography>
          <Grid container spacing={2}>
            {Object.entries(analysis.metrics).map(([key, value]) => {
              if (value === undefined || value === null) return null;
              return (
                <Grid size={{ xs: 12, sm: 6, md: 3 }} key={key}>
                  <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Typography variant="subtitle2" color="text.secondary" sx={{ flexGrow: 1, textTransform: 'capitalize' }}>
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </Typography>
                        <Tooltip title={MetricExplanation[key] || "Financial Metric"}>
                          <IconButton size="small"><InfoOutlinedIcon fontSize="small" /></IconButton>
                        </Tooltip>
                      </Box>
                      <Typography variant="h6">
                        {typeof value === 'number' ? value.toLocaleString(undefined, { maximumFractionDigits: 2 }) : value}
                        {['roe', 'revenueGrowth', 'debtToEquity'].includes(key) ? '%' : ''}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>

          {/* Logic Explanation */}
          <Paper sx={{ p: 3, mt: 4, bgcolor: '#f5f5f5' }}>
            <Typography variant="h6" gutterBottom>How is this calculated?</Typography>
            <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="subtitle2" fontWeight="bold">Quality Engine (Core)</Typography>
                    <Typography variant="body2">
                        Evaluates fundamental health. Points are awarded for ROE &gt; 15% (+3), Debt/Equity &lt; 0.5 (+3), Revenue Growth &gt; 10% (+2), and Reasonable P/E (+2). High quality stocks are ideal for your long-term Core portfolio.
                    </Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="subtitle2" fontWeight="bold">Momentum Engine (Satellite)</Typography>
                    <Typography variant="body2">
                        Evaluates price action. Points are awarded if Price &gt; 50DMA (+3), Golden Cross (50 &gt; 200DMA) (+2), RSI is healthy (50-70) (+3), and Price is near 52-Week High (+2). High momentum stocks are candidates for your Satellite portfolio.
                    </Typography>
                </Grid>
            </Grid>
          </Paper>

        </>
      ) : (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">
            Analysis data not available for this holding. 
            <br />
            Run <code>npm run cli -- prices update</code> to generate the report.
          </Typography>
        </Paper>
      )}
    </Box>
  );
}