import { Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Box } from '@mui/material';

function createData(
  name: string,
  symbol: string,
  quantity: number,
  avgPrice: number,
  currentPrice: number,
) {
  return { name, symbol, quantity, avgPrice, currentPrice };
}

const rows = [
  createData('Apple Inc.', 'AAPL', 50, 150, 175),
  createData('Microsoft Corp', 'MSFT', 30, 280, 420),
  createData('Alphabet Inc.', 'GOOGL', 40, 120, 160),
  createData('NVIDIA Corp', 'NVDA', 10, 400, 900),
];

export default function USStocks() {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        US Stocks
      </Typography>
       <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell align="right">Symbol</TableCell>
              <TableCell align="right">Quantity</TableCell>
              <TableCell align="right">Avg Price (USD)</TableCell>
              <TableCell align="right">Current Price (USD)</TableCell>
              <TableCell align="right">Value (USD)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow
                key={row.name}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  {row.name}
                </TableCell>
                <TableCell align="right">{row.symbol}</TableCell>
                <TableCell align="right">{row.quantity}</TableCell>
                <TableCell align="right">{row.avgPrice}</TableCell>
                <TableCell align="right">{row.currentPrice}</TableCell>
                <TableCell align="right">{(row.quantity * row.currentPrice).toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
