import React from 'react';
import { X, HelpCircle } from 'lucide-react';

interface SizeGuideProps {
  onClose: () => void;
}

export const SizeGuideModal: React.FC<SizeGuideProps> = ({ onClose }) => {
  return (
    <div id="size-guide-modal" className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-[#0C0C0C] border border-neutral-800 rounded-lg p-6 shadow-2xl relative overflow-hidden flex flex-col font-sans max-h-[85vh]">
        
        <div className="flex justify-between items-center pb-3 border-b border-neutral-800">
          <div className="flex items-center gap-1.5 font-mono text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
            <HelpCircle className="w-4 h-4" />
            <span>RASVYNAR TAILORING MEASURES</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-neutral-900 rounded text-zinc-450 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto space-y-6 pt-4 text-xs pr-2">
          <div className="text-center space-y-1">
            <h3 className="text-base font-bold tracking-wider text-white">Panduan Ukuran (Size Chart) Sizing</h3>
            <p className="text-[11px] text-zinc-400">Gunakan panduan garmen oversized kami untuk pencocokan postur badan.</p>
          </div>

          <div className="space-y-1.5">
            <h4 className="text-[9px] font-mono font-bold text-white uppercase tracking-widest bg-neutral-900 px-2 py-1 rounded">
              1. Hoodie & Outerwear (Oversized Cut)
            </h4>
            <table className="w-full text-left text-zinc-400 font-mono text-[11px]">
              <thead>
                <tr className="border-b border-neutral-800 text-[9px] text-zinc-550">
                  <th className="py-1">Size</th>
                  <th className="py-1 text-center">Lebar Dada</th>
                  <th className="py-1 text-center">Panjang Badan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-900">
                <tr>
                  <td className="py-1.5 font-bold text-white">S</td>
                  <td className="py-1.5 text-center">56 cm</td>
                  <td className="py-1.5 text-center">68 cm</td>
                </tr>
                <tr>
                  <td className="py-1.5 font-bold text-white">M</td>
                  <td className="py-1.5 text-center">59 cm</td>
                  <td className="py-1.5 text-center">71 cm</td>
                </tr>
                <tr>
                  <td className="py-1.5 font-bold text-white">L</td>
                  <td className="py-1.5 text-center">62 cm</td>
                  <td className="py-1.5 text-center">74 cm</td>
                </tr>
                <tr>
                  <td className="py-1.5 font-bold text-white">XL</td>
                  <td className="py-1.5 text-center">65 cm</td>
                  <td className="py-1.5 text-center">77 cm</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="text-[10px] font-mono text-zinc-500 italic leading-relaxed">
            *Toleransi jahitan ± 1.5 cm karena proses sablon manual dan jahit detail studio garmen. Concierge live chat kami siap mengusulkan ukuran terbaik Anda.
          </p>
        </div>

        <div className="pt-4 border-t border-neutral-800 text-right mt-4">
          <button
            onClick={onClose}
            className="bg-white text-black text-[10px] font-mono uppercase font-bold py-2 px-4 rounded hover:bg-neutral-200 cursor-pointer"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};

export default SizeGuideModal;
