import React, { useState, useEffect } from 'react';
import {
  Printer,
  ArrowLeft,
  Download,
  Check,
  AlertTriangle,
  ExternalLink,
  Scissors,
  Coffee,
} from 'lucide-react';
import QRCode from 'qrcode';
import { CAFE_CONFIG, isCustomerUrlValid } from '@atelier/shared';
import { WashiTape } from './PaperElements';

interface PrintableTableQRCodesProps {
  onBack: () => void;
}

export const PrintableTableQRCodes: React.FC<PrintableTableQRCodesProps> = ({ onBack }) => {
  const [qrSvgMap, setQrSvgMap] = useState<Record<number, string>>({});
  const [downloadedMap, setDownloadedMap] = useState<Record<number, boolean>>({});

  // Dynamic public customer URL from settings, localStorage, env variable, or fallback
  const customerBaseUrl =
    (typeof window !== 'undefined' && localStorage.getItem('atelier_customer_site_url')) ||
    CAFE_CONFIG.customerSiteUrl ||
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_CUSTOMER_SITE_URL) ||
    '';

  const { valid: isUrlValid, warning: urlWarning } = isCustomerUrlValid(customerBaseUrl);

  useEffect(() => {
    let isMounted = true;
    const generateAllSvgQRs = async () => {
      const generated: Record<number, string> = {};
      const base = customerBaseUrl.trim() || 'https://ateliervelin.coffee';

      for (const table of CAFE_CONFIG.tables) {
        const tableUrl = `${base.replace(/\/+$/, '')}/table/${table.number}`;
        try {
          // Generate crisp SVG markup for print & screen
          const svg = await QRCode.toString(tableUrl, {
            type: 'svg',
            margin: 1,
            color: {
              dark: '#2B1B14',
              light: '#FFFFFF',
            },
            errorCorrectionLevel: 'M',
          });
          generated[table.number] = svg;
        } catch (err) {
          console.error(`Failed to generate SVG QR for Table ${table.number}:`, err);
        }
      }

      if (isMounted) {
        setQrSvgMap(generated);
      }
    };

    generateAllSvgQRs();
    return () => {
      isMounted = false;
    };
  }, [customerBaseUrl]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadSingleSvg = (tableNumber: number) => {
    const svgMarkup = qrSvgMap[tableNumber];
    if (!svgMarkup) return;

    const blob = new Blob([svgMarkup], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `table-${tableNumber}-qr.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloadedMap((prev) => ({ ...prev, [tableNumber]: true }));
    setTimeout(() => {
      setDownloadedMap((prev) => ({ ...prev, [tableNumber]: false }));
    }, 2000);
  };

  // Group tables into batches of 6 for A4 layout (2 columns × 3 rows per page)
  const a4Pages: Array<typeof CAFE_CONFIG.tables> = [];
  for (let i = 0; i < CAFE_CONFIG.tables.length; i += 6) {
    a4Pages.push(CAFE_CONFIG.tables.slice(i, i + 6));
  }

  return (
    <div className="space-y-6">
      {/* Print-only CSS rules */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @media print {
            @page {
              size: A4 portrait;
              margin: 10mm;
            }
            body {
              background: #FFF !important;
              color: #000 !important;
            }
            .a4-page-grid {
              page-break-after: always;
              display: grid !important;
              grid-template-columns: repeat(2, 1fr) !important;
              grid-template-rows: repeat(3, 1fr) !important;
              gap: 8mm !important;
              height: 270mm !important;
            }
            .a4-page-grid:last-child {
              page-break-after: avoid;
            }
            .no-print {
              display: none !important;
            }
          }
        `,
      }} />

      {/* Warning banner if URL is empty, localhost, or not https */}
      {!isUrlValid && (
        <div className="p-4 bg-[#FFF3E0] border-l-4 border-[#C65D3B] text-[#7A3618] flex items-start gap-3 no-print">
          <AlertTriangle className="w-5 h-5 shrink-0 text-[#C65D3B] mt-0.5" />
          <div className="space-y-1 text-xs">
            <h4 className="font-bold text-sm text-[#2B1B14]">
              Live Customer Website URL Warning
            </h4>
            <p className="leading-relaxed">
              {urlWarning || 'Customer URL is invalid. QR codes will not work for customers until you set your live website URL.'}
            </p>
            <p className="text-[11px] text-[#4A372F] font-mono">
              Navigate to <strong>Settings → Cafe Profile</strong> to configure your production customer URL (e.g. <code className="bg-[#FAF5EC] px-1 font-bold">https://cafe.yourdomain.com</code>).
            </p>
          </div>
        </div>
      )}

      {/* Header Bar */}
      <div className="bg-[#FAF5EC] p-4 border border-[#B98A5E]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs no-print">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="p-1.5 border border-[#B98A5E]/40 text-[#4A372F] hover:text-[#2B1B14] cursor-pointer"
            aria-label="Back to Tables Management"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="font-serif-display text-2xl font-bold text-[#2B1B14]">
              Printable Table QR Sheets (A4 Vector Layout)
            </h2>
            <p className="text-xs text-[#4A372F]">
              Encoding target: <code className="bg-[#E7D6BE]/60 px-1 py-0.5 font-mono text-[#2B1B14]">{customerBaseUrl || 'https://...'}/table/[n]</code> · 6 cards per A4 sheet
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#2B1B14] hover:bg-[#3d281f] text-white text-xs font-serif font-semibold cursor-pointer shadow-xs transition-colors"
          >
            <Printer className="w-4 h-4 text-[#E5B358]" />
            <span>Print / Download PDF (A4)</span>
          </button>
        </div>
      </div>

      {/* Pages Container */}
      <div className="space-y-10">
        {a4Pages.map((pageTables, pageIndex) => (
          <div key={pageIndex} className="space-y-2">
            <div className="text-[11px] font-mono text-[#8C7A70] uppercase tracking-wider no-print">
              Sheet Page {pageIndex + 1} of {a4Pages.length} ({pageTables.length} Cards)
            </div>

            <div className="a4-page-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {pageTables.map((table) => {
                const targetUrl = `${(customerBaseUrl || 'https://ateliervelin.coffee').replace(/\/+$/, '')}/table/${table.number}`;
                const svgMarkup = qrSvgMap[table.number];

                return (
                  <div
                    key={table.id}
                    className="paper-sheet paper-grain p-5 border-2 border-dashed border-[#B98A5E]/70 text-center relative flex flex-col justify-between items-center min-h-[360px] bg-[#FAF5EC] shadow-xs print:shadow-none print:border-dashed print:border-[#2B1B14]"
                  >
                    {/* Cut lines indicators with scissor icons */}
                    <div className="absolute top-1 left-1 text-[#B98A5E]/60 flex items-center gap-0.5 text-[9px] font-mono select-none">
                      <Scissors className="w-2.5 h-2.5" />
                      <span>Cut line</span>
                    </div>

                    <WashiTape
                      variant="terracotta"
                      position="top-center"
                      label={`Table ${table.number}`}
                    />

                    {/* Cafe Branding & Table Header */}
                    <div className="pt-2 w-full">
                      <div className="flex items-center justify-center gap-1.5 mb-1">
                        <Coffee className="w-3.5 h-3.5 text-[#C65D3B]" />
                        <span className="text-[11px] text-[#2B1B14] uppercase tracking-widest font-mono font-bold">
                          {CAFE_CONFIG.cafeName}
                        </span>
                      </div>
                      <h3 className="font-serif-display text-3xl font-black text-[#2B1B14] tracking-tight">
                        Table {table.number < 10 ? `0${table.number}` : table.number}
                      </h3>
                      <span className="text-xs text-[#C65D3B] font-mono font-medium block mt-0.5">
                        {table.zone} · Seats up to {table.capacity}
                      </span>
                    </div>

                    {/* Vector Crisp QR Display */}
                    <div className="my-2 p-2 bg-white border border-[#2B1B14] shadow-xs w-40 h-40 flex items-center justify-center">
                      {svgMarkup ? (
                        <div
                          className="w-full h-full [&>svg]:w-full [&>svg]:h-full"
                          dangerouslySetInnerHTML={{ __html: svgMarkup }}
                        />
                      ) : (
                        <span className="text-xs font-mono text-[#8C7A70] animate-pulse">
                          Generating QR...
                        </span>
                      )}
                    </div>

                    {/* Instruction & URL */}
                    <div className="border-t border-[#B98A5E]/40 pt-2.5 w-full space-y-1.5">
                      <p className="text-xs font-serif font-bold text-[#2B1B14] tracking-wide">
                        Scan to order and pay
                      </p>
                      <p className="text-[10px] text-[#4A372F] font-mono max-w-[220px] truncate mx-auto">
                        {targetUrl}
                      </p>

                      {/* Interactive Controls (hidden on print) */}
                      <div className="pt-1 flex items-center justify-center gap-3 no-print">
                        <a
                          href={targetUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-mono text-[#C65D3B] hover:text-[#2B1B14] hover:underline"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Test this QR</span>
                        </a>

                        <button
                          type="button"
                          onClick={() => handleDownloadSingleSvg(table.number)}
                          className="inline-flex items-center gap-1 text-[11px] font-mono text-[#4A372F] hover:text-[#2B1B14] cursor-pointer"
                        >
                          {downloadedMap[table.number] ? (
                            <>
                              <Check className="w-3 h-3 text-[#2E7D32]" />
                              <span className="text-[#2E7D32]">Saved</span>
                            </>
                          ) : (
                            <>
                              <Download className="w-3 h-3" />
                              <span>SVG</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
