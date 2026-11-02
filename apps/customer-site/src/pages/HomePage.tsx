import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Star,
  ShoppingBag,
  Calendar,
  RotateCcw,
  Sparkles,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  X,
  MapPin,
  Clock,
  Compass,
} from 'lucide-react';
import {
  CAFE_CONFIG,
  GENERATED_IMAGES,
  ROAST_BATCHES,
  SIGNATURE_MENU_EDITIONS,
  GALLERY_MOMENTS,
  INITIAL_REVIEWS,
  MenuEdition,
  GalleryMoment,
  StickyReview,
  formatINR,
} from '@atelier/shared';
import { ResilientImage, WashiTape, ZigZagFoldDivider } from '../components/PaperElements';

interface HomePageProps {
  onAddToCart: (edition: MenuEdition) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onAddToCart }) => {
  const [unfoldKey, setUnfoldKey] = useState(0);
  const [selectedBatchIndex, setSelectedBatchIndex] = useState(0);
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});
  const [activePlatform, setActivePlatform] = useState<'All' | 'Google' | 'Zomato'>('All');
  const [galleryCategory, setGalleryCategory] = useState<string>('All Moments');
  const [lightboxMoment, setLightboxMoment] = useState<GalleryMoment | null>(null);

  const activeBatch = ROAST_BATCHES[selectedBatchIndex];

  const filteredMoments =
    galleryCategory === 'All Moments'
      ? GALLERY_MOMENTS
      : GALLERY_MOMENTS.filter((m) => m.category === galleryCategory);

  const filteredReviews =
    activePlatform === 'All'
      ? INITIAL_REVIEWS
      : INITIAL_REVIEWS.filter((r) => r.platform === activePlatform);

  const toggleCardFlip = (id: string) => {
    setFlippedCards((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 pt-6 pb-16">
      {/* =====================================================================
          SECTION 1: HERO (3D Unfolding Paper Card + Irregular Cutout Photo)
      ===================================================================== */}
      <section aria-labelledby="hero-heading" className="perspective-1200 pt-2">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4 text-xs text-[#4A372F]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#C65D3B]" />
            <span>Small-Batch Specialty Roastery</span>
            <span aria-hidden="true">·</span>
            <span>Passage des Papetiers</span>
            <span aria-hidden="true">·</span>
            <span className="font-serif-display font-semibold text-[#2B1B14]">{CAFE_CONFIG.city}</span>
          </div>

          <button
            type="button"
            onClick={() => setUnfoldKey((k) => k + 1)}
            className="inline-flex items-center gap-1.5 text-xs text-[#4A372F] hover:text-[#2B1B14] transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#B98A5E]" />
            <span>Replay 3D Paper Unfold</span>
          </button>
        </div>

        {/* 3D Unfolding Paper Card */}
        <motion.div
          key={unfoldKey}
          initial={{ rotateX: 68, opacity: 0, transformOrigin: 'top center' }}
          animate={{ rotateX: 0, opacity: 1 }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
          className="relative paper-sheet paper-grain border border-[#B98A5E]/40 p-4 sm:p-8 lg:p-12 overflow-hidden shadow-2xl"
        >
          <WashiTape variant="terracotta" position="top-center" label="Micro-Lot Roastery Edition" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center pt-2">
            {/* Left 7 Columns: Editorial Typography */}
            <div className="lg:col-span-7 space-y-3.5 sm:space-y-5">
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-[#FAF5EC] border border-[#B98A5E]/50 text-[11px] font-mono text-[#4A372F]">
                <span>Batch No. 418</span>
                <span aria-hidden="true">·</span>
                <span className="text-[#C65D3B] font-semibold">Slow Roast & Cupping</span>
              </div>

              <h1
                id="hero-heading"
                className="font-serif-display text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#2B1B14] leading-[1.14] text-balance"
              >
                Coffee roasted with the deliberate patience of handmade paper.
              </h1>

              <p className="text-xs sm:text-sm lg:text-base text-[#4A372F] leading-relaxed max-w-xl text-pretty">
                Every origin is sourced directly from heritage elevations, slow-roasted in
                our courtyard iron drum, and paired with 27-layer butter laminations baked
                warm at sunrise.
              </p>

              {/* Action Buttons: Visible above-the-fold on 360px phones */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-4 pt-1 sm:pt-2">
                <Link
                  to="/menu"
                  className="px-5 py-3 sm:px-6 sm:py-3.5 bg-[#C65D3B] text-[#FAF5EC] font-serif-display font-semibold text-xs sm:text-sm hover:bg-[#b24f2f] transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer clip-paper-tag min-h-[44px]"
                >
                  <ShoppingBag className="w-4 h-4 shrink-0" />
                  <span>Order Direct to Table (₹)</span>
                </Link>

                <Link
                  to="/book"
                  className="px-5 py-3 sm:px-6 sm:py-3.5 bg-[#FAF5EC] text-[#2B1B14] border-2 border-[#2B1B14] font-serif-display font-semibold text-xs sm:text-sm hover:bg-[#2B1B14] hover:text-[#FAF5EC] transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
                >
                  <Calendar className="w-4 h-4 text-[#B98A5E] shrink-0" />
                  <span>Reserve Table</span>
                </Link>
              </div>

              {/* Quick Hours Note */}
              <div className="flex items-center gap-2 text-[11px] text-[#4A372F] pt-2 border-t border-dashed border-[#B98A5E]/40">
                <Clock className="w-3.5 h-3.5 text-[#B98A5E] shrink-0" />
                <span>Today: 07:30 AM – 07:30 PM · Courtyard & Linen Tables Open</span>
              </div>
            </div>

            {/* Right 5 Columns: Cutout Irregular Shape Photo */}
            <div className="lg:col-span-5">
              <div className="relative mx-auto max-w-md group">
                <div
                  aria-hidden="true"
                  className="absolute inset-0 paper-sheet-kraft rotate-2 translate-x-2 translate-y-2 transition-transform duration-300 group-hover:rotate-3"
                />

                <div className="relative paper-sheet p-4 -rotate-1 transition-transform duration-300 group-hover:rotate-0">
                  <WashiTape variant="kraft" position="top-center" label="Walnut Pour-Over Bar" />

                  <div className="aspect-[16/10] w-full overflow-hidden bg-[#E7D6BE]">
                    <ResilientImage
                      src={GENERATED_IMAGES.heroInterior}
                      alt={`${CAFE_CONFIG.cafeName} sunlit espresso bar`}
                      fallbackLabel="Morning Light on Walnut Bar"
                      className="w-full h-full object-cover clip-irregular-photo transition-transform duration-300 group-hover:scale-103"
                    />
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs text-[#4A372F] px-1">
                    <span className="font-handwritten text-base text-[#2B1B14]">
                      Morning sun across Table 2 · 08:10 AM
                    </span>
                    <span className="tabular-nums text-[11px] text-[#4A372F]">Plate No. 01</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* =====================================================================
            SECTION 2: RATING CARD (Cutout Ticket with Google & Zomato Badges)
        ===================================================================== */}
        <div className="mt-8">
          <div className="relative ticket-cutout paper-grain p-5 sm:px-8 sm:py-6 border border-[#B98A5E]/45">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              {/* Left: 4.8 Stars & 2,300+ Reviews */}
              <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                <div className="pr-5 border-r border-dashed border-[#B98A5E]/60">
                  <div className="flex items-baseline gap-2">
                    <span className="font-serif-display text-3xl sm:text-4xl font-semibold text-[#2B1B14] tabular-nums">
                      4.8
                    </span>
                    <span className="text-xs text-[#4A372F] tabular-nums">/ 5.0</span>
                  </div>
                  <div className="flex items-center gap-0.5 text-[#C65D3B] mt-1" role="img" aria-label="Rated 4.8 out of 5 stars">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-[#C65D3B] text-[#C65D3B]" />
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 text-sm font-semibold text-[#2B1B14] tabular-nums">
                    <span>2,300+ Verified Guest Reviews</span>
                    <span aria-hidden="true" className="text-[#B98A5E]">·</span>
                    <span className="text-xs font-normal text-[#4A372F]">98% Return for Morning Filter</span>
                  </div>
                  <p className="text-xs text-[#4A372F] mt-1">
                    Voted #1 Independent Specialty Roastery & Viennoiserie in Old Quarter (2025–2026)
                  </p>
                </div>
              </div>

              {/* Right: Platform Switchers */}
              <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-start md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-dashed border-[#B98A5E]/50">
                <button
                  type="button"
                  onClick={() => setActivePlatform('Google')}
                  className={`px-3.5 py-2 text-xs border transition-colors cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                    activePlatform === 'Google'
                      ? 'bg-[#2B1B14] text-[#FAF5EC] border-[#2B1B14]'
                      : 'bg-[#F4EBDD] text-[#2B1B14] border-[#B98A5E]/60 hover:border-[#2B1B14]'
                  }`}
                >
                  <span className="font-serif-display font-semibold">Google</span>
                  <span aria-hidden="true">·</span>
                  <span className="tabular-nums">4.9 ★ (1,480)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActivePlatform('Zomato')}
                  className={`px-3.5 py-2 text-xs border transition-colors cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                    activePlatform === 'Zomato'
                      ? 'bg-[#C65D3B] text-[#FAF5EC] border-[#C65D3B]'
                      : 'bg-[#F4EBDD] text-[#2B1B14] border-[#B98A5E]/60 hover:border-[#2B1B14]'
                  }`}
                >
                  <span className="font-serif-display font-semibold">Zomato</span>
                  <span aria-hidden="true">·</span>
                  <span className="tabular-nums">4.8 ★ (860)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <ZigZagFoldDivider foldLabel="Fold 01 · Signature Roastery Editions" />

      {/* =====================================================================
          SECTION 3: SIGNATURE MENU (3 3D Flipping Cards)
      ===================================================================== */}
      <section aria-labelledby="signature-heading" className="py-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs text-[#4A372F] tracking-wide font-mono uppercase">
              Current Micro-Lots & Laminations
            </span>
            <h2 id="signature-heading" className="font-serif-display text-3xl sm:text-4xl font-semibold text-[#2B1B14] mt-1">
              Three Signature Paper Editions
            </h2>
          </div>
          <Link
            to="/menu"
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#C65D3B] hover:underline underline-offset-4 cursor-pointer"
          >
            <span>Explore All 20+ Items on Digital Menu</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {SIGNATURE_MENU_EDITIONS.map((edition) => {
            const isFlipped = flippedCards[edition.id] || false;
            return (
              <article
                key={edition.id}
                className="perspective-1000 min-h-[460px] select-none"
              >
                <div
                  className={`relative w-full h-full transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] preserve-3d motion-reduce:transition-none ${
                    isFlipped ? 'rotate-y-180' : ''
                  }`}
                >
                  {/* FRONT FACE */}
                  <div
                    onClick={() => toggleCardFlip(edition.id)}
                    className="absolute inset-0 backface-hidden paper-sheet paper-grain p-6 flex flex-col justify-between border border-[#B98A5E]/50 shadow-md hover:shadow-xl transition-shadow cursor-pointer"
                    aria-hidden={isFlipped}
                  >
                    <WashiTape variant="terracotta" position="top-center" label={edition.editionNumber} />

                    <div className="pt-2">
                      <div className="aspect-[4/3] w-full overflow-hidden bg-[#E7D6BE] border border-[#B98A5E]/30 mb-4">
                        <ResilientImage
                          src={edition.image}
                          alt={edition.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <span className="text-[11px] text-[#C65D3B] font-mono uppercase tracking-wider font-semibold">
                        {edition.category}
                      </span>
                      <h3 className="font-serif-display text-xl font-bold text-[#2B1B14] mt-0.5 leading-snug">
                        {edition.name}
                      </h3>
                      <p className="text-xs text-[#4A372F] mt-1 line-clamp-2 leading-relaxed">
                        {edition.subtitle}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-dashed border-[#B98A5E]/40 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] text-[#4A372F] block">Tasting Price</span>
                        <span className="font-serif-display text-lg font-bold text-[#2B1B14] tabular-nums">
                          {formatINR(edition.price)}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleCardFlip(edition.id);
                        }}
                        aria-label={`Unfold tasting notes for ${edition.name}`}
                        className="text-[11px] text-[#C65D3B] hover:text-[#2B1B14] font-medium flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <span>Tap to unfold</span>
                        <span aria-hidden="true">↻</span>
                      </button>
                    </div>
                  </div>

                  {/* BACK FACE */}
                  <div
                    className="absolute inset-0 backface-hidden rotate-y-180 paper-sheet-kraft paper-grain p-6 flex flex-col justify-between border-2 border-[#B98A5E] shadow-lg"
                    aria-hidden={!isFlipped}
                  >
                    <WashiTape variant="kraft" position="top-center" label="Provenance & Harvest" />

                    <div className="pt-3 space-y-2.5 overflow-y-auto max-h-[300px] scrollbar-thin">
                      <div>
                        <span className="text-[10px] text-[#4A372F] uppercase block font-mono">
                          Origin & Elevation
                        </span>
                        <p className="text-xs font-semibold text-[#2B1B14]">
                          {edition.originOrFlour}
                        </p>
                      </div>

                      <div>
                        <span className="text-[10px] text-[#4A372F] uppercase block font-mono">
                          Process & Extraction
                        </span>
                        <p className="text-xs text-[#2B1B14]">{edition.processOrBake}</p>
                      </div>

                      <div>
                        <span className="text-[10px] text-[#4A372F] uppercase block font-mono">
                          Tasting Notes
                        </span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {edition.tastingNotes.map((note) => (
                            <span
                              key={note}
                              className="px-2 py-0.5 bg-[#FAF5EC] border border-[#B98A5E]/50 text-[10px] text-[#2B1B14]"
                            >
                              {note}
                            </span>
                          ))}
                        </div>
                      </div>

                      <p className="font-handwritten text-base text-[#4A372F] pt-1">
                        “{edition.baristaNote}”
                      </p>
                    </div>

                    <div className="pt-3 border-t border-[#B98A5E]/40 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleCardFlip(edition.id);
                        }}
                        className="px-3 py-2 bg-[#FAF5EC] hover:bg-[#E7D6BE] text-[#2B1B14] text-xs font-medium border border-[#B98A5E]/60 transition-colors cursor-pointer min-h-[44px]"
                      >
                        ← Fold
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onAddToCart(edition);
                        }}
                        className="flex-1 py-2 bg-[#2B1B14] hover:bg-[#C65D3B] text-[#FAF5EC] text-xs font-serif-display font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-xs min-h-[44px]"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Add {formatINR(edition.price)} to Tray</span>
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <ZigZagFoldDivider foldLabel="Fold 02 · Roastery Dossier" />

      {/* =====================================================================
          SECTION 4: ABOUT TEASER & INTERACTIVE ROAST BATCH DOSSIER
      ===================================================================== */}
      <section className="py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6 space-y-5">
            <span className="text-xs text-[#4A372F] uppercase tracking-wider font-mono">
              01. The Roastery & Mill Archive
            </span>
            <h2 className="font-serif-display text-3xl sm:text-4xl font-semibold text-[#2B1B14] leading-tight text-balance">
              Crafted like a letterpress edition, poured one carafe at a time.
            </h2>
            <p className="text-sm sm:text-base text-[#4A372F] leading-relaxed">
              Before {CAFE_CONFIG.cafeName} became a coffee house, our courtyard building
              housed a nineteenth-century paper mill and bookbindery. We kept the original cedar
              drying racks, linen-draped skylights, and tactile obsession with craft.
            </p>

            {/* Interactive Roast Batch Logs */}
            <div className="pt-2">
              <span className="block text-xs font-medium text-[#4A372F] mb-2">
                Inspect Current Roaster Log Sheet:
              </span>
              <div className="flex flex-wrap gap-2">
                {ROAST_BATCHES.map((batch, idx) => (
                  <button
                    key={batch.batchNo}
                    type="button"
                    onClick={() => setSelectedBatchIndex(idx)}
                    className={`px-3.5 py-2 text-xs font-medium border transition-colors cursor-pointer tabular-nums ${
                      selectedBatchIndex === idx
                        ? 'bg-[#2B1B14] text-[#FAF5EC] border-[#2B1B14]'
                        : 'bg-[#FAF5EC] text-[#2B1B14] border-[#B98A5E]/50 hover:border-[#2B1B14]'
                    }`}
                  >
                    {batch.batchNo}
                  </button>
                ))}
              </div>

              <div className="mt-3 paper-sheet p-4 border border-[#B98A5E]/40">
                <div className="flex items-center justify-between text-xs text-[#4A372F] border-b border-dashed border-[#B98A5E]/40 pb-2">
                  <span className="font-semibold text-[#2B1B14]">{activeBatch.origin}</span>
                  <span className="tabular-nums">{activeBatch.altitude}</span>
                </div>
                <p className="text-xs text-[#4A372F] mt-2">
                  <strong className="text-[#2B1B14]">Process:</strong> {activeBatch.process} ·{' '}
                  <span className="text-[#C65D3B] font-medium">{activeBatch.notes}</span>
                </p>
                <p className="font-handwritten text-base text-[#4A372F] mt-1.5">
                  “{activeBatch.roasterComment}”
                </p>
              </div>
            </div>

            <Link
              to="/about"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2B1B14] hover:text-[#C65D3B] underline underline-offset-4"
            >
              <span>Read the Full Mill & Roastery Story →</span>
            </Link>
          </div>

          <div className="lg:col-span-6">
            <div className="relative mx-auto max-w-md py-4">
              <div
                aria-hidden="true"
                className="absolute inset-0 paper-sheet-kraft -rotate-3 translate-x-3 translate-y-3"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 paper-sheet rotate-2 -translate-x-2 translate-y-1.5"
              />
              <div className="relative paper-sheet paper-grain p-6 sm:p-8 -rotate-1 hover:rotate-0 transition-transform duration-200">
                <WashiTape variant="terracotta" position="top-right" label="Cupping Notes" />

                <div className="aspect-[4/3] w-full overflow-hidden bg-[#E7D6BE] border border-[#B98A5E]/40 mb-4">
                  <ResilientImage
                    src={GENERATED_IMAGES.pourOver}
                    alt="Artisan copper pour-over bloom"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="space-y-2 text-xs text-[#4A372F]">
                  <p className="font-serif-display text-base font-semibold text-[#2B1B14]">
                    The 35-Second First Bloom
                  </p>
                  <p>
                    We brew with unbleached organic bamboo filter cones to allow the delicate bergamot and jasmine notes of our Gedeb lots to pass through without paper astringency.
                  </p>
                  <p className="font-handwritten text-lg text-[#C65D3B] pt-1">
                    “Table 4 is where we taste test every fresh arrival.”
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <ZigZagFoldDivider foldLabel="Fold 03 · More Moments Gallery" />

      {/* =====================================================================
          SECTION 5: PHOTO GALLERY WITH LIGHTBOX MODAL
      ===================================================================== */}
      <section aria-labelledby="gallery-heading" className="py-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs text-[#4A372F] tracking-wide font-mono uppercase">
              Visual Archive · Oct 2026
            </span>
            <h2 id="gallery-heading" className="font-serif-display text-3xl sm:text-4xl font-semibold text-[#2B1B14] mt-1">
              More Moments
            </h2>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap gap-2 text-xs">
            {['All Moments', 'Pour & Steam', 'Morning Light', 'Pastry Table'].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setGalleryCategory(cat)}
                className={`px-3 py-1.5 border transition-colors cursor-pointer ${
                  galleryCategory === cat
                    ? 'bg-[#2B1B14] text-[#FAF5EC] border-[#2B1B14]'
                    : 'bg-[#FAF5EC] text-[#4A372F] border-[#B98A5E]/40 hover:border-[#2B1B14]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Gallery Grid of Tilted Cutout Photos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMoments.map((moment) => (
            <div
              key={moment.id}
              onClick={() => setLightboxMoment(moment)}
              className="paper-sheet paper-grain p-4 cursor-pointer hover:shadow-xl transition-all duration-300 hover:rotate-0"
              style={{ transform: `rotate(${moment.tiltDeg}deg)` }}
            >
              <WashiTape variant={moment.tapeVariant} position={moment.tapePosition} label={moment.dateStamp} />

              <div className="aspect-[4/3] w-full overflow-hidden bg-[#E7D6BE] border border-[#B98A5E]/30 mb-3">
                <ResilientImage
                  src={moment.image}
                  alt={moment.title}
                  className="w-full h-full object-cover group-hover:scale-102 transition-transform"
                />
              </div>

              <h3 className="font-serif-display text-base font-semibold text-[#2B1B14]">
                {moment.title}
              </h3>
              <p className="font-handwritten text-base text-[#C65D3B] mt-1">
                “{moment.handwrittenNote}”
              </p>
            </div>
          ))}
        </div>
      </section>

      <ZigZagFoldDivider foldLabel="Fold 04 · Guest Notes Wall" />

      {/* =====================================================================
          SECTION 6: STICKY-NOTE REVIEWS WALL
      ===================================================================== */}
      <section aria-labelledby="reviews-heading" className="py-6">
        <div className="text-center max-w-xl mx-auto mb-8 space-y-2">
          <span className="text-xs text-[#4A372F] tracking-wide font-mono uppercase">
            Community Pinboard
          </span>
          <h2 id="reviews-heading" className="font-serif-display text-3xl sm:text-4xl font-semibold text-[#2B1B14]">
            Notes Left at the Roastery Wall
          </h2>
          <p className="text-xs text-[#4A372F]">
            Guest reflections stamped and pinned fresh from our coffee house cork ledger.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredReviews.map((rev) => (
            <div
              key={rev.id}
              className="paper-sheet paper-grain p-6 relative border border-[#B98A5E]/40 shadow-md"
              style={{ transform: `rotate(${rev.tiltDeg}deg)` }}
            >
              <WashiTape variant={rev.tapeVariant} position="top-center" label={rev.platform} />

              <div className="flex items-center gap-1 text-[#C65D3B] mb-3">
                {[...Array(rev.rating)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-[#C65D3B]" />
                ))}
              </div>

              <p className="text-xs text-[#2B1B14] leading-relaxed italic">
                “{rev.quote}”
              </p>

              <p className="font-handwritten text-lg text-[#C65D3B] mt-3">
                {rev.handwrittenSignoff}
              </p>

              <div className="pt-3 mt-3 border-t border-dashed border-[#B98A5E]/40 flex items-center justify-between text-xs text-[#4A372F]">
                <div>
                  <span className="font-semibold text-[#2B1B14] block">{rev.author}</span>
                  <span className="text-[11px]">{rev.role}</span>
                </div>
                <span className="text-[10px] font-mono">{rev.date}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {lightboxMoment && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2B1B14]/75 backdrop-blur-xs"
            role="dialog"
            aria-modal="true"
            aria-label={lightboxMoment.title}
            onClick={() => setLightboxMoment(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-2xl w-full paper-sheet paper-grain p-6 border border-[#B98A5E]/50 shadow-2xl"
            >
              <WashiTape variant="terracotta" position="top-center" label={lightboxMoment.dateStamp} />

              <div className="flex items-center justify-between mb-3 pt-2">
                <span className="text-xs text-[#4A372F] font-mono">{lightboxMoment.cameraSpec}</span>
                <button
                  type="button"
                  onClick={() => setLightboxMoment(null)}
                  className="p-1 text-[#4A372F] hover:text-[#2B1B14] cursor-pointer"
                  aria-label="Close Lightbox"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="aspect-[16/10] w-full overflow-hidden bg-[#E7D6BE] border border-[#B98A5E]/40 mb-4">
                <ResilientImage
                  src={lightboxMoment.image}
                  alt={lightboxMoment.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <h3 className="font-serif-display text-xl font-bold text-[#2B1B14]">
                {lightboxMoment.title}
              </h3>
              <p className="text-xs text-[#4A372F] mt-1">{lightboxMoment.caption}</p>
              <p className="font-handwritten text-xl text-[#C65D3B] mt-1">
                “{lightboxMoment.handwrittenNote}”
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
