import * as React from 'react';
import { UserProfile } from '@core/types';

// Mock User Interface to replace Firebase User
export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
}

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = React.useState<User | null>(null);
  const [userProfile, setUserProfile] = React.useState<UserProfile | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    // SIMULATE LOGIN
    const mockUser: User = {
      uid: 'mock-user-id',
      email: 'hybhoyar@gmail.com',
      displayName: 'Hemant',
      photoURL: null,
      emailVerified: true
    };

    const mockProfile: UserProfile = {
      uid: 'mock-user-id',
      email: 'hybhoyar@gmail.com',
      memberId: 'm1',
      familyId: 'f1',
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };

    setCurrentUser(mockUser);
    setUserProfile(mockProfile);
    setLoading(false);
  }, []);

  const logout = async () => {
    alert('Logout disabled in local prototype mode.');
  };

  return (
    <AuthContext.Provider value={{ currentUser, userProfile, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

