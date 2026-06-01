import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Flame, Shield, Award, TrendingUp, Sparkles, AlertCircle } from 'lucide-react';
import { Product, Category, Banner } from '../types';

interface HomeViewProps {
  onNavigate: (view: string, categorySlug?: string) => void;
  onSelectProduct: (slug: string) => void;
}

export default function HomeView({ onNavigate, onSelectProduct }: HomeViewProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    // Collect Products, Categories, Banners
    Promise.all([
      fetch('/api/products').then(res => res.json()),
      fetch('/api/categories').then(res => res.json()),
      fetch('/api/admin/banners').then(res => res.json()) // fallback endpoint or default config
    ]).then(([pData, cData, bData]) => {
      if (pData.success) {
        setProducts(pData.products.slice(0, 4)); // Show 4 hero products
      }
      if (cData.success) {
        setCategories(cData.categories);
      }
      // FailSafe Banners Seed inside Client code if admin banners isn't active
      if (bData && bData.banners) {
        setBanners(bData.banners);
      } else {
        setBanners([
          {
            id: 'ban-1',
            title: 'THE CORE OF NEW CHROME',
            subtitle: 'Limited Edition Drops - Vol 03',
            imageUrl: 'https://images.unsplash.com/photo-1548883354-7622d03aca27?q=80&w=1600&auto=format&fit=crop',
            linkUrl: '/shop?category=limited-edition',
            isActive: true
          },
          {
            id: 'ban-2',
            title: 'STYLE BEYOND ORDINARY',
            subtitle: 'Signature Streetwear Staples',
            imageUrl: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=1600&auto=format&fit=crop',
            linkUrl: '/shop?category=hoodie',
            isActive: true
          }
        ]);
      }
    });
  }, []);

  useEffect(() => {
    if (banners.length === 0) return;
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners]);

  return (
    <div className="space-y-20 pb-16">
      
      {/* 1. HERO SLIDER BANNER WITH FADE LOOP */}
      {banners.length > 0 && (
        <div className="relative h-[80vh] sm:h-[85vh] w-full bg-neutral-950 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40 z-10"></div>
          
          <div className="relative h-full w-full">
            {banners.map((banner, idx) => (
              <div
                key={banner.id}
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                  idx === currentSlide ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <img
                  src={banner.imageUrl}
                  alt={banner.title}
                  className="w-full h-full object-cover opacity-60 scale-105 transform transition-transform duration-[5s]"
                />
                
                <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-12 md:p-20 z-20 max-w-4xl space-y-4">
                  <motion.span
                    initial={{ opacity: 0, y: 15 }}
                    animate={idx === currentSlide ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: 0.3 }}
                    className="text-xs font-mono tracking-[0.5em] text-neutral-300 font-semibold uppercase animate-pulse"
                  >
                    {banner.subtitle}
                  </motion.span>
                  
                  <motion.h1
                    initial={{ opacity: 0, y: 25 }}
                    animate={idx === currentSlide ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: 0.5 }}
                    className="text-4xl sm:text-5xl md:text-6xl font-display font-bold tracking-tight text-white uppercase leading-none"
                  >
                    {banner.title}
                  </motion.h1>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={idx === currentSlide ? { opacity: 1 } : {}}
                    transition={{ delay: 0.7 }}
                    className="pt-4"
                  >
                    <button
                      onClick={() => onNavigate('shop')}
                      className="px-6 py-3 bg-white text-black font-display font-semibold text-xs tracking-widest uppercase hover:bg-neutral-200 transition-all cursor-pointer flex items-center gap-2"
                    >
                      EXPLORE RELEASES
                      <ArrowRight size={14} />
                    </button>
                  </motion.div>
                </div>
              </div>
            ))}
          </div>

          {/* Indicator controls */}
          <div className="absolute bottom-6 right-6 z-20 flex gap-2">
            {banners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-1 transition-all duration-300 ${
                  idx === currentSlide ? 'w-8 bg-white' : 'w-2 bg-neutral-600'
                }`}
              ></button>
            ))}
          </div>
        </div>
      )}

      {/* 2. STATS & BRAND HIGHLIGHTS */}
      <section className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center border-y border-neutral-900 py-10">
        <div>
          <span className="block text-2xl sm:text-3xl font-display font-bold text-white">100%</span>
          <span className="text-[10px] sm:text-xs font-mono text-neutral-500 tracking-wider uppercase mt-1 block">Atelier Authentics</span>
        </div>
        <div className="border-l border-neutral-900">
          <span className="block text-2xl sm:text-3xl font-display font-bold text-white">480g</span>
          <span className="text-[10px] sm:text-xs font-mono text-neutral-500 tracking-wider uppercase mt-1 block">Heavy Loopback Fabric</span>
        </div>
        <div className="border-l border-neutral-900">
          <span className="block text-2xl sm:text-3xl font-display font-bold text-white">15m</span>
          <span className="text-[10px] sm:text-xs font-mono text-neutral-500 tracking-wider uppercase mt-1 block">Avg SCBD Transit Callback</span>
        </div>
        <div className="border-l border-neutral-900">
          <span className="block text-2xl sm:text-3xl font-display font-bold text-white">3200+</span>
          <span className="text-[10px] sm:text-xs font-mono text-neutral-500 tracking-wider uppercase mt-1 block">Loyal Patrons Registered</span>
        </div>
      </section>

      {/* 3. CATEGORIES HORIZONTAL GRID */}
      <section className="max-w-7xl mx-auto px-6 space-y-6">
        <div className="text-center md:text-left space-y-1">
          <span className="text-[10px] font-mono tracking-[0.4em] text-neutral-500 uppercase block">BROWSE SPECTOR LABS</span>
          <h2 className="text-2xl font-display font-semibold tracking-wide uppercase text-white">THE CATEGORY CHANNELS</h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onNavigate('shop', cat.slug)}
              className="bg-[#0f0f0f] border border-neutral-900 hover:border-white p-6 rounded text-left transition-all group relative overflow-hidden"
            >
              <div className="space-y-4 relative z-10">
                <span className="text-xs font-mono text-neutral-500 block h-4">0{cat.id.slice(-1)}</span>
                <span className="text-base font-display text-white uppercase tracking-wider group-hover:text-amber-300 transition-colors block">
                  {cat.name}
                </span>
                <span className="text-[11px] text-neutral-500 block truncate leading-tight">
                  {cat.description || 'View release collection Details.'}
                </span>
              </div>
              <div className="absolute right-[-10px] bottom-[-10px] opacity-10 text-9xl font-display select-none pointer-events-none text-neutral-800 font-bold">
                {cat.name.slice(0, 1)}
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* 4. FEATURED DESIGNS (HOT AND NEWEST GRID) */}
      <section className="max-w-7xl mx-auto px-6 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-mono tracking-[0.4em] text-neutral-500 uppercase block flex items-center gap-1">
              <Flame size={12} className="text-amber-500" />
              ATELIER RUNWAY EXCLUSIVES
            </span>
            <h2 className="text-2xl font-display font-semibold tracking-wide uppercase text-white">THE SIGNATURE SUITE</h2>
          </div>
          <button
            onClick={() => onNavigate('shop')}
            className="flex items-center gap-1 text-xs font-mono font-medium tracking-widest text-neutral-400 hover:text-white transition-colors"
          >
            VIEW FULL LAUNCHES
            <ArrowRight size={12} />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((p) => {
            const hasPromo = p.discountPrice && p.discountPrice < p.price;
            return (
              <div
                key={p.id}
                role="button"
                onClick={() => onSelectProduct(p.slug)}
                className="bg-[#070707] border border-neutral-900 hover:border-neutral-800 group transition-all"
              >
                {/* Image Section */}
                <div className="relative aspect-[3/4] bg-neutral-900 overflow-hidden cursor-pointer">
                  {p.isNew && (
                    <span className="absolute top-4 left-4 z-10 text-[9px] font-mono tracking-widest uppercase bg-white text-black px-2 py-1 font-semibold">
                      NEW DROP
                    </span>
                  )}
                  {hasPromo && (
                    <span className="absolute top-4 right-4 z-10 text-[9px] font-mono tracking-widest uppercase bg-amber-500 text-black px-2 py-1 font-semibold">
                      SAVE {Math.round(((p.price - p.discountPrice!) / p.price) * 100)}%
                    </span>
                  )}
                  <img
                    src={p.images[0]}
                    alt={p.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                {/* Info block */}
                <div className="p-4 space-y-2">
                  <span className="text-[9px] font-mono uppercase text-neutral-500 tracking-widest">
                    SKU: {p.sku}
                  </span>
                  <h3 className="text-sm font-display text-white font-medium group-hover:text-neutral-300 transition-colors truncate">
                    {p.name}
                  </h3>
                  
                  <div className="flex items-center gap-2">
                    {hasPromo ? (
                      <>
                        <span className="text-sm font-mono text-white font-semibold">
                          Rp {p.discountPrice!.toLocaleString()}
                        </span>
                        <span className="text-xs font-mono text-neutral-600 line-through">
                          Rp {p.price.toLocaleString()}
                        </span>
                      </>
                    ) : (
                      <span className="text-sm font-mono text-neutral-300">
                        Rp {p.price.toLocaleString()}
                      </span>
                    )}
                  </div>
                  
                  {/* Rating indicator */}
                  <div className="flex items-center gap-1.5 pt-1 text-[11px] text-neutral-500 font-mono">
                    <span className="text-amber-500">★</span>
                    <span className="text-white font-medium">{p.rating}</span>
                    <span>•</span>
                    <span>{p.salesCount} sold</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. BRAND CHARACTERS / GUARANTEES */}
      <section className="bg-[#050505] py-20 border-t border-neutral-900">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left">
          <div className="space-y-4">
            <div className="flex justify-center md:justify-start">
              <div className="w-10 h-10 rounded border border-neutral-800 flex items-center justify-center text-white bg-neutral-900">
                <Shield size={18} />
              </div>
            </div>
            <h3 className="text-lg font-display uppercase tracking-wider text-white">Atelier Authenticity</h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Every item is crafted specifically in SCBD-based ateliers using top-weight cottons, sturdy hardware, and verified tailoring procedures. Never mass produced.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex justify-center md:justify-start">
              <div className="w-10 h-10 rounded border border-neutral-800 flex items-center justify-center text-white bg-neutral-900">
                <Award size={18} />
              </div>
            </div>
            <h3 className="text-lg font-display uppercase tracking-wider text-white">Loyalty & Reward Matrix</h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Ascend inside our customer tiers from Bronze to Platinum and earn dynamic point cashback rewards redeemable directly during future collections.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex justify-center md:justify-start">
              <div className="w-10 h-10 rounded border border-neutral-800 flex items-center justify-center text-white bg-neutral-900">
                <TrendingUp size={18} />
              </div>
            </div>
            <h3 className="text-lg font-display uppercase tracking-wider text-white">Secure Transit Logistics</h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              We do not estimate distance blindly. Integrated geolocation computes optimal regional routing for JNE, J&T, and SiCepat, backed by absolute tracking verification.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
}
