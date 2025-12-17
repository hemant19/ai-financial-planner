import * as React from 'react';
import { useNavigate } from 'react-router';
import {
  Box,
  Button,
  Stepper,
  Step,
  StepLabel,
  Typography,
} from '@mui/material';
import { Family, AccountType, Currency, TempMember, TempAccount } from '../types';
import { v4 as uuid } from 'uuid'; // For generating unique IDs
import { saveOnboardingData } from '../services/firestore.service';

import IdentityStep from '../components/onboarding/IdentityStep';
import FamilyMembersStep from '../components/onboarding/FamilyMembersStep';
import AccountsStep from '../components/onboarding/AccountsStep';
import AssetsStep from '../components/onboarding/AssetsStep';
import ReviewStep from '../components/onboarding/ReviewStep';

const steps = [
  'Your Identity',
  'Your Circle (Optional)',
  'Your Accounts',
  'Initial Assets (Optional)',
  'Complete Onboarding',
];

export default function Onboarding() {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = React.useState(0);
  const [skipped, setSkipped] = React.useState(new Set<number>());
  const [isSaving, setIsSaving] = React.useState(false);

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
        id: uuid(),
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

  const handleNext = async () => {
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
          id: uuid(),
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

    if (activeStep === steps.length - 1) { // If it's the last step (Review and Complete)
      await handleCompleteOnboarding();
    } else {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
      setSkipped(newSkipped);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSkip = () => {
    if (!isStepOptional(activeStep)) {
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
      id: uuid(),
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
      id: uuid(),
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

  const handleCompleteOnboarding = async () => {
    setIsSaving(true);
    try {
      await saveOnboardingData(tempFamily, tempMembers, tempAccounts);
      console.log('Onboarding Complete!');
      navigate('/'); // Navigate to dashboard
    } catch (error) {
      console.error('Error saving onboarding data:', error);
      alert('Failed to save data. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };


  const getStepContent = (step: number) => {
    switch (step) {
      case 0: // Your Identity
        return (
          <IdentityStep
            displayName={displayName}
            setDisplayName={setDisplayName}
            primaryCurrency={primaryCurrency}
            setPrimaryCurrency={setPrimaryCurrency}
            isFamilySetup={isFamilySetup}
            setIsFamilySetup={setIsFamilySetup}
            familyName={familyName}
            setFamilyName={setFamilyName}
          />
        );
      case 1: // Your Circle
        return (
          <FamilyMembersStep
            members={tempMembers}
            onAddMember={handleAddMember}
            onRemoveMember={handleRemoveMember}
            isFamilySetup={isFamilySetup}
            familyName={familyName}
          />
        );
      case 2: // Your Accounts
        return (
          <AccountsStep
            accounts={tempAccounts}
            members={tempMembers}
            onAddAccount={handleAddAccount}
            onRemoveAccount={handleRemoveAccount}
          />
        );
      case 3: // Initial Assets
        return <AssetsStep accounts={tempAccounts} />;
      case 4: // Complete Onboarding
        return (
          <ReviewStep
            family={tempFamily}
            members={tempMembers}
            accounts={tempAccounts}
          />
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
      <Box sx={{ mt: 4, mb: 4 }}>
        {getStepContent(activeStep)}
      </Box>
      <Box sx={{ mt: 2, mb: 1 }}>
        <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
          <Button
            color="inherit"
            disabled={activeStep === 0 || isSaving}
            onClick={handleBack}
            sx={{ mr: 1 }}
          >
            Back
          </Button>
          <Box sx={{ flex: '1 1 auto' }} />
          {isStepOptional(activeStep) && (
            <Button color="inherit" onClick={handleSkip} sx={{ mr: 1 }} disabled={isSaving}>
              Skip
            </Button>
          )}
          <Button onClick={handleNext} disabled={isSaving}>
            {isSaving ? 'Saving...' : (activeStep === steps.length - 1 ? 'Finish' : 'Next')}
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
