import * as React from 'react';
import {
    Box,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    FormControlLabel,
    Switch,
} from '@mui/material';
import { Currency } from '../../types';

interface IdentityStepProps {
    displayName: string;
    setDisplayName: (val: string) => void;
    primaryCurrency: Currency;
    setPrimaryCurrency: (val: Currency) => void;
    isFamilySetup: boolean;
    setIsFamilySetup: (val: boolean) => void;
    familyName: string;
    setFamilyName: (val: string) => void;
}

export default function IdentityStep({
    displayName,
    setDisplayName,
    primaryCurrency,
    setPrimaryCurrency,
    isFamilySetup,
    setIsFamilySetup,
    familyName,
    setFamilyName,
}: IdentityStepProps) {
    return (
        <Box sx={{ p: 2 }}>
            <TextField
                label="Your Name"
                variant="outlined"
                fullWidth
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                margin="normal"
                required
            />
            <FormControl fullWidth margin="normal" required>
                <InputLabel id="primary-currency-label">Primary Currency</InputLabel>
                <Select
                    labelId="primary-currency-label"
                    value={primaryCurrency}
                    label="Primary Currency"
                    onChange={(e) => setPrimaryCurrency(e.target.value as Currency)}
                >
                    <MenuItem value="INR">INR</MenuItem>
                    <MenuItem value="USD">USD</MenuItem>
                    <MenuItem value="EUR">EUR</MenuItem>
                </Select>
            </FormControl>
            <FormControlLabel
                control={
                    <Switch
                        checked={isFamilySetup}
                        onChange={(e) => setIsFamilySetup(e.target.checked)}
                    />
                }
                label="I am setting this up for a family"
                sx={{ mt: 2 }}
            />
            {isFamilySetup && (
                <TextField
                    label="Family Name"
                    variant="outlined"
                    fullWidth
                    value={familyName}
                    onChange={(e) => setFamilyName(e.target.value)}
                    margin="normal"
                    required
                />
            )}
        </Box>
    );
}
