import React, { useState } from 'react';
import { LiveOrdersKanban } from '../components/LiveOrdersKanban';
import { KitchenDisplaySystem } from '../components/KitchenDisplaySystem';

export const LiveOrdersPage: React.FC = () => {
  const [isKDSOpen, setIsKDSOpen] = useState(false);

  return (
    <div className="space-y-6">
      <LiveOrdersKanban onOpenKitchenDisplay={() => setIsKDSOpen(true)} />
      {isKDSOpen && <KitchenDisplaySystem onClose={() => setIsKDSOpen(false)} />}
    </div>
  );
};
