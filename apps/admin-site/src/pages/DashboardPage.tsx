import React from 'react';
import { useNavigate } from 'react-router-dom';
import { DailyCounterDashboard } from '../components/DailyCounterDashboard';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <DailyCounterDashboard
        onNavigateToBills={() => navigate('/bills')}
        onNavigateToCustomers={() => navigate('/top-bills')}
      />
    </div>
  );
};
