import React, { useState, useRef } from 'react';
import { Volume2, VolumeX, Play, Check, X, Bell } from 'lucide-react';
import {
  ChimeOption,
  CHIME_OPTIONS,
  getChimeSoundPreference,
  setChimeSoundPreference,
  playOrderAlertChime,
  useFocusTrap,
} from '@atelier/shared';
import { WashiTape } from './PaperElements';

interface SoundSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SoundSelectorModal: React.FC<SoundSelectorModalProps> = ({ isOpen, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  useFocusTrap(isOpen, modalRef, onClose);

  const [selectedSound, setSelectedSound] = useState<ChimeOption>(() => getChimeSoundPreference());
  const [justPlayed, setJustPlayed] = useState<ChimeOption | null>(null);

  if (!isOpen) return null;

  const handleSelect = (option: ChimeOption) => {
    setSelectedSound(option);
    setChimeSoundPreference(option);
    if (option !== 'mute') {
      handlePreview(option);
    }
  };

  const handlePreview = (option: ChimeOption) => {
    setJustPlayed(option);
    playOrderAlertChime(option);
    setTimeout(() => setJustPlayed(null), 800);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2B1B14]/75 backdrop-blur-xs overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="sound-selector-title"
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        className="relative w-full max-w-md paper-sheet paper-grain p-6 sm:p-8 my-8 border border-[#B98A5E]/40 shadow-2xl focus:outline-hidden"
      >
        <WashiTape variant="terracotta" position="top-center" label="Audio Synthesizer" />

        <div className="flex items-start justify-between border-b border-[#B98A5E]/30 pb-3 mb-4">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-[#C65D3B] font-mono uppercase tracking-wider mb-0.5">
              <Bell className="w-3.5 h-3.5" />
              <span>Counter Sound Setting</span>
            </div>
            <h2 id="sound-selector-title" className="font-serif-display text-xl font-bold text-[#2B1B14]">
              New-Order Audio Chime
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close sound settings"
            className="p-1 text-[#4A372F] hover:text-[#2B1B14] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-[#4A372F] mb-4 leading-relaxed">
          Select an auditory prompt triggered on incoming tickets and Kitchen Display bumps. Preference is saved individually on this browser terminal.
        </p>

        <div className="space-y-2.5">
          {CHIME_OPTIONS.map((opt) => {
            const isSelected = selectedSound === opt.id;
            const isPlaying = justPlayed === opt.id;

            return (
              <div
                key={opt.id}
                onClick={() => handleSelect(opt.id)}
                className={`p-3.5 border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  isSelected
                    ? 'bg-[#FAF5EC] border-[#C65D3B] shadow-xs'
                    : 'bg-[#F4EBDD]/50 border-[#B98A5E]/40 hover:bg-[#FAF5EC]/70'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`mt-0.5 p-1.5 rounded-full ${
                      isSelected ? 'bg-[#C65D3B] text-white' : 'bg-[#E7D6BE] text-[#4A372F]'
                    }`}
                  >
                    {opt.id === 'mute' ? (
                      <VolumeX className="w-3.5 h-3.5" />
                    ) : (
                      <Volume2 className="w-3.5 h-3.5" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-[#2B1B14]">{opt.label}</span>
                      {isSelected && (
                        <span className="text-[10px] bg-[#C65D3B] text-white px-1.5 py-0.2 rounded-xs font-mono font-bold">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#4A372F] mt-0.5">{opt.description}</p>
                  </div>
                </div>

                {opt.id !== 'mute' && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePreview(opt.id);
                    }}
                    aria-label={`Preview ${opt.label}`}
                    className={`px-2.5 py-1 text-[11px] border border-[#B98A5E]/50 font-mono flex items-center gap-1 cursor-pointer transition-colors ${
                      isPlaying
                        ? 'bg-[#C65D3B] text-white border-[#C65D3B]'
                        : 'bg-white text-[#2B1B14] hover:bg-[#E7D6BE]'
                    }`}
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>Test</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-6 pt-3 border-t border-[#B98A5E]/30 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-[#2B1B14] text-[#FAF5EC] text-xs font-serif-display font-semibold hover:bg-[#3d271d] cursor-pointer shadow-xs"
          >
            Done & Save Preference
          </button>
        </div>
      </div>
    </div>
  );
};
