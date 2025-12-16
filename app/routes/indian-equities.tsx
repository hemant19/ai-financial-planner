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
  createData('Reliance Industries', 'RELIANCE', 100, 2400, 2900),
  createData('HDFC Bank', 'HDFCBANK', 200, 1500, 1450),
  createData('Tata Consultancy Services', 'TCS', 50, 3200, 3800),
  createData('Infosys', 'INFY', 150, 1400, 1600),
];

export default function IndianEquities() {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Indian Equities
      </Typography>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell align="right">Symbol</TableCell>
              <TableCell align="right">Quantity</TableCell>
              <TableCell align="right">Avg Price (INR)</TableCell>
              <TableCell align="right">Current Price (INR)</TableCell>
              <TableCell align="right">Value (INR)</TableCell>
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
