import { Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Box } from '@mui/material';

function createData(
  bankName: string,
  amount: number,
  rate: number,
  maturityDate: string,
) {
  return { bankName, amount, rate, maturityDate };
}

const rows = [
  createData('HDFC Bank', 100000, 7.5, '2025-05-15'),
  createData('SBI', 250000, 7.2, '2026-01-20'),
  createData('ICICI Bank', 150000, 7.4, '2024-11-30'),
];

export default function FixedDeposits() {
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
            {rows.map((row) => (
              <TableRow
                key={row.bankName + row.maturityDate}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  {row.bankName}
                </TableCell>
                <TableCell align="right">{row.amount.toLocaleString()}</TableCell>
                <TableCell align="right">{row.rate}%</TableCell>
                <TableCell align="right">{row.maturityDate}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
