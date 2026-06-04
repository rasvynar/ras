import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import Logo from './Logo';
import { ShoppingCart, User, Search, Menu, X, Award } from 'lucide-react';

interface NavbarProps {
  onNavigate: (view: string) => void;
  activeView: string;
  onOpenLogin: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigate, activeView, onOpenLogin, onLogout }) => {
  const { cart, currentUser } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const getMembershipColor = (tier: string) => {
    switch (tier) {
      case 'Platinum': return 'text-zinc-100 bg-zinc-800 border-zinc-700';
      case 'Gold': return 'text-amber-400 bg-amber-950/20 border-amber-900';
      case 'Silver': return 'text-slate-300 bg-slate-800/40 border-slate-700';
      default: return 'text-orange-400 bg-orange-950/20 border-orange-900';
    }
  };

  return (
    <nav id="rsv-navbar" className="sticky top-0 bg-[#070707]/90 backdrop-blur-md border-b border-neutral-850 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => { onNavigate('home'); setMobileMenuOpen(false); }}>
            <Logo size="md" className="text-white drop-shadow-[0_0_6px_rgba(255,255,255,0.12)]" />
            <div className="hidden sm:block">
              <span className="text-base font-black tracking-[0.2em] text-white">RASVYNAR</span>
              <p className="text-[7.5px] font-mono tracking-widest text-[#C0C0C0] uppercase leading-none mt-0.5">Style Beyond Ordinary</p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-7 text-[11px] font-mono uppercase tracking-widest text-zinc-400">
            <button
              onClick={() => onNavigate('home')}
              className={`hover:text-white transition-colors cursor-pointer ${activeView === 'home' ? 'text-white font-extrabold' : ''}`}
            >
              Home
            </button>
            <button
              onClick={() => onNavigate('shop')}
              className={`hover:text-white transition-colors cursor-pointer ${activeView.startsWith('shop') ? 'text-white font-extrabold' : ''}`}
            >
              Shop
            </button>
            <button
              onClick={() => onNavigate('categories')}
              className={`hover:text-white transition-colors cursor-pointer ${activeView === 'categories' ? 'text-white font-extrabold' : ''}`}
            >
              Categories
            </button>
            <button
              onClick={() => onNavigate('about')}
              className={`hover:text-white transition-colors cursor-pointer ${activeView === 'about' ? 'text-white font-extrabold' : ''}`}
            >
              About
            </button>
            <button
              onClick={() => onNavigate('contact')}
              className={`hover:text-white transition-colors cursor-pointer ${activeView === 'contact' ? 'text-white font-extrabold' : ''}`}
            >
              Contact
            </button>
          </div>

          <div className="flex items-center gap-4">
            
            <div className="relative">
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-1 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                title="Search Store"
              >
                <Search className="w-5 h-5" />
              </button>
              {searchOpen && (
                <div className="absolute right-0 top-10 w-60 bg-[#0F0F0F] border border-neutral-850 rounded p-2 shadow-2xl flex gap-1.5 z-50">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari streetwear..."
                    className="bg-[#141414] text-[11px] text-white p-2 rounded w-full outline-none border border-neutral-900 focus:border-zinc-500 font-mono"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && searchQuery.trim()) {
                        onNavigate(`search:${searchQuery}`);
                        setSearchOpen(false);
                      }
                    }}
                  />
                  <button 
                    onClick={() => { if(searchQuery.trim()) { onNavigate(`search:${searchQuery}`); setSearchOpen(false); } }} 
                    className="bg-white text-black text-[9px] font-bold px-2.5 rounded font-mono"
                  >
                    GO
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={() => onNavigate('cart')}
              className="p-1 text-zinc-400 hover:text-white transition-colors relative cursor-pointer"
              title="Shopping Cart"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-white text-black font-mono text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            {currentUser ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigate('profile')}
                  className="flex items-center p-0.5 rounded-full border border-neutral-800 object-cover overflow-hidden"
                  title="Profile & Membership"
                >
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-7 h-7 rounded-full object-cover"
                  />
                </button>
                
                <div className={`hidden lg:flex items-center gap-1 text-[9px] font-mono px-2 py-0.5 border rounded-full uppercase font-bold ${getMembershipColor(currentUser.membership)}`}>
                  <Award className="w-3 h-3" />
                  <span>{currentUser.membership}</span>
                </div>



                <button
                  onClick={onLogout}
                  className="hidden sm:inline-block bg-neutral-900 hover:bg-red-950/20 hover:text-red-400 border border-neutral-800 hover:border-red-900/30 text-zinc-400 text-[9px] font-mono uppercase tracking-wider px-2 py-1 py-1.5 rounded transition-all cursor-pointer"
                >
                  Keluar
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenLogin}
                className="bg-white text-black text-[10px] font-mono uppercase tracking-widest px-3.5 py-1.5 sm:py-2 rounded font-extrabold hover:bg-zinc-200 transition-all cursor-pointer border border-white"
              >
                Login
              </button>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1 md:hidden text-zinc-400 hover:text-white cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0A0A0A] border-b border-neutral-850 py-4 px-4 space-y-3 text-xs font-mono uppercase tracking-widest animate-slide-down">
          <button
            onClick={() => { onNavigate('home'); setMobileMenuOpen(false); }}
            className="block w-full text-left py-1 text-zinc-300 hover:text-white"
          >
            Home
          </button>
          <button
            onClick={() => { onNavigate('shop'); setMobileMenuOpen(false); }}
            className="block w-full text-left py-1 text-zinc-300 hover:text-white"
          >
            Shop
          </button>
          <button
            onClick={() => { onNavigate('categories'); setMobileMenuOpen(false); }}
            className="block w-full text-left py-1 text-zinc-300 hover:text-white"
          >
            Categories
          </button>
          <button
            onClick={() => { onNavigate('about'); setMobileMenuOpen(false); }}
            className="block w-full text-left py-1 text-zinc-300 hover:text-white"
          >
            About
          </button>
          <button
            onClick={() => { onNavigate('contact'); setMobileMenuOpen(false); }}
            className="block w-full text-left py-1 text-zinc-300 hover:text-white"
          >
            Contact
          </button>

          {currentUser ? (
            <button
              onClick={() => { onLogout(); setMobileMenuOpen(false); }}
              className="block w-full text-center py-2 bg-red-950/20 hover:bg-red-950/45 border border-red-900/30 text-red-400 rounded font-black mt-2 text-[10px]"
            >
              🚪 KELUAR (LOGOUT)
            </button>
          ) : (
            <button
              onClick={() => { onOpenLogin(); setMobileMenuOpen(false); }}
              className="block w-full text-center py-2 bg-white text-black rounded font-black mt-2 text-[10px]"
            >
              👋 MASUK / DAFTAR MEZANIN
            </button>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
