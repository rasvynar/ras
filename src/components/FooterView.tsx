import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import Logo from './Logo';
import { Mail, Send, CheckCircle2, ShieldCheck, Phone } from 'lucide-react';

interface FooterProps {
  onNavigate: (view: string) => void;
}

export const FooterView: React.FC<FooterProps> = ({ onNavigate }) => {
  const { cms, settings } = useApp();
  const [newsEmail, setNewsEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsEmail.trim()) {
      setSubscribed(true);
      setNewsEmail('');
      setTimeout(() => setSubscribed(false), 5000);
    }
  };

  return (
    <footer id="rsv-footer" className="bg-[#050505] border-t border-neutral-900 font-sans text-xs text-zinc-400 relative z-10">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        
        <div className="space-y-4">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate('home')}>
            <Logo size="md" className="text-white" />
            <div>
              <span className="text-sm font-black tracking-[0.2em] text-white">RASVYNAR</span>
              <p className="text-[7px] font-mono tracking-widest text-zinc-550 uppercase">{settings.tagline}</p>
            </div>
          </div>
          <p className="text-zinc-500 leading-relaxed text-[11px] text-justify">
            {cms.aboutUsText.substring(0, 140)}...
          </p>
          <div className="space-y-1 font-mono text-[9px] uppercase text-zinc-500">
            <div className="flex items-center gap-1.5">
              <Phone className="w-3 h-3" />
              <span>{cms.contactPhone}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Mail className="w-3 h-3" />
              <span>{cms.contactEmail}</span>
            </div>
          </div>
        </div>

        <div className="space-y-3 font-mono">
          <h4 className="text-[9px] text-white font-bold tracking-[0.2em] uppercase">E-Store Boutique</h4>
          <ul className="space-y-1.5 mt-2 text-[11px] text-zinc-400">
            <li>
              <button onClick={() => onNavigate('shop')} className="hover:text-white transition-colors cursor-pointer text-left">
                Katalog Streetwear
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('categories:Limited Edition')} className="hover:text-white transition-colors cursor-pointer text-left">
                Limited Genesis Drops
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('categories:Hoodie')} className="hover:text-white transition-colors cursor-pointer text-left">
                Signature Hoodies
              </button>
            </li>
          </ul>
        </div>

        <div className="space-y-3 font-mono">
          <h4 className="text-[9px] text-white font-bold tracking-[0.2em] uppercase">Customer Policies</h4>
          <ul className="space-y-1.5 mt-2 text-[11px] text-zinc-400">
            <li>
              <button onClick={() => onNavigate('faq')} className="hover:text-white transition-colors cursor-pointer text-left">
                Frequenty Asked FAQ
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('size-guide')} className="hover:text-white transition-colors cursor-pointer text-left">
                Artisanal Size Guide
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('return-policy')} className="hover:text-white transition-colors cursor-pointer text-left">
                Kebijakan Penukaran
              </button>
            </li>
          </ul>
        </div>

        <div className="space-y-3">
          <h4 className="text-[9px] font-mono text-white font-bold tracking-[0.2em] uppercase">Newsletter</h4>
          <p className="text-[11px] text-zinc-500 leading-relaxed">
            Dapatkan info rilis terbatas & promo musiman langsung ke email masuk Anda.
          </p>
          {subscribed ? (
            <div className="bg-neutral-900 border border-neutral-850 p-2.5 rounded flex items-center gap-1.5 text-white text-[10px]">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Terdaftar! Cek inbox Anda.</span>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <input
                type="email"
                required
                value={newsEmail}
                onChange={(e) => setNewsEmail(e.target.value)}
                placeholder="Email address..."
                className="bg-[#121212] border border-neutral-850 rounded px-2.5 py-1.5 text-xs w-full text-white placeholder:text-zinc-700 outline-none focus:border-zinc-500 font-mono"
              />
              <button
                type="submit"
                className="bg-white text-black p-2 rounded hover:bg-neutral-200 transition-colors flex items-center justify-center shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          )}
          <span className="text-[9px] font-mono text-zinc-600 tracking-wider flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> Secured by reCAPTCHA
          </span>
        </div>

      </div>

      <div className="border-t border-neutral-900 bg-[#030303] py-4 text-center">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-2 font-mono text-[8px] text-zinc-550 tracking-widest uppercase">
          <div>Couriers: JNE • J&T EXPRESS • SICEPAT • ANTERAJA</div>
          <div>Gateway: {settings.paymentGateway} (SECURE PAYMENT VA/QRIS)</div>
        </div>
      </div>

      <div className="border-t border-neutral-950 py-3 text-center font-mono text-[8.5px] text-zinc-600 tracking-wider uppercase">
        © 2026 {settings.brandName.toUpperCase()} TAILORED WORKS. ALL RIGHTS RESERVED.
      </div>

    </footer>
  );
};

export default FooterView;
