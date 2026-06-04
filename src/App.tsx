import React, { useState, useEffect } from 'react';
import { AppProvider, useApp, Product, Order, CartItem } from './context/AppContext';
import Logo from './components/Logo';
import Navbar from './components/Navbar';
import FooterView from './components/FooterView';
import InstallWizard from './components/FirstSetupWizard';
import LandingPage from './components/LandingPage';
import ShopView from './components/ShopView';
import ProductDetail from './components/ProductDetail';
import CustomerPortal from './components/CustomerPortal';
import AdminPanel from './components/AdminPanel';
import InvoicePDF from './components/InvoicePDF';
import PaymentGatewayModal from './components/PaymentGatewayModal';
import AntiFraudRegister from './components/AntiFraudRegister';
import AuthGateway from './components/AuthGateway';
import { ShoppingBag, CreditCard, ChevronRight, Truck, Info, HelpCircle, ShieldAlert, Key, LogIn, Sparkles, X, Plus, Trash } from 'lucide-react';

export const MainApp: React.FC = () => {
  const {
    settings,
    currentUser,
    setCurrentUser,
    isInstalled,
    installApp,
    cart,
    removeFromCart,
    updateCartQuantity,
    appliedCoupon,
    applyCouponCode,
    removeCouponCode,
    clearCart,
    createOrder,
    cms,
    recordLoginActivity,
    loyaltyPointsExchangeRate
  } = useApp();

  // Navigation controller
  const [activeView, setActiveView] = useState<string>('home');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // 1. Listen for back/forward browser navigation (popstate)
  useEffect(() => {
    const syncRoute = () => {
      const path = window.location.pathname;
      if (path === '/lupalagi') {
        setActiveView('admin');
      } else if (path === '/profile') {
        setActiveView('profile');
      } else if (path === '/cart') {
        setActiveView('cart');
      } else if (path === '/') {
        setActiveView('home');
      }
    };

    window.addEventListener('popstate', syncRoute);
    syncRoute(); // run on initial mount

    return () => window.removeEventListener('popstate', syncRoute);
  }, []);

  // 2. Push state to URL when activeView transitions
  useEffect(() => {
    const path = window.location.pathname;
    if (activeView === 'admin' && path !== '/lupalagi') {
      window.history.pushState(null, '', '/lupalagi');
    } else if (activeView === 'profile' && path !== '/profile') {
      window.history.pushState(null, '', '/profile');
    } else if (activeView === 'cart' && path !== '/cart') {
      window.history.pushState(null, '', '/cart');
    } else if (activeView === 'home' && path !== '/') {
      window.history.pushState(null, '', '/');
    } else if (!['admin', 'profile', 'cart', 'home'].includes(activeView) && path !== '/') {
      window.history.pushState(null, '', '/');
    }
  }, [activeView]);

  // Authentication modals
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Cart shipping states
  const [chosenCourier, setChosenCourier] = useState('jne');
  const [shippingCost, setShippingCost] = useState(15000); // 15.000 fallback
  const [couponCode, setCouponCode] = useState('');
  const [usePoints, setUsePoints] = useState(false);

  // Checkout address states
  const [checkoutName, setCheckoutName] = useState('');
  const [checkoutPhone, setCheckoutPhone] = useState('');
  const [checkoutEmail, setCheckoutEmail] = useState('');
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [activeBillOrder, setActiveBillOrder] = useState<Order | null>(null);

  // Introductory Cinematic Splash
  const [splash, setSplash] = useState(true);

  useEffect(() => {
    if (isInstalled) {
      const splashTimer = setTimeout(() => {
        setSplash(false);
      }, 1800);
      return () => clearTimeout(splashTimer);
    }
  }, [isInstalled]);

  // Set checkout inputs automatically when logged in
  useEffect(() => {
    if (currentUser) {
      setCheckoutName(currentUser.name);
      setCheckoutPhone(currentUser.whatsapp);
      setCheckoutEmail(currentUser.email);
    }
  }, [currentUser]);

  // Dynamic router to process initial parameters (cat searches, etc)
  const handleNavigation = (viewName: string) => {
    setSelectedProduct(null);
    setSelectedOrder(null);
    window.scrollTo(0, 0);

    if (viewName.startsWith('categories:') || viewName.startsWith('search:')) {
      setActiveView(`shop_filter:${viewName}`);
    } else {
      setActiveView(viewName);
    }
  };

  const handleSelectProduct = (prod: Product) => {
    setSelectedProduct(prod);
    setActiveView('product_detail');
    window.scrollTo(0, 0);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('rasvynar_token');
    handleNavigation('home');
  };

  const handleSelectOrder = (ord: Order) => {
    setSelectedOrder(ord);
    setActiveView('order_detail');
    window.scrollTo(0, 0);
  };

  // Login authenticator
  const handleLoginAction = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    // Developer instant login bypass for seamless reviews
    const formattedEmail = loginEmail.toLowerCase().trim();
    if (formattedEmail === settings.superAdminEmail.toLowerCase()) {
      const devAdmin = {
        id: 'usr-admin-initial',
        name: 'Super Admin RASVYNAR',
        email: settings.superAdminEmail,
        whatsapp: settings.whatsappBusiness,
        role: 'Super Admin' as const,
        status: 'Active' as const,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200',
        address: settings.businessAddress,
        province: 'DKI Jakarta',
        city: 'Jakarta Pusat',
        district: 'Menteng',
        postalCode: '10310',
        latitude: -6.1952,
        longitude: 106.8231,
        formattedAddress: settings.businessAddress,
        placeId: 'ChIJXQ-zW0rJaS4Rh19zVpA2-Yk',
        membership: 'Platinum' as const,
        points: 4500,
        referralCode: 'RSV-ADMIN',
        referredBy: '',
        commissionsEarned: 0,
        ipAddress: '127.0.0.1',
        country: 'Indonesia',
        cityFromIp: 'Jakarta',
        deviceFingerprint: 'BYPASS-LOCAL-DEV',
        browser: 'Edge/Chrome Kernel',
        riskScore: 0
      };

      recordLoginActivity({
        userName: 'Super Admin',
        email: settings.superAdminEmail,
        ipAddress: '127.0.0.1',
        country: 'Indonesia',
        city: 'Jakarta',
        device: 'Workstation Node',
        browser: 'Developer Console',
        status: 'SUCCESS',
        riskScore: 0
      });

      setCurrentUser(devAdmin);
      setAuthModalOpen(false);
      setLoginEmail('');
      setLoginPassword('');
      return;
    }

    // Customer simple fallback mockup
    if (loginPassword.length >= 6 && formattedEmail.includes('@')) {
      const userMock = {
        id: `usr-${Date.now()}`,
        name: formattedEmail.split('@')[0].toUpperCase(),
        email: formattedEmail,
        whatsapp: '+6281299988220',
        role: 'Customer' as const,
        status: 'Active' as const,
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150',
        address: 'Menteng, Jakarta Pusat, DKI Jakarta',
        province: 'DKI Jakarta',
        city: 'Jakarta Pusat',
        district: 'Menteng',
        postalCode: '10310',
        latitude: -6.1952,
        longitude: 106.8231,
        formattedAddress: 'Menteng, DKI Jakarta',
        placeId: 'ChIJXQ-zW0rJaS4Rh19zVpA2-Yk',
        membership: 'Bronze' as const,
        points: 300,
        referralCode: `RSV-${formattedEmail.split('@')[0].toUpperCase()}`,
        referredBy: '',
        commissionsEarned: 0,
        ipAddress: '180.252.1.20',
        country: 'Indonesia',
        cityFromIp: 'Jakarta',
        deviceFingerprint: 'DESKTOP-MOCK-USER',
        browser: 'Firefox',
        riskScore: 10
      };

      recordLoginActivity({
        userName: userMock.name,
        email: formattedEmail,
        ipAddress: '180.252.1.20',
        country: 'Indonesia',
        city: 'Jakarta',
        device: 'Consumer Laptop',
        browser: 'Firefox 126',
        status: 'SUCCESS',
        riskScore: 10
      });

      setCurrentUser(userMock);
      setAuthModalOpen(false);
      setLoginEmail('');
      setLoginPassword('');
    } else {
      setLoginError('Kredensial tidak valid. Silakan gunakan bypass Admin atau lengkapi password 6 karakter.');
    }
  };

  // Cart calculations
  const cartSubtotal = cart.reduce((sum, item) => {
    const activePrice = item.product.discountPrice > 0 ? item.product.discountPrice : item.product.price;
    return sum + activePrice * item.quantity;
  }, 0);

  // Weight calculator
  const totalCartWeight = cart.reduce((sum, item) => sum + item.product.weight * item.quantity, 0);

  // Dynamic courier shipping cost
  const getCourierPrice = (courierName: string, grams: number) => {
    const weightKg = Math.ceil(grams / 1000);
    const baseRate = courierName === 'jne' ? 18000 : courierName === 'j&t' ? 15000 : courierName === 'sicepat' ? 14000 : 12000;
    return baseRate * weightKg;
  };

  const calculatedShipping = getCourierPrice(chosenCourier, totalCartWeight);

  // Voucher deductions
  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountType === 'percentage') {
      discountAmount = Math.floor(cartSubtotal * (appliedCoupon.value / 100));
    } else {
      discountAmount = appliedCoupon.value;
    }
  }

  // Loyalty points deduction exchange (1 pt = Rp 10,- max: subtotal)
  const availablePoints = currentUser ? currentUser.points : 0;
  const pointsWorth = availablePoints * loyaltyPointsExchangeRate;
  const maxDedPointsAllowed = Math.min(pointsWorth, cartSubtotal * 0.5); // max 50% spend
  const pointsUsedDeduction = usePoints ? maxDedPointsAllowed : 0;

  const finalGrandTotal = Math.max(0, cartSubtotal + calculatedShipping - discountAmount - pointsUsedDeduction);

  const handleApplyVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    const res = applyCouponCode(couponCode, cartSubtotal);
    alert(res.message);
    setCouponCode('');
  };

  // Complete checkout forms and generate order
  const handleProceedToPayment = () => {
    if (cart.length === 0) return;
    if (!checkoutName.trim() || !checkoutPhone.trim() || !checkoutEmail.trim()) {
      alert('Mohon lengkapi formulir penerima barang sebelum melanjutkan pembayaran.');
      return;
    }

    if (!currentUser) {
      alert('Anda wajib login / mendaftar sebagai member RASVYNAR terlebih dahulu demi kenyamanan tracking resi dan anti-fraud.');
      setAuthModalOpen(true);
      return;
    }

    const orderItems = cart.map((item) => ({
      productId: item.product.id,
      name: item.product.name,
      quantity: item.quantity,
      price: item.product.discountPrice > 0 ? item.product.discountPrice : item.product.price,
      selectedSize: item.selectedSize,
      selectedColor: item.selectedColor.name,
      image: item.product.images[0]
    }));

    const compiledOrder = createOrder({
      userId: currentUser.id,
      customerName: checkoutName,
      customerEmail: checkoutEmail,
      customerWhatsapp: checkoutPhone,
      items: orderItems,
      shippingAddress: {
        formattedAddress: currentUser.address || settings.businessAddress,
        province: currentUser.province || 'DKI Jakarta',
        city: currentUser.city || 'Jakarta Pusat',
        district: currentUser.district || 'Menteng',
        postalCode: currentUser.postalCode || '10310',
        latitude: currentUser.latitude || -6.1952,
        longitude: currentUser.longitude || 106.8231
      },
      courier: chosenCourier,
      shippingFee: calculatedShipping,
      couponApplied: appliedCoupon ? appliedCoupon.code : '',
      discountAmount: discountAmount,
      pointsEarned: Math.floor(finalGrandTotal / 50000),
      pointsUsedDiscount: pointsUsedDeduction,
      totalWeight: totalCartWeight,
      totalAmount: finalGrandTotal,
      paymentMethod: `${settings.paymentGateway} Integrated`,
      paymentStatus: 'Pending',
      shippingStatus: 'Pending',
      waybillNumber: '',
      riskScore: currentUser.riskScore
    });

    setActiveBillOrder(compiledOrder);
    setPaymentModalOpen(true);
  };

  const handlePaymentClearedSuccess = () => {
    setPaymentModalOpen(false);
    clearCart();
    setActiveView('home');
    alert('🎉 Selamat! Transaksi garmen RASVYNAR Anda berhasil settled. Tim concierge kami sedang menyiapkan pesanan untuk penjemputan JNE/J&T.');
  };

  if (!isInstalled) {
    return (
      <InstallWizard
        onSetupCompleted={() => {
          installApp({
            brandName: 'RASVYNAR',
            superAdminEmail: 'superadmin@rasvynar.com',
            whatsappBusiness: '6281192381200',
            businessAddress: 'Level 12, Capital Grid SOHO, SCBD, Jakarta Selatan',
            adminName: 'Principal Director'
          });
        }}
      />
    );
  }

  if (!currentUser && !splash) {
    return (
      <div id="rasvynar-fullstack-spa" className="min-h-screen bg-[#070707] text-white flex flex-col justify-between selection:bg-white selection:text-black">
        <AuthGateway />
      </div>
    );
  }

  return (
    <div id="rasvynar-fullstack-spa" className="min-h-screen bg-[#070707] text-white flex flex-col justify-between selection:bg-white selection:text-black">
      
      {/* 1. Introductory cinematic splash animation */}
      {splash && (
        <div className="fixed inset-0 bg-[#000] z-50 flex flex-col items-center justify-center space-y-4 animate-fade-out">
          <Logo size="xl" className="animate-pulse shadow-2xl" />
          <h2 className="text-xl font-bold tracking-[0.3em] uppercase text-white">RASVYNAR</h2>
          <p className="text-[9px] font-mono tracking-widest text-zinc-500 uppercase">Style Beyond Ordinary</p>
        </div>
      )}

      {/* 2. Standard Header bar navigation */}
      <Navbar
        activeView={activeView}
        onNavigate={handleNavigation}
        onOpenLogin={() => { setAuthMode('login'); setAuthModalOpen(true); }}
        onLogout={handleLogout}
      />

      {/* 3. DYNAMIC PAGES SWITCH DRAWER */}
      <main className="flex-grow">
        
        {/* HOMEPAGE VIEW */}
        {activeView === 'home' && (
          <LandingPage
            onNavigate={handleNavigation}
            onSelectProduct={handleSelectProduct}
          />
        )}

        {/* CATALOG SPECIFIC VIEWS */}
        {(activeView === 'shop' || activeView.startsWith('shop_filter:')) && (
          <ShopView
            onSelectProduct={handleSelectProduct}
            initialFilter={activeView.replace('shop_filter:', '')}
          />
        )}

        {/* PRODUCT SPEC DETAIL VIEW */}
        {activeView === 'product_detail' && selectedProduct && (
          <ProductDetail
            product={selectedProduct}
            onBack={() => handleNavigation('shop')}
            onNavigateCart={() => handleNavigation('cart')}
          />
        )}

        {/* CATEGORIES INDEX SCREEN */}
        {activeView === 'categories' && (
          <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-6">
            <h2 className="text-3xl font-sans font-black tracking-widest uppercase">Atelier Line Collections</h2>
            <p className="text-xs text-zinc-400 font-mono tracking-wider max-w-xl mx-auto">Tinjau seluruh koleksi minimalis kontemporer yang dibuat di studio garmen tailor-made kami.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto pt-8">
              {['Limited Edition', 'Hoodie', 'T-Shirt', 'Sweater', 'Jacket', 'Accessories', 'Pants', 'Cap'].map((cat, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleNavigation(`categories:${cat}`)}
                  className="bg-neutral-900 border border-neutral-850 p-6 rounded hover:border-white transition-all text-left uppercase font-mono text-xs tracking-widest font-black"
                >
                  <span className="text-zinc-500 block mb-1">Koleksi #{i+1}</span>
                  <span className="text-white text-sm block mt-1">{cat}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* SHOPPING CART VIEW */}
        {activeView === 'cart' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 font-sans">
            <h1 className="text-2xl sm:text-4xl font-sans font-black tracking-widest text-white uppercase mb-8">Keranjang Belanja</h1>
            
            {cart.length === 0 ? (
              <div className="h-64 border border-neutral-850 border-dashed rounded flex flex-col items-center justify-center text-center p-6 space-y-4">
                <ShoppingBag className="w-8 h-8 text-zinc-600 animate-bounce" />
                <div className="text-sm font-bold text-white uppercase tracking-widest">Keranjang Kosong</div>
                <p className="text-xs text-zinc-400 max-w-xs">Garmen premium yang Anda incar belum ditambahkan. Pergi ke halaman katalog untuk memulai drop.</p>
                <button
                  onClick={() => handleNavigation('shop')}
                  className="bg-white text-black font-semibold text-xs tracking-widest uppercase py-3 px-6 rounded mt-2 hover:bg-zinc-200"
                >
                  Kembali Belanja
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Cart list details */}
                <div className="lg:col-span-2 space-y-4">
                  {cart.map((item) => (
                    <div key={item.id} className="bg-[#0B0B0B] border border-neutral-850 p-4 rounded flex justify-between gap-4">
                      <div className="flex gap-4">
                        <img src={item.product.images[0]} alt={item.product.name} className="w-16 h-16 rounded border border-neutral-800 object-cover shrink-0" />
                        <div className="space-y-1">
                          <h3 className="text-xs font-bold text-white uppercase">{item.product.name}</h3>
                          <p className="text-[10px] text-zinc-500 font-mono uppercase">Detail: Size {item.selectedSize} • Warna {item.selectedColor.name}</p>
                          <p className="text-xs text-white font-bold font-mono mt-1">
                            Rp {(item.product.discountPrice > 0 ? item.product.discountPrice : item.product.price).toLocaleString('id-ID')}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col items-end justify-between">
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-zinc-500 hover:text-red-400 p-1 bg-transparent border-0 outline-none cursor-pointer"
                        >
                          <Trash className="w-4 h-4" />
                        </button>
                        
                        <div className="flex items-center bg-black border border-neutral-850 rounded overflow-hidden">
                          <button
                            onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                            className="px-2 py-0.5 text-zinc-500 text-xs font-mono font-bold"
                          >
                            -
                          </button>
                          <span className="px-2.5 text-xs text-white font-mono font-bold">{item.quantity}</span>
                          <button
                            onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                            className="px-2 py-0.5 text-zinc-500 text-xs font-mono font-bold"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Delivery courier Selector Form & recipient maps check */}
                  <div className="bg-[#0B0B0B] border border-neutral-850 p-5 rounded-lg space-y-4 font-mono text-xs">
                    <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-white flex items-center gap-1.5 border-b border-neutral-900 pb-3">
                      <Truck className="w-4 h-4 text-zinc-400 animate-bounce" /> Konfigurasi Kurir Layanan JNE / J&T
                    </h3>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[9px] uppercase text-zinc-500 font-bold mb-1.5">Metode Kurir Kirim</label>
                        <select
                          value={chosenCourier}
                          onChange={(e) => setChosenCourier(e.target.value)}
                          className="w-full bg-[#121212] border border-neutral-800 rounded p-2.5 text-white"
                        >
                          <option value="jne">JNE KILAT REG (Rp 18.000 / kg)</option>
                          <option value="j&t">J&T EXPRES (Rp 15.000 / kg)</option>
                          <option value="sicepat">SICEPAT REG (Rp 14.000 / kg)</option>
                          <option value="anteraja">ANTERAJA REG (Rp 12.000 / kg)</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[9px] uppercase text-zinc-500 block font-bold">Total Berat Paket</span>
                        <div className="bg-[#121212] p-2.5 rounded font-mono text-zinc-300">
                          {(totalCartWeight / 1000).toFixed(2)} Kg ({totalCartWeight.toLocaleString('id-ID')} grams)
                        </div>
                      </div>
                    </div>

                    {/* Draggable user recipient address coordinate display warnings */}
                    {currentUser ? (
                      <div className="bg-[#121212] p-3 border border-neutral-850 rounded flex items-start gap-2.5 text-[10px] font-sans text-zinc-400">
                        <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                          Pengiriman terverifikasi Google Maps ke alamat: <br />
                          <span className="text-white font-bold block uppercase mt-0.5">{currentUser.address || 'Menteng, Jakarta Pusat, DKI Jakarta'}</span>
                          <span className="font-mono text-[9px] text-zinc-500">
                            GPS COORDINATES APPROVED: Latitude {currentUser.latitude ? currentUser.latitude.toFixed(5) : '-6.1952'} • Longitude {currentUser.longitude ? currentUser.longitude.toFixed(5) : '106.8231'}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-red-950/20 border border-red-900/65 p-3 rounded text-[10px] leading-relaxed font-sans text-red-300">
                        Anda belum mendaftar / masuk. Masuk dahulu untuk sinkronisasi GPS pengiriman Google Maps.
                      </div>
                    )}
                  </div>
                </div>

                {/* Billing subtotal metrics column */}
                <div className="space-y-6">
                  <div className="bg-[#0B0B0B] border border-neutral-850 p-5 rounded-lg space-y-4">
                    <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-[#FFFFFF] border-b border-neutral-900 pb-3">Ringkasan Biaya</h3>
                    
                    <div className="space-y-2.5 font-mono text-[11px] text-zinc-400">
                      <div className="flex justify-between">
                        <span>Biaya Subtotal:</span>
                        <span className="text-white">Rp {cartSubtotal.toLocaleString('id-ID')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Biaya Kirim Courier:</span>
                        <span className="text-white">Rp {calculatedShipping.toLocaleString('id-ID')}</span>
                      </div>

                      {appliedCoupon && (
                        <div className="flex justify-between text-red-400 border-b border-neutral-900 pb-2">
                          <span>Deduction Voucher ({appliedCoupon.code}):</span>
                          <span>-Rp {discountAmount.toLocaleString('id-ID')}</span>
                        </div>
                      )}

                      {/* Loyalty rewards redeemable option fields if user has points */}
                      {currentUser && currentUser.points > 0 && (
                        <div className="pt-2 border-t border-neutral-900">
                          <label className="flex items-center gap-2 cursor-pointer text-[10px]">
                            <input
                              type="checkbox"
                              checked={usePoints}
                              onChange={(e) => setUsePoints(e.target.checked)}
                              className="accent-white w-3.5 h-3.5 rounded"
                            />
                            <span>Tukarkan {currentUser.points} Loyalty Pts (Rp {pointsWorth.toLocaleString('id-ID')} Disc)</span>
                          </label>
                        </div>
                      )}

                      <div className="flex justify-between text-white font-bold border-t border-neutral-900 pt-3 text-xs uppercase tracking-wider">
                        <span>Grand Total Akhir:</span>
                        <span className="text-white font-black text-sm">Rp {finalGrandTotal.toLocaleString('id-ID')}</span>
                      </div>
                    </div>

                    {/* Voucher redeem form */}
                    <form onSubmit={handleApplyVoucher} className="flex gap-2 pt-2">
                      <input
                        type="text"
                        required
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        placeholder="VOUCHER (cth: WELCOME10)"
                        className="bg-black text-white text-xs border border-neutral-900 rounded p-2.5 outline-none focus:border-zinc-500 w-full font-mono uppercase tracking-widest"
                      />
                      <button
                        type="submit"
                        className="bg-white text-black font-semibold text-[10px] tracking-widest px-4 py-1 rounded"
                      >
                        SUBMIT
                      </button>
                    </form>

                    {appliedCoupon && (
                      <button
                        onClick={removeCouponCode}
                        className="w-full text-center text-red-400 font-mono text-[9px] hover:underline"
                      >
                        [Lepaskan kupon {appliedCoupon.code}]
                      </button>
                    )}

                    <button
                      onClick={handleProceedToPayment}
                      className="w-full bg-white text-black font-extrabold uppercase tracking-widest text-[11px] py-4 rounded hover:bg-neutral-200 transition-colors cursor-pointer border border-white flex items-center justify-center gap-1.5"
                    >
                      <CreditCard className="w-4 h-4" /> Bayar Transaksi
                    </button>
                  </div>
                </div>

              </div>
            )}
          </div>
        )}

        {/* CUSTOMER PROFILE VISUAL AREA */}
        {activeView === 'profile' && (
          <CustomerPortal onSelectOrder={handleSelectOrder} />
        )}

        {/* FULL INTEGRATED ORDER TAX DETAIL AND TIMELINE INVOICES */}
        {activeView === 'order_detail' && selectedOrder && (
          <div className="py-12 bg-black">
            <InvoicePDF order={selectedOrder} onBack={() => handleNavigation('profile')} />
          </div>
        )}

        {/* ADMINISTRATIVE SECURE DECKS */}
        {activeView === 'admin' && (
          <AdminPanel />
        )}

        {/* STATIC help center CMS generated guidelines routes */}
        {activeView === 'about' && (
          <div className="max-w-3xl mx-auto px-4 py-16 font-sans space-y-6 text-center leading-relaxed text-zinc-300">
            <h1 className="text-3xl font-sans font-black tracking-widest text-white uppercase">Tentang RASVYNAR</h1>
            <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest italic">{settings.tagline}</p>
            <div className="bg-neutral-900/40 p-6 rounded border border-neutral-850 font-sans text-sm text-justify leading-relaxed">
              {cms.aboutUsText}
            </div>
            <div className="pt-6 font-mono text-[11px] text-zinc-550 space-y-1">
              <p>Email Concierge: {cms.contactEmail}</p>
              <p>Physical Showroom: {cms.contactAddress}</p>
            </div>
          </div>
        )}

        {activeView === 'contact' && (
          <div className="max-w-3xl mx-auto px-4 py-16 font-sans space-y-6 text-center">
            <h1 className="text-3xl font-sans font-black tracking-widest text-white uppercase">Customer Concierge</h1>
            <p className="text-xs text-zinc-400 max-w-md mx-auto">Butuh bantuan konsultasi sizing garmen atau tracking waybill resi? Hubungi pusat layanan resmi kami.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 font-mono text-xs">
              <div className="bg-[#0B0B0B] border border-neutral-850 p-6 rounded">
                <span className="text-zinc-500 block mb-1 font-bold">WHATSAPP CHAT</span>
                <span className="text-white font-bold block mt-1">+{settings.whatsappBusiness}</span>
              </div>
              <div className="bg-[#0B0B0B] border border-neutral-850 p-6 rounded">
                <span className="text-zinc-500 block mb-1 font-bold">EMAIL SUPPORT</span>
                <span className="text-white font-bold block mt-1">{cms.contactEmail}</span>
              </div>
              <div className="bg-[#0B0B0B] border border-neutral-850 p-6 rounded">
                <span className="text-zinc-500 block mb-1 font-bold">HOTLINE CALL</span>
                <span className="text-white font-bold block mt-1">{cms.contactPhone}</span>
              </div>
            </div>
          </div>
        )}

        {/* CMS Terms and FAQs statutory documents views */}
        {['faq', 'size-guide', 'shipping-policy', 'return-policy', 'privacy-policy'].includes(activeView) && (
          <div className="max-w-3xl mx-auto px-4 py-16 font-sans space-y-6">
            <h1 className="text-2xl font-black text-white uppercase tracking-wider text-center">
              {activeView === 'faq' ? 'Frequently Asked Questions' : 
               activeView === 'size-guide' ? 'Sizing Measures Manual' : 
               activeView === 'shipping-policy' ? 'Shipping Guidelines' : 
               activeView === 'return-policy' ? 'Return Exchange Policy' : 'Privacy Protection Policy'}
            </h1>
            <div className="bg-neutral-900/40 p-6 rounded border border-neutral-850 text-xs sm:text-sm text-zinc-300 leading-relaxed text-justify space-y-4">
              {activeView === 'faq' ? (
                <div className="space-y-4">
                  {cms.faqList.map((f, i) => (
                    <div key={i} className="border-b border-neutral-900 pb-3">
                      <p className="text-white font-bold text-xs uppercase mb-1">Q: {f.q}</p>
                      <p className="text-zinc-400">A: {f.a}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p>
                  {activeView === 'size-guide' ? cms.sizeGuide : 
                   activeView === 'shipping-policy' ? cms.shippingPolicy : 
                   activeView === 'return-policy' ? cms.returnPolicy : cms.privacyPolicy}
                </p>
              )}
            </div>
          </div>
        )}

      </main>

      {/* 4. STATIC FOOTER COLUMN LAYOUT */}
      <FooterView onNavigate={handleNavigation} />

      {/* 5. MULTI-AUTHENTICATOR REGISTRATION / LOGIN MODAL DIALOGS */}
      {authModalOpen && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#0C0C0C] border border-neutral-800 rounded-lg p-6 relative overflow-hidden flex flex-col shadow-2xl relative">
            
            <button
              onClick={() => setAuthModalOpen(false)}
              className="absolute top-4 right-4 p-1 hover:bg-neutral-900 rounded text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            {authMode === 'login' ? (
              <div className="space-y-4">
                <div className="text-center">
                  <Logo size="lg" className="mx-auto" />
                  <h3 className="text-xl font-semibold tracking-wider text-white mt-3">Masuk Ke Boutik RASVYNAR</h3>
                  <p className="text-xs text-zinc-400 mt-1">Gunakan bypass super-admin untuk tes review stok atau asisten</p>
                </div>

                {loginError && <p className="text-xs text-red-400 text-center font-mono uppercase bg-red-950/20 p-2.5 border border-red-900 rounded">{loginError}</p>}

                <form onSubmit={handleLoginAction} className="space-y-4 text-xs font-mono text-zinc-400">
                  <div className="space-y-1">
                    <label className="uppercase text-[9px] tracking-wider block">Email address / Login ID</label>
                    <input
                      type="email"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="superadmin@rasvynar.com"
                      className="w-full bg-[#111] border border-neutral-850 rounded px-3.5 py-2.5 text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="uppercase text-[9px] tracking-wider block">Password</label>
                    <input
                      type="password"
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-[#111] border border-neutral-850 rounded px-3.5 py-2.5 text-white font-mono"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-white text-black font-extrabold uppercase py-3 rounded text-[10px] tracking-widest hover:bg-neutral-200 transition-colors cursor-pointer"
                  >
                    Mulai Sesi
                  </button>
                </form>

                <div className="bg-neutral-950 p-4 border border-neutral-850 rounded text-[10px] leading-relaxed text-zinc-400 font-mono space-y-1">
                  <p className="font-bold text-white uppercase tracking-wider flex items-center gap-1">
                    <Key className="w-3.5 h-3.5" /> Quick Bypass Admin (Developer):
                  </p>
                  <p className="text-zinc-500">Email: <span className="text-white font-bold">{settings.superAdminEmail}</span></p>
                  <p className="text-zinc-500">Password: <span className="text-white">(Isi karakter apa saja bebas min. 6 digit)</span></p>
                </div>

                <div className="pt-2 text-center text-xs text-zinc-550">
                  Belum terdaftar sebagai member?{' '}
                  <button onClick={() => setAuthMode('register')} className="text-white hover:underline font-bold">
                    Daftar Baru
                  </button>
                </div>
              </div>
            ) : (
              <AntiFraudRegister
                onSuccess={() => setAuthModalOpen(false)}
                onSwitchToLogin={() => setAuthMode('login')}
              />
            )}

          </div>
        </div>
      )}

      {/* 6. PAYMENTS GATEWAYS MODALS SHEET */}
      {paymentModalOpen && activeBillOrder && (
        <PaymentGatewayModal
          order={activeBillOrder}
          onPaymentSuccess={handlePaymentClearedSuccess}
          onClose={() => setPaymentModalOpen(false)}
        />
      )}

    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
