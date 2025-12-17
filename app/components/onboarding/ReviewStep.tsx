import * as React from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemText } from '@mui/material';
import { Family, TempMember, TempAccount } from '../../types';

interface ReviewStepProps {
    family: Family | null;
    members: TempMember[];
    accounts: TempAccount[];
}

export default function ReviewStep({ family, members, accounts }: ReviewStepProps) {
    return (
        <Box sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
                Review and Complete
            </Typography>
            <Paper sx={{ p: 2, mt: 2 }}>
                <Typography variant="subtitle1">
                    Family: {family ? family.name : 'Not set up'}
                </Typography>
                <Typography variant="subtitle1" sx={{ mt: 1 }}>
                    Members:
                </Typography>
                <List dense>
                    {members.map((member) => (
                        <ListItem key={member.id}>
                            <ListItemText
                                primary={`${member.displayName} (${member.relationship})`}
                                secondary={`Family ID: ${member.familyId || 'N/A'}`}
                            />
                        </ListItem>
                    ))}
                </List>
                <Typography variant="subtitle1" sx={{ mt: 1 }}>
                    Accounts:
                </Typography>
                <List dense>
                    {accounts.map((account) => (
                        <ListItem key={account.id}>
                            <ListItemText
                                primary={`${account.accountName} - ${account.institutionName}`}
                                secondary={`Type: ${account.type}, Currency: ${account.currency}`}
                            />
                        </ListItem>
                    ))}
                </List>
            </Paper>
        </Box>
    );
}
