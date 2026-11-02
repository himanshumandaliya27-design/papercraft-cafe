import React from 'react';
import { Link } from 'react-router-dom';
import { Coffee, Award, Sparkles, Heart, ArrowRight } from 'lucide-react';
import {
  CAFE_CONFIG,
  GENERATED_IMAGES,
  ROAST_BATCHES,
} from '@atelier/shared';
import { ResilientImage, WashiTape, ZigZagFoldDivider } from '../components/PaperElements';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-8 pt-6 pb-20">
      {/* Header */}
      <div className="border-b border-[#B98A5E]/30 pb-4 mb-8">
        <span className="text-xs text-[#4A372F] tracking-wide font-mono uppercase">
          01. Heritage & Origin
        </span>
        <h1 className="font-serif-display text-3xl sm:text-4xl font-bold text-[#2B1B14] mt-0.5">
          The Paper Mill & Coffee House
        </h1>
        <p className="text-xs sm:text-sm text-[#4A372F] mt-1 leading-relaxed">
          From a nineteenth-century bookbindery on Passage des Papetiers to an artisan specialty roastery.
        </p>
      </div>

      <div className="space-y-10">
        {/* Main Narrative Card with Layered Paper Stack */}
        <div className="relative paper-sheet paper-grain p-6 sm:p-10 border border-[#B98A5E]/40 shadow-xl space-y-6">
          <WashiTape variant="terracotta" position="top-center" label="Roastery Archive Dossier" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center pt-2">
            <div className="space-y-4 text-sm text-[#4A372F] leading-relaxed">
              <h2 className="font-serif-display text-2xl font-bold text-[#2B1B14] leading-snug">
                Where coffee roasting borrows the patience of hand-pressed paper.
              </h2>
              <p>
                In 1892, our courtyard building housed Master Papermaker Jean-Luc Vélin, who pressed rag cotton sheets for printmakers across the quarter. We restored the original cedar drying beams and stone water channels, transforming the hearth into a slow-roasting studio.
              </p>
              <p>
                Just as deckle-edged paper preserves the texture of raw fibers, our coffees preserve the terroir of the harvest—never obscured by dark roasts or chemical treatments.
              </p>
            </div>

            <div className="relative group">
              <div
                aria-hidden="true"
                className="absolute inset-0 paper-sheet-kraft rotate-2 translate-x-2 translate-y-2"
              />
              <div className="relative paper-sheet p-3 -rotate-1 group-hover:rotate-0 transition-transform">
                <ResilientImage
                  src={GENERATED_IMAGES.heroInterior}
                  alt="Atelier Vélin historic walnut bar"
                  className="w-full aspect-[4/3] object-cover"
                />
                <span className="block text-[11px] font-handwritten text-center text-[#2B1B14] mt-2">
                  The restored courtyard counter · Table 02
                </span>
              </div>
            </div>
          </div>
        </div>

        <ZigZagFoldDivider foldLabel="Our Three Founding Pillars" />

        {/* Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="paper-sheet paper-grain p-6 border border-[#B98A5E]/40 space-y-2.5">
            <span className="font-mono text-xs text-[#C65D3B] font-bold">01. Direct Elevation Lots</span>
            <h3 className="font-serif-display text-lg font-bold text-[#2B1B14]">
              High-Altitude Terroir
            </h3>
            <p className="text-xs text-[#4A372F] leading-relaxed">
              We purchase exclusively from farms above 1,800 MASL in Ethiopia, Guatemala, and Karnataka with complete farmer compensation transparency.
            </p>
          </div>

          <div className="paper-sheet paper-grain p-6 border border-[#B98A5E]/40 space-y-2.5">
            <span className="font-mono text-xs text-[#C65D3B] font-bold">02. 27-Layer Lamination</span>
            <h3 className="font-serif-display text-lg font-bold text-[#2B1B14]">
              Stone-Deck Viennoiserie
            </h3>
            <p className="text-xs text-[#4A372F] leading-relaxed">
              Our pastries are cold-fermented for 72 hours using heritage French butter and stone-ground grains, baked in cast-iron rings at 07:00 AM daily.
            </p>
          </div>

          <div className="paper-sheet paper-grain p-6 border border-[#B98A5E]/40 space-y-2.5">
            <span className="font-mono text-xs text-[#C65D3B] font-bold">03. Tactile Hospitality</span>
            <h3 className="font-serif-display text-lg font-bold text-[#2B1B14]">
              Slow Table Service
            </h3>
            <p className="text-xs text-[#4A372F] leading-relaxed">
              Every table features handmade stoneware cups by ceramicist Mara Lin and personal tasting cards stamped with the day's roasting parameters.
            </p>
          </div>
        </div>

        {/* Roasting Batch Archive */}
        <div className="paper-sheet paper-grain p-6 border border-[#B98A5E]/40 space-y-4">
          <h3 className="font-serif-display text-xl font-bold text-[#2B1B14]">
            Recent Master Roaster Logs
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {ROAST_BATCHES.map((batch) => (
              <div key={batch.batchNo} className="p-4 bg-[#FAF5EC] border border-[#B98A5E]/30 space-y-1 text-xs">
                <span className="font-mono text-[10px] text-[#C65D3B] font-bold">{batch.batchNo}</span>
                <p className="font-semibold text-[#2B1B14]">{batch.origin}</p>
                <p className="text-[11px] text-[#4A372F]">{batch.notes}</p>
                <p className="font-handwritten text-sm text-[#4A372F] pt-1">
                  “{batch.roasterComment}”
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="flex items-center justify-between p-6 paper-sheet-kraft border border-[#B98A5E]/60 flex-wrap gap-4">
          <div>
            <h4 className="font-serif-display text-lg font-bold text-[#2B1B14]">
              Experience our coffee in person
            </h4>
            <p className="text-xs text-[#4A372F]">
              Courtyard tables available every morning from 07:30 AM.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/menu"
              className="px-4 py-2 bg-[#2B1B14] text-[#FAF5EC] text-xs font-serif-display font-semibold hover:bg-[#3d281f]"
            >
              Order Online
            </Link>
            <Link
              to="/book"
              className="px-4 py-2 bg-[#C65D3B] text-[#FAF5EC] text-xs font-serif-display font-semibold hover:bg-[#b24f2f]"
            >
              Reserve a Table
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
