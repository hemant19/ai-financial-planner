import * as React from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  IconButton,
  Alert,
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import AddMemberForm from './AddMemberForm';
import { TempMember } from '../../types';

interface FamilyMembersStepProps {
  members: TempMember[];
  onAddMember: (name: string, relationship: string) => void;
  onRemoveMember: (id: string) => void;
  isFamilySetup: boolean;
  familyName: string;
}

export default function FamilyMembersStep({
  members,
  onAddMember,
  onRemoveMember,
  isFamilySetup,
  familyName,
}: FamilyMembersStepProps) {
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Members in your {isFamilySetup ? familyName || 'Family' : 'Circle'}
      </Typography>
      <Grid container spacing={2}>
        {members.map((member) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={member.id}>
            <Card
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                p: 1,
              }}
            >
              <CardContent>
                <Typography variant="subtitle1">{member.displayName}</Typography>
                <Chip label={member.relationship} size="small" />
              </CardContent>
              {!member.isPrimary && (
                <IconButton
                  edge="end"
                  aria-label="delete"
                  onClick={() => onRemoveMember(member.id)}
                >
                  <DeleteIcon />
                </IconButton>
              )}
            </Card>
          </Grid>
        ))}
      </Grid>
      {isFamilySetup && (
        <AddMemberForm onAddMember={onAddMember} />
      )}
      {!isFamilySetup && (
        <Alert severity="info" sx={{ mt: 2 }}>
          You chose "Just for myself". You can skip this step.
        </Alert>
      )}
    </Box>
  );
}
