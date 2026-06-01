import React from 'react';
import Logo from './Logo.tsx';
import { ShieldCheck, Truck, RotateCcw, MessageSquare, Instagram, ExternalLink } from 'lucide-react';

interface FooterProps {
  onNavigate: (view: string, subCategory?: string) => void;
}

export default function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="bg-[#080808] border-t border-neutral-900 mt-20 pt-16 pb-8 text-neutral-400 text-sm">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
        
        {/* Brand Information Column */}
        <div className="space-y-6">
          <div className="flex justify-start">
            <Logo size="sm" />
          </div>
          <p className="text-xs text-neutral-500 leading-relaxed tracking-wide">
            High-concept fashion brand bridging haute couture proportions with technical futuristic streetwear. Engineered inside our SCBD Jakarta atelier.
          </p>
          <div className="flex items-center gap-4 text-white">
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-neutral-400 transition-colors">
              <Instagram size={18} />
            </a>
            <a href="https://whatsapp.com" target="_blank" rel="noreferrer" className="hover:text-neutral-400 transition-colors">
              <MessageSquare size={18} />
            </a>
          </div>
        </div>

        {/* Categories Navigate Column */}
        <div className="space-y-4">
          <span className="text-white font-display text-sm tracking-widest uppercase font-semibold">COLLECTIONS</span>
          <ul className="space-y-2 text-xs tracking-wider uppercase font-mono">
            <li>
              <button onClick={() => onNavigate('shop', 'hoodie')} className="hover:text-white transition-colors text-left">
                Hoodies & Sweaters
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('shop', 't-shirt')} className="hover:text-white transition-colors text-left">
                Luxury Tee Lines
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('shop', 'jacket')} className="hover:text-white transition-colors text-left">
                Outerwear Coats
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('shop', 'limited-edition')} className="hover:text-white transition-colors text-left text-amber-400">
                ★ Limited Drops
              </button>
            </li>
          </ul>
        </div>

        {/* Customer Guides Column */}
        <div className="space-y-4">
          <span className="text-white font-display text-sm tracking-widest uppercase font-semibold">ATELIER GUIDES</span>
          <ul className="space-y-2 text-xs tracking-wider">
            <li>
              <button onClick={() => onNavigate('about')} className="hover:text-white transition-colors text-left">
                About The Brand
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('faq')} className="hover:text-white transition-colors text-left">
                Security FAQ Portal
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('size-guide')} className="hover:text-white transition-colors text-left">
                Size & Fitting Systems
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('return-refund')} className="hover:text-white transition-colors text-left">
                Return & Refunds Protocols
              </button>
            </li>
          </ul>
        </div>

        {/* Brand Promises Column */}
        <div className="space-y-4">
          <span className="text-white font-display text-sm tracking-widest uppercase font-semibold">SECURITY CORE</span>
          <div className="space-y-3.5 text-xs">
            <div className="flex gap-2.5 items-start">
              <ShieldCheck className="text-neutral-200 shrink-0 mt-0.5" size={16} />
              <div>
                <p className="text-neutral-300 font-medium font-mono text-[10px] tracking-widest">ANTI-FRAUD RATINGS</p>
                <p className="text-neutral-500 mt-0.5">Device log authentication & satellite geolocation mapping verified.</p>
              </div>
            </div>
            <div className="flex gap-2.5 items-start">
              <Truck className="text-neutral-200 shrink-0 mt-0.5" size={16} />
              <div>
                <p className="text-neutral-300 font-medium font-mono text-[10px] tracking-widest">SATELLITE LOGISTICS</p>
                <p className="text-neutral-500 mt-0.5">Real distances computed with live regional tracking resis.</p>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Baseline Credits */}
      <div className="max-w-7xl mx-auto px-6 pt-8 border-t border-neutral-900 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-neutral-600">
        <p>© 2026 RASVYNAR Studio. Engineered for Luxury Fashion and Premium Streetwear. SCBD Jakarta Office.</p>
        <div className="flex gap-6">
          <button onClick={() => onNavigate('privacy')} className="hover:text-neutral-400 transition-colors">Privacy</button>
          <button onClick={() => onNavigate('terms')} className="hover:text-neutral-400 transition-colors">Terms of Service</button>
        </div>
      </div>
    </footer>
  );
}
