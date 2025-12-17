import * as React from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  IconButton,
  Chip,
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import AddAccountForm from './AddAccountForm';
import { TempAccount, TempMember, AccountType, Currency } from '../../types';

interface AccountsStepProps {
  accounts: TempAccount[];
  members: TempMember[];
  onAddAccount: (
    memberId: string,
    type: AccountType,
    institutionName: string,
    accountName: string,
    currency: Currency,
    details: any
  ) => void;
  onRemoveAccount: (id: string) => void;
}

export default function AccountsStep({
  accounts,
  members,
  onAddAccount,
  onRemoveAccount,
}: AccountsStepProps) {
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Linked Accounts
      </Typography>
      <Grid container spacing={2}>
        {accounts.map((account) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={account.id}>
            <Card
              sx={{
                p: 1,
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Typography variant="subtitle1">
                  {account.accountName}
                </Typography>
                <IconButton
                  edge="end"
                  aria-label="delete"
                  onClick={() => onRemoveAccount(account.id)}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
              <Typography variant="body2" color="text.secondary">
                {account.institutionName} ({account.currency})
              </Typography>
              <Chip
                label={account.type}
                size="small"
                sx={{ mt: 1, alignSelf: 'flex-start' }}
              />
            </Card>
          </Grid>
        ))}
      </Grid>
      <AddAccountForm members={members} onAddAccount={onAddAccount} />
    </Box>
  );
}
