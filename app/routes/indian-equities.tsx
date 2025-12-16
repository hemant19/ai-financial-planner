import { Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Box } from '@mui/material';
import { useSelection } from '../context/SelectionContext';
import { DataService } from '../services/data.service';

export default function IndianEquities() {
  const { selectedMemberId } = useSelection();
  const holdings = DataService.getHoldings(selectedMemberId, 'EQUITY').filter(h => h.currency === 'INR');

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
            {holdings.map((row) => (
              <TableRow
                key={row.id}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  {row.name}
                </TableCell>
                <TableCell align="right">{row.symbol}</TableCell>
                <TableCell align="right">{row.quantity}</TableCell>
                <TableCell align="right">{row.averagePrice.toLocaleString()}</TableCell>
                <TableCell align="right">{row.lastPrice?.toLocaleString()}</TableCell>
                <TableCell align="right">{(row.quantity * (row.lastPrice || 0)).toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
