import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ShieldCheck, Mail, Smartphone, Lock, User, Compass, HelpCircle, ArrowRight, ShieldAlert, Key, Check } from 'lucide-react';
import { GoogleMapsVerifier } from './GoogleMapsVerifier';

interface AntiFraudRegisterProps {
  onSuccess: () => void;
  onSwitchToLogin: () => void;
}

export default function AntiFraudRegister({ onSuccess, onSwitchToLogin }: AntiFraudRegisterProps) {
  const { setCurrentUser } = useApp();

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [referral, setReferral] = useState('');

  // Sizing of inputs
  const [province, setProvince] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [postal, setPostal] = useState('');

  // Anti fraud geolocation mockup tracking
  const [isGpsLocked, setIsGpsLocked] = useState(false);
  const [gpsLatitude, setGpsLatitude] = useState<number | null>(null);
  const [gpsLongitude, setGpsLongitude] = useState<number | null>(null);
  const [gpsPlaceId, setGpsPlaceId] = useState('');
  const [isLocking, setIsLocking] = useState(false);

  // States
  const [step, setStep] = useState<'REGISTER' | 'OTP'>('REGISTER');
  const [otpCode, setOtpCode] = useState('');
  const [errorHeader, setErrorHeader] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSimulateGpsLock = () => {
    setIsLocking(true);
    setTimeout(() => {
      // Simulate locking into Jakarta coordinates
      const lat = -6.2297 + (Math.random() - 0.5) * 0.01;
      const lng = 106.8159 + (Math.random() - 0.5) * 0.01;
      setGpsLatitude(Number(lat.toFixed(4)));
      setGpsLongitude(Number(lng.toFixed(4)));
      setGpsPlaceId('ChIJXQ-zW0rJaS4Rh19zVpA2-Yk');
      setIsGpsLocked(true);
      setIsLocking(false);
    }, 1500);
  };

  const executeSubmitRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorHeader('');
    setInfoMessage('');

    if (password.length < 6) {
      setErrorHeader('Atelier security requires password containing at least 6 characters.');
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          email: email.toLowerCase().trim(),
          phoneNumber: phone,
          address,
          password,
          provinceStr: province,
          cityStr: city,
          districtStr: district,
          postalCode: postal,
          referredByCode: referral || undefined,
          latitude: gpsLatitude || -6.2297,
          longitude: gpsLongitude || 106.8159,
          googlePlaceId: gpsPlaceId || 'ChIJXQ-zW0rJaS4Rh19zVpA2-Yk'
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Identity matching compilation crashed.');
      }

      setInfoMessage('Verification token successfully generated! Silakan cek inbox Email Anda untuk mendapatkan kode OTP.');
      setStep('OTP');
    } catch (err: any) {
      setErrorHeader(err.message || 'Error compiling registration credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const executeVerifyEmailOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorHeader('');
    setInfoMessage('');
    setSubmitting(true);

    try {
      const res = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.toLowerCase().trim(),
          code: otpCode.trim()
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Token coordinates mismatch. Try again.');
      }

      // Save token and set current user in App Context
      localStorage.setItem('rasvynar_token', data.token);
      setCurrentUser(data.user);
      onSuccess();
      alert('🎉 Identity fully established! Welcome to RASVYNAR Patrons.');
    } catch (err: any) {
      setErrorHeader(err.message || 'OTP verification declined.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div id="antifraud-register" className="space-y-6 font-mono text-xs text-neutral-300">
      
      {errorHeader && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded text-[11px] flex gap-2">
          <ShieldAlert size={15} className="shrink-0 text-red-500 mt-0.5" />
          <p>{errorHeader}</p>
        </div>
      )}

      {infoMessage && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3 rounded text-[11px]">
          <p>✓ {infoMessage}</p>
        </div>
      )}

      {/* STEP 1: FILL FORM FIELDS */}
      {step === 'REGISTER' ? (
        <form onSubmit={executeSubmitRegister} className="space-y-4">
          
          {/* Full Name */}
          <div className="space-y-1">
            <label className="text-[9px] uppercase tracking-wider text-neutral-500">FULL NAME</label>
            <div className="relative">
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="E.g., Bagas Aditya"
                className="w-full bg-[#111] border border-neutral-850 rounded px-3 py-2 pl-9 text-white focus:outline-none focus:border-white transition-all text-xs"
              />
              <User className="absolute left-3 top-2.5 text-neutral-600" size={13} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Email */}
            <div className="space-y-1">
              <label className="text-[9px] uppercase tracking-wider text-neutral-500">EMAIL ADDRESS</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="patron@gmail.com"
                  className="w-full bg-[#111] border border-neutral-850 rounded px-3 py-2 pl-9 text-white focus:outline-none focus:border-white transition-all text-xs"
                />
                <Mail className="absolute left-3 top-2.5 text-neutral-600" size={13} />
              </div>
            </div>

            {/* WA Phone */}
            <div className="space-y-1">
              <label className="text-[9px] uppercase tracking-wider text-neutral-500">WHATSAPP NO</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="081xxxxxxxx"
                  className="w-full bg-[#111] border border-neutral-850 rounded px-3 py-2 pl-9 text-white focus:outline-none focus:border-white transition-all text-xs"
                />
                <Smartphone className="absolute left-3 top-2.5 text-neutral-600" size={13} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Password */}
            <div className="space-y-1">
              <label className="text-[9px] uppercase tracking-wider text-neutral-500">PASSWORD (MIN 6 CHARACTERS)</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#111] border border-neutral-850 rounded px-3 py-2 pl-9 text-white focus:outline-none focus:border-white transition-all text-xs"
                />
                <Lock className="absolute left-3 top-2.5 text-neutral-600" size={13} />
              </div>
            </div>

            {/* Referral optional */}
            <div className="space-y-1">
              <label className="text-[9px] uppercase tracking-wider text-neutral-500">REFERRAL INVITE CODE (OPTIONAL)</label>
              <div className="relative">
                <input
                  type="text"
                  value={referral}
                  onChange={(e) => setReferral(e.target.value)}
                  placeholder="E.g., ARSARXSU"
                  className="w-full bg-[#111] border border-neutral-850 rounded px-3 py-2 pl-9 text-white focus:outline-none focus:border-white transition-all text-xs uppercase"
                />
                <Key className="absolute left-3 top-2.5 text-neutral-600" size={13} />
              </div>
            </div>
          </div>

          {/* MANUAL ADDRESS INPUT */}
          <div className="space-y-1">
            <label className="text-[9px] uppercase tracking-wider text-neutral-500">ALAMAT LENGKAP PENGIRIMAN (BISA DIUPDATE SAAT CHECKOUT)</label>
            <div className="relative">
              <textarea
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Tulis nama jalan, RT/RW, nomor rumah, kelurahan, kecamatan, atau apartemen..."
                className="w-full bg-[#111] border border-neutral-850 rounded px-3 py-2 text-white focus:outline-none focus:border-white transition-all text-xs h-16"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Kota & Kode Pos */}
            <div className="space-y-1">
              <label className="text-[9px] uppercase tracking-wider text-neutral-500">KOTA / KABUPATEN</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Contoh: Jakarta Selatan"
                className="w-full bg-[#111] border border-neutral-850 rounded px-3 py-2 text-white focus:outline-none focus:border-white transition-all text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] uppercase tracking-wider text-neutral-500">KODE POS</label>
              <input
                type="text"
                value={postal}
                onChange={(e) => setPostal(e.target.value)}
                placeholder="Contoh: 12190"
                className="w-full bg-[#111] border border-neutral-850 rounded px-3 py-2 text-white focus:outline-none focus:border-white transition-all text-xs"
              />
            </div>
          </div>

          <div className="space-y-2 pt-3">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-white text-black hover:bg-neutral-200 rounded text-[10px] font-bold tracking-widest uppercase transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {submitting ? 'RECONCILING LEDGER...' : 'SECURE SIGNUP COUTURE'}
              <ArrowRight size={12} />
            </button>
          </div>

          <div className="pt-2 text-center text-xs text-neutral-500">
            Already registered?{' '}
            <button type="button" onClick={onSwitchToLogin} className="text-white hover:underline font-bold md:ml-1 uppercase">
              Establish Session Port
            </button>
          </div>

        </form>
      ) : (
        /* STEP 2: VERIFY CODE OTP */
        <form onSubmit={executeVerifyEmailOtp} className="space-y-5">
          <div className="text-center space-y-2 text-[11px] text-neutral-400 px-4 leading-normal font-sans">
            <p>Verification OTP matching token dispatched to email domain: <span className="text-white font-mono font-bold lowercase">{email}</span></p>
            <p className="text-[10px] font-mono text-amber-500 uppercase tracking-widest">Valid for 5 minutes only.</p>
          </div>

          <div className="space-y-1.5 max-w-xs mx-auto">
            <label className="text-[9px] uppercase tracking-wider text-neutral-500 text-center block">ENTER SECURITY TOKEN OTP</label>
            <input
              type="text"
              required
              maxLength={6}
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
              placeholder="123456"
              className="w-full bg-[#111] border border-neutral-850 rounded p-3 text-center text-sm font-extrabold tracking-[0.5em] text-emerald-450 focus:outline-none focus:border-white font-mono"
            />
          </div>

          <div className="space-y-2 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-white text-black font-extrabold uppercase py-3 rounded text-[10px] tracking-widest hover:bg-neutral-200 transition-colors cursor-pointer"
            >
              {submitting ? 'MEMVERIFIKASI...' : 'VERIFIKASI KODE OTP'}
            </button>

            <button
              type="button"
              onClick={() => {
                fetch('/api/auth/resend-otp', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ email: email.toLowerCase().trim() })
                })
                .then((res) => res.json())
                .then((data) => {
                  alert('Fresh OTP code has been sent directly to your email!');
                })
                .catch((err) => {
                  console.error(err);
                  alert('Gagal mengirim ulang OTP.');
                });
              }}
              className="w-full bg-black text-neutral-450 hover:text-white uppercase font-mono text-[9px] py-1.5 text-center transition cursor-pointer border border-neutral-900 rounded"
            >
              KIRIM ULANG KODE OTP (EMAIL)
            </button>
          </div>
        </form>
      )}

    </div>
  );
}
