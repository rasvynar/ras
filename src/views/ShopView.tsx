import React, { useEffect, useState } from 'react';
import { Search, SlidersHorizontal, Star, Sparkles, X, ChevronDown, Check, Columns, EyeOff } from 'lucide-react';
import { Product, Category } from '../types';

interface ShopViewProps {
  onSelectProduct: (product: Product) => void;
  initialFilter?: string;
}

export default function ShopView({ onSelectProduct, initialFilter = '' }: ShopViewProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  
  // Filter values
  const [search, setSearch] = useState(() => {
    if (initialFilter && initialFilter.startsWith('search:')) {
      return initialFilter.replace('search:', '');
    }
    return '';
  });

  const [category, setCategory] = useState(() => {
    if (initialFilter && initialFilter.startsWith('categories:')) {
      const catParsed = initialFilter.replace('categories:', '');
      return catParsed.toLowerCase().trim().replace(/\s+/g, '-');
    }
    return '';
  });

  const [sort, setSort] = useState('popular');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');

  // Update filters if initialFilter changes dynamically
  useEffect(() => {
    if (initialFilter) {
      if (initialFilter.startsWith('search:')) {
        setSearch(initialFilter.replace('search:', ''));
        setCategory('');
      } else if (initialFilter.startsWith('categories:')) {
        const catParsed = initialFilter.replace('categories:', '');
        setCategory(catParsed.toLowerCase().trim().replace(/\s+/g, '-'));
        setSearch('');
      }
    } else {
      setSearch('');
      setCategory('');
    }
  }, [initialFilter]);
  
  // Visual states
  const [showFilters, setShowFilters] = useState(true); // default true for better desktop discoverability
  const [totalProductsCount, setTotalProductsCount] = useState(0);

  // Available unique colors in store for user selection
  const popularColors = [
    { name: 'Black', hex: '#111111', query: 'black' },
    { name: 'White', hex: '#fbfbfb', query: 'white' },
    { name: 'Gray', hex: '#6b7280', query: 'gray' },
    { name: 'Silver', hex: '#cbd5e1', query: 'silver' },
    { name: 'Chrome', hex: '#94a3b8', query: 'chrome' },
    { name: 'Concrete', hex: '#78716c', query: 'concrete' },
    { name: 'Red', hex: '#ef4444', query: 'red' },
    { name: 'Sand', hex: '#d6d3d1', query: 'sand' },
    { name: 'Khaki', hex: '#a1a1aa', query: 'khaki' }
  ];

  useEffect(() => {
    // Read categories
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setCategories(data.categories);
        }
      });
  }, []);

  // Fetch products based on live filters (re-runs in real-time as state changes)
  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (category) params.append('category', category);
    if (sort) params.append('sort', sort);
    if (minPrice) params.append('minPrice', minPrice);
    if (maxPrice) params.append('maxPrice', maxPrice);
    if (selectedSize) params.append('size', selectedSize);
    if (selectedColor) params.append('color', selectedColor);

    fetch(`/api/products?${params.toString()}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setProducts(data.products);
          // Set initial aggregate total count only if first loads or just products length
          if (!search && !category && !minPrice && !maxPrice && !selectedSize && !selectedColor) {
            setTotalProductsCount(data.products.length);
          }
        }
      });
  }, [search, category, sort, minPrice, maxPrice, selectedSize, selectedColor]);

  const clearFilters = () => {
    setSearch('');
    setCategory('');
    setSort('popular');
    setMinPrice('');
    setMaxPrice('');
    setSelectedSize('');
    setSelectedColor('');
  };

  const hasActiveFilters = search || category || minPrice || maxPrice || selectedSize || selectedColor;

  return (
    <div id="rsv-shop-view" className="max-w-7xl mx-auto px-6 py-10 space-y-8 min-h-[80vh] font-sans selection:bg-white selection:text-black">
      
      {/* 1. Header with Title & Live Search Input */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-neutral-900 pb-8 gap-6">
        <div className="space-y-1">
          <span className="text-[10px] font-mono tracking-[0.4em] text-neutral-500 uppercase block">Atelier Archival Core</span>
          <h1 className="text-3xl font-display font-medium tracking-wider uppercase text-white">THE RELEASES CATALOGUE</h1>
          <p className="text-xs text-neutral-450 font-mono">
            {products.length} design(s) filtered from {totalProductsCount || 8} total pieces
          </p>
        </div>

        {/* Live Search and Quick Toggle Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative flex-grow sm:w-80">
            <input
              id="search-input"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, SKU, or concept..."
              className="w-full bg-[#070707] border border-neutral-800 focus:border-neutral-500 focus:outline-none px-4 py-3 pl-11 text-xs tracking-wide text-white transition-all rounded font-mono"
            />
            <Search className="absolute left-4 top-3.5 text-neutral-500" size={14} />
            {search && (
              <button 
                onClick={() => setSearch('')}
                className="absolute right-3 top-3 text-neutral-500 hover:text-white transition cursor-pointer"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <button
            id="filters-toggle-btn"
            onClick={() => setShowFilters(!showFilters)}
            className={`px-5 py-3 border text-xs font-mono flex items-center justify-center gap-2 transition-all cursor-pointer rounded ${
              showFilters ? 'border-white text-white bg-white/5' : 'border-neutral-850 text-neutral-400 hover:border-neutral-500'
            }`}
          >
            <SlidersHorizontal size={14} />
            {showFilters ? 'HIDE CONTROL CENTRE' : 'OPEN FILTERS'}
          </button>
        </div>
      </div>

      {/* 2. Main Shop Layout: Left Filtres Panel / Right Products List */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        
        {/* Left Column: Filter Panel */}
        {showFilters && (
          <div id="shop-filters-panel" className="bg-[#030303] border border-neutral-900 p-6 rounded space-y-8 animate-fade-in lg:sticky lg:top-24">
            
            <div className="flex justify-between items-center pb-4 border-b border-neutral-900">
              <span className="text-[11px] font-mono font-bold tracking-widest text-neutral-200 uppercase">SEARCH MATRIX</span>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-[9px] font-mono text-neutral-500 hover:text-white underline tracking-wider cursor-pointer"
                >
                  CLEAR ALL (✕)
                </button>
              )}
            </div>

            {/* Category selection */}
            <div className="space-y-3">
              <span className="text-[10px] font-mono font-semibold tracking-widest text-neutral-400 uppercase block">Kategori Model</span>
              <div className="space-y-1 flex flex-col font-mono text-xs text-neutral-400">
                <button
                  type="button"
                  onClick={() => setCategory('')}
                  className={`text-left py-1.5 px-3 rounded transition cursor-pointer ${
                    category === '' 
                      ? 'bg-white text-black font-semibold' 
                      : 'hover:bg-neutral-950 hover:text-white'
                  }`}
                >
                  ALL COLLECTIONS
                </button>
                {categories.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCategory(c.slug)}
                    className={`text-left py-1.5 px-3 rounded transition uppercase flex justify-between items-center cursor-pointer ${
                      category === c.slug 
                        ? 'bg-white text-black font-semibold' 
                        : 'hover:bg-neutral-950 hover:text-white'
                    }`}
                  >
                    <span>{c.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Sizes Selection widget with interactive toggle buttons */}
            <div className="space-y-3">
              <span className="text-[10px] font-mono font-semibold tracking-widest text-neutral-400 uppercase block">Sizing Matrix</span>
              <div className="grid grid-cols-5 gap-1.5">
                {['S', 'M', 'L', 'XL', 'XXL'].map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => setSelectedSize(selectedSize === sz ? '' : sz)}
                    className={`h-9 border rounded text-[10px] font-mono font-bold transition-all flex items-center justify-center cursor-pointer ${
                      selectedSize === sz
                        ? 'bg-white text-black border-white'
                        : 'bg-black text-neutral-400 border-neutral-850 hover:border-neutral-500 hover:text-white'
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            {/* Chromatic Color Swatches & Filters */}
            <div className="space-y-3">
              <span className="text-[10px] font-mono font-semibold tracking-widest text-neutral-400 uppercase block">Chromatic Hue</span>
              <div className="flex flex-wrap gap-2">
                {popularColors.map((col) => {
                  const isAct = selectedColor === col.query;
                  const borderCol = col.hex === '#fbfbfb' ? 'border-neutral-700' : 'border-transparent';
                  return (
                    <button
                      key={col.name}
                      type="button"
                      onClick={() => setSelectedColor(isAct ? '' : col.query)}
                      className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition hover:scale-110 relative cursor-pointer ${
                        isAct ? 'border-white h-8 w-8 scale-105' : borderCol
                      }`}
                      style={{ backgroundColor: col.hex }}
                      title={`${col.name} Filter`}
                    >
                      {isAct && (
                        <Check 
                          size={12} 
                          className={col.hex === '#fbfbfb' ? 'text-black' : 'text-white drop-shadow-md'} 
                        />
                      )}
                    </button>
                  );
                })}
              </div>
              <p className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest mt-1">
                Filter by aesthetic tonal color-space
              </p>
            </div>

            {/* Price limits */}
            <div className="space-y-3">
              <span className="text-[10px] font-mono font-semibold tracking-widest text-[#B5B5B5] uppercase block">Price Range (IDR)</span>
              <div className="space-y-2">
                <div className="flex gap-2 font-mono text-xs">
                  <div className="relative w-1/2">
                    <span className="absolute left-2.5 top-2 text-neutral-600 text-[10px]">RP</span>
                    <input
                      type="number"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      placeholder="Min"
                      className="w-full bg-[#070707] border border-neutral-850 focus:border-neutral-500 focus:outline-none p-2 pl-7 text-[11px] text-white rounded"
                    />
                  </div>
                  <div className="relative w-1/2">
                    <span className="absolute left-2.5 top-2 text-neutral-600 text-[10px]">RP</span>
                    <input
                      type="number"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      placeholder="Max"
                      className="w-full bg-[#070707] border border-neutral-850 focus:border-neutral-500 focus:outline-none p-2 pl-7 text-[11px] text-white rounded"
                    />
                  </div>
                </div>
                {/* Quick budget tags */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {[
                    { label: '< 500rb', val: '500000' },
                    { label: '500k - 1.5jt', val: '1500000' },
                    { label: '> 1.5jt', val: '1500000', custom: true }
                  ].map((bt, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        if (bt.custom) {
                          setMinPrice('1500000');
                          setMaxPrice('');
                        } else {
                          setMinPrice('');
                          setMaxPrice(bt.val);
                        }
                      }}
                      className="text-[9px] font-mono px-2 py-0.5 border border-neutral-900 rounded bg-[#0a0a0a] text-neutral-500 hover:text-white hover:border-neutral-850 transition cursor-pointer"
                    >
                      {bt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

          </div>
        )}

        {/* Right Column: Active Sorters, Filter Summary, and Product Grid */}
        <div className={showFilters ? 'lg:col-span-3 space-y-6' : 'lg:col-span-4 space-y-6'}>
          
          {/* Sorter Header and Quick Status Indicator */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-[#040404] border border-neutral-900 p-4 rounded gap-4 font-mono text-xs">
            <div className="flex items-center gap-3">
              <span className="text-neutral-500 text-[10px] tracking-wider uppercase">Active Params:</span>
              <div className="flex flex-wrap gap-1.5 text-[10px]">
                {hasActiveFilters ? (
                  <>
                    {category && <span className="bg-neutral-900 text-white px-2 py-0.5 border border-neutral-800 uppercase rounded">{category}</span>}
                    {selectedSize && <span className="bg-neutral-900 text-white px-2 py-0.5 border border-neutral-800 uppercase rounded">Size {selectedSize}</span>}
                    {selectedColor && <span className="bg-neutral-900 text-white px-2 py-0.5 border border-neutral-800 uppercase rounded">Color {selectedColor}</span>}
                    {(minPrice || maxPrice) && <span className="bg-neutral-900 text-white px-2 py-0.5 border border-neutral-800 uppercase rounded">IDR {minPrice || '0'}-{maxPrice || '∞'}</span>}
                  </>
                ) : (
                  <span className="text-neutral-500 uppercase tracking-widest text-[9px]">Standard Archival Order</span>
                )}
              </div>
            </div>

            {/* Sorting SelectionDropdown */}
            <div className="flex items-center gap-2">
              <span className="text-neutral-500 text-[10px] uppercase tracking-wider">Sort by:</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="bg-black border border-neutral-800 focus:border-neutral-500 focus:outline-none p-1.5 px-3 rounded text-xs text-white uppercase tracking-wider cursor-pointer font-mono"
              >
                <option value="popular">Popularity</option>
                <option value="newest">New Releases</option>
                <option value="price-asc">Price: Low-to-high</option>
                <option value="price-desc">Price: High-to-low</option>
                <option value="rating">Reviews count / Rating</option>
              </select>
            </div>
          </div>

          {/* Product Cards Block */}
          {products.length === 0 ? (
            <div className="h-80 border border-dashed border-neutral-800 bg-[#020202] rounded flex flex-col items-center justify-center text-center p-8 space-y-4">
              <div className="w-12 h-12 rounded-full border border-neutral-800 flex items-center justify-center text-neutral-500 select-none font-bold text-lg font-mono">
                !
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold tracking-wide text-neutral-200 uppercase font-mono">NO SPECIMENS MATCHED</p>
                <p className="text-xs text-neutral-500 max-w-sm font-sans mx-auto leading-relaxed">
                  The query context returned zero active results. Check spelling parameters, widen price limits, or reset the search control panel.
                </p>
              </div>
              <button
                onClick={clearFilters}
                className="px-5 py-2.5 bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white hover:border-neutral-500 text-[10px] font-mono uppercase tracking-widest rounded transition cursor-pointer"
              >
                RESET FILTERS CONTROL
              </button>
            </div>
          ) : (
            <div className={`grid grid-cols-1 sm:grid-cols-2 ${showFilters ? 'xl:grid-cols-3' : 'xl:grid-cols-4'} gap-6`}>
              {products.map((p) => {
                const hasPromo = p.discountPrice && p.discountPrice < p.price;
                return (
                  <div
                    key={p.id}
                    role="button"
                    onClick={() => onSelectProduct(p)}
                    className="bg-[#050505] border border-neutral-900 hover:border-neutral-700 group transition-all rounded overflow-hidden flex flex-col justify-between shadow-lg hover:shadow-2xl"
                  >
                    
                    {/* Visual aspect ratios media block */}
                    <div className="relative aspect-[3/4] bg-neutral-950 overflow-hidden cursor-pointer">
                      {p.isNew && (
                        <span className="absolute top-4 left-4 z-10 text-[8px] font-mono tracking-widest uppercase bg-white text-black px-2 py-0.5 font-bold rounded-sm">
                          NEW DROP
                        </span>
                      )}
                      {hasPromo && (
                        <span className="absolute top-4 right-4 z-10 text-[8px] font-mono tracking-widest uppercase bg-amber-500 text-black px-2 py-0.5 font-bold rounded-sm">
                          -{Math.round(((p.price - p.discountPrice!) / p.price) * 100)}%
                        </span>
                      )}
                      
                      {p.stock === 0 && (
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center z-10 select-none">
                          <span className="border border-white/40 text-neutral-200 text-[10px] font-mono tracking-widest uppercase px-3 py-1 bg-black/50">
                            SOLD OUT
                          </span>
                        </div>
                      )}

                      <img
                        src={p.images[0]}
                        alt={p.name}
                        referrerPolicy="no-referrer"
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-750 ease-out opacity-80 group-hover:opacity-100"
                      />
                    </div>

                    {/* Metadata text descriptors */}
                    <div className="p-4 space-y-2 border-t border-neutral-900 bg-[#030303]/40">
                      <div className="flex justify-between items-center text-[9px] font-mono text-neutral-500 tracking-widest uppercase">
                        <span>SKU: {p.sku}</span>
                      </div>

                      <h3 className="text-xs font-medium text-white group-hover:text-neutral-300 transition-colors truncate uppercase font-mono tracking-wider">
                        {p.name}
                      </h3>

                      <div className="flex items-center gap-2.5">
                        {hasPromo ? (
                          <>
                            <span className="text-xs font-mono text-white font-black">
                              Rp {p.discountPrice!.toLocaleString()}
                            </span>
                            <span className="text-[10px] font-mono text-neutral-600 line-through">
                              Rp {p.price.toLocaleString()}
                            </span>
                          </>
                        ) : (
                          <span className="text-xs font-mono text-neutral-300 font-bold">
                            Rp {p.price.toLocaleString()}
                          </span>
                        )}
                      </div>

                      {/* Micro review details and stock indicators */}
                      <div className="flex items-center justify-between text-[10px] text-neutral-500 font-mono pt-1.5 border-t border-neutral-900/50">
                        <div className="flex items-center gap-1 text-[9px]">
                          <Star size={9} className="fill-amber-500 text-amber-500 animate-pulse" />
                          <span className="text-neutral-300 font-bold">{p.rating}</span>
                          <span>•</span>
                          <span>{p.salesCount || 10} sold</span>
                        </div>
                        {p.stock <= 5 && p.stock > 0 ? (
                          <span className="text-amber-500 text-[8px] font-extrabold animate-pulse uppercase tracking-wide">ONLY {p.stock} LEFT</span>
                        ) : p.stock > 5 ? (
                          <span className="text-neutral-600 text-[8px] uppercase tracking-wider">{p.stock} INSTOCK</span>
                        ) : (
                          <span className="text-red-605 text-[8px] uppercase tracking-wider font-bold">SOLD OUT</span>
                        )}
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
}
