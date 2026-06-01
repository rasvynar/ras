import React, { useState, useEffect } from 'react';
import { useApp, Product } from '../context/AppContext';
import { ArrowRight, Star, Tag, Clock, Sparkles, TrendingUp, ShieldCheck, HelpCircle } from 'lucide-react';

interface LandingProps {
  onNavigate: (view: string) => void;
  onSelectProduct: (product: Product) => void;
}

export const LandingPage: React.FC<LandingProps> = ({ onNavigate, onSelectProduct }) => {
  const { banners, products, categories, cms } = useApp();
  const [activeBannerIdx, setActiveBannerIdx] = useState(0);

  // Simulated Flash Sale Countdown timer (ticks down to midnight remaining)
  const [countdown, setCountdown] = useState({ hrs: 8, mins: 45, secs: 30 });

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        let s = prev.secs - 1;
        let m = prev.mins;
        let h = prev.hrs;

        if (s < 0) {
          s = 59;
          m -= 1;
        }
        if (m < 0) {
          m = 59;
          h -= 1;
        }
        if (h < 0) {
          h = 23;
        }
        return { hrs: h, mins: m, secs: s };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Banner slide carousel automatic rotation
  useEffect(() => {
    if (banners.length <= 1) return;
    const bannerRotator = setInterval(() => {
      setActiveBannerIdx((idx) => (idx + 1) % banners.length);
    }, 6000);
    return () => clearInterval(bannerRotator);
  }, [banners]);

  // Extract products with active discounts or marked limited
  const filterFeatured = products.filter(p => p.discountPrice > 0 || p.isLimited).slice(0, 4);
  const filterBest = products.slice(0, 4);

  return (
    <div id="landing-page-root" className="bg-[#070707] text-[#FFFFFF]">
      
      {/* SECTION 1: HERO HOME CHROMATIC SLIDER */}
      <section className="relative h-[70vh] md:h-[85vh] bg-black overflow-hidden flex items-center">
        {banners.length > 0 && (
          <>
            <div className="absolute inset-0 transition-all duration-1000 ease-in-out">
              <img
                src={banners[activeBannerIdx].imageUrl}
                alt={banners[activeBannerIdx].title}
                className="w-full h-full object-cover opacity-45 scale-105 transform hover:scale-100 transition-transform duration-10000"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#070707] via-[#070707]/10 to-transparent" />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full animate-fade-in text-center md:text-left space-y-4 md:space-y-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/10 backdrop-blur-sm rounded-full font-mono text-[9px] uppercase tracking-widest text-[#C0C0C0]">
                <Sparkles className="w-3.5 h-3.5 text-white animate-spin" /> Seasonal Limited Launch
              </div>
              <h1 className="text-3xl sm:text-5xl lg:text-7xl font-sans font-black tracking-[0.1em] leading-none text-white max-w-4xl uppercase select-all">
                {banners[activeBannerIdx].title}
              </h1>
              <p className="text-xs sm:text-sm lg:text-base text-zinc-300 font-sans tracking-wide max-w-2xl leading-relaxed">
                {banners[activeBannerIdx].subtitle}
              </p>
              
              <div className="pt-4 flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start">
                <button
                  onClick={() => onNavigate('shop')}
                  className="w-full sm:w-auto bg-white text-black text-xs font-sans font-bold uppercase tracking-widest py-4 px-8 rounded hover:bg-[#C0C0C0] hover:scale-105 transition-all flex items-center justify-center gap-2 group cursor-pointer"
                >
                  Belanja Sekarang <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={() => onNavigate(`categories:${banners[activeBannerIdx].linkTo}`)}
                  className="w-full sm:w-auto bg-transparent border border-neutral-800 text-white text-xs font-mono uppercase tracking-widest py-3.5 px-6 rounded hover:bg-white/5 transition-colors cursor-pointer"
                >
                  Tinjau Koleksi
                </button>
              </div>
            </div>
            
            {/* Slide dots dashboard */}
            {banners.length > 1 && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
                {banners.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveBannerIdx(idx)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      activeBannerIdx === idx ? 'bg-white w-6' : 'bg-neutral-850 w-2'
                    }`}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </section>

      {/* SECTION 2: BRAND VALUE METRICS AND STATS */}
      <section className="bg-[#0A0A0A] border-y border-neutral-900 py-10 select-none">
        <div className="max-w-7xl mx-auto px-4 divide-y divide-neutral-900 lg:divide-y-0 lg:divide-x grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-0">
          {[
            { metric: 'WORLDWIDE SHIPPING', val: 'Fast & Secure Waybills JNE/J&T' },
            { metric: 'ELITE SEWING DENSITY', val: '400gsm Heavy French Cotton' },
            { metric: 'LOYALTY POINTS BOOST', val: 'Get Reward Points on Transact' },
            { metric: '100% SECURE CHECKOUT', val: 'Approved Midtrans/Xendit Settlement' }
          ].map((stat, idx) => (
            <div key={idx} className="flex flex-col items-center text-center px-4 py-3 lg:py-0">
              <span className="text-[11px] font-mono font-black tracking-widest text-zinc-300 uppercase">{stat.metric}</span>
              <p className="text-[10px] text-zinc-500 mt-1 font-sans">{stat.val}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 3: SCARCITY ACTIVE COUNTDOWN FLASH SALE */}
      <section className="max-w-7xl mx-auto px-4 py-8 md:py-12 relative">
        <div className="bg-neutral-950 border border-neutral-850 rounded-xl p-6 md:p-10 flex flex-col lg:flex-row items-center justify-between gap-8 shadow-2xl relative overflow-hidden">
          
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1.5px)] bg-[size:12px_12px] opacity-40 pointer-events-none" />
          
          <div className="space-y-4 text-center lg:text-left relative z-10">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-red-950/40 border border-red-900 text-red-400 font-mono text-[9px] uppercase tracking-wider rounded">
              <Clock className="w-3.5 h-3.5 animate-pulse" /> Flash Sale Drop
            </div>
            <h2 className="text-2xl sm:text-3xl font-sans font-black tracking-wider text-white">GENESIS MIDSEASON SHRED</h2>
            <p className="text-xs text-zinc-400 max-w-md leading-relaxed font-sans">
              Nikmati potongan harga langsung sampai Rp 300.000,- untuk edisi terbatas pilihan. Segera checkout sebelum jam habis.
            </p>
          </div>

          <div className="flex items-center gap-4 relative z-10">
            {[
              { label: 'JAM', count: countdown.hrs },
              { label: 'MENIT', count: countdown.mins },
              { label: 'DETIK', count: countdown.secs }
            ].map((unit, idx) => (
              <div key={idx} className="flex flex-col items-center">
                <div className="w-16 h-16 bg-zinc-900 border border-neutral-800 rounded-lg flex items-center justify-center font-mono text-2xl font-bold text-white shadow-xl">
                  {unit.count.toString().padStart(2, '0')}
                </div>
                <span className="text-[9px] font-mono text-zinc-500 tracking-wider font-bold mt-1.5 uppercase">{unit.label}</span>
              </div>
            ))}
          </div>

          <div className="relative z-10 shrink-0">
            <button
              onClick={() => onNavigate('shop')}
              className="bg-white text-black font-semibold text-xs uppercase tracking-widest py-3.5 px-6 rounded hover:bg-neutral-200 transition-colors cursor-pointer w-full"
            >
              Ambil Diskon
            </button>
          </div>

        </div>
      </section>

      {/* SECTION 4: PRODUCT CATEGORIES GRID MAP */}
      <section className="max-w-7xl mx-auto px-4 py-8 md:py-16">
        <div className="text-center mb-10 md:mb-16">
          <span className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">Interactive Navigation</span>
          <h2 className="text-2xl sm:text-3xl font-sans font-black tracking-wider text-white mt-1 uppercase">Kategori Mode RASVYNAR</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.slice(0, 8).map((cat, idx) => {
            // Find sample product in category to grab sample background image
            const itemMatch = products.find(p => p.category === cat);
            const imageFallback = itemMatch ? itemMatch.images[0] : 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=400';

            return (
              <button
                key={idx}
                type="button"
                onClick={() => onNavigate(`categories:${cat}`)}
                className="h-36 sm:h-44 bg-neutral-900 rounded border border-neutral-850 hover:border-zinc-500 overflow-hidden relative group text-left transition-all"
              >
                <img
                  src={imageFallback}
                  alt={cat}
                  className="w-full h-full object-cover opacity-25 group-hover:opacity-40 group-hover:scale-105 transition-all duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                <div className="absolute bottom-4 left-4 font-mono text-xs text-white uppercase tracking-widest font-black flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  <span>{cat}</span>
                  <ArrowRight className="w-3.5 h-3.5 opacity-60" />
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* SECTION 5: SIGNATURE SHRED FEATURED COLLECTION */}
      <section className="bg-[#050505] border-t border-neutral-900 py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4">
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10 md:mb-16 gap-4">
            <div>
              <span className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">Avant-Garde Pieces</span>
              <h2 className="text-2xl sm:text-3xl font-sans font-black tracking-wider text-white mt-1 uppercase">Produk Unggulan Limited</h2>
            </div>
            <button
              onClick={() => onNavigate('shop')}
              className="text-[#C0C0C0] hover:text-[#FFFFFF] text-xs font-mono uppercase tracking-widest flex items-center gap-1 group transition-colors cursor-pointer py-1.5"
            >
              Lihat Katalog Lengkap <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filterFeatured.map((prod) => {
              const hasDiscount = prod.discountPrice > 0;

              return (
                <div
                  key={prod.id}
                  onClick={() => onSelectProduct(prod)}
                  className="bg-[#0D0D0D] border border-neutral-850 rounded overflow-hidden hover:border-zinc-500 transition-all cursor-pointer group flex flex-col h-full shadow-2xl relative"
                >
                  {prod.isLimited && (
                    <span className="absolute top-2.5 left-2.5 bg-white text-black font-mono font-bold text-[8px] uppercase tracking-wider px-2 py-0.5 rounded shadow z-10 flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5" /> Limited Drop
                    </span>
                  )}
                  {hasDiscount && (
                    <span className="absolute top-2.5 right-2.5 bg-red-600 text-white font-mono font-bold text-[8px] uppercase px-1.5 py-0.5 rounded shadow z-10">
                      -{Math.floor(((prod.price - prod.discountPrice) / prod.price) * 100)}% OFF
                    </span>
                  )}

                  <div className="h-64 bg-zinc-950 overflow-hidden relative">
                    <img
                      src={prod.images[0]}
                      alt={prod.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500 opacity-80 group-hover:opacity-100"
                    />
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest uppercase">{prod.category}</span>
                      <h3 className="text-xs font-bold text-white tracking-wide uppercase line-clamp-1 mt-0.5">{prod.name}</h3>
                    </div>

                    <div className="flex items-end justify-between border-t border-neutral-900 pt-3 font-mono">
                      <div className="text-xs text-zinc-400 font-bold">
                        {hasDiscount ? (
                          <div className="space-y-0.5">
                            <span className="text-[10px] line-through text-zinc-650 tracking-wider">
                              Rp {prod.price.toLocaleString('id-ID')}
                            </span>
                            <p className="text-white text-xs font-black">
                              Rp {prod.discountPrice.toLocaleString('id-ID')}
                            </p>
                          </div>
                        ) : (
                          <p className="text-white">Rp {prod.price.toLocaleString('id-ID')}</p>
                        )}
                      </div>
                      <span className="text-[9px] text-zinc-500 uppercase tracking-wider">
                        Terjual {prod.soldCount || 10}+
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* SECTION 6: HEAVY TEXT REVIEWS AND TESTIMONIALS */}
      <section className="max-w-7xl mx-auto px-4 py-12 md:py-20 border-t border-neutral-900/40">
        <div className="text-center mb-12 md:mb-16">
          <span className="text-[10px] font-mono tracking-widest text-[#C0C0C0] uppercase">Customer Endorsement</span>
          <h2 className="text-xl sm:text-2xl font-sans font-black tracking-wider text-white mt-1 uppercase">Disukai Oleh Pecinta Streetwear</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {[
            {
              name: 'Satyawan Adrie',
              profession: 'Architect & Fashion Curator',
              text: 'Detail jahitannya luar biasa rata dan presisi. RASVYNAR adalah salah satu inovator streetwear di tanah air dengan standardisasi garmen premium berskala paris.',
              tier: 'Gold Member'
            },
            {
              name: 'Clara Michelle',
              profession: 'Model & Creative Director',
              text: 'Suka sekali dengan print siliconenya yang tebal dan cutting oversized-nya yang benar-benar solid. Mewah, nyaman, dan harganya sangat sebanding dengan kualitas.',
              tier: 'Platinum Member'
            }
          ].map((item, idx) => (
            <div key={idx} className="bg-neutral-900/50 border border-neutral-850 rounded p-6 space-y-4 shadow-xl">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-3.5 h-3.5 fill-white text-white" />
                ))}
              </div>
              <p className="text-xs text-zinc-350 leading-relaxed italic">"{item.text}"</p>
              <div className="border-t border-neutral-905 pt-3 flex justify-between items-center text-[10px] font-mono">
                <div>
                  <span className="font-bold text-white text-[11px] block">{item.name}</span>
                  <span className="text-zinc-500 mt-0.5 block">{item.profession}</span>
                </div>
                <span className="bg-neutral-950 px-2 py-0.5 border border-neutral-800 text-zinc-400 rounded-full font-bold">
                  {item.tier}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};

export default LandingPage;
