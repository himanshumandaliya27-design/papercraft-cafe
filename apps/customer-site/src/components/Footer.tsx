import React from 'react';
import { Link } from 'react-router-dom';
import { Coffee, MapPin, Phone, Mail, Clock, Heart } from 'lucide-react';
import { CAFE_CONFIG } from '@atelier/shared';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#FAF5EC] border-t border-[#B98A5E]/40 mt-16 pt-12 pb-16 px-4 sm:px-8 text-xs text-[#4A372F] paper-grain relative">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Brand & Concept */}
        <div className="md:col-span-5 space-y-3">
          <div className="flex items-center gap-2">
            <span className="font-serif-display text-2xl font-bold text-[#2B1B14]">
              {CAFE_CONFIG.cafeName}
            </span>
            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 bg-[#C65D3B] text-white">
              Est. {CAFE_CONFIG.establishedYear}
            </span>
          </div>
          <p className="text-sm text-[#4A372F] leading-relaxed max-w-sm">
            {CAFE_CONFIG.description}
          </p>
          <p className="font-handwritten text-lg text-[#C65D3B]">
            “Pressed on cotton paper, poured with quiet intent.”
          </p>
        </div>

        {/* Directory Links */}
        <div className="md:col-span-3 space-y-2">
          <span className="font-serif-display font-semibold text-sm text-[#2B1B14] block mb-2">
            House Directory
          </span>
          <ul className="space-y-1.5">
            <li>
              <Link to="/menu" className="hover:text-[#C65D3B] transition-colors">
                Digital Menu & Ordering (₹)
              </Link>
            </li>
            <li>
              <Link to="/book" className="hover:text-[#C65D3B] transition-colors">
                Reserve Courtyard Table
              </Link>
            </li>
            <li>
              <Link to="/my-orders" className="hover:text-[#C65D3B] transition-colors">
                Track Past Orders & Receipts
              </Link>
            </li>
            <li>
              <Link to="/about" className="hover:text-[#C65D3B] transition-colors">
                The Roastery & Mill Archive
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-[#C65D3B] transition-colors">
                Neighborhood Map & Transit
              </Link>
            </li>
          </ul>
        </div>

        {/* Hours & Contact */}
        <div className="md:col-span-4 space-y-2.5">
          <span className="font-serif-display font-semibold text-sm text-[#2B1B14] block mb-2">
            Service Timings & Address
          </span>
          <div className="flex items-start gap-2">
            <Clock className="w-3.5 h-3.5 text-[#B98A5E] mt-0.5 shrink-0" />
            <div>
              <p>{CAFE_CONFIG.openingHours.weekdays}</p>
              <p>{CAFE_CONFIG.openingHours.weekends}</p>
            </div>
          </div>
          <div className="flex items-start gap-2 pt-1">
            <MapPin className="w-3.5 h-3.5 text-[#B98A5E] mt-0.5 shrink-0" />
            <p>
              {CAFE_CONFIG.address}, {CAFE_CONFIG.city} {CAFE_CONFIG.pincode}
            </p>
          </div>
          <div className="flex items-center gap-4 pt-1">
            <a
              href={`tel:${CAFE_CONFIG.phone}`}
              className="inline-flex items-center gap-1 hover:text-[#2B1B14]"
            >
              <Phone className="w-3.5 h-3.5 text-[#B98A5E]" />
              <span>{CAFE_CONFIG.phone}</span>
            </a>
            <a
              href={`mailto:${CAFE_CONFIG.email}`}
              className="inline-flex items-center gap-1 hover:text-[#2B1B14]"
            >
              <Mail className="w-3.5 h-3.5 text-[#B98A5E]" />
              <span>{CAFE_CONFIG.email}</span>
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto mt-8 pt-4 border-t border-[#B98A5E]/20 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-[#4A372F]">
        <p>© {new Date().getFullYear()} {CAFE_CONFIG.cafeName}. All rights reserved.</p>
        <p className="flex items-center gap-1">
          <span>Crafted with</span>
          <Heart className="w-3 h-3 text-[#C65D3B] fill-[#C65D3B]" />
          <span>for specialty coffee and tactile paper craft.</span>
        </p>
      </div>
    </footer>
  );
};
