import React, { useRef } from 'react';
import { X, Keyboard, Command } from 'lucide-react';
import { useFocusTrap } from '@atelier/shared';
import { WashiTape } from './PaperElements';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({ isOpen, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  useFocusTrap(isOpen, modalRef, onClose);

  if (!isOpen) return null;

  const shortcuts = [
    { key: 'N', description: 'Open Live Kitchen Orders Kanban' },
    { key: 'D', description: 'Open Counter Dashboard' },
    { key: 'B', description: 'Open Bills & Invoicing' },
    { key: 'T', description: 'Open Floor Plan & Tables' },
    { key: 'K', description: 'Toggle Fullscreen Kitchen Display System (KDS)' },
    { key: '/', description: 'Focus Page Search Input' },
    { key: '?', description: 'Open / Close this Shortcuts Cheat Sheet' },
    { key: 'Esc', description: 'Close any active modal or drawer' },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2B1B14]/65 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="shortcuts-modal-title"
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        className="relative w-full max-w-md paper-sheet paper-grain p-6 border border-[#B98A5E]/50 shadow-2xl focus:outline-hidden"
      >
        <WashiTape variant="terracotta" position="top-center" label="Tactile Speed Keys" />

        <div className="flex items-center justify-between pb-3 border-b border-[#B98A5E]/30 mb-4">
          <div className="flex items-center gap-2">
            <Keyboard className="w-4 h-4 text-[#C65D3B]" />
            <h3 id="shortcuts-modal-title" className="font-serif-display text-lg font-bold text-[#2B1B14]">
              Keyboard Quick Keys
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-[#4A372F] hover:text-[#2B1B14] cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
            aria-label="Close shortcuts modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-[#4A372F] mb-4">
          Press any key when not typing in a text field for rapid roastery dispatch:
        </p>

        <div className="space-y-2 text-xs">
          {shortcuts.map((sc) => (
            <div
              key={sc.key}
              className="flex items-center justify-between py-1.5 px-2 bg-[#FAF5EC] border border-[#B98A5E]/30"
            >
              <span className="text-[#2B1B14] font-medium">{sc.description}</span>
              <kbd className="px-2.5 py-1 bg-[#2B1B14] text-[#FAF5EC] font-mono text-xs font-bold rounded-xs shadow-xs">
                {sc.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="mt-5 pt-3 border-t border-[#B98A5E]/30 text-center">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-[#2B1B14] text-[#FAF5EC] text-xs font-serif-display font-semibold hover:bg-[#3d271d] cursor-pointer"
          >
            Got it, return to ledger
          </button>
        </div>
      </div>
    </div>
  );
};
