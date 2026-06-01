import React, { useState } from 'react';
import { useApp, Order } from '../context/AppContext';
import { Award, Share2, Compass, FileText, ShoppingBag, Edit, User, ShieldCheck, Check } from 'lucide-react';

interface PortalProps {
  onSelectOrder: (order: Order) => void;
}

export const CustomerPortal: React.FC<PortalProps> = ({ onSelectOrder }) => {
  const { currentUser, setCurrentUser, orders, loyaltyPointsExchangeRate } = useApp();

  // Profile forms
  const [name, setName] = useState(currentUser?.name || '');
  const [whatsapp, setWhatsapp] = useState(currentUser?.whatsapp || '');
  const [avatar, setAvatar] = useState(currentUser?.avatar || '');
  const [successMsg, setSuccessMsg] = useState('');

  const [copiedLink, setCopiedLink] = useState(false);

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    setCurrentUser({
      ...currentUser,
      name,
      whatsapp,
      avatar: avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150'
    });

    setSuccessMsg('detail profil Anda berhasil diperbarui di server RASVYNAR!');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto text-center py-20 font-sans space-y-4">
        <Award className="w-12 h-12 text-zinc-500 animate-pulse mx-auto" />
        <h2 className="text-lg font-bold text-white uppercase tracking-wider">Silakan Login Terlebih Dahulu</h2>
        <p className="text-xs text-zinc-400">Anda wajib masuk ke akun terdaftar Anda untuk meninjau kargo, melacak resi, atau mengurus komisi afiliasi.</p>
      </div>
    );
  }

  // Calculate affiliate stats
  const referralLink = `${window.location.origin}?ref=${currentUser.referralCode}`;
  const totalCommissions = currentUser.commissionsEarned || 0;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  // Get dynamic benefits description based on membership
  const getMembershipBenefits = (tier: string) => {
    switch (tier) {
      case 'Platinum':
        return { disc: '12%', cb: '10%', ptsMultiplier: '4x', points: currentUser.points };
      case 'Gold':
        return { disc: '8%', cb: '5%', ptsMultiplier: '3x', points: currentUser.points };
      case 'Silver':
        return { disc: '5%', cb: '2%', ptsMultiplier: '2x', points: currentUser.points };
      default: // Bronze
        return { disc: '2%', cb: '1%', ptsMultiplier: '1x', points: currentUser.points };
    }
  };

  const benefits = getMembershipBenefits(currentUser.membership);
  const myOrders = orders.filter((o) => o.userId === currentUser.id);

  return (
    <div id="customer-portal" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 font-sans">
      
      {/* Visual Welcome Board */}
      <div className="bg-[#0A0A0A] border border-neutral-850 p-6 md:p-8 rounded-lg mb-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4 text-center md:text-left flex-col md:flex-row">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-16 h-16 md:w-20 md:h-20 rounded-full border-2 border-white/25 object-cover shadow-2xl"
          />
          <div>
            <h1 className="text-xl md:text-2xl font-black text-white uppercase">{currentUser.name}</h1>
            <p className="text-xs font-mono text-zinc-400 uppercase tracking-wide mt-0.5 mt-1">Level Member: <span className="text-white font-extrabold">{currentUser.membership}</span></p>
            <p className="text-[10px] font-mono text-zinc-500 mt-1 italic">IP Registry Localizer: {currentUser.ipAddress} ({currentUser.cityFromIp}, {currentUser.country})</p>
          </div>
        </div>

        {/* Loyalty points HUD block */}
        <div className="bg-neutral-950 p-4 border border-neutral-850 rounded text-center md:text-right min-w-[200px] space-y-1">
          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block font-bold">Loyalty Reward Points</span>
          <p className="text-2xl font-black text-white font-mono tracking-wide">{currentUser.points} Pts</p>
          <span className="text-[9px] font-mono text-zinc-550 uppercase tracking-wide block">
            Setara diskon Rp {(currentUser.points * loyaltyPointsExchangeRate).toLocaleString('id-ID')}
          </span>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* PANEL 1: PROFILE EDIT & MEMBERSHIP BENEFITS CARD */}
        <div className="space-y-6">
          
          <div className="bg-[#0B0B0B] border border-neutral-850 p-5 rounded-lg space-y-4">
            <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-[#FFFFFF] border-b border-neutral-900 pb-3 flex items-center gap-2">
              <User className="w-4 h-4 text-zinc-400" /> Detail Profil Akun
            </h3>
            
            {successMsg && (
              <p className="text-[11px] bg-emerald-950/40 text-emerald-300 p-2.5 rounded border border-emerald-900 leading-relaxed font-mono">
                ✓ BEBAS FRAUD: {successMsg}
              </p>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs font-mono text-zinc-400">
              <div className="space-y-1">
                <label className="uppercase text-[9px] tracking-wider block">Ganti Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#131313] border border-neutral-850 rounded px-2.5 py-2.5 text-xs text-white outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="uppercase text-[9px] tracking-wider block">WhatsApp (Format WA)</label>
                <input
                  type="text"
                  required
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="w-full bg-[#131313] border border-neutral-850 rounded px-2.5 py-2.5 text-xs text-white outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="uppercase text-[9px] tracking-wider block">Link Gambar Avatar URL</label>
                <input
                  type="text"
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  className="w-full bg-[#131313] border border-neutral-850 rounded px-2.5 py-2.5 text-xs text-white outline-none font-mono"
                  placeholder="https://images.unsplash.com/photo-XXX"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-white text-black font-semibold uppercase tracking-widest text-[10px] py-2.5 rounded hover:bg-neutral-200 transition-colors cursor-pointer text-center"
              >
                Simpan Profil
              </button>
            </form>
          </div>

          {/* Membership tier benefits explanation card */}
          <div className="bg-[#0B0B0B] border border-neutral-850 p-5 rounded-lg space-y-4">
            <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-[#FFFFFF] border-b border-neutral-900 pb-3 flex items-center gap-2">
              <Award className="w-4 h-4 text-zinc-400" /> Benefit Member ({currentUser.membership})
            </h3>
            <div className="space-y-2.5 font-mono text-[11px] text-zinc-400">
              <div className="flex justify-between border-b border-neutral-900 pb-1.5">
                <span>Diskon Langsung Garmen:</span>
                <span className="text-white font-bold">{benefits.disc} OFF</span>
              </div>
              <div className="flex justify-between border-b border-neutral-900 pb-1.5">
                <span>Cashback Reward Transaksi:</span>
                <span className="text-white font-bold">{benefits.cb} Cashback</span>
              </div>
              <div className="flex justify-between border-b border-neutral-900 pb-1.5">
                <span>Multiplier Poin Loyalty:</span>
                <span className="text-emerald-400 font-bold">{benefits.ptsMultiplier} Gain</span>
              </div>
            </div>
            <p className="text-[10px] text-zinc-550 leading-relaxed font-sans text-justify pt-1">
              Setiap kali Anda menaikkan strata keanggotaan (Bronze &gt; Silver &gt; Gold &gt; Platinum) melalui pengumpulan poin transaksi, potongan diskon langsung saat checkout akan teraplikasi otomatis secara permanen!
            </p>
          </div>

        </div>

        {/* PANEL 2: REFERRAL / AFFILIATE MONITORING PANEL */}
        <div className="space-y-6">
          <div className="bg-[#0B0B0B] border border-neutral-850 p-5 rounded-lg space-y-4">
            <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-[#FFFFFF] border-b border-neutral-900 pb-3 flex items-center gap-2">
              <Share2 className="w-4 h-4 text-zinc-400" /> Program Afiliasi RASVYNAR
            </h3>
            
            <p className="text-xs text-zinc-400 leading-relaxed font-sans text-justify">
              Sebarkan tautan rujukan unik Anda di bawah. Setiap ada transaksi pembeli menggunakan tautan referral atau kode kupon Anda, Anda akan meraih <span className="text-white font-bold">komisi langsung 5%</span> dari nilai transaksi dan pembeli mendapatkan diskon kupon.
            </p>

            <div className="space-y-3 pt-2 font-mono">
              <div>
                <span className="uppercase text-[9px] text-zinc-500 block mb-1">Kode Referral Anda:</span>
                <div className="bg-neutral-950 p-3 rounded font-extrabold text-white text-center border border-neutral-850 tracking-widest text-sm">
                  {currentUser.referralCode}
                </div>
              </div>

              <div>
                <span className="uppercase text-[9px] text-zinc-500 block mb-1">Link Afiliasi:</span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    disabled
                    value={referralLink}
                    className="w-full bg-[#131313] text-[10px] border border-neutral-850 rounded px-2 text-zinc-400 focus:outline-none"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="bg-white text-black p-2 rounded hover:bg-neutral-200 shrink-0 cursor-pointer"
                  >
                    {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="bg-[#131313] p-4 rounded border border-neutral-850 font-sans mt-3 space-y-1 text-center">
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block font-bold">Total Komisi Terkumpul</span>
                <p className="text-xl font-black text-emerald-400 font-mono">Rp {totalCommissions.toLocaleString('id-ID')}</p>
                <p className="text-[9px] text-zinc-500 font-mono uppercase tracking-wide">Dapat dicairkan via admin transfer bank resmi</p>
              </div>

            </div>
          </div>
        </div>

        {/* PANEL 3: USER HISTORY TRUCKINGS AND INVOICES CODES */}
        <div className="bg-[#0B0B0B] border border-neutral-850 p-5 rounded-lg space-y-4">
          <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-[#FFFFFF] border-b border-neutral-900 pb-3 flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-zinc-400" /> Riwayat Pesanan Saya ({myOrders.length})
          </h3>
          
          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
            {myOrders.length === 0 ? (
              <div className="text-center py-12 text-zinc-650 font-mono text-xs uppercase tracking-wide">
                Anda belum pernah melakukan pesanan garmen.
              </div>
            ) : (
              myOrders.map((ord) => (
                <div key={ord.id} className="bg-neutral-950 p-4 rounded border border-neutral-850 space-y-3 text-xs leading-relaxed font-sans">
                  
                  <div className="flex justify-between items-start border-b border-neutral-900 pb-2">
                    <div>
                      <span className="font-mono text-[10px] block font-bold text-white uppercase">{ord.id}</span>
                      <span className="text-[9px] text-zinc-500 block font-mono mt-0.5">{new Date(ord.createdAt).toLocaleDateString('id-ID')}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                      ord.paymentStatus === 'Paid' ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-900' : 'bg-red-950/20 text-red-500 border border-red-900'
                    }`}>
                      {ord.paymentStatus}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <p className="text-zinc-500 text-[10px] uppercase font-mono tracking-wider">Garments Dipesan:</p>
                    <ul className="list-disc pl-4 text-zinc-300 font-sans font-medium space-y-1 leading-snug">
                      {ord.items.map((it, idx) => (
                        <li key={idx} className="uppercase">
                          {it.name} ({it.selectedSize} - {it.quantity}pcs)
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Waybill resi tracking timeline block if dispatched */}
                  <div className="bg-[#121212] p-2.5 rounded border border-neutral-900 font-mono text-[10px] text-zinc-400 space-y-1.5">
                    <div className="flex justify-between text-zinc-500">
                      <span>Kurir Pengiriman:</span>
                      <span className="text-white uppercase font-bold">{ord.courier}</span>
                    </div>
                    <div className="flex justify-between text-zinc-500">
                      <span>Status Kargo:</span>
                      <span className="text-white uppercase font-bold">{ord.shippingStatus}</span>
                    </div>
                    <div className="flex justify-between text-zinc-500">
                      <span>No Resi Waybill:</span>
                      <span className="text-emerald-400 font-bold">{ord.waybillNumber || 'Menunggu Penjemputan Kurir'}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => onSelectOrder(ord)}
                    className="w-full bg-neutral-900 hover:bg-neutral-850 text-white font-mono border border-neutral-800 rounded py-2 text-[10px] uppercase tracking-widest flex items-center justify-center gap-1 cursor-pointer transition-all"
                  >
                    <FileText className="w-3.5 h-3.5 text-zinc-400" /> Unduh Invoice PDF / Tracking
                  </button>

                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

export default CustomerPortal;
