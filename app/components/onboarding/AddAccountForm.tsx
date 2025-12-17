import * as React from 'react';
import {
    Paper,
    Typography,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Button,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { AccountType, Currency, TempMember } from '../../types';

interface AddAccountFormProps {
    members: TempMember[];
    onAddAccount: (
        memberId: string,
        type: AccountType,
        institutionName: string,
        accountName: string,
        currency: Currency,
        details: any
    ) => void;
}

export default function AddAccountForm({ members, onAddAccount }: AddAccountFormProps) {
    const [selectedMemberId, setSelectedMemberId] = React.useState('');
    const [accountType, setAccountType] = React.useState<AccountType>('BANK');
    const [institutionName, setInstitutionName] = React.useState('');
    const [accountName, setAccountName] = React.useState('');
    const [currency, setCurrency] = React.useState<Currency>('INR');
    const [bankBalance, setBankBalance] = React.useState<number | ''>('');
    const [linkedPlatformId, setLinkedPlatformId] = React.useState('');
    const [accountNumberLast4, setAccountNumberLast4] = React.useState('');

    React.useEffect(() => {
        if (members.length > 0 && !selectedMemberId) {
            setSelectedMemberId(members[0].id);
        }
    }, [members, selectedMemberId]);

    const handleSubmit = () => {
        if (!selectedMemberId || !institutionName || !accountName || !currency) {
            alert('Please fill all required account fields.');
            return;
        }

        let details = {};
        if (accountType === 'BANK') {
            details = { currentBalance: bankBalance === '' ? undefined : bankBalance };
        } else if (accountType === 'DEMAT' || accountType === 'US_BROKER') {
            details = { linkedPlatformId, accountNumberLast4 };
        }

        onAddAccount(
            selectedMemberId,
            accountType,
            institutionName,
            accountName,
            currency,
            details
        );
        // Reset form
        setInstitutionName('');
        setAccountName('');
        setCurrency('INR');
        setBankBalance('');
        setLinkedPlatformId('');
        setAccountNumberLast4('');
    };

    return (
        <Paper sx={{ p: 2, mt: 3 }}>
            <Typography variant="h6" gutterBottom>
                Add New Account
            </Typography>
            <FormControl fullWidth margin="normal" required>
                <InputLabel id="account-member-label">Account Holder</InputLabel>
                <Select
                    labelId="account-member-label"
                    value={selectedMemberId}
                    label="Account Holder"
                    onChange={(e) => setSelectedMemberId(e.target.value)}
                >
                    {members.map((member) => (
                        <MenuItem key={member.id} value={member.id}>
                            {member.displayName}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            <FormControl fullWidth margin="normal" required>
                <InputLabel id="account-type-label">Account Type</InputLabel>
                <Select
                    labelId="account-type-label"
                    value={accountType}
                    label="Account Type"
                    onChange={(e) => setAccountType(e.target.value as AccountType)}
                >
                    <MenuItem value="BANK">Bank Account</MenuItem>
                    <MenuItem value="DEMAT">Demat Account</MenuItem>
                    <MenuItem value="US_BROKER">US Broker Account</MenuItem>
                </Select>
            </FormControl>

            <TextField
                label="Institution Name"
                variant="outlined"
                fullWidth
                value={institutionName}
                onChange={(e) => setInstitutionName(e.target.value)}
                margin="normal"
                required
            />
            <TextField
                label="Account Nickname"
                variant="outlined"
                fullWidth
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                margin="normal"
                required
            />
            <FormControl fullWidth margin="normal" required>
                <InputLabel id="account-currency-label">Account Currency</InputLabel>
                <Select
                    labelId="account-currency-label"
                    value={currency}
                    label="Account Currency"
                    onChange={(e) => setCurrency(e.target.value as Currency)}
                >
                    <MenuItem value="INR">INR</MenuItem>
                    <MenuItem value="USD">USD</MenuItem>
                    <MenuItem value="EUR">EUR</MenuItem>
                </Select>
            </FormControl>

            {accountType === 'BANK' && (
                <TextField
                    label="Current Balance (Optional)"
                    type="number"
                    variant="outlined"
                    fullWidth
                    value={bankBalance}
                    onChange={(e) => setBankBalance(parseFloat(e.target.value) || '')}
                    margin="normal"
                />
            )}

            {(accountType === 'DEMAT' || accountType === 'US_BROKER') && (
                <React.Fragment>
                    <TextField
                        label="Linked Platform ID (e.g., Kite User ID)"
                        variant="outlined"
                        fullWidth
                        value={linkedPlatformId}
                        onChange={(e) => setLinkedPlatformId(e.target.value)}
                        margin="normal"
                    />
                    <TextField
                        label="Account Number (Last 4 digits, Optional)"
                        variant="outlined"
                        fullWidth
                        value={accountNumberLast4}
                        onChange={(e) => setAccountNumberLast4(e.target.value)}
                        margin="normal"
                    />
                </React.Fragment>
            )}

            <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleSubmit}
                sx={{ mt: 2 }}
            >
                Add Account
            </Button>
        </Paper>
    );
}
