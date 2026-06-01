import React, { useEffect, useState } from 'react';
import Logo from '../components/Logo.tsx';
import GoogleMapsVerifier from '../components/GoogleMapsVerifier.tsx';
import { User, Order } from '../types';
import { Award, Compass, CreditCard, Shield, Download, FileText, Send, CheckCircle, Gift, AlertCircle, Share2 } from 'lucide-react';

interface ProfileViewProps {
  onNavigate: (view: string) => void;
}

export default function ProfileAndHistoryView({ onNavigate }: ProfileViewProps) {
  const [profile, setProfile] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [referrals, setReferrals] = useState<any>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [trackingTimeline, setTrackingTimeline] = useState<any[]>([]);
  const [selectedOrderPayment, setSelectedOrderPayment] = useState<any>(null);

  // Edit fields
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [province, setProvince] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [placeId, setPlaceId] = useState('');

  const [message, setMessage] = useState<string | null>(null);
  const [errorProfile, setErrorProfile] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = () => {
    const token = localStorage.getItem('rasvynar_token');
    if (!token) return;

    // Load active customer profile
    fetch('/api/auth/me', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.user) {
          setProfile(data.user);
          setFullName(data.user.fullName || '');
          setPhone(data.user.phoneNumber || '');
          setAddress(data.user.address || '');
          setProvince(data.user.provinceStr || '');
          setCity(data.user.cityStr || '');
          setPostalCode(data.user.postalCode || '');
        }
      });

    // Load history orders
    fetch('/api/orders/my-history', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setOrders(data.orders);
        }
      });

    // Load referral structures
    fetch('/api/referrals/stats', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setReferrals(data);
        }
      });
  };

  const updateProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setErrorProfile(null);
    setLoading(true);

    const token = localStorage.getItem('rasvynar_token');
    try {
      const res = await fetch('/api/auth/profile/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          fullName,
          phoneNumber: phone,
          address,
          provinceStr: province,
          cityStr: city,
          postalCode,
          googlePlaceId: placeId,
          latitude,
          longitude
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setMessage('Portfolio credentials updated.');
      fetchProfileData();
    } catch (err: any) {
      setErrorProfile(err.message || 'Connection failure.');
    } finally {
      setLoading(false);
    }
  };

  // Track shipment progression
  const fetchOrderTracking = async (order: Order) => {
    setSelectedOrder(order);
    setTrackingTimeline([]);
    
    // Fetch associated payment details
    const token = localStorage.getItem('rasvynar_token');
    fetch(`/api/orders/${order.id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setSelectedOrderPayment(data.payment);
        }
      });

    try {
      const res = await fetch(`/api/shipping/track/${order.id}`);
      const data = await res.json();
      if (data.success) {
        setTrackingTimeline(data.timeline);
      }
    } catch {
      console.warn('Could not track order');
    }
  };

  const triggerPrintInvoice = () => {
    window.print();
  };

  if (!profile) {
    return (
      <div className="min-h-[70vh] flex flex-col justify-center items-center font-mono">
        <p className="text-xs text-neutral-500 animate-pulse uppercase tracking-widest">AUTHENTICATING CUSTOMER CLUSTER KEYS...</p>
      </div>
    );
  }

  // Determine membership graphics and colors
  const levelColors = {
    BRONZE: 'from-amber-700 to-amber-900 border-amber-800 text-amber-200',
    SILVER: 'from-neutral-400 to-neutral-600 border-neutral-500 text-neutral-200',
    GOLD: 'from-yellow-600 to-yellow-800 border-yellow-700 text-yellow-100',
    PLATINUM: 'from-slate-700 via-zinc-800 to-black border-zinc-700 text-zinc-100'
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-16">
      
      {/* 1. MEMBERSHIP & LOYALTY CARD TOP */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
        
        {/* Tier Card */}
        <div className={`p-8 rounded-lg border bg-gradient-to-br ${levelColors[profile.membershipLevel]} flex flex-col justify-between space-y-8 relative overflow-hidden shadow-xl md:col-span-2`}>
          <div className="absolute top-[-30px] right-[-30px] opacity-10 font-display text-[9rem] font-bold select-none pointer-events-none">
            {profile.membershipLevel[0]}
          </div>

          <div className="flex justify-between items-start z-10">
            <div className="space-y-1">
              <span className="text-[9px] font-mono tracking-[0.4em] uppercase opacity-75">Customer Rank Portfolio</span>
              <h2 className="text-3xl font-display font-bold tracking-widest uppercase">{profile.membershipLevel}</h2>
            </div>
            <Award size={36} className="opacity-80" />
          </div>

          <div className="space-y-4 z-10">
            <div className="flex justify-between text-xs font-mono">
              <span className="opacity-80">LOYALTY LOOT CORES</span>
              <span className="font-bold tracking-widest">{profile.loyaltyPoints.toLocaleString()} PTS</span>
            </div>
            
            {/* Progress to next level bar */}
            <div className="space-y-1">
              <div className="h-1 bg-black/40 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-white rounded-full transition-all duration-1000"
                  style={{ width: `${Math.min(100, (profile.loyaltyPoints / 5000) * 100)}%` }}
                ></div>
              </div>
              <p className="text-[9px] font-mono text-right opacity-70">
                {profile.loyaltyPoints < 5000 
                  ? `${(5000 - profile.loyaltyPoints).toLocaleString()} points remaining to secure Platinum clearance.`
                  : '✓ Absolute peak clearance secured.'}
              </p>
            </div>
          </div>
        </div>

        {/* Brand Rewards parameters */}
        <div className="bg-[#080808] border border-neutral-900 p-8 rounded-lg flex flex-col justify-between">
          <div className="space-y-2">
            <span className="text-[9px] font-mono tracking-widest text-neutral-500 uppercase block">My Core Rewards Benefits</span>
            <h3 className="text-sm font-display text-white uppercase font-bold tracking-wider">PLATINUM LEVEL BENCHMARKS</h3>
            <ul className="text-xs text-neutral-500 space-y-2 pt-2.5 leading-relaxed">
              <li className="flex items-center gap-2">✓ <span className="text-white">10% Off</span> all premium limited collections</li>
              <li className="flex items-center gap-2">✓ <span className="text-white">2.0X Points Multiplier</span> granted on checkouts</li>
              <li className="flex items-center gap-2">✓ Priority executive SCBD packing priority</li>
              <li className="flex items-center gap-2">✓ Free regional cargo logistics shipping</li>
            </ul>
          </div>
          <p className="text-[10px] text-neutral-600 font-mono pt-4 border-t border-neutral-900 leading-snug">
            Benefits are automatically triggered on the billing ledger during checkout steps.
          </p>
        </div>

      </section>

      {/* 2. REFERRALS & CODES COMMISSION (AFFILIATES) */}
      {referrals && (
        <section className="bg-[#050505] border border-neutral-900 p-8 rounded-lg grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="space-y-4">
            <div className="inline-flex h-9 w-9 bg-neutral-900 border border-neutral-800 rounded items-center justify-center text-white font-bold font-mono">
              <Gift size={16} />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-neutral-500 uppercase block">Affiliate Referral Engine</span>
              <h3 className="text-lg font-display text-white uppercase tracking-wider font-semibold">STYLE RECRUITMENT COMMAND</h3>
            </div>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Disseminate your personalized referral links or codes. When clients register under your nodes, they earn <span className="text-neutral-300 font-semibold font-mono">100 loyalty points</span>, and you earn <span className="text-neutral-300 font-semibold font-mono">5% commission</span> from all their succeeding fashion purchases!
            </p>
          </div>

          <div className="bg-black border border-neutral-900 p-6 rounded flex flex-col justify-between space-y-6">
            <div className="space-y-2">
              <span className="text-[9px] font-mono text-neutral-500 uppercase">My Unique Referral Identifier</span>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={referrals.referralCode || ''}
                  className="bg-[#050505] border border-neutral-800 text-xs font-mono font-bold tracking-widest text-emerald-400 p-2 rounded flex-1 focus:outline-none text-center"
                  readOnly
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(referrals.referralCode || '');
                    alert('Referral Code copied directly to clipboard.');
                  }}
                  className="px-3.5 bg-neutral-900 border border-neutral-800 hover:border-white text-xs font-mono text-white rounded transition"
                >
                  <Share2 size={13} />
                </button>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-neutral-900">
              <span className="text-[9px] font-mono text-neutral-500 uppercase">Interactive Affiliate Link</span>
              <input
                type="text"
                value={`${window.location.origin}/?ref=${referrals.referralCode || ''}`}
                className="bg-[#050505] border border-neutral-800 text-[10px] font-mono text-neutral-400 p-2 rounded w-full focus:outline-none"
                readOnly
              />
            </div>
          </div>

          <div className="bg-neutral-950/25 p-6 border border-neutral-900 rounded flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex justify-between items-baseline">
                <span className="text-[10px] font-mono text-neutral-500 uppercase">Active Balance Balance</span>
                <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded font-bold uppercase border border-emerald-500/20">LIVE COMMISSION</span>
              </div>
              <p className="text-3xl font-mono text-white font-bold">
                Rp {referrals.commissionBalance?.toLocaleString()}
              </p>
              
              <div className="flex justify-between text-xs text-neutral-500 pt-2 border-t border-neutral-900">
                <span>Total recruits:</span>
                <span className="text-white font-mono font-semibold">{referrals.totalReferrals} patrons</span>
              </div>
            </div>

            <button
              onClick={() => alert('Payout of commission balance triggers on SCBD atelier billing window monthly.')}
              className="w-full bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-xs tracking-widest font-mono py-2.5 text-white uppercase rounded transition mt-4 shrink-0"
            >
              WITHDRAW COMMISSIONS
            </button>
          </div>

        </section>
      )}

      {/* 3. INVOICE AND PIPELINE PROGRESS DETAILS (IF ACTIVE ORDER IS POPPED) */}
      {selectedOrder && (
        <div className="bg-[#050505] border-2 border-neutral-900 rounded-lg p-6 sm:p-10 space-y-8 relative" id="printable-invoice-block">
          
          <button
            onClick={() => setSelectedOrder(null)}
            className="absolute top-4 right-4 text-xs font-mono text-neutral-500 hover:text-white uppercase transition-all"
          >
            ✕ ESCAPE DETAIL VIEW
          </button>

          {/* PRINTABLE INVOICE SCHEMA */}
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b border-neutral-900 pb-8">
              <div className="space-y-3">
                <Logo size="sm" />
                <p className="text-[11px] font-mono text-neutral-400 max-w-sm leading-relaxed uppercase">
                  RASVYNAR ATELIER OFFICE / CAPITAL GRID SOHO LEVEL 12, SCBD JAKARTA SELATAN (12190)
                </p>
              </div>
              <div className="text-left sm:text-right space-y-1">
                <span className="text-[10px] font-mono tracking-widest text-emerald-400 bg-emerald-400/5 border border-emerald-400/10 px-2 py-0.5 uppercase rounded">
                  {selectedOrder.status}
                </span>
                <p className="text-base font-mono text-white font-semibold mt-1">INV NO: {selectedOrder.id}</p>
                <p className="text-xs text-neutral-500 font-mono">Date: {new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            {/* Address rows */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 text-xs leading-relaxed border-b border-neutral-900 pb-8">
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-neutral-500 uppercase block">RECEIVER ADDRESS SIGNATURE</span>
                <p className="text-white font-semibold flex items-center gap-1.5">{selectedOrder.shippingName}</p>
                <p className="text-neutral-401 font-mono">{selectedOrder.shippingPhone}</p>
                <p className="text-neutral-400 select-all">{selectedOrder.shippingAddress}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-neutral-500 uppercase block font-bold">TRANSACTION PROTOCOL</span>
                <p className="text-neutral-300">Carrier: <span className="text-white font-bold">{selectedOrder.shippingCourier}</span></p>
                <p className="text-neutral-300">Resi Code: <span className="text-white font-mono">{selectedOrder.shippingTrackingNumber || 'Pending compilation.'}</span></p>
                <p className="text-neutral-300">G-Place Reference: <span className="text-white font-mono truncate block max-w-xs">{selectedOrder.googlePlaceId || 'N/A'}</span></p>
              </div>
            </div>

            {/* List products bought */}
            <div className="space-y-4">
              <span className="text-[10px] font-mono text-neutral-500 uppercase block">PURCHASE RECORDS ITEMS</span>
              <div className="divide-y divide-neutral-900">
                {selectedOrder.items.map((it, idx) => (
                  <div key={idx} className="py-4 flex justify-between text-xs">
                    <div className="space-y-1">
                      <p className="text-white font-medium">{it.name}</p>
                      <p className="text-[10px] font-mono text-neutral-500 uppercase">
                        Size: {it.size} | Color: {it.color} | Qty: {it.quantity}
                      </p>
                    </div>
                    <span className="font-mono text-neutral-300">
                      Rp {(it.price * it.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Subtotals summaries billing ledger */}
            <div className="border-t border-neutral-900 pt-6 flex flex-col items-end text-xs font-mono space-y-2">
              <div className="flex justify-between w-64 text-neutral-400">
                <span>ORDER SUB-VALUES</span>
                <span className="text-white">
                  Rp {(selectedOrder.totalAmount - selectedOrder.shippingFee + selectedOrder.discountAmount).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between w-64 text-neutral-400">
                <span>CARRIER SERVICE FEE</span>
                <span className="text-white">Rp {selectedOrder.shippingFee.toLocaleString()}</span>
              </div>
              {selectedOrder.discountAmount > 0 && (
                <div className="flex justify-between w-64 text-amber-500">
                  <span>PROMOTION VALUE REBATE</span>
                  <span>-Rp {selectedOrder.discountAmount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between w-64 text-[#FFD700] bg-yellow-500/5 border border-yellow-500/10 p-2.5 mt-2 rounded">
                <span className="font-sans font-medium">REWARD POINTS SECURED</span>
                <span className="font-bold">+{selectedOrder.pointsEarned} POINTS</span>
              </div>
              <div className="flex justify-between w-64 text-sm font-bold border-t border-neutral-900 pt-4 text-white">
                <span className="font-display">TOTAL BILLS</span>
                <span>Rp {selectedOrder.totalAmount.toLocaleString()}</span>
              </div>
            </div>

            {/* PRINT BUTTON */}
            <div className="flex flex-wrap gap-4 pt-6 justify-end no-print">
              <button
                onClick={triggerPrintInvoice}
                className="px-5 py-3 border border-neutral-800 hover:border-white text-xs font-mono text-white flex items-center gap-2 transition rounded"
              >
                <Download size={13} />
                DOWNLOAD PDF / INVOICE PRINT
              </button>
            </div>
            
          </div>

          {/* SATELLITE COURIER PROGRESS TIMELINE TRACKS */}
          <div className="bg-neutral-950 p-6 border border-neutral-900 rounded space-y-6 mt-8 no-print">
            <div className="flex justify-between items-center pb-2 border-b border-neutral-900">
              <div className="space-y-0.5">
                <span className="text-[9px] font-mono text-neutral-500 uppercase">Logistics progression tracking</span>
                <h3 className="text-xs font-display text-white uppercase font-bold tracking-wider">
                  {selectedOrder.shippingCourier} TIMELINE PATH
                </h3>
              </div>
              <span className="text-[10px] font-mono text-neutral-400">
                Resi: {selectedOrder.shippingTrackingNumber || 'Processing...'}
              </span>
            </div>

            <div className="space-y-6 relative pl-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[1px] before:bg-neutral-800">
              {trackingTimeline.map((time, idx) => (
                <div key={idx} className="relative space-y-1">
                  <div className={`absolute left-[-21px] top-1.5 h-2 w-2 rounded-full border border-black ${idx === 0 ? 'bg-emerald-400 scale-125' : 'bg-neutral-600'}`}></div>
                  <div className="flex items-baseline justify-between gap-4">
                    <p className={`text-xs font-bold ${idx === 0 ? 'text-white' : 'text-neutral-400'}`}>{time.title}</p>
                    <span className="text-[9px] font-mono text-neutral-600">
                      {new Date(time.date).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 leading-relaxed font-sans">{time.desc}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* 4. ORDERS HISTORY TABLE LISTS */}
      <section className="bg-[#050505] p-8 border border-neutral-900 rounded-lg space-y-6">
        <div className="space-y-1">
          <span className="text-[10px] font-mono text-neutral-500 uppercase block">Atelier orders archives</span>
          <h2 className="text-xl font-display font-semibold tracking-wider text-white">MY COUTURE COMMANDS</h2>
        </div>

        {orders.length === 0 ? (
          <p className="text-xs text-neutral-500 italic font-mono py-4">You have not committed any checkout orders so far. Access collections page to make a purchase.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs divide-y divide-neutral-900">
              <thead>
                <tr className="text-neutral-500 font-mono tracking-wider text-[10px] uppercase">
                  <th className="pb-3.5">COMMAND CODE ID</th>
                  <th className="pb-3.5">TRANSIT COURIER</th>
                  <th className="pb-3.5">LEDGER AMT</th>
                  <th className="pb-3.5">DATE SIGNATURE</th>
                  <th className="pb-3.5">TRANSACTION STATUS</th>
                  <th className="pb-3.5 text-right font-mono">TRACE ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-900 text-neutral-300">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-neutral-900/10 transition">
                    <td className="py-4 font-mono font-bold text-white uppercase">{o.id}</td>
                    <td className="py-4 uppercase font-mono">{o.shippingCourier}</td>
                    <td className="py-4 font-mono text-white font-semibold">Rp {o.totalAmount.toLocaleString()}</td>
                    <td className="py-4 text-neutral-500 font-mono">{new Date(o.createdAt).toLocaleDateString()}</td>
                    <td className="py-4">
                      <span className={`text-[9px] font-mono tracking-widest px-2 py-0.5 uppercase border rounded ${
                        o.status === 'PAID' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                      }`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      <button
                        onClick={() => fetchOrderTracking(o)}
                        className="text-[10px] py-1 px-3 bg-neutral-900 border border-neutral-800 hover:border-white font-mono text-white uppercase tracking-widest rounded transition"
                      >
                        REVIEW INVOICES
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* 5. ADDRESS & MATRICES CONFIG AND PROFILE MODIFIERS */}
      <section className="bg-[#050505] p-8 border border-neutral-900 rounded-lg">
        <form onSubmit={updateProfileSubmit} className="space-y-6">
          <div className="flex border-b border-neutral-900 pb-4 h-12 justify-between items-center mb-6">
            <h2 className="text-xl font-display font-semibold tracking-wider text-white uppercase">COUTURE SHIPPING ATELIER PROFILE</h2>
            {message && <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/5 border border-emerald-500/10 px-3 py-1 font-semibold">✓ {message}</span>}
            {errorProfile && <span className="text-[10px] font-mono text-red-500 bg-red-500/10 border border-red-500/20 px-3 py-1 font-semibold">⚠ {errorProfile}</span>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono uppercase text-neutral-400">FullName</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-black border border-neutral-800 focus:border-white focus:outline-none p-3 rounded text-xs text-white"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono uppercase text-neutral-400">WhatsApp Phone</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-black border border-neutral-800 focus:border-white focus:outline-none p-3 rounded text-xs text-white"
                required
              />
            </div>
          </div>

          {/* VERIFY ADDRESS MAP COMPONENT */}
          <div className="space-y-4">
            <span className="text-xs font-mono tracking-widest text-neutral-400 uppercase block">Verifikasi Alamat Lokasi Saya</span>
            <GoogleMapsVerifier 
              onAddressSelected={(data) => {
                setAddress(data.formattedAddress);
                setProvince(data.province);
                setCity(data.city);
                setPostalCode(data.postalCode);
                setLatitude(data.latitude);
                setLongitude(data.longitude);
                setPlaceId(data.placeId);
              }} 
              initialAddress={address} 
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-48 bg-white hover:bg-neutral-200 text-black font-display font-semibold text-xs tracking-widest py-3 uppercase rounded transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                <FileText size={12} />
                SAVE PROFILE KEYS
              </>
            )}
          </button>
        </form>
      </section>

    </div>
  );
}
