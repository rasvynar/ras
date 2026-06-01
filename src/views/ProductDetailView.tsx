import React, { useEffect, useState } from 'react';
import { ShoppingBag, Star, ShieldCheck, HelpCircle, Send, Heart, AlertCircle } from 'lucide-react';
import { Product, Review } from '../types';

interface ProductDetailViewProps {
  slug: string;
  onAddToCart: (product: Product, quantity: number, size: 'S' | 'M' | 'L' | 'XL' | 'XXL', color: string) => void;
  onNavigateToCart: () => void;
  isAuthenticated: boolean;
  onAddToWishlist: (p: Product) => void;
  isWishlisted: boolean;
}

export default function ProductDetailView({
  slug,
  onAddToCart,
  onNavigateToCart,
  isAuthenticated,
  onAddToWishlist,
  isWishlisted
}: ProductDetailViewProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [activeImage, setActiveImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<'S' | 'M' | 'L' | 'XL' | 'XXL'>('M');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [tab, setTab] = useState<'desc' | 'specs' | 'returns'>('desc');
  
  // Custom Reviews Submit Box
  const [userRating, setUserRating] = useState(5);
  const [userComment, setUserComment] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState<string | null>(null);
  const [reviewError, setReviewError] = useState<string | null>(null);

  useEffect(() => {
    // Load Product Data
    fetch(`/api/products/${slug}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setProduct(data.product);
          if (data.product.colors && data.product.colors.length > 0) {
            setSelectedColor(data.product.colors[0]);
          }
          // Fetch associated reviews
          fetchReviews(data.product.id);
        }
      });
  }, [slug]);

  const fetchReviews = (prodId: string) => {
    fetch(`/api/reviews/${prodId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setReviews(data.reviews);
        }
      });
  };

  if (!product) {
    return (
      <div className="min-h-[70vh] flex flex-col justify-center items-center">
        <div className="w-8 h-8 border-2 border-neutral-800 border-t-white rounded-full animate-spin"></div>
        <p className="text-xs font-mono tracking-widest text-neutral-500 mt-4 uppercase">RETRIEVING ATELIER CORE DATA...</p>
      </div>
    );
  }

  const hasDiscount = product.discountPrice && product.discountPrice < product.price;
  const priceToPay = hasDiscount ? product.discountPrice! : product.price;

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewError(null);
    setReviewSuccess(null);

    const token = localStorage.getItem('rasvynar_token');
    if (!token) {
      setReviewError('You must be registered or authenticated to post reviews.');
      return;
    }

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          productId: product.id,
          rating: userRating,
          comment: userComment
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Review failed to log.');

      setReviewSuccess('Couture feedback linked to item.');
      setUserComment('');
      fetchReviews(product.id); // Reload
    } catch (err: any) {
      setReviewError(err.message || 'Error occurred.');
    }
  };

  const executeAddToCart = () => {
    onAddToCart(product, quantity, selectedSize, selectedColor);
    onNavigateToCart();
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-16">
      
      {/* 1. PRODUCT TWO-COLUMN HERO GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        
        {/* LEFT COLUMN: HIGH-RES PHOTO CAROUSEL */}
        <div className="space-y-4">
          <div className="relative aspect-[3/4] bg-neutral-950 border border-neutral-900 rounded overflow-hidden">
            <img
              src={product.images[activeImage] || 'placeholder.jpg'}
              alt={product.name}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            {product.isNew && (
              <span className="absolute top-4 left-4 z-10 text-[9px] font-mono tracking-widest uppercase bg-white text-black px-2 py-1 font-semibold">
                NEW STABLE DROP
              </span>
            )}
          </div>

          {/* Sub Gallery Row list */}
          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`aspect-[3/4] bg-neutral-900 overflow-hidden border rounded transition-all ${
                    idx === activeImage ? 'border-white bg-neutral-950' : 'border-neutral-900 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="sub gallery" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: ACTION BLOCK AND COUTURE CONFIGURES */}
        <div className="space-y-8 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="space-y-1.5">
              <span className="text-xs font-mono tracking-widest uppercase text-neutral-500">
                CORE SERIES / SKU: {product.sku}
              </span>
              <h1 className="text-3xl font-display font-medium uppercase tracking-wide text-white leading-tight">
                {product.name}
              </h1>
            </div>

            {/* Price Tags */}
            <div className="flex items-baseline gap-4 py-2 border-y border-neutral-900">
              {hasDiscount ? (
                <>
                  <span className="text-2xl font-mono text-white font-bold">
                    Rp {product.discountPrice!.toLocaleString()}
                  </span>
                  <span className="text-sm font-mono text-neutral-600 line-through">
                    Rp {product.price.toLocaleString()}
                  </span>
                  <span className="text-xs font-mono font-semibold tracking-wider text-amber-500 bg-amber-500/10 px-2 py-0.5 border border-amber-500/20 uppercase rounded">
                    PROMO VALUE
                  </span>
                </>
              ) : (
                <span className="text-2xl font-mono text-neutral-300 font-bold">
                  Rp {product.price.toLocaleString()}
                </span>
              )}
            </div>

            {/* Sizing grid selection */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="font-mono text-neutral-400">SELECT ATELIER SIZE</span>
                <span className="text-[11px] text-neutral-500 font-mono italic">Relaxed Oversized Fit</span>
              </div>
              <div className="flex gap-2">
                {['S', 'M', 'L', 'XL', 'XXL'].map((sz) => {
                  const isAvailable = product.sizes.includes(sz as any);
                  return (
                    <button
                      key={sz}
                      onClick={() => isAvailable && setSelectedSize(sz as any)}
                      className={`h-11 w-12 text-xs font-mono border rounded transition ${
                        !isAvailable 
                          ? 'border-neutral-900 text-neutral-800 cursor-not-allowed line-through' 
                          : selectedSize === sz 
                            ? 'border-white bg-white text-black font-semibold' 
                            : 'border-neutral-800 hover:border-neutral-400 text-neutral-300'
                      }`}
                      disabled={!isAvailable}
                    >
                      {sz}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Colors Select lists */}
            <div className="space-y-3">
              <span className="text-xs font-mono text-neutral-400 block">SELECT TEXTURE COLOR</span>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-3.5 py-1.5 text-xs font-mono border rounded transition ${
                      selectedColor === color 
                        ? 'border-white bg-neutral-900 text-white font-semibold' 
                        : 'border-neutral-800 text-neutral-400 hover:border-neutral-500'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>

            {/* Sizing quantity slider */}
            <div className="flex items-center gap-6">
              <div className="space-y-2">
                <span className="text-xs font-mono text-neutral-400 block">QUANTITY</span>
                <div className="flex items-center border border-neutral-800 rounded h-11 bg-black overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="h-full px-3 hover:bg-neutral-900 text-neutral-400 text-lg transition-all"
                  >
                    -
                  </button>
                  <span className="px-4 font-mono text-sm font-bold text-white tracking-widest">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="h-full px-3 hover:bg-neutral-900 text-neutral-400 text-lg transition-all"
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="text-xs font-mono pt-6 text-neutral-500">
                Weight: {(product.weight * quantity).toLocaleString()}g | Available: {product.stock}
              </div>
            </div>
          </div>

          {/* Checkout Bag and Wishlist action triggers */}
          <div className="flex gap-4 pt-4 border-t border-neutral-900">
            <button
              onClick={executeAddToCart}
              disabled={product.stock === 0}
              className="flex-1 bg-white text-black font-display font-semibold uppercase text-xs tracking-widest py-4 rounded hover:bg-neutral-200 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <ShoppingBag size={14} />
              {product.stock === 0 ? 'SOLD OUT' : 'INITIATE PURCHASE'}
            </button>
            <button
              onClick={() => onAddToWishlist(product)}
              className={`px-4 bg-black border rounded hover:border-white transition-all flex items-center justify-center ${
                isWishlisted ? 'border-red-500 text-red-500' : 'border-neutral-800 text-neutral-500 hover:text-white'
              }`}
            >
              <Heart size={18} className={isWishlisted ? 'fill-red-500' : ''} />
            </button>
          </div>
        </div>

      </div>

      {/* 2. DESCRIPTION & TECHNICAL SPECIFICATIONS TAB */}
      <div className="border-t border-neutral-900 pt-10">
        <div className="flex border-b border-neutral-900 mb-6 gap-6 overflow-x-auto text-xs font-mono tracking-widest uppercase">
          <button
            onClick={() => setTab('desc')}
            className={`pb-3 font-semibold transition ${tab === 'desc' ? 'border-b-2 border-white text-white' : 'text-neutral-500'}`}
          >
            DESIGN WRITEUP
          </button>
          <button
            onClick={() => setTab('specs')}
            className={`pb-3 font-semibold transition ${tab === 'specs' ? 'border-b-2 border-white text-white' : 'text-neutral-500'}`}
          >
            SPECIFICATIONS
          </button>
          <button
            onClick={() => setTab('returns')}
            className={`pb-3 font-semibold transition ${tab === 'returns' ? 'border-b-2 border-white text-white' : 'text-neutral-500'}`}
          >
            RETURNS & SHIPPINGS
          </button>
        </div>

        <div className="min-h-24 max-w-3xl leading-relaxed text-sm text-neutral-400 space-y-4 font-mono">
          {tab === 'desc' && (
            <p className="text-neutral-300 font-sans">{product.description}</p>
          )}

          {tab === 'specs' && (
            <div className="space-y-4 whitespace-pre-line text-neutral-300 text-xs">
              {product.details || '• Organic luxury weight standard-ply loopback fibers.\n• High density screen printed brand monograms\n• Sturdy double edge stitched accents.'}
            </div>
          )}

          {tab === 'returns' && (
            <div className="text-xs space-y-2 text-neutral-400 leading-relaxed font-sans">
              <p>✓ All shipments boxed down in magnetic brand boxes and dispatched within 24 hours.</p>
              <p>✓ Automated distances are configured through ourSCBD SCBD central Google Maps router.</p>
              <p>✓ Returns are verified within 7 calendar days on pristine condition.</p>
            </div>
          )}
        </div>
      </div>

      {/* 3. EXPERIMENTAL REVIEW & RATING HISTOGRAM */}
      <div className="border-t border-neutral-900 pt-10 space-y-10">
        <div className="space-y-1">
          <span className="text-[10px] font-mono tracking-[0.4em] text-neutral-500 uppercase block">PATRON RATINGS EXCLUSIVITY</span>
          <h2 className="text-xl font-display font-semibold tracking-wider uppercase text-white">THE CUSTOMER LOGS ({reviews.length})</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          
          {/* List Review Feeds */}
          <div className="md:col-span-2 space-y-6">
            {reviews.length === 0 ? (
              <p className="text-xs text-neutral-500 italic font-mono">No review logs currently mounted for this couture design matrix.</p>
            ) : (
              <div className="space-y-6">
                {reviews.map((rev) => (
                  <div key={rev.id} className="bg-[#070707] border border-neutral-900 p-5 rounded space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {rev.userAvatar ? (
                          <img src={rev.userAvatar} alt="avatar" className="w-8 h-8 rounded-full object-cover" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-neutral-900 border border-neutral-800 text-[10px] font-mono flex items-center justify-center text-neutral-400 font-bold uppercase">
                            {rev.userName.slice(0, 2)}
                          </div>
                        )}
                        <div>
                          <p className="text-xs font-semibold text-white tracking-wide">{rev.userName}</p>
                          <p className="text-[10px] font-mono text-neutral-600">{new Date(rev.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            size={10}
                            className={i < rev.rating ? 'fill-amber-500 text-amber-500' : 'text-neutral-800'}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-neutral-400 leading-relaxed font-sans">{rev.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Form input to create feedback if logged-in */}
          <div className="bg-[#050505] p-6 border border-neutral-900 rounded space-y-5">
            <span className="text-[10px] font-mono tracking-widest text-white uppercase block">LOG YOUR DESIGN FEEDBACK</span>
            
            {reviewSuccess && (
              <p className="text-xs font-mono text-emerald-400 bg-emerald-400/5 p-3 rounded border border-emerald-400/10">
                ✓ {reviewSuccess}
              </p>
            )}
            
            {reviewError && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded text-xs flex items-start gap-2.5">
                <AlertCircle size={14} className="shrink-0 mt-0.5 text-red-500" />
                <p>{reviewError}</p>
              </div>
            )}

            {!isAuthenticated ? (
              <p className="text-xs text-neutral-500 leading-relaxed font-sans">
                Please register or verify your credentials profile to submit rating scores to this brand.
              </p>
            ) : (
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-mono uppercase text-neutral-400">RATING SCORE (1-5)</label>
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setUserRating(num)}
                        className={`p-1 hover:scale-110 transition ${num <= userRating ? 'text-amber-500' : 'text-neutral-700'}`}
                      >
                        <Star size={18} className={num <= userRating ? 'fill-amber-500' : ''} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-mono uppercase text-neutral-400">YOUR OBSERVATIONS</label>
                  <textarea
                    rows={3}
                    value={userComment}
                    onChange={(e) => setUserComment(e.target.value)}
                    placeholder="Meticulously write down your observations of fits and materials..."
                    className="w-full bg-black border border-neutral-800 focus:border-white focus:outline-none p-3 rounded text-xs text-white resize-none"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full h-10 bg-white hover:bg-neutral-200 text-black font-display font-semibold text-xs tracking-widest uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer rounded"
                >
                  <Send size={12} />
                  TRANSMIT COMMENT
                </button>
              </form>
            )}
          </div>

        </div>
      </div>

    </div>
  );
}
