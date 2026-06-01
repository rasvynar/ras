import React, { useEffect, useState } from 'react';
import GoogleMapsVerifier from '../components/GoogleMapsVerifier.tsx';
import { Trash2, ShoppingBag, ShieldCheck, Tag, MapPin, Compass, Percent, QrCode, CreditCard, ChevronRight } from 'lucide-react';
import { Product, CartItem } from '../types';

interface CartAndCheckoutViewProps {
  cart: CartItem[];
  products: Product[];
  onUpdateQty: (productId: string, size: string, color: string, qty: number) => void;
  onRemoveItem: (productId: string, size: string, color: string) => void;
  onCheckoutSuccess: (orderId: string) => void;
  isAuthenticated: boolean;
  currentUser: any;
  onTriggerAuth: () => void;
}

export default function CartAndCheckoutView({
  cart,
  products,
  onUpdateQty,
  onRemoveItem,
  onCheckoutSuccess,
  isAuthenticated,
  currentUser,
  onTriggerAuth
}: CartAndCheckoutViewProps) {
  
  // Checkout Profiles
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [province, setProvince] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [postalCode, setPostalCode] = useState('');
  
  // Maps geolocations
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [placeId, setPlaceId] = useState('');
  const [distanceKm, setDistanceKm] = useState<number | null>(null);

  // Vouchers
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState<string | null>(null);
  const [discountVal, setDiscountVal] = useState(0);
  const [couponError, setCouponError] = useState<string | null>(null);

  // Logistics couriers
  const [courier, setCourier] = useState<'JNE' | 'J&T' | 'SICEPAT' | 'POS' | 'ANTERAJA'>('SICEPAT');
  const [courierPrices, setCourierPrices] = useState<{ [key: string]: number }>({});
  const [logisticsLoading, setLogisticsLoading] = useState(false);

  // Payment gateways choices
  const [paymentMethod, setPaymentMethod] = useState('QRIS Universal');
  
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  // Synch profile details if authenticated
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      setFullName(currentUser.fullName || '');
      setPhone(currentUser.phoneNumber || currentUser.whatsapp || '');
      setEmail(currentUser.email || '');
      setAddress(currentUser.address || '');
      setProvince(currentUser.provinceStr || currentUser.province || '');
      setCity(currentUser.cityStr || currentUser.city || '');
      setDistrict(currentUser.districtStr || currentUser.district || '');
      const pCode = currentUser.postalCode || currentUser.postal || '';
      setPostalCode(pCode);

      const lat = currentUser.latitude;
      const lng = currentUser.longitude;
      if (lat && lng) {
        setLatitude(Number(lat));
        setLongitude(Number(lng));
        if (currentUser.googlePlaceId || currentUser.placeId) {
          setPlaceId(currentUser.googlePlaceId || currentUser.placeId);
        }

        // Trigger automatic shipping calculation for the authenticated user
        setLogisticsLoading(true);
        fetch('/api/shipping/calculate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ latitude: Number(lat), longitude: Number(lng), postalCode: pCode })
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.success) {
              setDistanceKm(data.distanceKm);
              setCourierPrices(data.prices);
            }
          })
          .catch((err) => console.warn('Automatic shipping calc failed', err))
          .finally(() => setLogisticsLoading(false));
      }
    }
  }, [isAuthenticated, currentUser]);

  // Derived calculations
  const cartSubtotal = cart.reduce((sum, item) => {
    const prod = products.find(p => p.id === item.productId);
    const price = prod ? (prod.discountPrice || prod.price) : 0;
    return sum + (price * item.quantity);
  }, 0);

  const totalWeightStrText = cart.reduce((sum, item) => {
    const prod = products.find(p => p.id === item.productId);
    return sum + ((prod?.weight || 300) * item.quantity);
  }, 0);

  // Trigger Shipping calculate upon map verification
  const handleAddressVerified = async (geo: {
    address: string;
    latitude: number;
    longitude: number;
    placeId: string;
    province: string;
    city: string;
    district: string;
    postalCode: string;
  }) => {
    setAddress(geo.address);
    setLatitude(geo.latitude);
    setLongitude(geo.longitude);
    setPlaceId(geo.placeId);
    setProvince(geo.province);
    setCity(geo.city);
    setDistrict(geo.district);
    setPostalCode(geo.postalCode);

    setLogisticsLoading(true);
    try {
      const res = await fetch('/api/shipping/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ latitude: geo.latitude, longitude: geo.longitude, postalCode: geo.postalCode })
      });
      const data = await res.json();
      if (data.success) {
        setDistanceKm(data.distanceKm);
        setCourierPrices(data.prices);
      }
    } catch {
      console.warn('Geolocation math failure.');
    } finally {
      setLogisticsLoading(false);
    }
  };

  // Voucher Evaluation
  const validateCoupon = async () => {
    setCouponError(null);
    setCouponApplied(null);
    setDiscountVal(0);

    if (!couponCode) return;

    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode, amount: cartSubtotal })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setDiscountVal(data.discount);
      setCouponApplied(data.coupon.code);
    } catch (err: any) {
      setCouponError(err.message || 'Invalid code.');
    }
  };

  // Submit checkout
  const submitCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);

    if (cart.length === 0) {
      setGeneralError('Your shopping bag is empty.');
      return;
    }

    if (!latitude || !longitude) {
      setGeneralError('Satellite Geolocation coordinate coordinates are required. Pick an address on Google Maps verifier.');
      return;
    }

    const token = localStorage.getItem('rasvynar_token');
    if (!token) {
      setGeneralError('Please log in or register before completing transaction.');
      onTriggerAuth();
      return;
    }

    setCheckoutLoading(true);

    try {
      const orderItemsMatched = cart.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        size: item.size,
        color: item.color
      }));

      const payload = {
        items: orderItemsMatched,
        couponCode: couponApplied,
        shippingName: fullName,
        shippingPhone: phone,
        shippingEmail: email,
        shippingAddress: address,
        shippingProvince: province,
        shippingCity: city,
        shippingDistrict: district,
        shippingPostalCode: postalCode,
        shippingCourier: courier,
        shippingFee: courierPrices[courier] || 12000,
        googlePlaceId: placeId,
        latitude,
        longitude,
        paymentMethod
      };

      const res = await fetch('/api/orders/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Server rejected checkout parameters.');

      onCheckoutSuccess(data.orderId);
    } catch (err: any) {
      setGeneralError(err.message || 'Error occurred during transaction compilation.');
    } finally {
      setCheckoutLoading(false);
    }
  };

  const selectedShippingCost = courierPrices[courier] || 0;
  const grandTotal = cartSubtotal + selectedShippingCost - discountVal;

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 min-h-[85vh]">
      
      {cart.length === 0 ? (
        <div className="h-96 border border-neutral-900 bg-[#060606] rounded flex flex-col items-center justify-center text-center p-8 space-y-4 max-w-lg mx-auto">
          <div className="w-12 h-12 bg-neutral-900 border border-neutral-800 flex items-center justify-center rounded-full text-neutral-500">
            <ShoppingBag size={20} />
          </div>
          <p className="text-sm font-semibold text-neutral-200 tracking-wider font-mono uppercase">Your Bag is Empty</p>
          <p className="text-xs text-neutral-650 max-w-xs leading-relaxed">
            There are no couture fashion releases inside your cart currently. Browse our collections page to add releases.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* LEFT: CART PRODUCTS AND DETAILS (COL-SPAN 7) */}
          <div className="lg:col-span-7 space-y-10">
            
            <div className="space-y-4">
              <span className="text-[10px] font-mono tracking-widest text-neutral-500 uppercase block">Atelier Order Terminal</span>
              <h1 className="text-2xl font-display font-semibold tracking-wide uppercase text-white">YOUR SHOPPING BAG</h1>
            </div>

            {/* List products cards */}
            <div className="divide-y divide-neutral-900 border-y border-neutral-900">
              {cart.map((item, index) => {
                const prod = products.find(p => p.id === item.productId);
                if (!prod) return null;
                const price = prod.discountPrice || prod.price;

                return (
                  <div key={index} className="py-6 flex gap-6 items-start">
                    <img
                      src={prod.images[0]}
                      alt={prod.name}
                      referrerPolicy="no-referrer"
                      className="w-20 aspect-[3/4] object-cover bg-neutral-950 border border-neutral-900 rounded"
                    />
                    
                    <div className="flex-1 space-y-2">
                      <div className="flex justify-between items-start">
                        <h3 className="text-sm font-display text-white font-medium">{prod.name}</h3>
                        <span className="text-sm font-mono text-neutral-300 font-semibold">
                          Rp {(price * item.quantity).toLocaleString()}
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 text-[11px] font-mono text-neutral-500">
                        <span>SIZE: {item.size}</span>
                        <span>•</span>
                        <span>COLOR: {item.color}</span>
                        <span>•</span>
                        <span>WEIGHT: {prod.weight}g</span>
                      </div>

                      <div className="flex justify-between items-center pt-2">
                        {/* Qty selectors */}
                        <div className="flex items-center border border-neutral-900 rounded h-8 bg-black overflow-hidden">
                          <button
                            type="button"
                            onClick={() => onUpdateQty(item.productId, item.size, item.color, Math.max(1, item.quantity - 1))}
                            className="h-full px-2.5 hover:bg-neutral-900 text-neutral-500 transition-all"
                          >
                            -
                          </button>
                          <span className="px-3 font-mono text-xs font-semibold text-white">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => onUpdateQty(item.productId, item.size, item.color, item.quantity + 1)}
                            className="h-full px-2.5 hover:bg-neutral-900 text-neutral-500 transition-all"
                          >
                            +
                          </button>
                        </div>

                        {/* Remove item */}
                        <button
                          type="button"
                          onClick={() => onRemoveItem(item.productId, item.size, item.color)}
                          className="text-neutral-600 hover:text-red-400 transition"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Total weights readout */}
            <div className="bg-[#050505] p-4 border border-neutral-900 rounded flex justify-between items-center text-xs font-mono">
              <span className="text-neutral-500">AGGREGATE GROSS WEIGHTS</span>
              <span className="text-white font-semibold tracking-wider">{totalWeightStrText} grams</span>
            </div>

            {/* CHECKOUT DELIVERIES FORM */}
            <form onSubmit={submitCheckout} className="space-y-8">
              <div className="space-y-4">
                <span className="text-xs font-mono tracking-widest text-white uppercase block">1. DELIVERIES PORTFOLIO</span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase text-neutral-400">FullName</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-[#050505] border border-neutral-800 focus:border-white focus:outline-none p-3 rounded text-xs text-white"
                      placeholder="Receiver name..."
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase text-neutral-400">WhatsApp Line Phone</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-[#050505] border border-neutral-800 focus:border-white focus:outline-none p-3 rounded text-xs text-white"
                      placeholder="e.g. 081192381200"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase text-neutral-400">Administrative Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#050505] border border-neutral-800 focus:border-white focus:outline-none p-3 rounded text-xs text-white"
                    placeholder="E-invoice recipient..."
                    required
                  />
                </div>
              </div>

              {/* MAP COMPONENT FOR GEO VERIFICATION */}
              <div className="space-y-4">
                <span className="text-xs font-mono tracking-widest text-white uppercase block">2. GEOLOCATION MATCH</span>
                <GoogleMapsVerifier onAddressVerified={handleAddressVerified} initialAddress={address} />
              </div>

              {/* COURIER LOGISTICS & MAP ESTIMATION */}
              {latitude && longitude && (
                <div className="space-y-4 bg-black border border-neutral-900 p-6 rounded space-y-4">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-neutral-500">COMPUTED ATELIER GEODESIC</span>
                    <span className="text-emerald-400 font-semibold tracking-wider flex items-center gap-1">
                      <Compass size={12} className="animate-spin" />
                      {distanceKm ? `${distanceKm} Kilometers` : 'Locating...'}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-mono uppercase text-neutral-400">3. SELECT LOGISTIC COURIER</label>
                    
                    {logisticsLoading ? (
                      <div className="text-center font-mono py-4 text-xs text-neutral-500 animate-pulse">Calculating transit pricing algorithms...</div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {Object.keys(courierPrices).map((curr) => (
                          <button
                            key={curr}
                            type="button"
                            onClick={() => setCourier(curr as any)}
                            className={`p-3 border rounded text-left transition text-xs font-mono flex flex-col justify-between h-20 ${
                              courier === curr 
                                ? 'border-white bg-[#0e0e0e] text-white font-semibold' 
                                : 'border-neutral-900 text-neutral-400 hover:border-neutral-700 bg-neutral-950/25'
                            }`}
                          >
                            <span className="block text-[10px] font-bold uppercase tracking-wider">{curr} Freight</span>
                            <span className="block text-white font-semibold mt-1">Rp {courierPrices[curr]?.toLocaleString()}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* VENDOR PAYMENT CONFIG */}
              <div className="space-y-3 bg-[#0a0a0a] border border-neutral-900 p-6 rounded">
                <span className="text-xs font-mono tracking-widest text-white uppercase block mb-2">4. MERCHANT INTEGRATION ROUTE</span>
                
                <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                  {[
                    { name: 'QRIS Universal', sub: 'Instant QR Code barcode dispatch', icon: <QrCode size={15} /> },
                    { name: 'BCA VA Transfer', sub: 'Virtual Account automated check', icon: <CreditCard size={15} /> },
                    { name: 'Mandiri VA', sub: 'High speed transaction tunnel', icon: <CreditCard size={15} /> },
                    { name: 'BNI/BRI VA', sub: 'Central state banking nodes', icon: <CreditCard size={15} /> },
                    { name: 'DANA / GoPay E-Wallet', sub: 'Mobile platform redirections', icon: <Compass size={15} /> }
                  ].map((pay) => (
                    <button
                      key={pay.name}
                      type="button"
                      onClick={() => setPaymentMethod(pay.name)}
                      className={`p-3 border rounded text-left transition flex gap-3 items-start h-20 ${
                        paymentMethod === pay.name 
                          ? 'border-white bg-[#0f0f0f] text-white font-semibold' 
                          : 'border-neutral-900 text-neutral-500 hover:border-neutral-850'
                      }`}
                    >
                      <div className="shrink-0 mt-0.5">{pay.icon}</div>
                      <div>
                        <span className="block font-bold text-[10px] tracking-wider uppercase text-neutral-200">{pay.name}</span>
                        <span className="block text-[9px] text-neutral-500 mt-1 leading-snug">{pay.sub}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {!isAuthenticated && (
                <div className="bg-amber-500/10 border border-amber-500/20 text-xs text-amber-500 p-4 rounded flex items-center justify-between gap-4">
                  <p className="font-sans leading-relaxed">
                    You are checking out under guest mode. Establish a secure verified account to record loyalty points and referral bonus earnings.
                  </p>
                  <button
                    type="button"
                    onClick={onTriggerAuth}
                    className="shrink-0 px-4 py-2 bg-amber-500 text-black font-semibold tracking-wider rounded font-mono text-[10px] uppercase cursor-pointer"
                  >
                    AUTHENTICATE
                  </button>
                </div>
              )}

              {generalError && (
                <p className="text-xs font-mono text-red-400 bg-red-400/5 p-4 rounded border border-red-500/10 leading-relaxed font-semibold">
                  ⚠ Checkout Error: {generalError}
                </p>
              )}

              {/* ACTION BTN */}
              <button
                type="submit"
                disabled={checkoutLoading || logisticsLoading || !latitude}
                className={`w-full py-4 rounded font-display font-bold text-xs tracking-widest uppercase transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  !latitude 
                    ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed border border-neutral-900' 
                    : 'bg-white hover:bg-neutral-200 text-black'
                }`}
              >
                {checkoutLoading ? (
                  <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <>
                    <ShieldCheck size={14} />
                    {latitude ? 'TRANSMIT & SETTLE ORDER' : 'AWAITING CODES MAP VERIFICATION'}
                  </>
                )}
              </button>
            </form>

          </div>

          {/* RIGHT: BILLING BREAKDOWNS (COL-SPAN 5) */}
          <div className="lg:col-span-5 bg-[#0a0a0a] border border-neutral-900 p-6 sm:p-8 rounded-lg space-y-8 sticky top-24">
            
            <div className="border-b border-neutral-900 pb-4">
              <span className="text-[10px] font-mono tracking-widest text-neutral-500 uppercase block mb-1">Couture Vault</span>
              <h2 className="text-base font-display font-semibold uppercase tracking-wider text-white">BILLING LEDGER</h2>
            </div>

            {/* Voucher inputs */}
            <div className="space-y-2.5">
              <span className="text-[9px] font-mono tracking-widest uppercase text-neutral-400 block">DEDUCTIONS PROMOTIONS CODE</span>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Enter Coupon e.g. CHROME30"
                    className="w-full bg-black border border-neutral-800 focus:border-white focus:outline-none px-4 py-2.5 pl-9 text-xs tracking-wider text-white uppercase rounded"
                  />
                  <Tag className="absolute left-3 top-3 text-neutral-600" size={13} />
                </div>
                <button
                  type="button"
                  onClick={validateCoupon}
                  className="px-4 py-2.5 bg-neutral-900 border border-neutral-800 hover:border-white text-xs font-mono text-white tracking-widest uppercase transition-all rounded cursor-pointer"
                >
                  APPLY
                </button>
              </div>
              {couponApplied && (
                <p className="text-[10px] font-mono text-emerald-400 mt-1 flex items-center gap-1 bg-emerald-500/5 px-2 py-1 inline-block rounded">
                  <Percent size={10} /> CODE APPROVED: {couponApplied} (-Rp {discountVal.toLocaleString()})
                </p>
              )}
              {couponError && (
                <p className="text-[10px] font-mono text-red-400 mt-1">⚠ {couponError}</p>
              )}
            </div>

            {/* Financial columns */}
            <div className="space-y-3.5 text-xs font-mono border-t border-neutral-900 pt-6">
              <div className="flex justify-between items-center text-neutral-400">
                <span>BAG COMBINED VALUE</span>
                <span className="text-white">Rp {cartSubtotal.toLocaleString()}</span>
              </div>
              
              <div className="flex justify-between items-center text-neutral-400">
                <span>COURIER CARRIER FEES</span>
                <span className="text-white">
                  {latitude ? `Rp ${selectedShippingCost.toLocaleString()}` : 'Awaiting Map PIN'}
                </span>
              </div>

              {discountVal > 0 && (
                <div className="flex justify-between items-center text-amber-500">
                  <span>PROMOTION REBATE DEDUCTIONS</span>
                  <span>-Rp {discountVal.toLocaleString()}</span>
                </div>
              )}

              <div className="flex justify-between items-center text-xs font-mono text-emerald-400 bg-emerald-500/5 p-3 border border-emerald-500/10 rounded">
                <span className="font-sans font-semibold tracking-wider">LOYALTY REWARDS REBATE</span>
                <span className="font-bold">+{Math.round(cartSubtotal / 10000)} POINTS</span>
              </div>

              <div className="flex justify-between items-center text-sm border-t border-neutral-900 pt-5 text-white font-bold">
                <span className="font-display uppercase tracking-wider text-neutral-300">LEDGER TOTAL</span>
                <span className="text-white text-lg font-mono">Rp {grandTotal.toLocaleString()}</span>
              </div>
            </div>

            <div className="bg-black/50 border border-neutral-900 p-4 rounded text-[10px] text-neutral-500 leading-relaxed font-mono">
              <p className="flex items-center gap-1.5 uppercase font-bold text-neutral-400 mb-1">
                <ShieldCheck size={12} className="text-emerald-500" /> Secure Atelier Clearing Gateways
              </p>
              Transactions processed using Enterprise-grade TLS encryption models. Direct auto-webhook triggers active on clearance.
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
