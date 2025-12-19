import * as React from 'react';
import { Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Box } from '@mui/material';
import { useSelection } from '../context/SelectionContext';
import { DataService } from '../services/data.service';
import { FixedDeposit } from '../types';

export default function FixedDeposits() {
  const { selectedMemberId } = useSelection();
  const [fds, setFds] = React.useState<FixedDeposit[]>([]);

  React.useEffect(() => {
    const fetchFds = async () => {
      const data = await DataService.getFixedDepositsForMember(selectedMemberId);
      setFds(data);
    };
    fetchFds();
  }, [selectedMemberId]);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Fixed Deposits
      </Typography>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Bank</TableCell>
              <TableCell align="right">FD Number</TableCell>
              <TableCell align="right">Principal</TableCell>
              <TableCell align="right">Rate (%)</TableCell>
              <TableCell align="right">Maturity Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {fds.map((row) => (
              <TableRow
                key={row.id}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  {row.bankName}
                </TableCell>
                <TableCell align="right">{row.fdNumber}</TableCell>
                <TableCell align="right">₹{row.principalAmount.toLocaleString()}</TableCell>
                <TableCell align="right">{row.interestRate}%</TableCell>
                <TableCell align="right">{new Date(row.maturityDate).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
