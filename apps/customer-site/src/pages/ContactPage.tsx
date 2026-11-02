import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin,
  Clock,
  Phone,
  Mail,
  Share2,
  Navigation,
  Copy,
  Check,
  Compass,
} from 'lucide-react';
import { CAFE_CONFIG } from '@atelier/shared';
import { WashiTape } from '../components/PaperElements';

export const ContactPage: React.FC = () => {
  const [copiedAddress, setCopiedAddress] = useState(false);

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(`${CAFE_CONFIG.address}, ${CAFE_CONFIG.city} ${CAFE_CONFIG.pincode}`);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2500);
  };

  const getWhatsAppChatUrl = () => {
    const text = `Hello ${CAFE_CONFIG.cafeName}! I would like to inquire about today's roast batches and table availability.`;
    return `https://wa.me/91${CAFE_CONFIG.phone.replace(/\D/g, '').slice(-10)}?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-8 pt-6 pb-20">
      {/* Header */}
      <div className="border-b border-[#B98A5E]/30 pb-4 mb-8">
        <span className="text-xs text-[#4A372F] tracking-wide font-mono uppercase">
          02. Neighborhood & Hours
        </span>
        <h1 className="font-serif-display text-3xl sm:text-4xl font-bold text-[#2B1B14] mt-0.5">
          Visit Atelier Vélin
        </h1>
        <p className="text-xs sm:text-sm text-[#4A372F] mt-1 leading-relaxed">
          Tucked away in the cobblestone passageway of Old Quarter with sunlit courtyard seating.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Left Column: Hours & Contact Cards (6 Cols) */}
        <div className="md:col-span-6 space-y-6">
          {/* Service Hours Paper Card */}
          <div className="paper-sheet paper-grain p-6 border border-[#B98A5E]/40 shadow-md space-y-4">
            <WashiTape variant="terracotta" position="top-center" label="Roastery Timings" />

            <div className="flex items-center gap-2 pt-2 text-sm font-semibold text-[#2B1B14]">
              <Clock className="w-4 h-4 text-[#C65D3B]" />
              <span>Counter & Table Service Hours</span>
            </div>

            <div className="space-y-2 text-xs text-[#4A372F] border-b border-dashed border-[#B98A5E]/40 pb-3">
              <div className="flex justify-between">
                <span className="font-medium text-[#2B1B14]">Tuesday – Friday:</span>
                <span className="font-mono">07:30 AM – 06:30 PM</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-[#2B1B14]">Saturday – Sunday:</span>
                <span className="font-mono">08:00 AM – 07:30 PM</span>
              </div>
              <div className="flex justify-between text-[#C65D3B]">
                <span className="font-medium">Monday (Roast & Cupping):</span>
                <span className="font-mono">08:00 AM – 03:00 PM</span>
              </div>
            </div>

            <p className="text-[11px] text-[#4A372F] italic">
              Kitchen serves warm laminated viennoiserie from 07:30 AM until sold out. Afternoon pour-overs poured until close.
            </p>
          </div>

          {/* Contact & Address Card */}
          <div className="paper-sheet paper-grain p-6 border border-[#B98A5E]/40 shadow-md space-y-4">
            <WashiTape variant="kraft" position="top-center" label="Quarter Postal Coordinates" />

            <div className="flex items-start justify-between pt-2">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-mono text-[#4A372F]">Physical Location</span>
                <p className="text-sm font-semibold text-[#2B1B14] leading-snug">
                  {CAFE_CONFIG.address}
                </p>
                <p className="text-xs text-[#4A372F]">
                  {CAFE_CONFIG.city}, {CAFE_CONFIG.state} {CAFE_CONFIG.pincode}
                </p>
              </div>

              <button
                type="button"
                onClick={handleCopyAddress}
                className="px-2.5 py-1 text-xs border border-[#B98A5E]/50 bg-[#FAF5EC] text-[#2B1B14] hover:bg-[#E7D6BE] cursor-pointer flex items-center gap-1"
                title="Copy Address to Clipboard"
              >
                {copiedAddress ? <Check className="w-3.5 h-3.5 text-[#2E7D32]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedAddress ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <div className="pt-3 border-t border-dashed border-[#B98A5E]/40 space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#B98A5E]" />
                <a href={`tel:${CAFE_CONFIG.phone}`} className="hover:text-[#C65D3B]">
                  {CAFE_CONFIG.phone}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#B98A5E]" />
                <a href={`mailto:${CAFE_CONFIG.email}`} className="hover:text-[#C65D3B]">
                  {CAFE_CONFIG.email}
                </a>
              </div>
            </div>

            <div className="pt-2">
              <a
                href={getWhatsAppChatUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 bg-[#2E7D32] text-white text-xs font-semibold flex items-center justify-center gap-2 hover:bg-[#256629] cursor-pointer shadow-xs"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Chat on WhatsApp (+91 {CAFE_CONFIG.phone})</span>
              </a>
            </div>
          </div>
        </div>

        {/* Right Column: Folded Paper Map Simulation (6 Cols) */}
        <div className="md:col-span-6 space-y-6">
          <div className="paper-sheet paper-grain p-6 border border-[#B98A5E]/40 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#B98A5E]/30 pb-3">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-[#B98A5E]" />
                <span className="font-serif-display text-base font-bold text-[#2B1B14]">
                  Neighborhood Transit & Walking Map
                </span>
              </div>
              <span className="text-[10px] font-mono text-[#C65D3B] uppercase">Zone 01</span>
            </div>

            {/* Stylized Paper Map SVG */}
            <div className="relative aspect-[4/3] w-full bg-[#EFE3CF] border-2 border-[#B98A5E]/50 overflow-hidden shadow-inner p-4">
              {/* Paper Fold Creases */}
              <div
                aria-hidden="true"
                className="absolute inset-y-0 left-1/2 w-px bg-[#B98A5E]/30 shadow-sm"
              />
              <div
                aria-hidden="true"
                className="absolute inset-x-0 top-1/2 h-px bg-[#B98A5E]/30 shadow-sm"
              />

              {/* Map Illustration Routes */}
              <svg viewBox="0 0 400 300" className="w-full h-full text-[#4A372F]/50">
                {/* Cobblestone streets */}
                <path
                  d="M 20 60 Q 150 70 200 150 T 380 220"
                  fill="none"
                  stroke="#B98A5E"
                  strokeWidth="8"
                  strokeLinecap="round"
                />
                <path
                  d="M 120 20 L 120 280"
                  fill="none"
                  stroke="#B98A5E"
                  strokeWidth="6"
                  strokeDasharray="4 4"
                />
                <path
                  d="M 200 150 L 320 60"
                  fill="none"
                  stroke="#B98A5E"
                  strokeWidth="5"
                />

                {/* Roastery Pin */}
                <circle cx="200" cy="150" r="14" fill="#C65D3B" />
                <circle cx="200" cy="150" r="6" fill="#FAF5EC" />
                <text
                  x="200"
                  y="185"
                  textAnchor="middle"
                  fill="#2B1B14"
                  fontSize="12"
                  fontWeight="bold"
                  fontFamily="Fraunces"
                >
                  {CAFE_CONFIG.cafeName}
                </text>
                <text
                  x="200"
                  y="200"
                  textAnchor="middle"
                  fill="#4A372F"
                  fontSize="9"
                  fontFamily="Inter"
                >
                  Courtyard Entrance · Table 01–10
                </text>

                {/* Metro landmark */}
                <rect x="35" y="45" width="30" height="20" fill="#FAF5EC" stroke="#4A372F" />
                <text x="50" y="59" textAnchor="middle" fill="#2B1B14" fontSize="8">
                  Metro
                </text>

                {/* Harbor landmark */}
                <text x="320" y="50" fill="#4A372F" fontSize="9" fontStyle="italic">
                  Old Docklands (3 min walk)
                </text>
              </svg>
            </div>

            <div className="space-y-1.5 text-xs text-[#4A372F]">
              <p>
                <strong>From Fort / Colaba Metro:</strong> 4-minute walk through the covered papermakers arcade.
              </p>
              <p>
                <strong>Parking:</strong> Street parking available along the dock wall until 11:00 AM; two public municipal garages within 200m.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <Link
                to="/book"
                className="w-full py-2.5 bg-[#2B1B14] text-[#FAF5EC] text-xs font-serif-display font-semibold hover:bg-[#3d281f] text-center cursor-pointer shadow-xs"
              >
                Reserve Your Visit Online →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
