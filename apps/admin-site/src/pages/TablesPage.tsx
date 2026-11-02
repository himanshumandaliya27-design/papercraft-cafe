import React, { useState } from 'react';
import { TableManagement } from '../components/TableManagement';
import { PrintableTableQRCodes } from '../components/PrintableTableQRCodes';
import { QrCode } from 'lucide-react';

export const TablesPage: React.FC = () => {
  const [showQRSheet, setShowQRSheet] = useState(false);

  return (
    <div className="space-y-6">
      {showQRSheet ? (
        <PrintableTableQRCodes onBack={() => setShowQRSheet(false)} />
      ) : (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setShowQRSheet(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#FAF5EC] border border-[#B98A5E]/60 hover:border-[#2B1B14] text-[#2B1B14] text-xs font-semibold cursor-pointer shadow-xs"
            >
              <QrCode className="w-3.5 h-3.5 text-[#C65D3B]" />
              <span>Print Table Standee QR Codes</span>
            </button>
          </div>
          <TableManagement />
        </div>
      )}
    </div>
  );
};
