import React, { useEffect, useState } from 'react';
import Logo from '../components/Logo.tsx';
import { Product, Category, Order, UserActivity } from '../types';
import {
  TrendingUp,
  ShoppingBag,
  Users,
  Layers,
  ChevronRight,
  Database,
  Trash2,
  Edit2,
  Plus,
  Compass,
  Key,
  Shield,
  Activity,
  AlertOctagon,
  Percent,
  Check,
  Smartphone,
  Globe
} from 'lucide-react';

export default function AdminPortalView() {
  const [stats, setStats] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [securityLogs, setSecurityLogs] = useState<UserActivity[]>([]);
  const [multiAccountThreats, setMultiAccountThreats] = useState<any[]>([]);
  
  const [currentTab, setCurrentTab] = useState<'stats' | 'products' | 'orders' | 'security'>('stats');

  // Product Create Form States
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [discountPrice, setDiscountPrice] = useState('');
  const [stock, setStock] = useState('20');
  const [weight, setWeight] = useState('350');
  const [catId, setCatId] = useState('');
  const [colorText, setColorText] = useState('Jet Black, Void Gray');
  const [sizesText, setSizesText] = useState('S, M, L, XL');
  const [desc, setDesc] = useState('');
  const [imgUrlsText, setImgUrlsText] = useState('https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=800');
  
  const [prodError, setProdError] = useState<string | null>(null);
  const [prodSuccess, setProdSuccess] = useState<string | null>(null);

  // Edit Tracking Resi Form
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
  const [resiText, setResiText] = useState('');

  useEffect(() => {
    fetchAdminData();
  }, [currentTab]);

  const fetchAdminData = () => {
    const token = localStorage.getItem('rasvynar_token');
    if (!token) return;

    // Load overall statistics
    fetch('/api/admin/stats', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setStats(data.stats);
        }
      });

    // Load available products catalog
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setProducts(data.products);
        }
      });

    // Load available categories
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setCategories(data.categories);
          if (data.categories.length > 0 && !catId) {
            setCatId(data.categories[0].id);
          }
        }
      });

    // Load all order histories
    fetch('/api/admin/orders', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setOrders(data.orders);
        }
      });

    // Load security logging data
    fetch('/api/admin/security/telemetry', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setSecurityLogs(data.recentLogs);
          setMultiAccountThreats(data.threats.multiAccountDetector || []);
        }
      });
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProdError(null);
    setProdSuccess(null);

    const imageUrls = imgUrlsText.split(',').map(u => u.trim()).filter(Boolean);
    const colors = colorText.split(',').map(c => c.trim()).filter(Boolean);
    const sizes = sizesText.split(',').map(s => s.trim().toUpperCase()).filter(Boolean);

    if (imageUrls.length === 0) {
      setProdError('At least one catalog product image path string must be configured.');
      return;
    }

    const token = localStorage.getItem('rasvynar_token');
    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name,
          price: Number(price),
          discountPrice: discountPrice ? Number(discountPrice) : undefined,
          stock: Number(stock),
          weight: Number(weight),
          categoryId: catId,
          sizes,
          colors,
          description: desc,
          imageUrls
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setProdSuccess('Couture item configured and launched inside the catalogue grid.');
      setName('');
      setPrice('');
      setDiscountPrice('');
      setDesc('');
      fetchAdminData();
    } catch (err: any) {
      setProdError(err.message || 'Error occurred.');
    }
  };

  const deleteProduct = async (id: string) => {
    if (!confirm('Are you absolutely certain to archive this items SKU?')) return;
    const token = localStorage.getItem('rasvynar_token');
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) fetchAdminData();
    } catch {
      console.warn('Delete parameter crashed');
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    const token = localStorage.getItem('rasvynar_token');
    try {
      await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      fetchAdminData();
    } catch {
      console.warn('Status change failure');
    }
  };

  const updateOrderResi = async (orderId: string) => {
    const token = localStorage.getItem('rasvynar_token');
    try {
      await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ trackingNumber: resiText })
      });
      setEditingOrderId(null);
      setResiText('');
      fetchAdminData();
    } catch {
      console.warn('Resi updates error feedback');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-10 min-h-[90vh]">
      
      {/* 1. ADMIN PANEL HEADERS PANEL */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-neutral-900 pb-6 gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[10px] font-mono tracking-[0.4em] text-neutral-500 uppercase">
            <Database size={12} className="text-emerald-500 animate-pulse" />
            Atelier Command Core System
          </div>
          <h1 className="text-3xl font-display font-bold tracking-wider uppercase text-white">THE PRINCIPAL ATELIER PANEL</h1>
        </div>

        {/* Tab channels buttons toggles */}
        <div className="flex flex-wrap gap-2 text-xs font-mono">
          <button
            onClick={() => setCurrentTab('stats')}
            className={`px-4 py-2.5 border rounded transition cursor-pointer ${
              currentTab === 'stats' ? 'border-white bg-white text-black font-semibold' : 'border-neutral-900 text-neutral-400 hover:border-neutral-700'
            }`}
          >
            DASHBOARD STATS
          </button>
          <button
            onClick={() => setCurrentTab('products')}
            className={`px-4 py-2.5 border rounded transition cursor-pointer ${
              currentTab === 'products' ? 'border-white bg-white text-black font-semibold' : 'border-neutral-900 text-neutral-400 hover:border-neutral-700'
            }`}
          >
            CATALOGUE MANAGERS
          </button>
          <button
            onClick={() => setCurrentTab('orders')}
            className={`px-4 py-2.5 border rounded transition cursor-pointer ${
              currentTab === 'orders' ? 'border-white bg-white text-black font-semibold' : 'border-neutral-900 text-neutral-400 hover:border-neutral-700'
            }`}
          >
            ORDER SHIPMENT LINES
          </button>
          <button
            onClick={() => setCurrentTab('security')}
            className={`px-4 py-2.5 border rounded transition cursor-pointer flex items-center gap-1.5 ${
              currentTab === 'security' ? 'border-red-500 bg-red-500/10 text-red-500 font-semibold' : 'border-neutral-900 text-neutral-400 hover:border-neutral-705'
            }`}
          >
            <Shield size={12} />
            ANTI-FRAUD LOGS
          </button>
        </div>
      </div>

      {/* 2. STATS MODULE VIEW */}
      {currentTab === 'stats' && stats && (
        <div className="space-y-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-[#050505] p-6 border border-neutral-900 rounded-lg space-y-2">
              <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest block font-bold">TOTAL TURNOVER</span>
              <p className="text-2xl font-mono text-white font-bold">Rp {stats.totalSales.toLocaleString()}</p>
            </div>
            <div className="bg-[#050505] p-6 border border-neutral-900 rounded-lg space-y-2">
              <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest block font-bold">ACTIVE CUSTOMERS</span>
              <p className="text-2xl font-mono text-white font-semibold">{stats.customersCount} registered</p>
            </div>
            <div className="bg-[#050505] p-6 border border-neutral-900 rounded-lg space-y-2">
              <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest block font-bold">TOTAL COMMANDS</span>
              <p className="text-2xl font-mono text-white font-semibold">{stats.ordersCount} checkouts</p>
            </div>
            <div className="bg-[#050505] p-6 border border-neutral-900 rounded-lg space-y-2">
              <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest block font-bold">SKUS VOLUMES</span>
              <p className="text-2xl font-mono text-white font-semibold">{stats.totalProducts} design blocks</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            
            {/* Top selling fast fashion list items */}
            <div className="bg-[#050505] p-6 border border-neutral-900 rounded-lg space-y-6">
              <span className="text-xs font-mono text-neutral-400 uppercase tracking-widest block">TOP COUTURE SELLING VELOCITIES</span>
              <div className="divide-y divide-neutral-900">
                {stats.topProducts.map((p: any, idx: number) => (
                  <div key={idx} className="py-4 flex justify-between items-center text-xs">
                    <div>
                      <p className="text-white font-semibold font-display uppercase">{p.name}</p>
                      <p className="text-[10px] font-mono text-neutral-500 uppercase pt-0.5">Avail stocks: {p.stock} units</p>
                    </div>
                    <span className="font-mono text-emerald-400 font-bold bg-emerald-500/5 border border-emerald-500/10 px-2 py-1 rounded">
                      {p.sales} SOLD
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Simulated graph or daily aggregates */}
            <div className="bg-[#050505] p-6 border border-neutral-900 rounded-lg space-y-6">
              <span className="text-xs font-mono text-neutral-400 uppercase tracking-widest block">DAILY TURN-OVER HISTORY METRIC</span>
              <div className="space-y-3 font-mono text-xs text-neutral-400">
                {Object.keys(stats.salesByDate).map((dt) => (
                  <div key={dt} className="flex justify-between items-center bg-black p-3.5 border border-neutral-900 rounded">
                    <span>{dt}</span>
                    <span className="text-white font-semibold">Rp {stats.salesByDate[dt].toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 3. CATALOGUE MANAGER & ADD PRODUCT CRUD */}
      {currentTab === 'products' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Form Create Product (Col span 5) */}
          <div className="lg:col-span-5 bg-[#050505] border border-neutral-900 p-6 sm:p-8 rounded-lg space-y-6">
            <span className="text-xs font-mono tracking-widest text-white uppercase block pb-3 border-b border-neutral-900 font-bold">
              LAUNCH NEW DESIGN COUTURE
            </span>

            {prodError && <p className="text-xs font-mono text-red-400 bg-red-400/5 border border-red-500/10 p-3 rounded">⚠ {prodError}</p>}
            {prodSuccess && <p className="text-xs font-mono text-emerald-400 bg-emerald-500/5 border border-emerald-400/10 p-3 rounded">✓ {prodSuccess}</p>}

            <form onSubmit={handleProductSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-neutral-400 uppercase">Item Brand Label</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-black border border-neutral-800 focus:border-white focus:outline-none p-2.5 text-xs text-white rounded"
                  placeholder="e.g. RASVYNAR liquid silver cap"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-neutral-400 uppercase">Price (IDR)</label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full bg-black border border-neutral-800 focus:border-white focus:outline-none p-2.5 text-xs text-white rounded font-mono"
                    placeholder="Base Price"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-neutral-400 uppercase">Discount Price</label>
                  <input
                    type="number"
                    value={discountPrice}
                    onChange={(e) => setDiscountPrice(e.target.value)}
                    className="w-full bg-black border border-neutral-800 focus:border-white focus:outline-none p-2.5 text-xs text-white rounded font-mono"
                    placeholder="Optional"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-neutral-400 uppercase">Stock Quantitities</label>
                  <input
                    type="number"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className="w-full bg-black border border-neutral-800 focus:border-white focus:outline-none p-2.5 text-xs text-white rounded font-mono"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-neutral-400 uppercase">Weight (Grams)</label>
                  <input
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="w-full bg-black border border-neutral-800 focus:border-white focus:outline-none p-2.5 text-xs text-white rounded font-mono"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-neutral-400 uppercase">Category</label>
                  <select
                    value={catId}
                    onChange={(e) => setCatId(e.target.value)}
                    className="w-full bg-black border border-neutral-800 focus:border-white focus:outline-none p-2.5 text-xs text-white uppercase rounded"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-neutral-400 uppercase">Dynamic Colors (split comma)</label>
                <input
                  type="text"
                  value={colorText}
                  onChange={(e) => setColorText(e.target.value)}
                  className="w-full bg-black border border-neutral-800 focus:border-white focus:outline-none p-2.5 text-xs text-white rounded"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-neutral-400 uppercase">Interactive Sizes (split comma)</label>
                <input
                  type="text"
                  value={sizesText}
                  onChange={(e) => setSizesText(e.target.value)}
                  className="w-full bg-black border border-neutral-800 focus:border-white focus:outline-none p-2.5 text-xs text-white rounded"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-neutral-400 uppercase font-bold">Image URLs (comma for many list)</label>
                <textarea
                  value={imgUrlsText}
                  onChange={(e) => setImgUrlsText(e.target.value)}
                  rows={2}
                  className="w-full bg-black border border-neutral-800 focus:border-white focus:outline-none p-2.5 text-xs text-white resize-none rounded"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-neutral-400 uppercase">Detailed Descriptions Tab Writeup</label>
                <textarea
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  rows={2}
                  className="w-full bg-black border border-neutral-800 focus:border-white focus:outline-none p-2.5 text-xs text-white resize-none rounded"
                />
              </div>

              <button
                type="submit"
                className="w-full h-11 bg-white hover:bg-neutral-200 text-black font-display font-semibold text-xs tracking-widest uppercase transition-all flex items-center justify-center gap-1 cursor-pointer rounded"
              >
                <Plus size={14} /> CATALOGUE LAUNCH ITEM
              </button>
            </form>
          </div>

          {/* List Products Catalog Table (Col span 7) */}
          <div className="lg:col-span-7 bg-[#050505] p-6 border border-neutral-900 rounded-lg space-y-6">
            <span className="text-xs font-mono tracking-widest text-neutral-400 uppercase block font-bold">LAUNCHED PRODUCTS ARCHIVE</span>
            <div className="divide-y divide-neutral-900">
              {products.map((p) => (
                <div key={p.id} className="py-4 flex gap-4 items-center justify-between text-xs">
                  <div className="flex gap-4 items-center min-w-0">
                    <img src={p.images[0]} alt={p.name} className="w-10 h-12 object-cover bg-neutral-900 border rounded" />
                    <div className="min-w-0">
                      <p className="text-white font-semibold font-display uppercase truncate max-w-sm">{p.name}</p>
                      <p className="text-[10px] font-mono text-neutral-500 uppercase pt-0.5">
                        Price: Rp {p.price.toLocaleString()} | stock: {p.stock} units | weigh: {p.weight}g
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteProduct(p.id)}
                    className="text-neutral-500 hover:text-red-400 transition-all p-2 shrink-0"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* 4. ORDERS SHIPMENT LINES & RESI TRACING DETAILS */}
      {currentTab === 'orders' && (
        <div className="bg-[#050505] p-8 border border-neutral-900 rounded-lg space-y-6">
          <span className="text-xs font-mono tracking-widest text-neutral-400 uppercase block font-bold">ORDER STATUS CONTROLLER</span>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs divide-y divide-neutral-900">
              <thead>
                <tr className="text-neutral-500 font-mono tracking-wider text-[10px] uppercase">
                  <th className="pb-3.5">ORDER CODE</th>
                  <th className="pb-3.5">RECEIVER CLIENT</th>
                  <th className="pb-3.5">COURIER SERVICE</th>
                  <th className="pb-3.5">TRACK SECURE CODE (RESI)</th>
                  <th className="pb-3.5">ORDER STATUS STATE</th>
                  <th className="pb-3.5">BILL PRICE</th>
                  <th className="pb-3.5 text-right font-mono">ACTION ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-900 text-neutral-300">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-neutral-900/10 transition">
                    <td className="py-4 font-mono font-bold text-white uppercase">{o.id}</td>
                    <td className="py-4">{o.shippingName}</td>
                    <td className="py-4 uppercase font-mono">{o.shippingCourier}</td>
                    <td className="py-4 font-mono">
                      {editingOrderId === o.id ? (
                        <div className="flex gap-1.5">
                          <input
                            type="text"
                            value={resiText}
                            onChange={(e) => setResiText(e.target.value)}
                            placeholder="e.g. JB002"
                            className="bg-black border border-neutral-800 text-xs px-2 py-0.5 w-32 focus:outline-none"
                          />
                          <button
                            onClick={() => updateOrderResi(o.id)}
                            className="text-emerald-400 hover:bg-neutral-900 p-1"
                          >
                            <Check size={14} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <span>{o.shippingTrackingNumber || 'No Resi Issued.'}</span>
                          <button
                            onClick={() => {
                              setEditingOrderId(o.id);
                              setResiText(o.shippingTrackingNumber || '');
                            }}
                            className="text-[10px] text-neutral-500 underline ml-1"
                          >
                            Edit
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="py-4">
                      <select
                        value={o.status}
                        onChange={(e) => updateOrderStatus(o.id, e.target.value)}
                        className="bg-black border border-neutral-800 focus:outline-none p-1.5 text-[9px] font-mono uppercase text-white rounded"
                      >
                        <option value="PENDING">PENDING</option>
                        <option value="PAID">PAID</option>
                        <option value="PROCESSING">PROCESSING</option>
                        <option value="SHIPPED">SHIPPED</option>
                        <option value="DELIVERED">DELIVERED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
                    </td>
                    <td className="py-4 font-mono font-bold text-white">Rp {o.totalAmount.toLocaleString()}</td>
                    <td className="py-4 text-right">
                      <button
                        onClick={() => alert(`Order print logic triggered for order: ${o.id}`)}
                        className="text-[10px] py-1 px-3 bg-neutral-900 hover:bg-neutral-850 font-mono text-white tracking-widest rounded transition"
                      >
                        PRINT RECORD
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. ANTI-FRAUD SECURITY LEVEL & DEVICES TRACKING */}
      {currentTab === 'security' && (
        <div className="space-y-8">
          
          {/* Multi account browser correlation flags */}
          {multiAccountThreats.length > 0 && (
            <div className="bg-red-500/10 border-2 border-red-500/20 rounded p-6 space-y-4">
              <div className="flex gap-2.5 items-start">
                <AlertOctagon className="text-red-500 shrink-0" size={20} />
                <div>
                  <h3 className="text-sm font-bold text-red-500 tracking-wider uppercase font-display">MULTI-ACCOUNT REGISTRATION ATTACK DETECTED</h3>
                  <p className="text-xs text-red-400 mt-1">
                    Multiple distinct client emails share matching hardware fingerprint arrays. Synergized logins flagged for audit trails:
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {multiAccountThreats.map((threat, index) => (
                  <div key={index} className="bg-black border border-neutral-900 p-4 rounded text-xs font-mono text-neutral-400 space-y-2">
                    <p className="text-neutral-500">MAPPED MD5 SIG: <span className="text-white font-bold">{threat.fingerprint}</span></p>
                    <div className="space-y-1 divide-y divide-neutral-900 pt-1">
                      {threat.mappedEmails.map((em: string) => (
                        <p key={em} className="text-red-400 font-semibold py-1">⚠ {em}</p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Secure interactive activity trackers logs */}
          <div className="bg-[#050505] p-8 border border-neutral-900 rounded-lg space-y-6">
            <span className="text-xs font-mono tracking-widest text-neutral-400 uppercase block font-bold">CLIENT COUTURE TELEMETRY HISTORY</span>
            
            <div className="divide-y divide-neutral-900">
              {securityLogs.length === 0 ? (
                <p className="text-xs text-neutral-500 italic py-4">No recent security logging metrics recorded.</p>
              ) : (
                securityLogs.map((log) => (
                  <div key={log.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-4 leading-relaxed font-mono">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-[9px] font-mono px-2 py-0.5 rounded uppercase border font-bold ${
                          log.isSuspicious 
                            ? 'bg-red-500/10 border-red-500/20 text-red-500' 
                            : 'bg-emerald-500/5 border-emerald-500/10 text-emerald-400'
                        }`}>
                          Risk Score: {log.riskScore}
                        </span>
                        <span className="text-white font-bold">{log.action}</span>
                      </div>
                      
                      <div className="flex flex-wrap gap-4 text-[10px] text-neutral-500">
                        <span className="flex items-center gap-1"><Globe size={11} /> {log.ipAddress} ({log.country})</span>
                        <span className="flex items-center gap-1"><Smartphone size={11} /> {log.device} • {log.browser}</span>
                      </div>
                    </div>
                    
                    <span className="text-[10px] text-neutral-500 shrink-0 text-left sm:text-right">
                      {new Date(log.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
