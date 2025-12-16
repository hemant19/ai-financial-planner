import { Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Box } from '@mui/material';
import { useSelection } from '../context/SelectionContext';
import { DataService } from '../services/data.service';

export default function FixedDeposits() {
  const { selectedMemberId } = useSelection();
  const fixedDeposits = DataService.getFixedDeposits(selectedMemberId);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Fixed Deposits
      </Typography>
       <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Bank Name</TableCell>
              <TableCell align="right">Principal Amount (INR)</TableCell>
              <TableCell align="right">Interest Rate (%)</TableCell>
              <TableCell align="right">Maturity Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {fixedDeposits.map((row) => (
              <TableRow
                key={row.id}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  {row.bankName}
                </TableCell>
                <TableCell align="right">{row.principalAmount.toLocaleString()}</TableCell>
                <TableCell align="right">{row.interestRate}%</TableCell>
                <TableCell align="right">{row.maturityDate}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
