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

interface AddMemberFormProps {
    onAddMember: (name: string, relationship: string) => void;
}

export default function AddMemberForm({ onAddMember }: AddMemberFormProps) {
    const [name, setName] = React.useState('');
    const [relationship, setRelationship] = React.useState('Child');

    const handleSubmit = () => {
        if (name) {
            onAddMember(name, relationship);
            setName('');
            setRelationship('Child');
        }
    };

    return (
        <Paper sx={{ p: 2, mt: 3 }}>
            <Typography variant="h6" gutterBottom>
                Add New Member
            </Typography>
            <TextField
                label="Member Name"
                variant="outlined"
                fullWidth
                value={name}
                onChange={(e) => setName(e.target.value)}
                margin="normal"
            />
            <FormControl fullWidth margin="normal">
                <InputLabel id="relationship-label">Relationship</InputLabel>
                <Select
                    labelId="relationship-label"
                    value={relationship}
                    label="Relationship"
                    onChange={(e) => setRelationship(e.target.value)}
                >
                    <MenuItem value="Spouse">Spouse</MenuItem>
                    <MenuItem value="Child">Child</MenuItem>
                    <MenuItem value="Parent">Parent</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                </Select>
            </FormControl>
            <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleSubmit}
                sx={{ mt: 2 }}
            >
                Add Member
            </Button>
        </Paper>
    );
}
