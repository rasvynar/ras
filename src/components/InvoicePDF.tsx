import React from 'react';
import { Order } from '../types';
import Logo from './Logo.tsx';
import { Printer, ChevronLeft, Calendar, User, Mail, Compass, PackageOpen, HelpCircle } from 'lucide-react';

interface InvoicePDFProps {
  order: Order | null;
  onBack: () => void;
}

export default function InvoicePDF({ order, onBack }: InvoicePDFProps) {
  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center h-80 space-y-4">
        <p className="text-sm font-mono text-neutral-450 uppercase tracking-widest">No transaction record found</p>
        <button onClick={onBack} className="text-xs text-white border border-neutral-800 px-4 py-2 hover:border-white">
          Return to Profile
        </button>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  const hasDiscount = order.discountAmount > 0;
  const originalSubtotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div id="invoice-view-container" className="max-w-4xl mx-auto px-6 py-10 space-y-8 font-sans animate-fade-in print:bg-white print:text-black">
      
      {/* Action Header bar (hidden in print mode) */}
      <div className="flex justify-between items-center bg-[#050505] border border-neutral-900 p-4 rounded print:hidden">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-mono text-neutral-400 hover:text-white transition cursor-pointer"
        >
          <ChevronLeft size={15} />
          RETURN TO PROFILE
        </button>

        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 bg-white text-black font-semibold text-xs font-mono tracking-wider rounded hover:bg-neutral-200 transition cursor-pointer"
        >
          <Printer size={14} />
          PRINT INVOICE
        </button>
      </div>

      {/* Actual Printable Invoice Block */}
      <div id="printable-invoice" className="bg-[#030303] border border-neutral-900 p-8 sm:p-12 rounded-lg space-y-10 print:border-none print:bg-white print:p-0">
        
        {/* Header section with brand logo and invoice invoice info */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b border-neutral-900 pb-8">
          <div className="space-y-4">
            <Logo size="md" showTagline={false} />
            <div className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest leading-relaxed">
              <p className="font-bold text-white print:text-black">RASVYNAR ATELIER TERMINAL</p>
              <p>SCBD SOHO Level 12, Terminal Capital</p>
              <p>Jakarta Selatan, Indonesia 12190</p>
              <p>CS WhatsApp: +62 811-9238-1200</p>
            </div>
          </div>

          <div className="text-right space-y-1 font-mono">
            <span className="text-[9px] bg-white/10 text-neutral-300 font-bold px-2 py-0.5 rounded tracking-widest print:border print:border-black print:text-black print:bg-transparent">
              {order.status}
            </span>
            <h2 className="text-2xl font-bold tracking-wider text-white pt-2 print:text-black">INVOICE</h2>
            <p className="text-xs text-neutral-400 font-bold print:text-neutral-600">ORDER CODE: #{order.id}</p>
            <p className="text-[10px] text-neutral-500">DATE: {new Date(order.createdAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
          </div>
        </div>

        {/* Customer patreon and shipping destination descriptors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 text-xs font-mono">
          <div className="space-y-2 border-l border-neutral-900 pl-4 print:border-neutral-200">
            <p className="font-semibold text-neutral-400 uppercase tracking-widest">COUTURE PATRON</p>
            <div className="space-y-1 text-neutral-300 print:text-black">
              <p className="font-bold text-white print:text-black">{order.shippingName}</p>
              <p>{order.shippingEmail}</p>
              <p>Phone: {order.shippingPhone}</p>
            </div>
          </div>

          <div className="space-y-2 border-l border-neutral-900 pl-4 print:border-neutral-200">
            <p className="font-semibold text-neutral-400 uppercase tracking-widest">DELIVERY SHIPMENT</p>
            <div className="space-y-1 text-neutral-300 print:text-black">
              <p className="uppercase">{order.shippingCourier} Express Logistics</p>
              <p className="leading-relaxed text-[11px]">{order.shippingAddress}, {order.shippingDistrict}, {order.shippingCity}, {order.shippingProvince} {order.shippingPostalCode}</p>
              {order.shippingTrackingNumber ? (
                <p className="text-white font-bold text-[10px] bg-neutral-900 px-2 py-0.5 w-max print:text-black print:bg-neutral-100">WAYBILL AWN: {order.shippingTrackingNumber}</p>
              ) : (
                <p className="text-amber-500 text-[10px] tracking-wider uppercase">Fulfillment preparing...</p>
              )}
            </div>
          </div>
        </div>

        {/* Invoice Item List */}
        <div className="space-y-4">
          <span className="text-[10px] font-mono font-bold tracking-widest text-[#B5B5B5] uppercase block">GARMENT INDEX DETAILS</span>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono border-collapse">
              <thead>
                <tr className="border-b border-neutral-900 text-[10px] text-neutral-550 uppercase font-black text-xs leading-normal">
                  <th className="py-3 px-2">GARMENT DESCRIPTION</th>
                  <th className="py-3 px-2 text-center">SIZE</th>
                  <th className="py-3 px-2 text-center">COLOR</th>
                  <th className="py-3 px-2 text-right">UNIT (IDR)</th>
                  <th className="py-3 px-2 text-center">QTY</th>
                  <th className="py-3 px-2 text-right">TOTAL (IDR)</th>
                </tr>
              </thead>
              <tbody className="text-xs text-neutral-300 divide-y divide-neutral-950 print:text-black">
                {order.items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-neutral-950/20">
                    <td className="py-4 px-2 uppercase font-semibold font-mono text-[11px]">
                      {item.name}
                    </td>
                    <td className="py-4 px-2 text-center uppercase text-[11px]">{(item as any).selectedSize || (item as any).size || 'ALL'}</td>
                    <td className="py-4 px-2 text-center uppercase text-[11px]">{(item as any).selectedColor || (item as any).color || '-'}</td>
                    <td className="py-4 px-2 text-right">Rp {item.price.toLocaleString()}</td>
                    <td className="py-4 px-2 text-center">{item.quantity}</td>
                    <td className="py-4 px-2 text-right font-bold text-white print:text-black">
                      Rp {(item.price * item.quantity).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Invoice pricing splits and summations */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-t border-neutral-900 pt-8">
          <div className="space-y-2 text-[10px] font-mono text-neutral-500 uppercase max-w-sm">
            <p className="font-bold text-neutral-400">PATREON INSTRUCTIONS & LOGS</p>
            <p className="leading-relaxed">
              This digital invoice is a valid document verified by the automated Anti-Fraud logs and satellite routing vectors. Exchange/return drops require original tag labels intact.
            </p>
          </div>

          <div className="w-full sm:w-80 space-y-2.5 font-mono text-xs border-r border-[#000] text-right">
            <div className="flex justify-between">
              <span className="text-neutral-500 uppercase">SUBTOTAL RE-INDEX:</span>
              <span className="text-neutral-300 print:text-black">Rp {originalSubtotal.toLocaleString()}</span>
            </div>
            
            {hasDiscount && (
              <div className="flex justify-between text-amber-500 font-bold">
                <span className="uppercase">COUPON APPLIED:</span>
                <span>-Rp {order.discountAmount.toLocaleString()}</span>
              </div>
            )}

            <div className="flex justify-between">
              <span className="text-neutral-500 uppercase">SHIPPING LOGISTICS FEE:</span>
              <span className="text-neutral-300 print:text-black">Rp {order.shippingFee.toLocaleString()}</span>
            </div>

            <div className="flex justify-between border-t border-neutral-900 pt-3.5 text-sm font-black">
              <span className="text-white print:text-black uppercase tracking-wider">GRAND TOTAL IDR:</span>
              <span className="text-white print:text-black text-md">Rp {order.totalAmount.toLocaleString()}</span>
            </div>

            <div className="pt-2 text-[10px] text-emerald-400 uppercase font-sans tracking-widest font-bold">
              ✓ PATREON POINTS REWARD EARNED: +{order.pointsEarned || 0} POINTS
            </div>
          </div>
        </div>

        {/* Footer legalities */}
        <div className="text-center pt-8 border-t border-neutral-950 text-[9px] font-mono text-neutral-600 uppercase tracking-widest">
          <p>Style Beyond Ordinary • Thank you for your distinguished patronage</p>
        </div>

      </div>

    </div>
  );
}
