import * as React from 'react';
import {
    Box,
    Typography,
    Alert,
    List,
    ListItem,
    ListItemText,
    TextField,
} from '@mui/material';
import { TempAccount } from '../../types';

interface AssetsStepProps {
    accounts: TempAccount[];
    // Placeholder for future implementation
    onUpdateAssetValue?: (accountId: string, value: number) => void;
}

export default function AssetsStep({ accounts }: AssetsStepProps) {
    return (
        <Box sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
                Provide Estimated Initial Values (Optional)
            </Typography>
            <Alert severity="info" sx={{ mb: 2 }}>
                You can provide a rough estimate for your investment accounts. You can
                add detailed holdings later.
            </Alert>
            <List>
                {accounts.filter(
                    (acc) => acc.type === 'DEMAT' || acc.type === 'US_BROKER'
                ).length === 0 && (
                        <Typography variant="body2" color="text.secondary">
                            No investment accounts added.
                        </Typography>
                    )}
                {accounts
                    .filter((acc) => acc.type === 'DEMAT' || acc.type === 'US_BROKER')
                    .map((account) => (
                        <ListItem key={account.id}>
                            <ListItemText
                                primary={`${account.accountName} (${account.institutionName})`}
                            />
                            <TextField
                                label={`Estimated Value (${account.currency})`}
                                type="number"
                                variant="outlined"
                                size="small"
                                sx={{ ml: 2 }}
                            // Here you would capture and update the estimated value for this account
                            />
                        </ListItem>
                    ))}
            </List>
        </Box>
    );
}
