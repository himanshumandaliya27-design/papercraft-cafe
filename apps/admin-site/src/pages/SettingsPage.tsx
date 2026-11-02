import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SettingsAndStaff } from '../components/SettingsAndStaff';

export const SettingsPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <SettingsAndStaff onOpenQRCodes={() => navigate('/tables')} />
    </div>
  );
};
