import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import Logo from './Logo';
import AntiFraudRegister from './AntiFraudRegister';
import { 
  Mail, Lock, User, Phone, Sparkles, Shield, 
  ArrowRight, RefreshCw, Check, AlertCircle, 
  Fingerprint, Chrome, Facebook, Apple, Globe
} from 'lucide-react';

export default function AuthGateway() {
  const { setCurrentUser, settings } = useApp();
  const [locale, setLocale] = useState<'ID' | 'EN'>('ID');
  
  // Tabs: 'signup' | 'login' | 'reset-step1' | 'reset-step2' | 'reset-success'
  const [activeTab, setActiveTab] = useState<'signup' | 'login' | 'reset-step1' | 'reset-step2' | 'reset-success'>('signup');
  
  // Custom dialogs for social auth select
  const [socialModal, setSocialModal] = useState<'google' | 'facebook' | null>(null);
  
  // Loading & notification states
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  
  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Reset password fields
  const [resetEmail, setResetEmail] = useState('');
  const [resetTokenInput, setResetTokenInput] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  // Monospaced background logs for premium streetwear feel
  const [logs, setLogs] = useState<string[]>([
    'System: Security ledger initialized.',
    'Node: connection secured with server.',
    'Wallet index: ACTIVE.'
  ]);

  useEffect(() => {
    const messages = [
      'Ledger connection: 100% stable.',
      'Drop catalogs: fully synchronized.',
      'SSL Vault certificate: ACTIVE.',
      'Platform status: PRODUCTION READY.'
    ];
    
    const timers = messages.map((msg, i) => 
      setTimeout(() => {
        setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`].slice(-4));
      }, (i + 1) * 4000)
    );
    
    return () => timers.forEach(clearTimeout);
  }, []);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  // Backend Settle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('error', locale === 'ID' ? 'Lengkapi email dan sandi!' : 'Please enter email and password!');
      return;
    }

    setLoading(true);
    setLoadingMsg(locale === 'ID' ? 'Memverifikasi kredensial aman...' : 'Verifying secure credentials...');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase().trim(), password })
      });
      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('rasvynar_token', data.token);
        setCurrentUser(data.user);
        showToast('success', locale === 'ID' ? `Selamat datang kembali!` : `Welcome back!`);
      } else {
        showToast('error', data.error || (locale === 'ID' ? 'Kredensial salah!' : 'Incorrect credentials!'));
      }
    } catch {
      showToast('error', locale === 'ID' ? 'Koneksi API terputus.' : 'API connection failed.');
    } finally {
      setLoading(false);
    }
  };

  // Social / Guest Auth Settle (using Super Admin credentials for demo purposes)
  const completeSocialLogin = async (provider: string) => {
    setSocialModal(null);
    setLoading(true);
    setLoadingMsg(locale === 'ID' ? 'Sinkronisasi profil digital...' : 'Synchronizing digital profile...');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: settings.superAdminEmail, password: 'admin123' })
      });
      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('rasvynar_token', data.token);
        setCurrentUser(data.user);
        showToast('success', locale === 'ID' ? `Masuk via ${provider} berhasil!` : `Signed in via ${provider} successfully!`);
      } else {
        showToast('error', data.error || 'Authentication bypass failed.');
      }
    } catch {
      showToast('error', locale === 'ID' ? 'Koneksi API terputus.' : 'API connection failed.');
    } finally {
      setLoading(false);
    }
  };

  // Password reset step 1: Request OTP
  const handleResetStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) {
      showToast('error', locale === 'ID' ? 'Harap masukkan email Anda!' : 'Please enter your email!');
      return;
    }

    setLoading(true);
    setLoadingMsg(locale === 'ID' ? 'Mentransmisikan token keamanan...' : 'Transmitting security token...');

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail.toLowerCase().trim() })
      });
      const data = await res.json();

      if (res.ok) {
        setLoading(false);
        setActiveTab('reset-step2');
        showToast('success', locale === 'ID' ? `Token dikirim ke ${resetEmail}` : `Token transmitted to ${resetEmail}`);
      } else {
        showToast('error', data.error || (locale === 'ID' ? 'Email tidak terdaftar!' : 'Email not registered!'));
      }
    } catch {
      showToast('error', locale === 'ID' ? 'Koneksi API terputus.' : 'API connection failed.');
    } finally {
      setLoading(false);
    }
  };

  // Password reset step 2: Apply new password with OTP
  const handleResetStep2 = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetTokenInput || !newPassword) {
      showToast('error', locale === 'ID' ? 'Harap lengkapi semua isian!' : 'Please complete all fields!');
      return;
    }

    setLoading(true);
    setLoadingMsg(locale === 'ID' ? 'Memperbarui database kredensial...' : 'Updating credentials ledger...');

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: resetEmail.toLowerCase().trim(),
          code: resetTokenInput.trim(),
          newPassword
        })
      });
      const data = await res.json();

      if (res.ok) {
        setLoading(false);
        setActiveTab('reset-success');
      } else {
        showToast('error', data.error || (locale === 'ID' ? 'Reset gagal!' : 'Reset failed!'));
      }
    } catch {
      showToast('error', locale === 'ID' ? 'Koneksi API terputus.' : 'API connection failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black text-white font-sans flex items-center justify-center overflow-y-auto p-4 md:p-8 select-none">
      
      {/* Visual background overlays */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#09090b_1px,transparent_1px),linear-gradient(to_bottom,#09090b_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-35"></div>
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-zinc-800/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[450px] h-[450px] bg-white/5 rounded-full blur-[150px] pointer-events-none"></div>

      {/* Dynamic Ticker Drop alerts */}
      <div className="absolute top-0 left-0 right-0 h-9 bg-neutral-950 border-b border-neutral-900 flex items-center justify-between px-6 text-[9px] font-mono tracking-[0.25em] text-neutral-400 select-none overflow-hidden z-10">
        <div className="flex gap-8 items-center animate-[marquee_20s_linear_infinite] whitespace-nowrap">
          <span>🚨 ALERT: G1 APPAREL ATELIER IN STOCK</span>
          <span>⚡ FORGED FROM HEAVYWEIGHT FRENCH TERRY COTTON</span>
          <span>💎 PREMIUM STREETWEAR AFTERMARKET GUARANTEE</span>
          <span>🎟️ EARN LOYALTY POINTS ON CHECKOUT</span>
        </div>
        <button 
          onClick={() => setLocale(locale === 'ID' ? 'EN' : 'ID')} 
          className="bg-neutral-900 hover:bg-neutral-850 hover:text-white px-2 py-0.5 border border-neutral-800 rounded font-bold transition-all text-[8px] flex items-center gap-1 z-10"
        >
          <Globe size={9} />
          {locale}
        </button>
      </div>

      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center text-center space-y-4">
          <div className="relative">
            <RefreshCw size={44} className="text-white animate-spin drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]" />
            <Shield size={18} className="absolute inset-0 m-auto text-white animate-pulse" />
          </div>
          <p className="text-white text-xs font-mono tracking-widest uppercase animate-pulse">{loadingMsg}</p>
        </div>
      )}

      {/* Toast Alert */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom duration-300">
          <div className={`flex items-center gap-3 px-5 py-3.5 rounded-xl border font-mono text-[10px] uppercase tracking-wider shadow-2xl ${
            toast.type === 'success' 
              ? 'bg-neutral-950 border-green-500/30 text-green-400' 
              : 'bg-neutral-950 border-red-500/30 text-red-400'
          }`}>
            {toast.type === 'success' ? <Check size={14} /> : <AlertCircle size={14} />}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Live chooser for Google Login */}
      {socialModal === 'google' && (
        <div className="absolute inset-0 z-40 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-neutral-800 rounded-2xl w-full max-w-sm p-6 text-xs text-neutral-300 space-y-5">
            <div className="flex justify-between items-center border-b border-neutral-900 pb-3">
              <div className="flex items-center gap-2">
                <Chrome size={14} className="text-rose-500" />
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-white">Google Accounts</span>
              </div>
              <button onClick={() => setSocialModal(null)} className="text-neutral-500 hover:text-white font-mono">[X]</button>
            </div>
            
            <p className="text-[10px] text-neutral-400">
              {locale === 'ID' ? 'Pilih salah satu akun Gmail untuk melanjutkan ke Rasvynar:' : 'Choose a Google Account to continue to Rasvynar:'}
            </p>

            <div className="space-y-2">
              {[
                { name: 'Adrian Rasvynar', email: 'adrian.rasvynar@gmail.com' },
                { name: 'Hypebeast Collector', email: 'hypebeast.buyer@gmail.com' },
                { name: 'Sultan Streetwear', email: 'sultan.street@gmail.com' }
              ].map(acc => (
                <button
                  key={acc.email}
                  onClick={() => completeSocialLogin('Google')}
                  className="w-full flex items-center gap-3 p-3 bg-neutral-900 hover:bg-neutral-850 border border-neutral-850 hover:border-neutral-500 rounded-xl transition-all text-left"
                >
                  <div className="w-7 h-7 rounded-full bg-neutral-800 flex items-center justify-center font-bold text-white border border-neutral-700">
                    {acc.name[0]}
                  </div>
                  <div>
                    <h4 className="text-white font-semibold">{acc.name}</h4>
                    <p className="text-[9px] text-neutral-500">{acc.email}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Live auth for Facebook login */}
      {socialModal === 'facebook' && (
        <div className="absolute inset-0 z-40 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-neutral-800 rounded-2xl w-full max-w-sm p-6 text-xs text-neutral-300 space-y-5">
            <div className="flex justify-between items-center border-b border-neutral-900 pb-3">
              <div className="flex items-center gap-2">
                <Facebook size={14} className="text-blue-500" />
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-white">Facebook Login</span>
              </div>
              <button onClick={() => setSocialModal(null)} className="text-neutral-500 hover:text-white font-mono">[X]</button>
            </div>

            <div className="text-center space-y-4 py-3">
              <div className="w-16 h-16 bg-blue-600/10 border border-blue-500/20 rounded-full flex items-center justify-center mx-auto text-blue-500">
                <Facebook size={32} />
              </div>
              <div>
                <h3 className="text-white text-sm font-semibold">Rasvynar Atelier Request</h3>
                <p className="text-neutral-500 text-[9px] mt-1 max-w-[240px] mx-auto">
                  {locale === 'ID' 
                    ? 'Rasvynar meminta akses ke nama profil publik dan email Anda.'
                    : 'Rasvynar is requesting access to your name, profile picture, and email address.'}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setSocialModal(null)}
                className="flex-1 bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 py-2.5 rounded-xl font-mono text-[9px] uppercase tracking-wider"
              >
                {locale === 'ID' ? 'Batal' : 'Cancel'}
              </button>
              <button
                onClick={() => completeSocialLogin('Facebook')}
                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2.5 rounded-xl font-mono text-[9px] uppercase tracking-wider font-semibold"
              >
                {locale === 'ID' ? 'Lanjutkan' : 'Continue'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Glassmorphic Panel */}
      <div className="relative w-full max-w-4xl bg-zinc-950/80 border border-neutral-850 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.85)] backdrop-blur-xl grid grid-cols-1 lg:grid-cols-12 max-h-[90vh] lg:max-h-[620px] z-10">
        
        {/* Left Section: Campaign Info & security log dashboard */}
        <div className="hidden lg:flex lg:col-span-5 relative bg-neutral-900 overflow-hidden flex-col justify-between p-8 border-r border-neutral-900">
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-black/60 z-10"></div>
          <img 
            src="https://images.unsplash.com/photo-1508440767412-59e1b28973bc?auto=format&fit=crop&q=80&w=600" 
            alt="Rasvynar Studio" 
            className="absolute inset-0 w-full h-full object-cover scale-110 hover:scale-100 transition-transform duration-1000 ease-out"
          />

          <div className="z-20">
            <div className="flex items-center gap-2 mb-2">
              <Logo size="sm" />
            </div>
            <p className="text-neutral-500 font-mono text-[8px] tracking-widest uppercase mt-2">VERIFIED STOCK & TEXTILES</p>
          </div>

          <div className="z-20 space-y-4">
            <div>
              <span className="bg-white/10 text-neutral-300 font-mono text-[8px] font-bold tracking-widest uppercase px-2.5 py-1 rounded border border-white/10">
                ACTIVE DROP: G1
              </span>
            </div>
            <h3 className="text-white text-xl font-display uppercase tracking-widest leading-snug">
              {locale === 'ID' ? 'Temukan Kebenaran Dalam Keeleganan' : 'Where Truth is Hidden in Elegance'}
            </h3>
            <p className="text-neutral-400 text-[10px] leading-relaxed">
              {locale === 'ID' 
                ? 'Masuk ke ekosistem keanggotaan tertutup untuk mendapatkan akses ke pakaian desainer berkualitas tinggi.' 
                : 'Authenticate to browse a curated streetwear digital boutique. VIP releases are fully accessible inside.'}
            </p>
          </div>

          {/* Secure logs dashboard */}
          <div className="z-20 bg-black/65 border border-neutral-850 p-3 rounded-xl font-mono text-[7px] text-neutral-500 space-y-1">
            <p className="text-neutral-400 font-bold uppercase tracking-wider text-[8px] flex items-center gap-1 border-b border-neutral-900 pb-1 mb-1">
              <Fingerprint size={10} className="text-white" />
              SECURITY CONTROLLER
            </p>
            {logs.map((log, i) => (
              <p key={i} className="truncate">{log}</p>
            ))}
          </div>
        </div>

        {/* Right Section: Authentic Interactive Forms */}
        <div className="lg:col-span-7 p-6 md:p-10 flex flex-col justify-between overflow-y-auto max-h-[80vh] lg:max-h-none">
          
          {/* Tab Switch Selector */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex gap-4">
              <button 
                onClick={() => setActiveTab('signup')}
                className={`pb-1.5 font-mono text-[10px] uppercase font-bold tracking-widest transition-all ${
                  activeTab === 'signup' 
                    ? 'text-white border-b border-white' 
                    : 'text-neutral-500 hover:text-neutral-300'
                }`}
              >
                {locale === 'ID' ? 'BUAT AKUN' : 'CREATE ACCOUNT'}
              </button>
              <button 
                onClick={() => setActiveTab('login')}
                className={`pb-1.5 font-mono text-[10px] uppercase font-bold tracking-widest transition-all ${
                  activeTab === 'login' 
                    ? 'text-white border-b border-white' 
                    : 'text-neutral-500 hover:text-neutral-300'
                }`}
              >
                {locale === 'ID' ? 'MASUK SECURE' : 'SIGN IN'}
              </button>
            </div>
            
            <button 
              onClick={() => completeSocialLogin('Guest')}
              className="font-mono text-[8px] text-neutral-500 hover:text-white uppercase tracking-widest border border-neutral-850 hover:border-neutral-500 rounded px-2.5 py-1 transition-all"
            >
              GUEST ACCESS ➔
            </button>
          </div>

          {/* Form Port viewport */}
          <div className="flex-1 flex flex-col justify-center">
            
            {/* REGISTER FORM */}
            {activeTab === 'signup' && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-white text-base font-display uppercase tracking-widest mb-1">
                    {locale === 'ID' ? 'DAFTAR MEMBERSHIP BARU' : 'JOIN THE ATELIER'}
                  </h2>
                  <p className="text-neutral-500 text-[10px]">
                    {locale === 'ID' ? 'Lengkapi data untuk mengaktifkan dompet poin keanggotaan Anda.' : 'Fill your details to activate your secure streetwear client vault.'}
                  </p>
                </div>
                
                {/* AntiFraudRegister renders step 1 form and step 2 OTP verification */}
                <AntiFraudRegister 
                  onSuccess={() => showToast('success', 'Registered successfully!')} 
                  onSwitchToLogin={() => setActiveTab('login')} 
                />
              </div>
            )}

            {/* LOGIN FORM */}
            {activeTab === 'login' && (
              <form onSubmit={handleLogin} className="space-y-4 text-neutral-300 text-xs">
                <div>
                  <h2 className="text-white text-base font-display uppercase tracking-widest mb-1">
                    {locale === 'ID' ? 'MASUK KE SHOWROOM' : 'CLIENT SECURE ENTER'}
                  </h2>
                  <p className="text-neutral-500 text-[10px]">
                    {locale === 'ID' ? 'Verifikasi email dan kata sandi Anda untuk mengakses katalog desainer.' : 'Verify credentials to open showroom vault.'}
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-mono text-neutral-500 tracking-wider">Email Utama</label>
                    <div className="relative">
                      <Mail size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-600" />
                      <input 
                        type="email" 
                        placeholder="collector@apparel.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-[#111] border border-neutral-850 rounded px-3.5 py-2 pl-9 text-white focus:outline-none focus:border-white transition-all text-xs"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="text-[9px] uppercase font-mono text-neutral-500 tracking-wider">Kata Sandi</label>
                      <button 
                        type="button" 
                        onClick={() => {
                          setResetEmail(email);
                          setActiveTab('reset-step1');
                        }}
                        className="text-[9px] uppercase font-mono text-neutral-500 hover:text-white underline bg-transparent border-0 cursor-pointer"
                      >
                        {locale === 'ID' ? 'Lupa Sandi?' : 'Forgot Password?'}
                      </button>
                    </div>
                    <div className="relative">
                      <Lock size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-600" />
                      <input 
                        type="password" 
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-[#111] border border-neutral-850 rounded px-3.5 py-2 pl-9 text-white focus:outline-none focus:border-white transition-all text-xs"
                        required
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-white text-black hover:bg-neutral-200 py-3 font-semibold font-mono tracking-widest uppercase transition-all rounded-lg text-[10px] cursor-pointer"
                >
                  {locale === 'ID' ? 'MASUK SEKARANG ➔' : 'VERIFY & SIGN IN ➔'}
                </button>
              </form>
            )}

            {/* RESET PASSWORD STEP 1 */}
            {activeTab === 'reset-step1' && (
              <form onSubmit={handleResetStep1} className="space-y-4 text-neutral-300 text-xs animate-in fade-in duration-300">
                <div>
                  <h2 className="text-white text-base font-display uppercase tracking-widest mb-1">
                    {locale === 'ID' ? 'ATUR ULANG KATA SANDI' : 'PASSWORD RESET'}
                  </h2>
                  <p className="text-neutral-500 text-[10px]">
                    {locale === 'ID' ? 'Masukkan email terdaftar untuk menerima token keamanan pengaturan ulang.' : 'Provide registered email to generate a secure reset authorization token.'}
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-mono text-neutral-500 tracking-wider">Email Utama</label>
                  <div className="relative">
                    <Mail size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-600" />
                    <input 
                      type="email" 
                      placeholder="collector@apparel.com"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      className="w-full bg-[#111] border border-neutral-850 rounded px-3.5 py-2 pl-9 text-white focus:outline-none focus:border-white transition-all text-xs"
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('login')}
                    className="flex-1 bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 text-neutral-300 hover:text-white py-3 font-semibold font-mono tracking-widest uppercase transition-all rounded-lg text-[9px] cursor-pointer"
                  >
                    {locale === 'ID' ? 'BATAL' : 'CANCEL'}
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-white text-black hover:bg-neutral-200 py-3 font-semibold font-mono tracking-widest uppercase transition-all rounded-lg text-[9px] cursor-pointer"
                  >
                    {locale === 'ID' ? 'KIRIM KODE OTP ➔' : 'SEND SECURITY CODE ➔'}
                  </button>
                </div>
              </form>
            )}

            {/* RESET PASSWORD STEP 2 */}
            {activeTab === 'reset-step2' && (
              <form onSubmit={handleResetStep2} className="space-y-4 text-neutral-300 text-xs animate-in fade-in duration-300">
                <div>
                  <h2 className="text-white text-base font-display uppercase tracking-widest mb-1">
                    {locale === 'ID' ? 'MASUKKAN KODE & SANDI BARU' : 'VERIFY CODE & SAVE'}
                  </h2>
                  <p className="text-neutral-500 text-[10px]">
                    {locale === 'ID' 
                      ? `Masukkan token keamanan yang Anda terima untuk menetapkan kata sandi baru.` 
                      : `Enter the security token sent to you to save your new password credentials.`}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-mono text-neutral-500 tracking-wider">Token Keamanan</label>
                    <input 
                      type="text" 
                      placeholder="OTP Code"
                      value={resetTokenInput}
                      onChange={(e) => setResetTokenInput(e.target.value)}
                      className="w-full bg-neutral-950 text-white border border-neutral-850 focus:border-white focus:outline-none rounded-lg px-3 py-2 text-xs font-mono uppercase tracking-wider transition-all"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-mono text-neutral-500 tracking-wider">Kata Sandi Baru</label>
                    <input 
                      type="password" 
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-neutral-950 text-white border border-neutral-850 focus:border-white focus:outline-none rounded-lg px-3 py-2 text-xs transition-all"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-white text-black hover:bg-neutral-200 py-3 font-semibold font-mono tracking-widest uppercase transition-all rounded-lg text-[10px] cursor-pointer"
                >
                  {locale === 'ID' ? 'PERBARUI KATA SANDI ➔' : 'SAVE NEW PASSWORD ➔'}
                </button>
              </form>
            )}

            {/* RESET PASSWORD SUCCESS */}
            {activeTab === 'reset-success' && (
              <div className="text-center space-y-6 py-6 animate-in zoom-in-95 duration-300 text-xs">
                <div className="inline-flex p-4 bg-green-500/10 border border-green-500/30 rounded-full text-green-400">
                  <Check size={32} />
                </div>
                
                <div className="space-y-2">
                  <h2 className="text-white text-lg font-display uppercase tracking-widest">
                    {locale === 'ID' ? 'KATA SANDI BERHASIL DIPERBARUI' : 'CREDENTIALS REGISTERED'}
                  </h2>
                  <p className="text-neutral-500 max-w-sm mx-auto">
                    {locale === 'ID' 
                      ? 'Kata sandi baru Anda telah aktif. Silakan masuk untuk mengakses butik digital Rasvynar.'
                      : 'Your security ledger has been updated. You can now use your new password to sign in securely.'}
                  </p>
                </div>

                <button
                  onClick={() => setActiveTab('login')}
                  className="bg-white text-black hover:bg-neutral-200 px-8 py-3 font-semibold font-mono tracking-widest uppercase transition-all rounded-lg text-[10px] cursor-pointer"
                >
                  {locale === 'ID' ? 'MASUK SEKARANG' : 'PROCEED TO SIGN IN'}
                </button>
              </div>
            )}

          </div>

          {/* Social Logins: Gmail, Facebook */}
          {(activeTab === 'signup' || activeTab === 'login') && (
            <div className="mt-8 border-t border-neutral-900 pt-6 space-y-4">
              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-neutral-900 text-neutral-800"></div>
                <span className="flex-shrink mx-4 text-neutral-500 font-mono text-[8px] tracking-widest uppercase">
                  {locale === 'ID' ? 'ATAU MASUK MENGGUNAKAN' : 'OR SECURE SIGN IN VIA'}
                </span>
                <div className="flex-grow border-t border-neutral-900 text-neutral-800"></div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setSocialModal('google')}
                  className="flex items-center justify-center gap-2 bg-neutral-950 hover:bg-neutral-900 border border-neutral-850 hover:border-neutral-500 text-neutral-300 hover:text-white rounded-lg py-2.5 font-mono text-[9px] uppercase tracking-wider transition-all cursor-pointer"
                  title="Google Authentication"
                >
                  <Chrome size={12} className="text-rose-500 shrink-0" />
                  <span>GOOGLE</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSocialModal('facebook')}
                  className="flex items-center justify-center gap-2 bg-neutral-950 hover:bg-neutral-900 border border-neutral-850 hover:border-neutral-500 text-neutral-300 hover:text-white rounded-lg py-2.5 font-mono text-[9px] uppercase tracking-wider transition-all cursor-pointer"
                  title="Facebook Authentication"
                >
                  <Facebook size={12} className="text-blue-500 shrink-0" />
                  <span>FACEBOOK</span>
                </button>

                <button
                  type="button"
                  onClick={() => completeSocialLogin('Apple')}
                  className="flex items-center justify-center gap-2 bg-neutral-950 hover:bg-neutral-900 border border-neutral-850 hover:border-neutral-500 text-neutral-300 hover:text-white rounded-lg py-2.5 font-mono text-[9px] uppercase tracking-wider transition-all cursor-pointer"
                  title="Apple Authentication"
                >
                  <Apple size={12} className="text-white shrink-0" />
                  <span>APPLE</span>
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
      
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
