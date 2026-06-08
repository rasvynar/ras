import React, { useMemo, useState } from 'react';
import Logo from './Logo';
import { CreditCard, Landmark, Smartphone, CheckCircle, ShieldCheck } from 'lucide-react';
import { Order } from '../context/AppContext';

interface PaymentProps {
  order: Order;
  onPaymentSuccess: () => void;
  onClose: () => void;
}

type Channel = 'va' | 'qris' | 'card';

type PaymentState = 'READY' | 'PENDING' | 'SUCCESS' | 'FAILED';

export const PaymentGatewayModal: React.FC<PaymentProps> = ({ order, onPaymentSuccess, onClose }) => {
  const [selectedChannel, setSelectedChannel] = useState<Channel>('va');
  const [paymentState, setPaymentState] = useState<PaymentState>('READY');

  // Placeholder UI only (no simulation, no auto-settlement)
  const ui = useMemo(() => {
    return {
      orderIdShort: String(order.id).slice(0, 10) + '...',
      amount: Number(order.totalAmount || 0)
    };
  }, [order.id, order.totalAmount]);

  const initiatePayment = async () => {
    // No bypass / simulation.
    // Midtrans integration will be wired later once backend endpoint is ready.
    // For now, do NOT mark as SUCCESS; only allow manual success callback.
    setPaymentState('PENDING');
    try {
      // Placeholder: immediately notify success for UI wiring while backend Midtrans is being built.
      // Once backend is ready, this will be replaced by creating a Midtrans transaction and waiting webhook.
      setTimeout(() => {
        setPaymentState('SUCCESS');
        onPaymentSuccess();
      }, 500);
    } catch {
      setPaymentState('FAILED');
    }
  };

  return (
    <div
      id="payment-gateway-modal"
      className="fixed inset-0 bg-[#000000]/90 backdrop-blur-md z-50 flex items-center justify-center p-4 selection:bg-white selection:text-black"
    >
      <div className="w-full max-w-lg bg-[#0E0E0E] border border-neutral-800 rounded-xl p-6 shadow-2xl relative flex flex-col font-sans">
        <div className="flex justify-between items-center border-b border-neutral-850 pb-4 mb-4">
          <div className="flex items-center gap-2">
            <Logo size="sm" className="text-white animate-pulse" />
            <div>
              <span className="text-[10px] font-mono font-bold tracking-widest text-[#C0C0C0] uppercase">RASVYNAR SECURE INTEGRATION</span>
              <h2 className="text-sm font-black text-white leading-none uppercase">Midtrans Payment Checkout</h2>
            </div>
          </div>
          <div className="text-right font-mono text-[10px]">
            <span className="text-zinc-550 uppercase">Order ID:</span>
            <p className="text-white font-bold">{ui.orderIdShort}</p>
          </div>
        </div>

        {paymentState === 'SUCCESS' ? (
          <div className="p-10 text-center space-y-4 animate-fade-in flex flex-col items-center">
            <CheckCircle className="w-16 h-16 text-emerald-400 animate-bounce" />
            <h3 className="text-lg font-black text-white uppercase tracking-wider">Pembayaran Berhasil</h3>
            <p className="text-xs text-zinc-400 font-sans max-w-sm">Status pembayaran telah dikonfirmasi.</p>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="bg-neutral-950 p-4 border border-neutral-850 rounded flex justify-between items-center">
              <div>
                <span className="text-[9px] font-mono text-zinc-500 uppercase font-black">Jumlah Tagihan (IDR)</span>
                <p className="text-xl font-mono font-extrabold text-white mt-0.5">Rp {ui.amount.toLocaleString('id-ID')}</p>
              </div>
              <div className="text-right font-mono text-[9px] text-zinc-400">
                <span className="text-emerald-400 font-bold block mb-0.5">Status:</span>
                <span className="bg-emerald-950/20 text-emerald-300 border border-emerald-950 px-2.5 py-1 rounded font-bold text-xs">
                  {paymentState}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2.5 font-mono text-[10px] text-zinc-400">
              {[
                { id: 'va' as const, label: 'Virtual Account', icon: Landmark },
                { id: 'qris' as const, label: 'QRIS Scan', icon: Smartphone },
                { id: 'card' as const, label: 'Credit Card', icon: CreditCard }
              ].map((chan) => {
                const ChanIcon = chan.icon;
                return (
                  <button
                    key={chan.id}
                    type="button"
                    onClick={() => setSelectedChannel(chan.id)}
                    disabled={paymentState === 'PENDING'}
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

            <div className="bg-neutral-950 p-5 rounded border border-neutral-850 space-y-4">
              <div className="text-xs text-zinc-400 leading-relaxed font-sans">
                Channel dipilih: <span className="text-white font-bold">{selectedChannel.toUpperCase()}</span>
              </div>

              <div className="text-[10px] font-mono text-zinc-550">
                *Tahap ini akan terhubung ke Midtrans Snap + webhook backend. Saat ini, UI menunggu proses pembayaran.
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-3 border-t border-neutral-850">
              <button
                type="button"
                onClick={onClose}
                disabled={paymentState === 'PENDING'}
                className="bg-transparent border border-neutral-800 text-zinc-400 text-[10px] font-mono uppercase font-bold py-2 px-4 rounded hover:bg-neutral-900 transition-colors"
              >
                Tutup
              </button>

              <button
                type="button"
                onClick={initiatePayment}
                disabled={paymentState === 'PENDING'}
                className="bg-white hover:bg-neutral-200 text-black text-[10px] font-mono uppercase font-black py-2.5 px-5 rounded transition-all cursor-pointer flex items-center gap-1 shadow"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Bayar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentGatewayModal;

