import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import WelcomeScreen from './WelcomeScreen';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4 shadow-glow animate-pulse">
            <img 
              src="/Picture1.png" 
              alt="SmartSpend Logo" 
              className="w-12 h-12 object-contain"
            />
          </div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return <WelcomeScreen />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;