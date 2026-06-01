import React, { useState } from 'react';
import { useApp, Product } from '../context/AppContext';
import { SizeGuideModal } from './SizeGuideModal';
import { Heart, ShoppingBag, Award, ArrowLeft, Star, Camera, Check, HelpingHand, Trash } from 'lucide-react';

interface DetailProps {
  product: Product;
  onBack: () => void;
  onNavigateCart: () => void;
}

export const ProductDetail: React.FC<DetailProps> = ({ product, onBack, onNavigateCart }) => {
  const { addToCart, reviews, addProductReview, currentUser } = useApp();

  const [selectedImgIdx, setSelectedImgIdx] = useState(0);
  const [selectedSize, setSelectedSize] = useState(product.sizes[0] || 'L');
  const [selectedColor, setSelectedColor] = useState(product.colors[0] || { name: 'Muted', hex: '#666' });
  const [quantity, setQuantity] = useState(1);
  const [isWishlist, setIsWishlist] = useState(false);

  // Size helper overlay visual trigger
  const [showSizeGuide, setShowSizeGuide] = useState(false);

  // New review form states
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [newReviewPhoto, setNewReviewPhoto] = useState('');
  const [reviewSuccessMsg, setReviewSuccessMsg] = useState('');

  // Cart submission
  const handleAddToCart = () => {
    const skuCombo = `${product.sku}-${selectedSize}-${selectedColor.name.toUpperCase().substring(0,3)}`;
    addToCart({
      id: skuCombo,
      product,
      quantity,
      selectedSize,
      selectedColor
    });
    // Shake button effect or navigate instantly to checkout
    onNavigateCart();
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    addProductReview({
      productId: product.id,
      userName: currentUser ? currentUser.name : 'Tamu Premium',
      userAvatar: currentUser ? currentUser.avatar : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150',
      rating: newRating,
      comment: newComment,
      photoUrl: newReviewPhoto || 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=200' // default simulated picture review
    });

    setNewComment('');
    setNewReviewPhoto('');
    setReviewSuccessMsg('ulasan premium Anda berhasil diverifikasi oleh moderator sistem!');
    setTimeout(() => setReviewSuccessMsg(''), 5000);
  };

  const relevantReviews = reviews.filter((r) => r.productId === product.id);
  const hasDiscount = product.discountPrice > 0;
  const activePrice = hasDiscount ? product.discountPrice : product.price;

  return (
    <div id="product-detail-sheet" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16 font-sans">
      
      {/* Visual back navigator */}
      <button
        onClick={onBack}
        className="mb-8 flex items-center gap-1 text-xs font-mono uppercase tracking-widest text-zinc-400 hover:text-white transition-colors bg-transparent border-0 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" /> Kembali Ke Katalog
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16">
        
        {/* PANEL 1: PHOTO COMPILATIONS */}
        <div className="space-y-4">
          <div className="h-96 md:h-[550px] bg-neutral-950 rounded-lg overflow-hidden border border-neutral-900 relative">
            <img
              src={product.images[selectedImgIdx] || product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity"
            />
          </div>

          {/* Thumbnails array list */}
          {product.images.length > 1 && (
            <div className="flex gap-3">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSelectedImgIdx(i)}
                  className={`w-20 h-20 bg-neutral-950 border rounded overflow-hidden transition-all ${
                    selectedImgIdx === i ? 'border-white scale-102 shadow-lg' : 'border-neutral-850 opacity-60'
                  }`}
                >
                  <img src={img} alt="Thumbnail view" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* PANEL 2: SPECS SELECTIONS & ORDER TRIGGER */}
        <div className="space-y-6">
          <div>
            <span className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">{product.category}</span>
            <h1 className="text-xl sm:text-3xl font-sans font-black tracking-wider text-white mt-1.5 uppercase leading-snug">
              {product.name}
            </h1>
            <p className="text-[10px] font-mono text-zinc-650 mt-1 uppercase">SKU COORD: {product.sku}</p>
          </div>

          {/* Pricing section layout */}
          <div className="border-y border-neutral-900 py-4 flex items-center justify-between font-mono">
            <div>
              {hasDiscount ? (
                <div className="space-y-0.5">
                  <span className="text-xs line-through text-zinc-600 tracking-wider">
                    Rp {product.price.toLocaleString('id-ID')}
                  </span>
                  <p className="text-white text-xl font-black">
                    Rp {product.discountPrice.toLocaleString('id-ID')}
                  </p>
                </div>
              ) : (
                <p className="text-white text-xl font-black">Rp {product.price.toLocaleString('id-ID')}</p>
              )}
            </div>

            <div className="text-right">
              <span className="text-[10px] text-zinc-500 uppercase block tracking-wider">Status Stok Kargo</span>
              <p className={`text-xs font-bold ${product.stock > 0 ? 'text-emerald-400' : 'text-red-500'}`}>
                {product.stock > 0 ? `Tersedia: ${product.stock} pcs` : 'Telah Habis Dipesan'}
              </p>
            </div>
          </div>

          <p className="text-xs text-zinc-350 leading-relaxed text-justify font-sans">{product.description}</p>

          {/* Sizes Selection widget with SizeGuide link triggers */}
          <div className="space-y-2.5">
            <div className="flex justify-between items-center text-[10px] font-mono text-zinc-400 uppercase tracking-widest">
              <span className="font-bold">1. Pilih Ukuran (Size)</span>
              <button
                type="button"
                onClick={() => setShowSizeGuide(true)}
                className="text-white hover:underline focus:outline-none cursor-pointer"
              >
                Atelier Size Guide (?)
              </button>
            </div>
            <div className="flex gap-2">
              {product.sizes.map((sz) => (
                <button
                  key={sz}
                  type="button"
                  onClick={() => setSelectedSize(sz)}
                  className={`w-12 h-10 border rounded text-xs font-mono uppercase tracking-wider transition-all flex items-center justify-center ${
                    selectedSize === sz
                      ? 'bg-white text-black border-white font-bold'
                      : 'bg-neutral-950 text-zinc-400 border-neutral-850 hover:bg-neutral-900'
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>

          {/* Colors selection visual beads */}
          <div className="space-y-2.5">
            <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest font-bold">
              2. Pilih Detail Warna ({selectedColor.name})
            </div>
            <div className="flex gap-3">
              {product.colors.map((col, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedColor(col)}
                  className={`w-7 h-7 rounded-full border flex items-center justify-center transition-all ${
                    selectedColor.hex === col.hex ? 'border-white scale-110 shadow-lg' : 'border-neutral-800'
                  }`}
                  style={{ backgroundColor: col.hex }}
                  title={col.name}
                >
                  {selectedColor.hex === col.hex && (
                    <Check className={`w-3.5 h-3.5 ${col.hex === '#FFFFFF' ? 'text-black' : 'text-white'}`} />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity modifiers and addToCart submit triggers */}
          <div className="flex gap-4 pt-4 border-t border-neutral-900 mt-4">
            
            <div className="flex items-center bg-neutral-950 border border-neutral-850 rounded overflow-hidden">
              <button
                type="button"
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                className="px-3.5 py-2 hover:bg-neutral-900 border-r border-neutral-850 text-xs font-mono font-bold text-zinc-400 hover:text-white"
              >
                -
              </button>
              <span className="px-4 py-2 text-xs font-mono text-white font-bold">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity(q => q + 1)}
                className="px-3.5 py-2 hover:bg-neutral-900 border-l border-neutral-850 text-xs font-mono font-bold text-zinc-400 hover:text-white"
              >
                +
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="flex-1 bg-white text-black font-extrabold text-xs uppercase tracking-widest py-3 px-6 rounded hover:bg-[#C0C0C0] transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed border border-white"
            >
              <ShoppingBag className="w-4 h-4" /> {product.stock > 0 ? 'Tambahkan Ke Keranjang' : 'Kehabisan Stok'}
            </button>

            <button
              onClick={() => setIsWishlist(!isWishlist)}
              className={`p-3 rounded border transition-colors ${
                isWishlist ? 'border-red-900 bg-red-950/20 text-red-500' : 'border-neutral-850 text-zinc-550 hover:text-white hover:bg-zinc-950'
              }`}
              title="Add Favorit"
            >
              <Heart className={`w-4 h-4 ${isWishlist ? 'fill-current' : ''}`} />
            </button>

          </div>

        </div>

      </div>

      {/* SECTION 3: RECTANGLE REVIEWS & SUBMISSION CORNER */}
      <div className="mt-16 border-t border-neutral-900 pt-12 md:pt-16 max-w-4xl">
        <h3 className="text-lg font-bold tracking-wider text-white uppercase mb-8">Testimoni Pelanggan ({relevantReviews.length})</h3>

        {/* Existing ulasans list in vertical timelines */}
        <div className="space-y-6 mb-12">
          {relevantReviews.length === 0 ? (
            <p className="text-xs text-zinc-550 font-mono uppercase tracking-wide">garmen ini belum memiliki ulasan pembeli terdaftar.</p>
          ) : (
            relevantReviews.map((rev) => (
              <div key={rev.id} className="bg-neutral-900/30 border border-neutral-850/60 rounded p-5 space-y-3.5 font-sans">
                <div className="flex justify-between items-start">
                  
                  <div className="flex items-center gap-2.5">
                    <img src={rev.userAvatar} alt="user avatar" className="w-8 h-8 rounded-full border border-neutral-800 object-cover" />
                    <div>
                      <span className="font-bold text-xs text-white uppercase block">{rev.userName}</span>
                      <span className="text-[9px] text-[#A0A0A0] block mt-0.5 font-mono">{new Date(rev.createdAt).toLocaleDateString('id-ID')}</span>
                    </div>
                  </div>

                  <div className="flex gap-0.5 text-amber-450">
                    {[1, 2, 3, 4, 5].map((st) => (
                      <Star key={st} className={`w-3.5 h-3.5 ${st <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-neutral-800'}`} />
                    ))}
                  </div>

                </div>

                <p className="text-xs text-zinc-300 leading-relaxed text-justify">{rev.comment}</p>

                {/* Optional attached review photo */}
                {rev.photoUrl && (
                  <div className="w-24 h-24 rounded border border-neutral-800 overflow-hidden bg-neutral-950">
                    <img src={rev.photoUrl} alt="Review attachment" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Write new review form */}
        <div className="bg-neutral-950 border border-neutral-850 p-6 rounded-lg space-y-4">
          <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-zinc-300 border-b border-neutral-900 pb-3">
            Tulis Ulasan Autentik Pelanggan
          </h4>

          {reviewSuccessMsg && (
            <div className="bg-emerald-950/40 border border-emerald-900 text-emerald-300 p-3.5 rounded text-xs">
              🔒 SELAMAT: {reviewSuccessMsg}
            </div>
          )}

          <form onSubmit={handleReviewSubmit} className="space-y-4 font-mono text-zinc-400 text-xs">
            
            <div className="flex items-center gap-4">
              <span className="uppercase text-[10px] tracking-wider font-bold">Beri Rating:</span>
              <div className="flex gap-1.5 cursor-pointer">
                {[1, 2, 3, 4, 5].map((rt) => (
                  <button
                    key={rt}
                    type="button"
                    onClick={() => setNewRating(rt)}
                    className="p-1 text-amber-400 hover:scale-115 transition-transform bg-transparent border-0 outline-none"
                  >
                    <Star className={`w-5 h-5 ${rt <= newRating ? 'fill-current' : 'text-neutral-800'}`} />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] uppercase tracking-wider font-bold">Simulasi Link Foto Review</label>
              <div className="relative">
                <input
                  type="text"
                  value={newReviewPhoto}
                  onChange={(e) => setNewReviewPhoto(e.target.value)}
                  placeholder="https://images.unsplash.com/your-review-photo.jpg"
                  className="w-full bg-[#111] border border-neutral-850 rounded px-3.5 py-2 text-xs text-white outline-none font-mono placeholder:text-zinc-700"
                />
                <Camera className="absolute right-3 top-2 w-4 h-4 text-zinc-550" />
              </div>
              <p className="text-[9px] text-zinc-500 uppercase tracking-wide">Anda dapat memasukkan link foto atau biarkan kosong untuk simulasi default</p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] uppercase tracking-wider font-bold">Isi Komentar Ulasan</label>
              <textarea
                required
                rows={3}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Bagikan pengalaman mengesankan Anda mengenai ukuran, kenyamanan, atau keunikan pakaian ini..."
                className="w-full bg-[#111] border border-neutral-850 rounded px-3.5 py-3 text-xs text-white outline-none font-sans"
              />
            </div>

            <button
              type="submit"
              className="bg-white text-black font-semibold uppercase tracking-widest text-[10px] py-2.5 px-6 rounded hover:bg-neutral-200 transition-colors cursor-pointer"
            >
              Kirim Testimoni
            </button>

          </form>
        </div>

      </div>

      {/* Embedded Size Guide Overlay visual */}
      {showSizeGuide && <SizeGuideModal onClose={() => setShowSizeGuide(false)} />}

    </div>
  );
};

export default ProductDetail;
