import React, { useState } from 'react';
import { useApp, Product } from '../context/AppContext';
import { Search, SlidersHorizontal, ArrowDownAZ, Star, AlertCircle, Sparkles } from 'lucide-react';

interface ShopProps {
  onSelectProduct: (product: Product) => void;
  initialFilter?: string;
}

export const ShopView: React.FC<ShopProps> = ({ onSelectProduct, initialFilter = '' }) => {
  const { products, categories } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<string>(() => {
    if (initialFilter.startsWith('categories:')) {
      return initialFilter.replace('categories:', '');
    }
    return 'all';
  });

  const [searchVal, setSearchVal] = useState<string>(() => {
    if (initialFilter.startsWith('search:')) {
      return initialFilter.replace('search:', '');
    }
    return '';
  });

  const [maxPrice, setMaxPrice] = useState<number>(3000000);
  const [sortBy, setSortBy] = useState<string>('featured');

  const filteredProducts = products.filter((p) => {
    const catMatch = selectedCategory === 'all' || p.category === selectedCategory;
    
    const searchMatch =
      p.name.toLowerCase().includes(searchVal.toLowerCase()) ||
      p.description.toLowerCase().includes(searchVal.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchVal.toLowerCase());

    const activePrice = p.discountPrice > 0 ? p.discountPrice : p.price;
    const priceMatch = activePrice <= maxPrice;

    return catMatch && searchMatch && priceMatch;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const priceA = a.discountPrice > 0 ? a.discountPrice : a.price;
    const priceB = b.discountPrice > 0 ? b.discountPrice : b.price;

    switch (sortBy) {
      case 'price-asc':
        return priceA - priceB;
      case 'price-desc':
        return priceB - priceA;
      case 'rating':
        return b.rating - a.rating;
      case 'sales':
        return b.soldCount - a.soldCount;
      default:
        return 0;
    }
  });

  return (
    <div id="shop-view-root" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 font-sans">
      
      <div className="mb-8 text-center md:text-left">
        <h1 className="text-xl sm:text-3xl font-sans font-black tracking-widest text-white uppercase">
          {selectedCategory === 'all' ? 'RASVYNAR ATELIER DIRECTORY' : `${selectedCategory.toUpperCase()} COLLECTION`}
        </h1>
        <p className="text-[10px] text-zinc-500 mt-1 uppercase font-mono tracking-wider">
          Menampilkan {sortedProducts.length} Premium Garments terpilih
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        <div className="bg-[#0B0B0B] border border-neutral-850 p-5 rounded-lg space-y-6 h-fit relative">
          
          <div className="flex items-center gap-1.5 pb-2 border-b border-neutral-900 font-mono text-[11px] font-bold text-white uppercase tracking-wider">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filter Garments</span>
          </div>

          <div className="space-y-1.5">
            <label className="text-[9px] font-mono text-zinc-550 uppercase tracking-widest block font-bold">Search</label>
            <div className="relative">
              <input
                type="text"
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                className="w-full bg-[#141414] text-white text-[11px] border border-neutral-850 rounded pl-8 pr-2.5 py-2 outline-none focus:border-zinc-500 font-mono"
                placeholder="Cari SKU / model..."
              />
              <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-zinc-600" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[9px] font-mono text-zinc-550 uppercase tracking-widest block font-bold">Kategori</label>
            <div className="flex flex-col gap-1 text-[11px] font-mono text-zinc-450 uppercase">
              <button
                type="button"
                onClick={() => setSelectedCategory('all')}
                className={`text-left py-1 hover:text-white transition-colors ${
                  selectedCategory === 'all' ? 'text-white font-extrabold' : ''
                }`}
              >
                Semua Koleksi ({products.length})
              </button>
              {categories.map((cat, idx) => {
                const count = products.filter(p => p.category === cat).length;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`text-left py-1 hover:text-white transition-colors flex items-center justify-between ${
                      selectedCategory === cat ? 'text-white font-extrabold' : ''
                    }`}
                  >
                    <span>{cat}</span>
                    <span className="text-[10px] text-zinc-550">({count})</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-[9px] font-mono text-zinc-550 uppercase tracking-widest font-bold">
              <span>Batas Harga</span>
              <span className="text-white">Rp {maxPrice.toLocaleString('id-ID')}</span>
            </div>
            <input
              type="range"
              min="200000"
              max="4000000"
              step="50000"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full h-1 bg-zinc-900 rounded-lg appearance-none cursor-pointer accent-white"
            />
          </div>

          <div className="space-y-1.5 border-t border-neutral-900 pt-4">
            <label className="text-[9px] font-mono text-zinc-555 uppercase block font-bold flex items-center gap-1">
              <ArrowDownAZ className="w-3.5 h-3.5" /> Urutan
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full bg-[#141414] border border-neutral-850 rounded px-2 py-2 text-xs text-white outline-none font-mono"
            >
              <option value="featured">Featured Collection</option>
              <option value="price-asc">Harga: Terendah</option>
              <option value="price-desc">Harga: Tertinggi</option>
              <option value="rating">Rating Terbaik</option>
              <option value="sales">Populer (Sales)</option>
            </select>
          </div>

        </div>

        <div className="lg:col-span-3">
          
          {sortedProducts.length === 0 ? (
            <div className="h-60 border border-dashed border-neutral-800 rounded flex flex-col items-center justify-center text-center p-6 space-y-2.5 font-sans">
              <AlertCircle className="w-6 h-6 text-zinc-500 animate-bounce" />
              <div className="text-xs font-bold text-white uppercase tracking-wider">Garments Kosong</div>
              <p className="text-[11px] text-zinc-450 max-w-xs leading-relaxed">
                Maaf, tidak ada produk garmen premium yang cocok dengan kriteria filter Anda saat ini.
              </p>
              <button
                type="button"
                onClick={() => { setSelectedCategory('all'); setSearchVal(''); setMaxPrice(3000000); }}
                className="bg-white text-black font-semibold text-[9px] font-mono uppercase tracking-widest px-3 py-1.5 rounded mt-1.5"
              >
                Reset Filter
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {sortedProducts.map((prod) => {
                const hasDiscount = prod.discountPrice > 0;

                return (
                  <div
                    key={prod.id}
                    onClick={() => onSelectProduct(prod)}
                    className="bg-[#0A0A0A] border border-neutral-850 hover:border-zinc-550 rounded overflow-hidden cursor-pointer flex flex-col justify-between group transition-all relative"
                  >
                    
                    {prod.isLimited && (
                      <span className="absolute top-2 left-2 bg-white text-black font-mono font-bold text-[8px] uppercase tracking-wider px-1.5 py-0.5 rounded shadow z-10 flex items-center gap-0.5">
                        <Sparkles className="w-2.5 h-2.5" /> Limited Drop
                      </span>
                    )}

                    {hasDiscount && (
                      <span className="absolute top-2 right-2 bg-red-600 text-white font-mono font-bold text-[8px] uppercase px-1.5 py-0.5 rounded z-10">
                        -{Math.floor(((prod.price - prod.discountPrice) / prod.price) * 100)}% OFF
                      </span>
                    )}

                    <div className="h-64 bg-[#050505] overflow-hidden relative">
                      <img
                        src={prod.images[0]}
                        alt={prod.name}
                        className="w-full h-full object-cover group-hover:scale-103 transition-all duration-300 opacity-75 group-hover:opacity-100"
                      />
                    </div>

                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <span className="text-[8px] font-mono text-zinc-550 uppercase tracking-widest">{prod.category}</span>
                        <h3 className="text-xs font-bold text-white tracking-wide uppercase line-clamp-1 mt-0.5">{prod.name}</h3>
                        
                        <div className="flex items-center gap-1 mt-1 text-amber-400 font-mono text-[9px]">
                          <Star className="w-3 h-3 fill-amber-400" />
                          <span>{prod.rating.toFixed(1)}</span>
                          <span className="text-zinc-650">• {prod.reviewsCount} review</span>
                        </div>
                      </div>

                      <div className="border-t border-neutral-900 pt-3 flex items-end justify-between font-mono">
                        <div className="text-xs font-bold">
                          {hasDiscount ? (
                            <div className="space-y-0.5">
                              <span className="text-[9px] line-through text-zinc-700">
                                Rp {prod.price.toLocaleString('id-ID')}
                              </span>
                              <p className="text-white text-xs font-black">
                                Rp {prod.discountPrice.toLocaleString('id-ID')}
                              </p>
                            </div>
                          ) : (
                            <p className="text-white text-xs">Rp {prod.price.toLocaleString('id-ID')}</p>
                          )}
                        </div>
                        <span className="text-[9px] text-zinc-550 uppercase">
                          Terjual {prod.soldCount || 10}+
                        </span>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>

      </div>

    </div>
  );
};

export default ShopView;
