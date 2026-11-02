import React from 'react';
import { getMissingConfigs, MissingConfig } from '../config/appMode';

interface MissingConfigScreenProps {
  siteName: 'Customer Site' | 'Admin POS & Management' | 'Unified Preview';
  siteType?: 'customer' | 'admin' | 'both';
}

export const MissingConfigScreen: React.FC<MissingConfigScreenProps> = ({
  siteName,
  siteType = 'both',
}) => {
  const allMissing = getMissingConfigs();
  const relevantMissing = allMissing.filter(
    (item) => item.site === 'both' || item.site === siteType
  );

  return (
    <div className="min-h-screen bg-[#F4EBDD] text-[#2B1B14] flex items-center justify-center p-4 font-sans">
      <div className="max-w-xl w-full bg-[#FAF5EC] border-2 border-[#B98A5E] p-8 shadow-[4px_4px_0_0_#B98A5E] rounded-sm">
        <div className="inline-block bg-[#C65D3B] text-[#FAF5EC] px-3 py-1 font-serif text-sm tracking-widest uppercase mb-4 font-semibold">
          Configuration Required
        </div>

        <h1 className="text-2xl sm:text-3xl font-serif font-bold mb-2">
          {siteName}
        </h1>
        <p className="text-[#4A372F] text-sm mb-6 leading-relaxed">
          This application is running in <strong className="font-semibold text-[#2B1B14]">Production Mode</strong>, which strictly requires real Firebase credentials to protect customer and cafe data integrity.
        </p>

        <div className="bg-[#EFE4D2] p-4 rounded border border-[#B98A5E]/40 mb-6">
          <h2 className="text-xs font-mono uppercase tracking-wider text-[#6B5A4E] mb-2 font-bold">
            Missing or Placeholder Environment Variables ({relevantMissing.length})
          </h2>
          <ul className="space-y-2">
            {relevantMissing.map((item: MissingConfig) => (
              <li key={item.key} className="flex items-start justify-between text-sm bg-[#FAF5EC] p-2 border border-[#B98A5E]/30">
                <span className="font-mono text-xs font-bold text-[#C65D3B]">{item.key}</span>
                <span className="text-xs text-[#6B5A4E]">{item.label}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-4 text-xs text-[#4A372F] leading-normal border-t border-[#B98A5E]/30 pt-4">
          <h3 className="font-bold text-[#2B1B14] uppercase tracking-wider text-xs">How to fix this:</h3>
          <ol className="list-decimal pl-4 space-y-1">
            <li>Open the <code className="bg-[#EFE4D2] px-1 py-0.5 rounded font-mono">.env.example</code> file in your app folder.</li>
            <li>Copy it to <code className="bg-[#EFE4D2] px-1 py-0.5 rounded font-mono">.env</code> and add your real Firebase Web App credentials.</li>
            <li>On Netlify, configure these exact variables in <strong>Site Settings → Environment Variables</strong>.</li>
            <li>Trigger a redeploy since Vite bakes environment variables into static client code at build time.</li>
          </ol>
        </div>

        <div className="mt-6 pt-4 border-t border-[#B98A5E]/30 flex items-center justify-between">
          <span className="text-[11px] text-[#6B5A4E] font-serif italic">Atelier Vélin — Tactile Roastery Suite</span>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-[#2B1B14] hover:bg-[#4A372F] text-[#FAF5EC] text-xs font-medium uppercase tracking-wider rounded transition-colors"
          >
            Check Again
          </button>
        </div>
      </div>
    </div>
  );
};
