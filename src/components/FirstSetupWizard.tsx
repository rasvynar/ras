import React, { useState } from 'react';
import Logo from './Logo.tsx';
import { Settings, Lock, Mail, Phone, MapPin, Sparkles, AlertCircle } from 'lucide-react';

interface WizardProps {
  onSetupCompleted: () => void;
}

export default function FirstSetupWizard({ onSetupCompleted }: WizardProps) {
  const [brandName, setBrandName] = useState('RASVYNAR');
  const [adminName, setAdminName] = useState('Principal Director');
  const [emailAdmin, setEmailAdmin] = useState('rasvynar@gmail.com');
  const [adminPassword, setAdminPassword] = useState('admin123');
  const [phoneBusiness, setPhoneBusiness] = useState('081192381200');
  const [addressBusiness, setAddressBusiness] = useState('Level 12, Capital Grid SOHO, SCBD, Jakarta Selatan');
  
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/wizard/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandName,
          emailAdmin,
          adminName,
          adminPassword,
          phoneBusiness,
          addressBusiness
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit initialization vectors');
      }

      onSetupCompleted();
    } catch (err: any) {
      setError(err.message || 'Connection glitch.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      
      {/* Background ambient lighting effects */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-neutral-800/25 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-neutral-700/20 blur-[130px] rounded-full"></div>

      <div className="w-full max-w-xl bg-[#0a0a0a] border border-neutral-900 rounded-lg p-8 sm:p-10 relative z-10 space-y-8 shadow-2xl">
        
        {/* Header monogram logo */}
        <div className="text-center space-y-3">
          <Logo size="md" showTagline={false} />
          <h2 className="text-xl tracking-widest uppercase font-display font-medium text-neutral-200">
            PLATELIER DEPLOYMENT WIZARD
          </h2>
          <p className="text-xs text-neutral-500 max-w-[85%] mx-auto leading-relaxed">
            Configure the default identity vectors of your high-contrast luxury streetwear systems.
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded text-xs flex items-start gap-2.5 leading-relaxed">
            <AlertCircle size={15} className="shrink-0 mt-0.5 text-red-500" />
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Brand parameters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono tracking-widest uppercase text-neutral-400">BRAND IDENTITY NAME</label>
              <div className="relative">
                <input
                  type="text"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  className="w-full bg-black border border-neutral-800 focus:border-white focus:outline-none px-3 py-2 pl-9 rounded text-sm text-white"
                  required
                />
                <Settings className="absolute left-3 top-3.5 text-neutral-600" size={14} />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-mono tracking-widest uppercase text-neutral-400">BUSINESS WHATSAPP (OTP & HELP)</label>
              <div className="relative">
                <input
                  type="text"
                  value={phoneBusiness}
                  onChange={(e) => setPhoneBusiness(e.target.value)}
                  className="w-full bg-black border border-neutral-800 focus:border-white focus:outline-none px-3 py-2 pl-9 rounded text-sm text-white"
                  required
                />
                <Phone className="absolute left-3 top-3.5 text-neutral-600" size={14} />
              </div>
            </div>
          </div>

          {/* Admin Email */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono tracking-widest uppercase text-neutral-400">PRINCIPAL ADMINISTRATIVE EMAIL</label>
            <div className="relative">
              <input
                type="email"
                value={emailAdmin}
                onChange={(e) => setEmailAdmin(e.target.value)}
                className="w-full bg-black border border-neutral-800 focus:border-white focus:outline-none px-3 py-2.5 pl-9 rounded text-sm text-white"
                required
              />
              <Mail className="absolute left-3 top-3.5 text-neutral-600" size={14} />
            </div>
          </div>

          {/* Admin Name & Super Admin Password */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono tracking-widest uppercase text-neutral-400">PRINCIPAL OFFICER NAME</label>
              <input
                type="text"
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
                className="w-full bg-black border border-neutral-800 focus:border-white focus:outline-none px-3 py-2 rounded text-sm text-white"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-mono tracking-widest uppercase text-neutral-400">ATELIER EXECUTIVE PASSWORD</label>
              <div className="relative">
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full bg-black border border-neutral-800 focus:border-white focus:outline-none px-3 py-2 pl-9 rounded text-sm text-white"
                  placeholder="admin123"
                  required
                />
                <Lock className="absolute left-3 top-3.5 text-neutral-600" size={14} />
              </div>
            </div>
          </div>

          {/* Business Address */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono tracking-widest uppercase text-neutral-400">HQ Flagship Terminal Address</label>
            <div className="relative">
              <textarea
                value={addressBusiness}
                onChange={(e) => setAddressBusiness(e.target.value)}
                rows={2}
                className="w-full bg-black border border-neutral-800 focus:border-white focus:outline-none px-3 py-2 pl-9 rounded text-sm text-white resize-none"
                required
              />
              <MapPin className="absolute left-3 top-3 text-neutral-600" size={14} />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white hover:bg-neutral-200 hover:text-black text-black font-display font-semibold text-xs tracking-widest py-3 uppercase rounded transition-all cursor-pointer flex items-center justify-center gap-2 mt-4"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                <Sparkles size={14} /> BOOTSTRAP BRAND ASSETS
              </>
            )}
          </button>
        </form>

        <div className="text-center">
          <p className="text-[10px] text-neutral-600 font-mono">
            SECURE RE-ENGAGEMENT PROTOCOL ON DOCKER / SCBD PORTS.
          </p>
        </div>
      </div>
    </div>
  );
}
