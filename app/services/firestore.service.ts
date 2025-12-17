import { writeBatch, doc, collection } from "firebase/firestore";
import { db } from "../firebase";
import { Family, Member, Account } from "../types";
import { removeUndefined } from "../utils";

export const saveOnboardingData = async (
  family: Family | null,
  members: Member[],
  accounts: Account[]
) => {
  const batch = writeBatch(db);

  // 1. Save Family (if exists)
  if (family) {
    const familyRef = doc(db, "families", family.id);
    batch.set(familyRef, removeUndefined(family));
  }

  // 2. Save Members
  members.forEach((member) => {
    const memberRef = doc(db, "members", member.id);
    batch.set(memberRef, removeUndefined(member));
  });

  // 3. Save Accounts
  accounts.forEach((account) => {
    const accountRef = doc(db, "accounts", account.id);
    // Remove temporary fields if any (like tempHoldings which we aren't saving yet in this step based on the UI)
    // The UI 'Initial Assets' step captures estimated values but the Account interface doesn't strictly have a field for it unless we repurpose currentBalance or add metadata.
    // For now, we just save the account object as is, assuming it matches the interface.
    const { ...accountData } = account; 
    batch.set(accountRef, removeUndefined(accountData));
  });

  await batch.commit();
};
