import React, { useState, useEffect } from 'react';
import { Order } from '../context/AppContext';
import Logo from './Logo';
import { CreditCard, Landmark, CheckCircle, Smartphone, AlertTriangle, ShieldCheck } from 'lucide-react';

interface PaymentProps {
  order: Order;
  onPaymentSuccess: () => void;
  onClose: () => void;
}

export const PaymentGatewayModal: React.FC<PaymentProps> = ({ order, onPaymentSuccess, onClose }) => {
  const [selectedChannel, setSelectedChannel] = useState<'va' | 'qris' | 'card'>('va');
  const [vaNumber, setVaNumber] = useState('');
  const [timerLeft, setTimerLeft] = useState(299); // 5 minutes payment simulation limit
  const [paymentSettled, setPaymentSettled] = useState(false);

  // Generate simulated Virtual Account on load
  useEffect(() => {
    setVaNumber(`988${Math.floor(10000000 + Math.random() * 90000000)}`);
  }, []);

  // Timer tick down
  useEffect(() => {
    if (timerLeft <= 0) return;
    const ticker = setInterval(() => {
      setTimerLeft((t) => t - 1);
    }, 1000);
    return () => clearInterval(ticker);
  }, [timerLeft]);

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSimulateSettlement = () => {
    setPaymentSettled(true);
    setTimeout(() => {
      onPaymentSuccess();
    }, 1805);
  };

  return (
    <div id="payment-gateway-modal" className="fixed inset-0 bg-[#000000]/90 backdrop-blur-md z-50 flex items-center justify-center p-4 selection:bg-white selection:text-black">
      <div className="w-full max-w-lg bg-[#0E0E0E] border border-neutral-800 rounded-xl p-6 shadow-2xl relative flex flex-col font-sans">
        
        {/* Gateway branding header */}
        <div className="flex justify-between items-center border-b border-neutral-850 pb-4 mb-4">
          <div className="flex items-center gap-2">
            <Logo size="sm" className="text-white animate-pulse" />
            <div>
              <span className="text-[10px] font-mono font-bold tracking-widest text-[#C0C0C0] uppercase">RASVYNAR SECURE INTEGRATION</span>
              <h2 className="text-sm font-black text-white leading-none uppercase">Virtual Midtrans Settlement</h2>
            </div>
          </div>
          <div className="text-right font-mono text-[10px]">
            <span className="text-zinc-550 uppercase">Order ID:</span>
            <p className="text-white font-bold">{order.id.substring(0,10)}...</p>
          </div>
        </div>

        {paymentSettled ? (
          <div className="p-10 text-center space-y-4 animate-fade-in flex flex-col items-center">
            <CheckCircle className="w-16 h-16 text-emerald-400 animate-bounce" />
            <h3 className="text-lg font-black text-white uppercase tracking-wider">Metode Pembayaran Sukses Settled!</h3>
            <p className="text-xs text-zinc-400 font-sans max-w-sm">
              Token tanda pelunasan berhasil ditransmisikan. Kargo Anda otomatis memasuki tahap pemrosesan gudang.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            
            {/* Total invoice metrics */}
            <div className="bg-neutral-950 p-4 border border-neutral-850 rounded flex justify-between items-center">
              <div>
                <span className="text-[9px] font-mono text-zinc-500 uppercase font-black">Jumlah Tagihan (IDR)</span>
                <p className="text-xl font-mono font-extrabold text-white mt-0.5">Rp {order.totalAmount.toLocaleString('id-ID')}</p>
              </div>
              <div className="text-right font-mono text-[9px] text-zinc-400">
                <span className="text-red-400 font-bold block mb-0.5">Batas Bayar (Ticking):</span>
                <span className="bg-red-950/20 text-red-500 border border-red-950 px-2.5 py-1 rounded font-bold text-xs">{formatTimer(timerLeft)}</span>
              </div>
            </div>

            {/* Channels tab list */}
            <div className="grid grid-cols-3 gap-2.5 font-mono text-[10px] text-zinc-400">
              {[
                { id: 'va', label: 'Virtual Account', icon: Landmark },
                { id: 'qris', label: 'QRIS Scan', icon: Smartphone },
                { id: 'card', label: 'Credit Card', icon: CreditCard }
              ].map((chan) => {
                const ChanIcon = chan.icon;
                return (
                  <button
                    key={chan.id}
                    onClick={() => setSelectedChannel(chan.id as any)}
                    className={`p-2.5 border rounded flex flex-col items-center gap-1.5 transition-colors cursor-pointer ${
                      selectedChannel === chan.id
                        ? 'border-white text-white font-bold bg-neutral-900/40'
                        : 'border-neutral-850 hover:bg-neutral-950'
                    }`}
                  >
                    <ChanIcon className="w-4 h-4" />
                    <span>{chan.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Selected layout channel specific configs */}
            <div className="bg-neutral-950 p-5 rounded border border-neutral-850 space-y-4">
              
              {selectedChannel === 'va' && (
                <div className="space-y-3 font-mono text-xs text-center">
                  <span className="text-[9px] text-[#A0A0A0] block uppercase tracking-widest">Nomor Virtual Account Permata/BCA</span>
                  <p className="text-lg font-black tracking-widest text-[#FFFFFF] font-mono py-1.5 bg-neutral-900 rounded border border-neutral-800">
                    {vaNumber}
                  </p>
                  <p className="text-[10px] text-zinc-550 leading-relaxed font-sans max-w-xs mx-auto">
                    Salin nomor di atas, buka aplikasi m-Banking Anda, pilih transfer Virtual Account, masukkan nominal yang tepat.
                  </p>
                </div>
              )}

              {selectedChannel === 'qris' && (
                <div className="text-center space-y-3 flex flex-col items-center font-sans">
                  <span className="text-[9px] font-mono text-zinc-450 uppercase tracking-widest font-bold">QRIS GPN INTERACTIVE GATEWAY</span>
                  <div className="bg-white p-3.5 rounded-lg w-40 h-40 flex items-center justify-center shadow-xl">
                    <img 
                      src="https://images.unsplash.com/photo-1543128639-4cb7e6eeef1b?q=80&w=200" 
                      alt="Simulated QRIS Grid" 
                      className="w-full h-full object-contain filter contrast-125" 
                    />
                  </div>
                  <p className="text-[9px] font-mono text-zinc-500 uppercase leading-relaxed max-w-xs block">
                    Pindai menggunakan aplikasi GoPay, OVO, ShopeePay, Dana, atau BCA Mobile.
                  </p>
                </div>
              )}

              {selectedChannel === 'card' && (
                <div className="space-y-3 text-xs font-mono text-zinc-400">
                  <div className="space-y-1">
                    <label className="text-[9px] block">No Kartu Kredit / Debit</label>
                    <input
                      type="text"
                      disabled
                      placeholder="4111 8299 1022 9388"
                      className="w-full bg-[#111] p-2 rounded text-white border border-neutral-850"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9px] block">Masa Berlaku (Expired)</label>
                      <input type="text" disabled placeholder="12/29" className="w-full bg-[#111] p-2 rounded text-white border border-neutral-850" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] block">CVV</label>
                      <input type="text" disabled placeholder="***" className="w-full bg-[#111] p-2 rounded text-white border border-neutral-850" />
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Simulator action tool buttons */}
            <div className="flex gap-3 justify-end pt-3 border-t border-neutral-850">
              <button
                type="button"
                onClick={onClose}
                className="bg-transparent border border-neutral-800 text-zinc-400 text-[10px] font-mono uppercase font-bold py-2 px-4 rounded hover:bg-neutral-900 transition-colors"
              >
                Gagalkan Transaksi
              </button>
              
              <button
                onClick={handleSimulateSettlement}
                className="bg-white hover:bg-neutral-200 text-black text-[10px] font-mono uppercase font-black py-2.5 px-5 rounded transition-all cursor-pointer flex items-center gap-1 shadow"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-600 animate-pulse" /> Bayar (Simulasi)
              </button>
            </div>

            <div className="text-[9.5px] font-mono text-zinc-550 leading-relaxed text-center italic border-t border-neutral-900/60 pt-3">
              *CATATAN SIMULATOR: Tekan tombol "Bayar (Simulasi)" untuk memicu webhook otomatis pelunasan order instan dari payment gateway.
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default PaymentGatewayModal;
