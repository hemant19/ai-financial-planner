import * as React from 'react';
import { useNavigate } from 'react-router';
import {
  Box,
  Button,
  Stepper,
  Step,
  StepLabel,
  Typography,
  TextField,
  FormControlLabel,
  Switch,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Paper,
  Grid,
  Divider,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Card,
  CardContent,
  Chip,
  Alert,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { Family, Member, Account, AccountType, Currency, Holding, FixedDeposit } from '../types';
import { v4 as uuidv4 } from 'uuid'; // For generating unique IDs

const steps = [
  'Your Identity',
  'Your Circle (Optional)',
  'Your Accounts',
  'Initial Assets (Optional)',
  'Complete Onboarding',
];

interface TempMember extends Member {
  isPrimary?: boolean; // To identify the main user
}

interface TempAccount extends Account {
  tempHoldings?: Holding[]; // Temporary storage for holdings related to this account
  tempFixedDeposits?: FixedDeposit[]; // Temporary storage for fixed deposits
}

export default function Onboarding() {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = React.useState(0);
  const [skipped, setSkipped] = React.useState(new Set<number>());

  // Step 1 State
  const [displayName, setDisplayName] = React.useState('');
  const [primaryCurrency, setPrimaryCurrency] = React.useState<Currency>('INR');
  const [isFamilySetup, setIsFamilySetup] = React.useState(false);
  const [familyName, setFamilyName] = React.useState('');

  // Consolidated temporary data for onboarding
  const [tempFamily, setTempFamily] = React.useState<Family | null>(null);
  const [tempMembers, setTempMembers] = React.useState<TempMember[]>([]);
  const [tempAccounts, setTempAccounts] = React.useState<TempAccount[]>([]);

  React.useEffect(() => {
    // Initialize primary member when component mounts
    if (tempMembers.length === 0 && activeStep === 0) {
      setTempMembers([{
        id: uuidv4(),
        familyId: '', // Will be set after family creation
        displayName: displayName || 'You',
        relationship: 'Self',
        isPrimary: true,
      }]);
    }
  }, [tempMembers, displayName, activeStep]);

  React.useEffect(() => {
    // Update primary member's display name if changed in step 1
    setTempMembers(prev => prev.map(member => member.isPrimary ? { ...member, displayName: displayName || 'You' } : member));
  }, [displayName]);

  const isStepOptional = (step: number) => {
    return step === 1 || step === 3; // "Your Circle" and "Initial Assets" are optional
  };

  const isStepSkipped = (step: number) => {
    return skipped.has(step);
  };

  const handleNext = () => {
    let newSkipped = skipped;
    if (isStepSkipped(activeStep)) {
      newSkipped = new Set(newSkipped.values());
      newSkipped.delete(activeStep);
    }

    // Step-specific logic before moving next
    if (activeStep === 0) { // Your Identity
      if (!displayName || !primaryCurrency) {
        alert('Please fill in your name and primary currency.');
        return;
      }
      if (isFamilySetup && !familyName) {
        alert('Please provide a family name.');
        return;
      }

      const primaryMember = tempMembers.find(m => m.isPrimary);
      if (!primaryMember) return; // Should not happen

      let newFamily: Family | null = null;
      if (isFamilySetup) {
        newFamily = {
          id: uuidv4(),
          name: familyName,
          baseCurrency: primaryCurrency,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setTempFamily(newFamily);
        // Link primary member to family
        setTempMembers(prev => prev.map(member => member.isPrimary ? { ...member, familyId: newFamily!.id } : member));
      } else {
        setTempFamily(null); // No family
        // Ensure primary member has no familyId if not family setup
        setTempMembers(prev => prev.map(member => member.isPrimary ? { ...member, familyId: '' } : member));
      }
    } else if (activeStep === 2) { // Your Accounts
      if (tempAccounts.length === 0) {
        alert('Please add at least one account.');
        return;
      }
    }


    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    setSkipped(newSkipped);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSkip = () => {
    if (!isStepOptional(activeStep)) {
      // You probably want to guard against something like this,
      // it should never occur unless someone's messing with the app.
      throw new Error("You can't skip a step that isn't optional.");
    }
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    setSkipped((prevSkipped) => {
      const newSkipped = new Set(prevSkipped.values());
      newSkipped.add(activeStep);
      return newSkipped;
    });
  };

  const handleReset = () => {
    setActiveStep(0);
    setSkipped(new Set<number>());
    setDisplayName('');
    setPrimaryCurrency('INR');
    setIsFamilySetup(false);
    setFamilyName('');
    setTempFamily(null);
    setTempMembers([]); // Re-initialize by useEffect
    setTempAccounts([]);
  };

  const handleAddMember = (name: string, relationship: string) => {
    const primaryMember = tempMembers.find(m => m.isPrimary);
    const newMember: TempMember = {
      id: uuidv4(),
      familyId: tempFamily?.id || '',
      displayName: name,
      relationship: relationship,
    };
    setTempMembers(prev => [...prev, newMember]);
  };

  const handleRemoveMember = (id: string) => {
    setTempMembers(prev => prev.filter(member => member.id !== id));
  };

  const handleAddAccount = (
    memberId: string,
    type: AccountType,
    institutionName: string,
    accountName: string,
    currency: Currency,
    details: any // Specific details based on account type
  ) => {
    const newAccount: TempAccount = {
      id: uuidv4(),
      memberId,
      type,
      institutionName,
      accountName,
      currency,
      isActive: true,
      ...details,
    };
    setTempAccounts(prev => [...prev, newAccount]);
  };

  const handleRemoveAccount = (id: string) => {
    setTempAccounts(prev => prev.filter(account => account.id !== id));
  };

  const handleCompleteOnboarding = () => {
    // Here, you would typically save tempFamily, tempMembers, tempAccounts
    // to your persistent storage (e.g., Firestore).
    console.log('Onboarding Complete!', {
      family: tempFamily,
      members: tempMembers,
      accounts: tempAccounts,
    });
    navigate('/'); // Navigate to dashboard
  };


  const getStepContent = (step: number) => {
    switch (step) {
      case 0: // Your Identity
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
      case 1: // Your Circle
        return (
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Members in your {isFamilySetup ? familyName || 'Family' : 'Circle'}
            </Typography>
            <Grid container spacing={2}>
              {tempMembers.map((member) => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={member.id}>
                  <Card sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1 }}>
                    <CardContent>
                      <Typography variant="subtitle1">{member.displayName}</Typography>
                      <Chip label={member.relationship} size="small" />
                    </CardContent>
                    {!member.isPrimary && (
                      <IconButton edge="end" aria-label="delete" onClick={() => handleRemoveMember(member.id)}>
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </Card>
                </Grid>
              ))}
            </Grid>
            {isFamilySetup && ( // Only allow adding members if it's a family setup
                <AddMemberForm onAddMember={handleAddMember} />
            )}
            {!isFamilySetup && (
                <Alert severity="info" sx={{ mt: 2 }}>
                    You chose "Just for myself". You can skip this step.
                </Alert>
            )}
          </Box>
        );
      case 2: // Your Accounts
        return (
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Linked Accounts
            </Typography>
            <Grid container spacing={2}>
              {tempAccounts.map((account) => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={account.id}>
                  <Card sx={{ p: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="subtitle1">{account.accountName}</Typography>
                      <IconButton edge="end" aria-label="delete" onClick={() => handleRemoveAccount(account.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                    <Typography variant="body2" color="text.secondary">{account.institutionName} ({account.currency})</Typography>
                    <Chip label={account.type} size="small" sx={{ mt: 1, alignSelf: 'flex-start' }} />
                  </Card>
                </Grid>
              ))}
            </Grid>
            <AddAccountForm members={tempMembers} onAddAccount={handleAddAccount} />
          </Box>
        );
      case 3: // Initial Assets
        return (
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Provide Estimated Initial Values (Optional)
            </Typography>
            <Alert severity="info" sx={{ mb: 2 }}>
              You can provide a rough estimate for your investment accounts. You can add detailed holdings later.
            </Alert>
            <List>
                {tempAccounts.filter(acc => acc.type === 'DEMAT' || acc.type === 'US_BROKER').length === 0 && (
                    <Typography variant="body2" color="text.secondary">
                        No investment accounts added.
                    </Typography>
                )}
                {tempAccounts.filter(acc => acc.type === 'DEMAT' || acc.type === 'US_BROKER').map(account => (
                    <ListItem key={account.id}>
                        <ListItemText primary={`${account.accountName} (${account.institutionName})`} />
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
      case 4: // Complete Onboarding
        return (
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Review and Complete
            </Typography>
            <Paper sx={{ p: 2, mt: 2 }}>
                <Typography variant="subtitle1">Family: {tempFamily ? tempFamily.name : 'Not set up'}</Typography>
                <Typography variant="subtitle1" sx={{ mt: 1 }}>Members:</Typography>
                <List dense>
                    {tempMembers.map(member => (
                        <ListItem key={member.id}>
                            <ListItemText primary={`${member.displayName} (${member.relationship})`} secondary={`Family ID: ${member.familyId || 'N/A'}`} />
                        </ListItem>
                    ))}
                </List>
                <Typography variant="subtitle1" sx={{ mt: 1 }}>Accounts:</Typography>
                <List dense>
                    {tempAccounts.map(account => (
                        <ListItem key={account.id}>
                            <ListItemText primary={`${account.accountName} - ${account.institutionName}`} secondary={`Type: ${account.type}, Currency: ${account.currency}`} />
                        </ListItem>
                    ))}
                </List>
            </Paper>
          </Box>
        );
      default:
        return 'Unknown step';
    }
  };

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Typography variant="h4" sx={{ mb: 4 }}>Welcome to FinPlan - Onboarding</Typography>
      <Stepper activeStep={activeStep}>
        {steps.map((label, index) => {
          const stepProps: { completed?: boolean } = {};
          const labelProps: {
            optional?: React.ReactNode;
          } = {};
          if (isStepOptional(index)) {
            labelProps.optional = (
              <Typography variant="caption">Optional</Typography>
            );
          }
          if (isStepSkipped(index)) {
            stepProps.completed = false;
          }
          return (
            <Step key={label} {...stepProps}>
              <StepLabel {...labelProps}>{label}</StepLabel>
            </Step>
          );
        })}
      </Stepper>
      <Box sx={{ mt: 2, mb: 1 }}>
        {activeStep === steps.length ? (
          <React.Fragment>
            <Typography sx={{ mt: 2, mb: 1 }}>
              All steps completed - you&apos;re finished
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
              <Box sx={{ flex: '1 1 auto' }} />
              <Button onClick={handleReset}>Reset</Button>
              <Button onClick={handleCompleteOnboarding}>Go to Dashboard</Button>
            </Box>
          </React.Fragment>
        ) : (
          <React.Fragment>
            {getStepContent(activeStep)}
            <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
              <Button
                color="inherit"
                disabled={activeStep === 0}
                onClick={handleBack}
                sx={{ mr: 1 }}
              >
                Back
              </Button>
              <Box sx={{ flex: '1 1 auto' }} />
              {isStepOptional(activeStep) && (
                <Button color="inherit" onClick={handleSkip} sx={{ mr: 1 }}>
                  Skip
                </Button>
              )}
              <Button onClick={handleNext}>
                {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
              </Button>
            </Box>
          </React.Fragment>
        )}
      </Box>
    </Box>
  );
}

interface AddMemberFormProps {
    onAddMember: (name: string, relationship: string) => void;
}

function AddMemberForm({ onAddMember }: AddMemberFormProps) {
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
            <Typography variant="h6" gutterBottom>Add New Member</Typography>
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
            <Button variant="contained" startIcon={<AddIcon />} onClick={handleSubmit} sx={{ mt: 2 }}>
                Add Member
            </Button>
        </Paper>
    );
}

interface AddAccountFormProps {
    members: TempMember[];
    onAddAccount: (memberId: string, type: AccountType, institutionName: string, accountName: string, currency: Currency, details: any) => void;
}

function AddAccountForm({ members, onAddAccount }: AddAccountFormProps) {
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

        onAddAccount(selectedMemberId, accountType, institutionName, accountName, currency, details);
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
            <Typography variant="h6" gutterBottom>Add New Account</Typography>
            <FormControl fullWidth margin="normal" required>
                <InputLabel id="account-member-label">Account Holder</InputLabel>
                <Select
                    labelId="account-member-label"
                    value={selectedMemberId}
                    label="Account Holder"
                    onChange={(e) => setSelectedMemberId(e.target.value)}
                >
                    {members.map(member => (
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

            <Button variant="contained" startIcon={<AddIcon />} onClick={handleSubmit} sx={{ mt: 2 }}>
                Add Account
            </Button>
        </Paper>
    );
}