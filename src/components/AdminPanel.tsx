import React, { useState } from 'react';
import { useApp, Product, Order, Coupon, BlogOrCms } from '../context/AppContext';
import { LayoutDashboard, ShoppingBag, FolderSync, ShieldAlert, Award, FileSpreadsheet, Lock, Sparkles, Plus, Trash, Edit, Check } from 'lucide-react';

export const AdminPanel: React.FC = () => {
  const {
    products, setProducts,
    orders, updateOrderStatus,
    users,
    coupons, setCoupons,
    cms, updateCms,
    loginActivities,
    settings, updateSettings
  } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'fraud' | 'cms'>('overview');

  // New product form state
  const [newProdName, setNewProdName] = useState('');
  const [newProdCategory, setNewProdCategory] = useState('Hoodie');
  const [newProdPrice, setNewProdPrice] = useState(899000);
  const [newProdStock, setNewProdStock] = useState(25);
  const [newProdImg, setNewProdImg] = useState('https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=600');
  const [newProdSku, setNewProdSku] = useState('RSV-NEW-99');
  const [newProdDesc, setNewProdDesc] = useState('Potongan oversized premium terbaik didesain khusus oleh RASVYNAR Tailored Works.');
  const [productSuccess, setProductSuccess] = useState('');

  // Sorter / Coupon addition state
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponVal, setNewCouponVal] = useState(15);
  const [newCouponMin, setNewCouponMin] = useState(800000);

  // Editable CMS form state
  const [cmsHeroTitle, setCmsHeroTitle] = useState(cms.homeHeroTitle);
  const [cmsHeroSubtitle, setCmsHeroSubtitle] = useState(cms.homeHeroSubtitle);
  const [cmsAboutUs, setCmsAboutUs] = useState(cms.aboutUsText);
  const [cmsAddress, setCmsAddress] = useState(cms.contactAddress);
  const [cmsEmail, setCmsEmail] = useState(cms.contactEmail);
  const [cmsPhone, setCmsPhone] = useState(cms.contactPhone);
  const [cmsSuccess, setCmsSuccess] = useState('');

  // Selected Order Tracking waybill editing
  const [editingWaybillId, setEditingWaybillId] = useState<string | null>(null);
  const [tempWaybill, setTempWaybill] = useState('');

  // Overall statistics
  const totalSalesRevenue = orders.filter((o) => o.paymentStatus === 'Paid').reduce((sum, o) => sum + o.totalAmount, 0);
  const totalActiveUsers = users.length;
  const totalActiveOrdersCount = orders.length;
  const totalGarmentsCount = products.length;

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName.trim()) return;

    const generatedSlug = newProdName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const newProduct: Product = {
      id: `prod-${Date.now()}`,
      name: newProdName,
      slug: generatedSlug,
      description: newProdDesc,
      price: Number(newProdPrice),
      discountPrice: 0,
      stock: Number(newProdStock),
      weight: 450,
      sku: newProdSku,
      category: newProdCategory,
      images: [newProdImg || 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=600'],
      rating: 5.0,
      reviewsCount: 0,
      soldCount: 0,
      sizes: ['S', 'M', 'L', 'XL'],
      colors: [
        { name: 'Core Black', hex: '#000000' },
        { name: 'Cyber Silver', hex: '#C0C0C0' }
      ],
      isLimited: false
    };

    setProducts((prev) => [newProduct, ...prev]);
    setProductSuccess(`Garmen ${newProdName} berhasil diposting ke katalog!`);
    setNewProdName('');
    setNewProdSku(`RSV-NEW-${Math.floor(Math.random() * 80 + 10)}`);
    setTimeout(() => setProductSuccess(''), 4000);
  };

  const handleDeleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const handleUpdateWaybillSubmit = (orderId: string) => {
    updateOrderStatus(orderId, {
      waybillNumber: tempWaybill,
      shippingStatus: 'Shipped'
    });
    setEditingWaybillId(null);
    setTempWaybill('');
  };

  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode.trim()) return;

    const newCp: Coupon = {
      code: newCouponCode.toUpperCase().trim(),
      discountType: 'percentage',
      value: Number(newCouponVal),
      minPurchase: Number(newCouponMin),
      isActive: true
    };
    setCoupons((prev) => [newCp, ...prev]);
    setNewCouponCode('');
  };

  const handleUpdateCmsAction = (e: React.FormEvent) => {
    e.preventDefault();
    updateCms({
      homeHeroTitle: cmsHeroTitle,
      homeHeroSubtitle: cmsHeroSubtitle,
      aboutUsText: cmsAboutUs,
      contactAddress: cmsAddress,
      contactEmail: cmsEmail,
      contactPhone: cmsPhone
    });
    setCmsSuccess('Konten halaman statis CMS berhasil disinkronkan ke UI landing page!');
    setTimeout(() => setCmsSuccess(''), 4000);
  };

  return (
    <div id="admin-panel-root" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 font-sans">
      
      {/* Admin Title Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-neutral-900 pb-6 mb-8 gap-4">
        <div>
          <h1 className="text-xl md:text-3xl font-sans font-black tracking-widest text-white uppercase flex items-center gap-2">
            <Lock className="w-6 h-6 text-zinc-400" /> CONSOLE PENGELOLA {settings.brandName.toUpperCase()}
          </h1>
          <p className="text-xs text-zinc-500 uppercase mt-1 font-mono tracking-wider">Super Admin panel akses tertutup terenkripsi • Status: Live</p>
        </div>

        {/* Action tabs buttons */}
        <div className="flex gap-1.5 flex-wrap font-mono text-[10px] uppercase tracking-wider font-bold">
          {[
            { id: 'overview', label: 'Monitor Dashboard', icon: LayoutDashboard },
            { id: 'products', label: 'Stok Garmen', icon: ShoppingBag },
            { id: 'orders', label: 'Fulfillment Resi', icon: FolderSync },
            { id: 'fraud', label: 'Risk Intelligence', icon: ShieldAlert },
            { id: 'cms', label: 'CMS static pages', icon: FileSpreadsheet }
          ].map((tab) => {
            const ActiveIcon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-3 rounded border flex items-center gap-1.5 transition-colors cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-white text-black border-white'
                    : 'bg-neutral-950 text-zinc-400 border-neutral-850 hover:bg-neutral-900'
                }`}
              >
                <ActiveIcon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TABS LAYOUTS */}

      {/* TAB 1: EXECUTIVE MONITOR OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-8 animate-fade-in">
          
          {/* Statistics grid matrices */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 text-center lg:text-left">
            {[
              { label: 'TOTAL PENJUALAN (SETTLED)', val: `Rp ${totalSalesRevenue.toLocaleString('id-ID')}` },
              { label: 'TOTAL PESANAN COORD', val: `${totalActiveOrdersCount} Orders` },
              { label: 'GARMENTS REGISTERED', val: `${totalGarmentsCount} Items` },
              { label: 'VERIFIED CUSTOMERS', val: `${totalActiveUsers} Members` }
            ].map((st, idx) => (
              <div key={idx} className="bg-[#0B0B0B] border border-neutral-850 p-4 rounded-lg space-y-1 shadow-md">
                <span className="text-[9px] font-mono font-bold tracking-widest text-[#A0A0A0] uppercase block">{st.label}</span>
                <p className="text-sm md:text-lg font-black text-white font-mono tracking-wide mt-1">{st.val}</p>
              </div>
            ))}
          </div>

          {/* Graphical diagram trend markup using custom design columns */}
          <div className="bg-[#0B0B0B] border border-neutral-850 p-6 rounded-lg space-y-4">
            <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-white">Laporan Metrik Penjualan Tahunan (2026)</h3>
            <div className="h-44 flex items-end gap-3 md:gap-6 pt-6 font-mono text-[9px] text-[#A0A0A0] select-none border-b border-neutral-900">
              {[
                { m: 'Jan', v: 4500000 },
                { m: 'Feb', v: 8900000 },
                { m: 'Mar', v: 12500000 },
                { m: 'Apr', v: 16900000 },
                { m: 'Mei', v: 24700000 },
                { m: 'Jun', v: totalSalesRevenue || 12000000 }
              ].map((bar, i) => {
                const maxVal = 25000000;
                const pct = Math.min(100, Math.max(10, (bar.v / maxVal) * 100));

                return (
                  <div key={i} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                    {/* Hover text detailed val */}
                    <span className="absolute -top-6 text-white font-bold bg-zinc-900 border border-neutral-800 px-1 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                      Rp {(bar.v / 1000000).toFixed(1)}jt
                    </span>
                    <div 
                      className="w-full bg-[#E0E0E0] group-hover:bg-[#FFFFFF] rounded-t transition-all shadow-inner"
                      style={{ height: `${pct}%` }}
                    />
                    <span className="mt-2 block font-semibold uppercase">{bar.m}</span>
                  </div>
                );
              })}
            </div>
            <p className="text-[10px] text-zinc-550 leading-relaxed font-mono">
              *Diagram di atas menunjukkan pertumbuhan omset penjualan settled (PAID). Seluruh grafik diperbarui otomatis real-time.
            </p>
          </div>

        </div>
      )}

      {/* TAB 2: PRODUCTS STOCK MATRIX AND POSTER */}
      {activeTab === 'products' && (
        <div className="space-y-8 animate-fade-in grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Post item form column */}
          <div className="bg-[#0B0B0B] border border-neutral-850 p-5 rounded-lg space-y-4">
            <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-white border-b border-neutral-900 pb-3 flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-zinc-400" /> Posting Garmen Baru
            </h3>

            {productSuccess && (
              <p className="text-[11px] bg-emerald-950/40 text-emerald-300 p-2.5 rounded border border-emerald-900">
                {productSuccess}
              </p>
            )}

            <form onSubmit={handleCreateProduct} className="space-y-4 text-xs font-mono text-zinc-400">
              <div className="space-y-1">
                <label className="uppercase text-[9px] tracking-wider block">Model Nama Garmen</label>
                <input
                  type="text"
                  required
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  className="w-full bg-[#131313] border border-neutral-850 rounded px-2.5 py-2.5 text-xs text-white"
                  placeholder="e.g. CORE MINIMAL JOGGER"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="uppercase text-[9px] tracking-wider block">Harga Satuan IDR</label>
                  <input
                    type="number"
                    required
                    value={newProdPrice}
                    onChange={(e) => setNewProdPrice(Number(e.target.value))}
                    className="w-full bg-[#131313] border border-neutral-850 rounded px-2.5 py-2.5 text-xs text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="uppercase text-[9px] tracking-wider block">Kunci SKU Code</label>
                  <input
                    type="text"
                    required
                    value={newProdSku}
                    onChange={(e) => setNewProdSku(e.target.value)}
                    className="w-full bg-[#131313] border border-neutral-850 rounded px-2.5 py-2.5 text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="uppercase text-[9px] tracking-wider block">Kategori</label>
                  <select
                    value={newProdCategory}
                    onChange={(e) => setNewProdCategory(e.target.value)}
                    className="w-full bg-[#131313] border border-neutral-850 rounded px-2 py-2.5 text-xs text-white"
                  >
                    <option value="Hoodie">Hoodie</option>
                    <option value="T-Shirt">T-Shirt</option>
                    <option value="Sweater">Sweater</option>
                    <option value="Jacket">Jacket</option>
                    <option value="Pants">Pants</option>
                    <option value="Cap">Cap</option>
                    <option value="Accessories">Accessories</option>
                    <option value="Limited Edition">Limited Edition</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="uppercase text-[9px] tracking-wider block">Stok Gudang</label>
                  <input
                    type="number"
                    required
                    value={newProdStock}
                    onChange={(e) => setNewProdStock(Number(e.target.value))}
                    className="w-full bg-[#131313] border border-neutral-850 rounded px-2.5 py-2.5 text-xs text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="uppercase text-[9px] tracking-wider block">Foto Image URL</label>
                <input
                  type="text"
                  required
                  value={newProdImg}
                  onChange={(e) => setNewProdImg(e.target.value)}
                  className="w-full bg-[#131313] border border-neutral-850 rounded px-2.5 py-2.5 text-xs text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="uppercase text-[9px] tracking-wider block">Deskripsi Detail</label>
                <textarea
                  rows={2}
                  required
                  value={newProdDesc}
                  onChange={(e) => setNewProdDesc(e.target.value)}
                  className="w-full bg-[#131313] border border-neutral-850 rounded px-2.5 py-2 text-xs text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-white text-black hover:bg-neutral-200 font-bold uppercase tracking-widest text-[10px] py-3 rounded transition-colors"
              >
                Posting Ke Katalog E-Store
              </button>
            </form>
          </div>

          {/* List items block */}
          <div className="lg:col-span-2 bg-[#0B0B0B] border border-neutral-850 p-5 rounded-lg space-y-4">
            <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-white border-b border-neutral-900 pb-3">
              Katalog Garments Aktif ({products.length})
            </h3>
            
            <div className="space-y-3.5 max-h-[500px] overflow-y-auto pr-2">
              {products.map((p) => (
                <div key={p.id} className="bg-neutral-950 p-3.5 rounded border border-neutral-850 flex items-center justify-between gap-4 font-sans text-xs">
                  <div className="flex items-center gap-3">
                    <img src={p.images[0]} alt={p.name} className="w-12 h-12 rounded border border-neutral-800 object-cover" />
                    <div>
                      <span className="font-bold text-white uppercase block line-clamp-1">{p.name}</span>
                      <div className="text-[10px] font-mono text-zinc-500 mt-0.5 space-x-2">
                        <span>SKU: {p.sku}</span>
                        <span>• Price: Rp {p.price.toLocaleString('id-ID')}</span>
                        <span>• Stok: {p.stock}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteProduct(p.id)}
                    className="p-2 hover:bg-neutral-900 rounded text-red-500 hover:text-red-400 border border-neutral-900 transition-colors cursor-pointer"
                    title="Hapus Produk"
                  >
                    <Trash className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* TAB 3: ORDERS DISPATCH WAYBILLS AND TRACKING */}
      {activeTab === 'orders' && (
        <div className="bg-[#0B0B0B] border border-neutral-850 p-5 rounded-lg space-y-4 animate-fade-in font-sans">
          <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-white border-b border-neutral-900 pb-3">
            Kelola Antrean Pesanan Pelanggan ({orders.length})
          </h3>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-neutral-800 text-[10px] font-mono uppercase text-zinc-500 pb-2">
                  <th className="py-2.5">Invoice / Customer</th>
                  <th className="py-2.5">Paket Detail</th>
                  <th className="py-2.5">Jumlah Settled</th>
                  <th className="py-2.5">Status Delivery</th>
                  <th className="py-2.5 text-center">Fulfillment Resi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-900 text-zinc-350">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-zinc-650 font-mono text-xs uppercase tracking-wider">Belum ada pesanan masuk.</td>
                  </tr>
                ) : (
                  orders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-neutral-950/20">
                      <td className="py-4">
                        <span className="font-mono text-[10px] text-white font-bold block">{ord.id}</span>
                        <span className="block text-[10px] text-zinc-500 mt-0.5 uppercase">{ord.customerName}</span>
                      </td>
                      <td className="py-4 max-w-xs truncate">
                        <div className="space-y-0.5">
                          {ord.items.map((it, idx) => (
                            <span key={idx} className="block text-[11px] text-zinc-300 font-medium uppercase font-sans">
                              {it.name} ({it.selectedSize} - {it.quantity}X)
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-4 font-mono text-white">Rp {ord.totalAmount.toLocaleString('id-ID')}</td>
                      <td className="py-4 font-mono">
                        <select
                          value={ord.shippingStatus}
                          onChange={(e) => updateOrderStatus(ord.id, { shippingStatus: e.target.value as any })}
                          className="bg-black text-[10px] text-emerald-400 font-bold border border-neutral-800 rounded px-1.5 py-1 uppercase"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Paid">Paid (Lunas)</option>
                          <option value="Processing">Processing</option>
                          <option value="Shipped">Shipped (Dikirim)</option>
                          <option value="Delivered">Delivered (Selesai)</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="py-4 text-center font-mono text-[11px]">
                        {editingWaybillId === ord.id ? (
                          <div className="flex gap-1.5 justify-center items-center">
                            <input
                              type="text"
                              value={tempWaybill}
                              onChange={(e) => setTempWaybill(e.target.value)}
                              placeholder="Ketik No Resi JNE"
                              className="bg-black text-white text-[10px] border border-neutral-800 rounded px-1.5 py-1 outline-none"
                            />
                            <button
                              onClick={() => handleUpdateWaybillSubmit(ord.id)}
                              className="p-1 bg-emerald-700 hover:bg-emerald-600 rounded text-white"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <span className="text-zinc-500 block font-semibold">{ord.waybillNumber || 'BELUM DISPATCHED'}</span>
                            <button
                              onClick={() => { setEditingWaybillId(ord.id); setTempWaybill(ord.waybillNumber || 'RESI-882791'); }}
                              className="text-white hover:underline block mx-auto font-mono text-[9px] uppercase tracking-wider"
                            >
                              [Input Waybill Resi]
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: RISK INTELLIGENCE & TELEMETRY */}
      {activeTab === 'fraud' && (
        <div id="fraud-intelligence" className="space-y-6 animate-fade-in font-sans">
          
          <div className="bg-[#0B0B0B] border border-neutral-850 p-5 rounded-lg space-y-4">
            <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-[#FFFFFF] border-b border-neutral-900 pb-3 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-500 animate-pulse" /> Telemetry Log Registrasi & Anti-Fraud Registry
            </h3>

            <p className="text-xs text-zinc-400 leading-relaxed font-sans">
              Setiap kali pengguna melakukan interaksi registrasi atau pendaftaran, gerbang keamanan RASVYNAR SHIELD melacak sidik jari browser (Device fingerprinting), GPS koordinat geolokasi, VPN/proxy, dan validasi MX record domain. Akun dengan skor bahaya tinggi (&gt;50) otomatis ditandai sebagai <span className="text-red-500 font-bold block mt-1">● SUSPICIOUS ACCOUNT</span>.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-neutral-800 text-[10px] font-mono uppercase text-zinc-500 pb-2">
                    <th className="py-2.5">User Member</th>
                    <th className="py-2.5">IP Address / Showroom</th>
                    <th className="py-2.5">Kombinasi Koordinat GPS (Maps)</th>
                    <th className="py-2.5">Otentikasi Device Fingerprint</th>
                    <th className="py-2.5 text-center">Indeks Risiko Fraud Base</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-900 text-zinc-350">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-neutral-950/20">
                      <td className="py-3">
                        <span className="font-bold text-white block uppercase">{u.name}</span>
                        <span className="block text-[9px] font-mono text-zinc-500 mt-0.5">{u.email}</span>
                      </td>
                      <td className="py-3 font-mono text-[10px]">
                        <span className="block text-zinc-300">{u.ipAddress}</span>
                        <span className="block text-[9px] text-zinc-550 uppercase">{u.cityFromIp || 'Jakarta'}, {u.country || 'ID'}</span>
                      </td>
                      <td className="py-3 font-mono text-[9px] text-zinc-400 uppercase">
                        <div>LAT: {u.latitude.toFixed(4) || 'Pending'}</div>
                        <div>LNG: {u.longitude.toFixed(4) || 'Pending'}</div>
                      </td>
                      <td className="py-3 font-mono text-[9px] text-zinc-500 max-w-xs truncate">
                        {u.deviceFingerprint || 'FP-SYSTEM-INIT'}
                      </td>
                      <td className="py-3 text-center">
                        <span className={`px-2 py-1 rounded-full font-mono text-[9px] font-bold ${
                          u.riskScore >= 50
                            ? 'bg-red-950/40 text-red-400 border border-red-900'
                            : 'bg-emerald-950/20 text-emerald-400 border border-emerald-900'
                        }`}>
                          Skor {u.riskScore}% {u.riskScore >= 50 ? 'SUSPICIOUS' : 'SECURE'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Vouchers lists Setup */}
          <div className="bg-[#0B0B0B] border border-neutral-850 p-5 rounded-lg space-y-4">
            <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-[#FFFFFF] border-b border-neutral-900 pb-3">
              Buat Voucher Promo Baru
            </h3>
            <form onSubmit={handleCreateCoupon} className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-mono">
              <input
                type="text"
                required
                value={newCouponCode}
                onChange={(e) => setNewCouponCode(e.target.value)}
                placeholder="KODE VOUCHER BRUTAL"
                className="bg-[#111] text-white border border-neutral-800 rounded px-2.5 py-1.5 outline-none font-mono tracking-widest"
              />
              <input
                type="number"
                required
                value={newCouponVal}
                onChange={(e) => setNewCouponVal(Number(e.target.value))}
                placeholder="Potongan %"
                className="bg-[#111] text-white border border-neutral-800 rounded px-2.5 py-1.5 outline-none"
              />
              <input
                type="number"
                required
                value={newCouponMin}
                onChange={(e) => setNewCouponMin(Number(e.target.value))}
                placeholder="Min Transaksi (Rp)"
                className="bg-[#111] text-white border border-neutral-800 rounded px-2.5 py-1.5 outline-none"
              />
              <button
                type="submit"
                className="bg-white text-black font-semibold text-[10px] uppercase py-2 rounded font-bold hover:bg-neutral-200"
              >
                Simpan Voucher
              </button>
            </form>
          </div>

        </div>
      )}

      {/* TAB 5: CMS STATIC PAGES EDITOR */}
      {activeTab === 'cms' && (
        <div className="bg-[#0B0B0B] border border-neutral-850 p-5 rounded-lg space-y-4 animate-fade-in">
          <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-white border-b border-neutral-900 pb-3 flex items-center justify-between">
            <span>Edit Konten Teks Halaman Statis CMS (Tanpa Ubah Kode)</span>
            <span className="text-[10px] text-zinc-550">Disimpan di local storage database</span>
          </h3>

          {cmsSuccess && (
            <p className="text-[11px] bg-emerald-950/40 text-emerald-300 border border-emerald-900 p-2.5 rounded font-mono">
              {cmsSuccess}
            </p>
          )}

          <form onSubmit={handleUpdateCmsAction} className="space-y-5 text-xs font-mono text-zinc-400">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="uppercase text-[9px] tracking-wider block">Home Page Hero Title</label>
                <input
                  type="text"
                  required
                  value={cmsHeroTitle}
                  onChange={(e) => setCmsHeroTitle(e.target.value)}
                  className="w-full bg-[#131313] border border-neutral-850 rounded px-2.5 py-2.5 text-xs text-white"
                />
              </div>
              <div className="space-y-1">
                <label className="uppercase text-[9px] tracking-wider block">Home Page Hero Subtitle</label>
                <input
                  type="text"
                  required
                  value={cmsHeroSubtitle}
                  onChange={(e) => setCmsHeroSubtitle(e.target.value)}
                  className="w-full bg-[#131313] border border-neutral-850 rounded px-2.5 py-2.5 text-xs text-white"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="uppercase text-[9px] tracking-wider block">About Us (Tentang Garmen RASVYNAR)</label>
              <textarea
                rows={3}
                required
                value={cmsAboutUs}
                onChange={(e) => setCmsAboutUs(e.target.value)}
                className="w-full bg-[#131313] border border-neutral-850 rounded px-2.5 py-2 text-xs text-white font-sans"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="uppercase text-[9px] tracking-wider block">Email Showroom Utama</label>
                <input
                  type="email"
                  required
                  value={cmsEmail}
                  onChange={(e) => setCmsEmail(e.target.value)}
                  className="w-full bg-[#131313] border border-neutral-850 rounded px-2.5 py-2.5 text-xs text-white"
                />
              </div>
              <div className="space-y-1">
                <label className="uppercase text-[9px] tracking-wider block">Telepon Support</label>
                <input
                  type="text"
                  required
                  value={cmsPhone}
                  onChange={(e) => setCmsPhone(e.target.value)}
                  className="w-full bg-[#131313] border border-neutral-850 rounded px-2.5 py-2.5 text-xs text-white"
                />
              </div>
              <div className="space-y-1">
                <label className="uppercase text-[9px] tracking-wider block">Alamat Showroom Fisik</label>
                <input
                  type="text"
                  required
                  value={cmsAddress}
                  onChange={(e) => setCmsAddress(e.target.value)}
                  className="w-full bg-[#131313] border border-neutral-850 rounded px-2.5 py-2.5 text-xs text-white"
                />
              </div>
            </div>

            <button
              type="submit"
              className="bg-white text-black font-semibold text-[10px] uppercase tracking-widest py-3 px-8 rounded hover:bg-neutral-200 cursor-pointer"
            >
              Sinkronkan Perubahan Static CMS Pages
            </button>
          </form>
        </div>
      )}

    </div>
  );
};

export default AdminPanel;
