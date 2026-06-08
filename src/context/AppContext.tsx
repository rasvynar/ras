import React, { createContext, useContext, useState, useEffect } from 'react';

// === SCHEMAS & TYPES ===

export interface AppSettings {
  brandName: string;
  tagline: string;
  whatsappBusiness: string;
  businessAddress: string;
  superAdminEmail: string;
  paymentGateway: 'Midtrans' | 'Xendit';
  midtransMerchantId: string;
  midtransClientKey: string;
  midtransServerKey: string;
  googleMapsApiKey: string;
  isInstalled: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  whatsapp: string;
  role: 'Super Admin' | 'Admin' | 'Staff' | 'Customer';
  status: 'Active' | 'Inactive' | 'Suspicious';
  avatar: string;
  address: string;
  province: string;
  city: string;
  district: string;
  postalCode: string;
  latitude: number;
  longitude: number;
  formattedAddress: string;
  placeId: string;
  membership: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  points: number;
  referralCode: string;
  referredBy: string;
  commissionsEarned: number;
  ipAddress: string;
  country: string;
  cityFromIp: string;
  deviceFingerprint: string;
  browser: string;
  riskScore: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  discountPrice: number; // 0 if no discount
  stock: number;
  weight: number; // in grams
  sku: string;
  category: string;
  images: string[];
  rating: number;
  reviewsCount: number;
  soldCount: number;
  sizes: string[];
  colors: { name: string; hex: string }[];
  isLimited: boolean;
}

export interface CartItem {
  id: string; // SKU or productid-size-color combo
  product: Product;
  quantity: number;
  selectedSize: string;
  selectedColor: { name: string; hex: string };
}

export interface Coupon {
  code: string;
  discountType: 'percentage' | 'fixed';
  value: number;
  minPurchase: number;
  isActive: boolean;
}

export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  selectedSize: string;
  selectedColor: string;
  image: string;
}

export interface Order {
  id: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  customerWhatsapp: string;
  items: OrderItem[];
  shippingAddress: {
    formattedAddress: string;
    province: string;
    city: string;
    district: string;
    postalCode: string;
    latitude: number;
    longitude: number;
  };
  courier: string;
  shippingFee: number;
  couponApplied: string;
  discountAmount: number;
  pointsEarned: number;
  pointsUsedDiscount: number;
  totalWeight: number; // total in grams
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: 'Pending' | 'Paid' | 'Failed';
  shippingStatus: 'Pending' | 'Paid' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  waybillNumber: string;
  riskScore: number;
  createdAt: string;
}

export interface Review {
  id: string;
  productId: string;
  userName: string;
  userAvatar: string;
  rating: number;
  comment: string;
  photoUrl: string;
  createdAt: string;
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  linkTo: string;
  isActive: boolean;
}

export interface BlogOrCms {
  homeHeroTitle: string;
  homeHeroSubtitle: string;
  aboutUsText: string;
  contactAddress: string;
  contactEmail: string;
  contactPhone: string;
  faqList: { q: string; a: string }[];
  privacyPolicy: string;
  termsOfService: string;
  returnPolicy: string;
  shippingPolicy: string;
  sizeGuide: string;
}

export interface LoginActivity {
  id: string;
  userName: string;
  email: string;
  ipAddress: string;
  country: string;
  city: string;
  device: string;
  browser: string;
  timestamp: string;
  status: 'SUCCESS' | 'FAILED';
  riskScore: number;
}

interface AppContextType {
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  users: User[];
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  isEmailVerified: boolean;
  setEmailVerified: (status: boolean) => void;
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  categories: string[];
  coupons: Coupon[];
  setCoupons: React.Dispatch<React.SetStateAction<Coupon[]>>;
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (cartItemId: string) => void;
  updateCartQuantity: (cartItemId: string, qty: number) => void;
  clearCart: () => void;
  appliedCoupon: Coupon | null;
  applyCouponCode: (code: string, subtotal: number) => { success: boolean; message: string };
  removeCouponCode: () => void;
  orders: Order[];
  createOrder: (orderData: Omit<Order, 'id' | 'createdAt'>) => Order;
  updateOrderStatus: (orderId: string, updates: Partial<Order>) => void;
  reviews: Review[];
  addProductReview: (review: Omit<Review, 'id' | 'createdAt'>) => void;
  banners: Banner[];
  updateBanners: (newBanners: Banner[]) => void;
  cms: BlogOrCms;
  updateCms: (newCms: Partial<BlogOrCms>) => void;
  loginActivities: LoginActivity[];
  recordLoginActivity: (activity: Omit<LoginActivity, 'id' | 'timestamp'>) => void;
  loyaltyPointsExchangeRate: number; // standard e.g., 100 points = Rp 1.000 discount
  isInstalled: boolean;
  installApp: (brandSetup: {
    brandName: string;
    superAdminEmail: string;
    whatsappBusiness: string;
    businessAddress: string;
    adminName: string;
    adminPassword?: string;
  }) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const SEED_CATEGORIES = [
  'Limited Edition',
  'Hoodie',
  'T-Shirt',
  'Sweater',
  'Jacket',
  'Polo Shirt',
  'Pants',
  'Cap',
  'Accessories'
];

const SEED_PRODUCTS: Product[] = [
  {
    id: 'prod-001',
    name: 'RASVYNAR SIGNATURE GLITCH HOODIE',
    slug: 'rasvynar-signature-glitch-hoodie',
    description: 'Bahan katun fleece premium 400gsm yang sangat tebal namun tetap adem di kulit. Sablon high-density gel dengan detail holografik cyberpunk. Memancarkan aura kemewahan jalanan (street luxury) yang belum pernah Anda rasakan sebelumnya.',
    price: 1599000,
    discountPrice: 1299000,
    stock: 24,
    weight: 850,
    sku: 'RSV-HD-001',
    category: 'Limited Edition',
    images: [
      'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=600&auto=format&fit=crop'
    ],
    rating: 4.9,
    reviewsCount: 18,
    soldCount: 42,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: [
      { name: 'Core Black', hex: '#000000' },
      { name: 'Future White', hex: '#FFFFFF' },
      { name: 'Cyber Silver', hex: '#C0C0C0' }
    ],
    isLimited: true
  },
  {
    id: 'prod-002',
    name: 'SILVER-THREAD MONOGRAM SWEATER',
    slug: 'silver-thread-monogram-sweater',
    description: 'Sweater rajut rajutan premium dengan finishing benang logam perak (silver metallic threads). Menghadirkan pola monogram RASVYNAR di seluruh bagian bahan. Sentuhan glamor dan futuristik untuk penampilan premium dinamis Anda.',
    price: 1199000,
    discountPrice: 999000,
    stock: 15,
    weight: 600,
    sku: 'RSV-SW-002',
    category: 'Sweater',
    images: [
      'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1574164904299-3a102b110380?q=80&w=600&auto=format&fit=crop'
    ],
    rating: 4.8,
    reviewsCount: 9,
    soldCount: 22,
    sizes: ['M', 'L', 'XL'],
    colors: [
      { name: 'Metallic Silver', hex: '#D1D5DB' },
      { name: 'Charcoal Asphalt', hex: '#1F2937' }
    ],
    isLimited: false
  },
  {
    id: 'prod-003',
    name: 'CHROME REBEL COATED TECH-JACKET',
    slug: 'chrome-rebel-coated-tech-jacket',
    description: 'Jaket teknikal windproof dan water-repellent dengan lapisan pelindung polyurethane mengkilap layaknya chrome. Gantungan ritsleting industrial, kantung multifungsi modular bento-style, serta tudung kepala yang dapat disembunyikan.',
    price: 2499000,
    discountPrice: 0,
    stock: 5,
    weight: 1100,
    sku: 'RSV-JK-003',
    category: 'Jacket',
    images: [
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=600&auto=format&fit=crop'
    ],
    rating: 5.0,
    reviewsCount: 5,
    soldCount: 8,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Deep Space', hex: '#111827' },
      { name: 'Reflective Platinum', hex: '#E5E7EB' }
    ],
    isLimited: true
  },
  {
    id: 'prod-004',
    name: 'SILICONE PRINT LOGO T-SHIRT',
    slug: 'silicone-print-logo-t-shirt',
    description: 'Kaos oversized premium berbahan Cotton Combed 20s ultra-soft. Logo RASVYNAR di depan dicetak dengan teknik Liquid Silicone Embossed tebal setinggi 2mm memberikan efek 3D yang megah khas brand ternama Paris.',
    price: 499000,
    discountPrice: 429000,
    stock: 50,
    weight: 280,
    sku: 'RSV-TS-004',
    category: 'T-Shirt',
    images: [
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=600&auto=format&fit=crop'
    ],
    rating: 4.7,
    reviewsCount: 31,
    soldCount: 115,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: [
      { name: 'Dark Void', hex: '#000000' },
      { name: 'Pure Snow', hex: '#FFFFFF' }
    ],
    isLimited: false
  },
  {
    id: 'prod-005',
    name: 'FUTURISTIC EMBARK POLO SHIRT',
    slug: 'futuristic-embark-polo-shirt',
    description: 'Kombinasi sempurna dari busana formal modern dan kegagahan streetwear. Kerah berkerut magnetis tersembunyi dengan sulaman metalik di plaket kancing. Bahan Dry-Fit premium berpori mikro menjaga kesejukan tubuh sepanjang hari.',
    price: 699000,
    discountPrice: 599000,
    stock: 35,
    weight: 350,
    sku: 'RSV-PL-005',
    category: 'Polo Shirt',
    images: [
      'https://images.unsplash.com/photo-1581655353564-df123a1eb820?q=80&w=600&auto=format&fit=crop'
    ],
    rating: 4.6,
    reviewsCount: 12,
    soldCount: 40,
    sizes: ['M', 'L', 'XL'],
    colors: [
      { name: 'Premium Charcoal', hex: '#2D3748' },
      { name: 'Glacier White', hex: '#EDF2F7' }
    ],
    isLimited: false
  },
  {
    id: 'prod-006',
    name: 'GEOMETRIC PANEL STRAP CARGO PANTS',
    slug: 'geometric-panel-strap-cargo-pants',
    description: 'Celana kargo panelis berlapis tangguh dengan tali pelepas cepat (quick-release industrial buckles). Dapat diatur ritsleting bagian lutut untuk diubah menjadi celana pendek kasual bermutu tinggi.',
    price: 999000,
    discountPrice: 899000,
    stock: 18,
    weight: 700,
    sku: 'RSV-PT-006',
    category: 'Pants',
    images: [
      'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=600&auto=format&fit=crop'
    ],
    rating: 4.8,
    reviewsCount: 14,
    soldCount: 29,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Stealth Black', hex: '#090D16' },
      { name: 'Raw Sand', hex: '#D2D2D2' }
    ],
    isLimited: false
  },
  {
    id: 'prod-007',
    name: 'CORE HYPERION TRUCKER CAP - SILVER BADGE',
    slug: 'core-hyperion-trucker-cap-silver-badge',
    description: 'Topi trucker bergaya modern melengkung (curved brim) dengan sematan lencana titanium logam RASVYNAR di panel depan. Bagian belakang dilengkapi mesh sirkulasi berkualitas militer.',
    price: 399000,
    discountPrice: 0,
    stock: 45,
    weight: 150,
    sku: 'RSV-CP-007',
    category: 'Cap',
    images: [
      'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?q=80&w=600&auto=format&fit=crop'
    ],
    rating: 4.9,
    reviewsCount: 20,
    soldCount: 65,
    sizes: ['All Size'],
    colors: [
      { name: 'Carbon Black', hex: '#1C1C1C' }
    ],
    isLimited: false
  },
  {
    id: 'prod-008',
    name: 'METRIC CHROMATIC NYLON BELT',
    slug: 'metric-chromatic-nylon-belt',
    description: 'Sabuk anyaman nilon dengan kekuatan tensile tinggi, dilengkapi gesper penguncian otomatis (auto-lock cobra-style magnetic buckle). Sangat modern dan menambah kemewahan fungsional pada pinggang celana Anda.',
    price: 349000,
    discountPrice: 279000,
    stock: 100,
    weight: 120,
    sku: 'RSV-AC-008',
    category: 'Accessories',
    images: [
      'https://images.unsplash.com/photo-1624222247344-550fb8ecf7db?q=80&w=600&auto=format&fit=crop'
    ],
    rating: 4.9,
    reviewsCount: 15,
    soldCount: 110,
    sizes: ['All Size'],
    colors: [
      { name: 'Chrono Silver', hex: '#A1A1AA' },
      { name: 'Void Black', hex: '#000000' }
    ],
    isLimited: false
  }
];

const SEED_BANNERS = [
  {
    id: 'ban-1',
    title: 'THE HYBRID GENESIS COLLECTION',
    subtitle: 'Where Futuristic Streetwear Collides with Elite Parisian Luxury Craftsmanship',
    imageUrl: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=1200&auto=format&fit=crop',
    linkTo: 'Limited Edition',
    isActive: true
  },
  {
    id: 'ban-2',
    title: 'STYLE BEYOND ORDINARY',
    subtitle: 'Step into the avant-garde minimal core. Exclusive drop available now.',
    imageUrl: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=1200&auto=format&fit=crop',
    linkTo: 'all',
    isActive: true
  }
];

const DEFAULT_CMS: BlogOrCms = {
  homeHeroTitle: 'STYLE BEYOND ORDINARY',
  homeHeroSubtitle: 'RASVYNAR is a manifestation of modern minimal cyberpunk aesthetics coupled with elite haute couture elements.',
  aboutUsText: 'Didirikan di jantung mode futuristik, RASVYNAR mendefinisikan ulang kemewahan panggung busana bagi penjelajah urban. Kami memadukan garmen berdaya tahan militer dengan siluet minimalis, warna monokrom berkelas, jaminan kenyamanan tingkat tinggi, serta estetika masa depan.',
  contactAddress: 'Unit L-2-58, Grand Indonesia Shopping Town, Menteng, DKI Jakarta, 10310',
  contactEmail: 'concierge@rasvynar.com',
  contactPhone: '+62-21-999-8800',
  faqList: [
    { q: 'Apakah semua produk RASVYNAR dijamin original?', a: 'Ya, seluruh produk didesain dan diproduksi secara eksklusif oleh RASVYNAR Tailored Works dengan kontrol kualitas tertinggi.' },
    { q: 'Berapa lama estimasi pengiriman pesanan?', a: 'Untuk pulau Jawa berkisar 1-3 hari kerja menggunakan layanan kilat JNE/J&T/SiCepat. Di luar Jawa memerlukan waktu 3-7 hari kerja.' },
    { q: 'Apakah saya bisa menukar barang jika ukurannya tidak pas?', a: 'Tentu. Anda dapat berkonsultasi via WhatsApp CS untuk pengajuan Return & Exchange maksimal 3 hari setelah status produk diterima sesuai panduan Size Guide.' }
  ],
  privacyPolicy: 'RASVYNAR sangat menjunjung tinggi keamanan data pribadi Anda. Seluruh pembayaran diproses langsung secara kriptografis oleh payment gateway tanpa menyimpan informasi kartu kredit Anda di server kami. IP Address, Browser dan Device Fingerprint dilacak hanya untuk analisis pencegahan fraud demi kenyamanan bersama.',
  termsOfService: 'Dengan melakukan pembelian, Anda menyetujui seluruh ketentuan pengiriman, pembatalan sepihak atas pesanan mencurigakan, dan mengikuti petunjuk kepatuhan pendaftaran akun anti-bot kami.',
  returnPolicy: 'Barang yang ingin ditukar wajib dalam keadaan baru, ber-tag lengkap, belum pernah dicuci, bebas dari wewangian luar, dan disertai dengan video unboxing lengkap tanpa jeda untuk validasi klaim.',
  shippingPolicy: 'Pengiriman dilakukan setiap hari Senin-Sabtu pukul 17.00 WIB. Resi pengiriman otomatis masuk ke sistem dan dapat dilacak langsung di menu Riwayat Pesanan pada malam harinya.',
  sizeGuide: 'Semua dimensi produk diukur dalam sentimeter. Selisih 1-2 cm wajar dalam toleransi manufaktur jahitan. Hubungi concierge jika Anda meragukan ukuran ideal untuk postur tubuh Anda.'
};

const DEFAULT_COUPONS: Coupon[] = [
  { code: 'WELCOME10', discountType: 'percentage', value: 10, minPurchase: 500000, isActive: true },
  { code: 'RSVNRSUPER', discountType: 'fixed', value: 200000, minPurchase: 1500000, isActive: true },
  { code: 'STREETGOLD', discountType: 'percentage', value: 15, minPurchase: 1000000, isActive: true }
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Loading persisted states or falling back to default/seeds
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('rsv_settings');
    if (saved) return JSON.parse(saved);
    return {
      brandName: 'RASVYNAR',
      tagline: 'Style Beyond Ordinary',
      whatsappBusiness: '6281234567890',
      businessAddress: 'Grand Indonesia Shopping Town, Jakarta Pusat, DKI Jakarta',
      superAdminEmail: 'superadmin@rasvynar.com',
      paymentGateway: 'Midtrans',
      midtransMerchantId: 'M123456',
      midtransClientKey: 'SB-Mid-client-W89gV07dGv',
      midtransServerKey: 'SB-Mid-server-H9f6F23Sda',
      googleMapsApiKey: process.env.GOOGLE_MAPS_PLATFORM_KEY || (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY || '',
      isInstalled: false // Default to false to show the Setup Wizard to developers/users
    };
  });

  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('rsv_users');
    if (saved) return JSON.parse(saved);
    // Initial super admin user seed
    return [
      {
        id: 'usr-001',
        name: 'Super Admin RASVYNAR',
        email: 'superadmin@rasvynar.com',
        whatsapp: '6281234567890',
        role: 'Super Admin',
        status: 'Active',
        avatar: 'https://photos.app.goo.gl/h3465ombAasCcQiz6',
        address: 'Grand Indonesia Shopping Town, Jakarta Pusat',
        province: 'DKI Jakarta',
        city: 'Jakarta Pusat',
        district: 'Menteng',
        postalCode: '10310',
        latitude: -6.1952,
        longitude: 106.8231,
        formattedAddress: 'Grand Indonesia Shopping Town, Menteng, DKI Jakarta',
        placeId: 'ChIJXQ-zW0rJaS4Rh19zVpA2-Yk',
        membership: 'Platinum',
        points: 5000,
        referralCode: 'RSV-ADMIN',
        referredBy: '',
        commissionsEarned: 0,
        ipAddress: '127.0.0.1',
        country: 'Indonesia',
        cityFromIp: 'Jakarta',
        deviceFingerprint: 'DEV_FINGERPRINT_ADMIN_LOCAL',
        browser: 'Google Chrome',
        riskScore: 0
      }
    ];
  });

  const [currentUser, setCurrentUserState] = useState<User | null>(() => {
    const saved = localStorage.getItem('rsv_curr_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [isEmailVerified, setEmailVerified] = useState<boolean>(true);

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('rsv_products');
    return saved ? JSON.parse(saved) : SEED_PRODUCTS;
  });

  const [coupons, setCoupons] = useState<Coupon[]>(() => {
    const saved = localStorage.getItem('rsv_coupons');
    return saved ? JSON.parse(saved) : DEFAULT_COUPONS;
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('rsv_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(() => {
    const saved = localStorage.getItem('rsv_applied_coupon');
    return saved ? JSON.parse(saved) : null;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('rsv_orders');
    return saved ? JSON.parse(saved) : [];
  });

  const [reviews, setReviews] = useState<Review[]>(() => {
    const saved = localStorage.getItem('rsv_reviews');
    if (saved) return JSON.parse(saved);
    // Seed some premium reviews
    return [
      {
        id: 'rev-001',
        productId: 'prod-001',
        userName: 'Fathur Rahman',
        userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150&auto=format&fit=crop',
        rating: 5,
        comment: 'Sangat mewah! Bahannya luar biasa tebal dan cutting oversized-nya sempurna. Pemasangan logo siliconenya tebal dan gagah. Highly recommended brand premium Indonesia!',
        photoUrl: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=200&auto=format&fit=crop',
        createdAt: '2026-05-20T10:22:00Z'
      },
      {
        id: 'rev-002',
        productId: 'prod-001',
        userName: 'Aurelia S.',
        userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop',
        rating: 5,
        comment: 'Design cyberpunk glitchnya berkelas. Tidak pasaran, dipadukan dengan cargo pants streetwear bener-bener jadi aesthetic banget. Pengiriman cuma 1 hari ke Bandung.',
        photoUrl: '',
        createdAt: '2026-05-25T14:30:00Z'
      }
    ];
  });

  const [banners, setBannersState] = useState<Banner[]>(() => {
    const saved = localStorage.getItem('rsv_banners');
    return saved ? JSON.parse(saved) : SEED_BANNERS;
  });

  const [cms, setCms_State] = useState<BlogOrCms>(() => {
    const saved = localStorage.getItem('rsv_cms');
    return saved ? JSON.parse(saved) : DEFAULT_CMS;
  });

  const [loginActivities, setLoginActivities] = useState<LoginActivity[]>(() => {
    const saved = localStorage.getItem('rsv_login_activities');
    return saved ? JSON.parse(saved) : [];
  });

  const loyaltyPointsExchangeRate = 10; // 1 point = Rp 10,- rupiah discount
  const isInstalled = settings.isInstalled;

  // Sync to database simulated with local-storage on any block change
  useEffect(() => {
    localStorage.setItem('rsv_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('rsv_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('rsv_curr_user', currentUser ? JSON.stringify(currentUser) : '');
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('rsv_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('rsv_coupons', JSON.stringify(coupons));
  }, [coupons]);

  useEffect(() => {
    localStorage.setItem('rsv_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('rsv_applied_coupon', appliedCoupon ? JSON.stringify(appliedCoupon) : '');
  }, [appliedCoupon]);

  useEffect(() => {
    localStorage.setItem('rsv_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('rsv_reviews', JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    localStorage.setItem('rsv_banners', JSON.stringify(banners));
  }, [banners]);

  useEffect(() => {
    localStorage.setItem('rsv_cms', JSON.stringify(cms));
  }, [cms]);

  useEffect(() => {
    localStorage.setItem('rsv_login_activities', JSON.stringify(loginActivities));
  }, [loginActivities]);

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const setCurrentUser = (user: User | null) => {
    setCurrentUserState(user);
    if (user) {
      // Keep state registry synced
      setUsers((prev) => prev.map((u) => (u.id === user.id ? user : u)));
    }
  };

  const installApp = (brandSetup: {
    brandName: string;
    superAdminEmail: string;
    whatsappBusiness: string;
    businessAddress: string;
    adminName: string;
    adminPassword?: string;
  }) => {
    // Generate actual Super Admin user based on details entered
    const superAdmin: User = {
      id: 'usr-admin-initial',
      name: brandSetup.adminName,
      email: brandSetup.superAdminEmail,
      whatsapp: brandSetup.whatsappBusiness.startsWith('0')
        ? '62' + brandSetup.whatsappBusiness.substring(1)
        : brandSetup.whatsappBusiness,
      role: 'Super Admin',
      status: 'Active',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=150&auto=format&fit=crop',
      address: brandSetup.businessAddress,
      province: 'DKI Jakarta',
      city: 'Jakarta Pusat',
      district: 'Menteng',
      postalCode: '10310',
      latitude: -6.1952,
      longitude: 106.8231,
      formattedAddress: brandSetup.businessAddress,
      placeId: 'ChIJXQ-zW0rJaS4Rh19zVpA2-Yk',
      membership: 'Platinum',
      points: 5000,
      referralCode: 'RSV-FOUNDER',
      referredBy: '',
      commissionsEarned: 0,
      ipAddress: '127.0.0.1',
      country: 'Indonesia',
      cityFromIp: 'Jakarta',
      deviceFingerprint: 'INITIAL_WIZARD_PROV',
      browser: 'Admin Console Browser',
      riskScore: 0
    };

    setUsers((prev) => {
      // Remove any previously generated local devs and place our real new Admin
      const filtered = prev.filter(u => u.role !== 'Super Admin');
      return [superAdmin, ...filtered];
    });

    setSettings((prev) => ({
      ...prev,
      brandName: brandSetup.brandName,
      superAdminEmail: brandSetup.superAdminEmail,
      whatsappBusiness: brandSetup.whatsappBusiness.startsWith('0')
        ? '62' + brandSetup.whatsappBusiness.substring(1)
        : brandSetup.whatsappBusiness,
      businessAddress: brandSetup.businessAddress,
      isInstalled: true
    }));

    setCurrentUserState(superAdmin);
  };

  const addToCart = (item: CartItem) => {
    setCart((prev) => {
      const existingIdx = prev.findIndex(
        (i) =>
          i.product.id === item.product.id &&
          i.selectedSize === item.selectedSize &&
          i.selectedColor.hex === item.selectedColor.hex
      );

      if (existingIdx > -1) {
        const copy = [...prev];
        copy[existingIdx].quantity += item.quantity;
        return copy;
      }
      return [...prev, item];
    });
  };

  const removeFromCart = (cartItemId: string) => {
    setCart((prev) => prev.filter((i) => i.id !== cartItemId));
  };

  const updateCartQuantity = (cartItemId: string, qty: number) => {
    setCart((prev) =>
      prev.map((i) => (i.id === cartItemId ? { ...i, quantity: Math.max(1, qty) } : i))
    );
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
  };

  const applyCouponCode = (code: string, subtotal: number): { success: boolean; message: string } => {
    const uppercaseCode = code.toUpperCase().trim();
    const found = coupons.find((c) => c.code === uppercaseCode && c.isActive);

    if (!found) {
      return { success: false, message: 'Kode voucher tidak valid atau telah kedaluwarsa.' };
    }

    if (subtotal < found.minPurchase) {
      return {
        success: false,
        message: `Minimal transaksi untuk voucher ini adalah Rp ${found.minPurchase.toLocaleString('id-ID')}`
      };
    }

    setAppliedCoupon(found);
    return { success: true, message: `Voucher ${found.code} berhasil dipasang!` };
  };

  const removeCouponCode = () => {
    setAppliedCoupon(null);
  };

  const createOrder = (orderData: Omit<Order, 'id' | 'createdAt'>): Order => {
    const randomizedId = `RSV-${Date.now().toString().substring(7)}-${Math.floor(Math.random() * 900 + 100)}`;
    const newOrder: Order = {
      ...orderData,
      id: randomizedId,
      createdAt: new Date().toISOString()
    };

    setOrders((prev) => [newOrder, ...prev]);

    // Update product inventory stock & soldCount
    setProducts((prevProd) =>
      prevProd.map((prod) => {
        const inOrder = orderData.items.find((item) => item.productId === prod.id);
        if (inOrder) {
          return {
            ...prod,
            stock: Math.max(0, prod.stock - inOrder.quantity),
            soldCount: prod.soldCount + inOrder.quantity
          };
        }
        return prod;
      })
    );

    // Give points to user & deduct points if used
    if (currentUser) {
      let finalPoints = currentUser.points;

      // Add points earned: every 10,000 IDR amount spent -> 1 point
      const pointsGain = Math.floor(orderData.totalAmount / 50000);

      if (orderData.pointsUsedDiscount > 0) {
        // deduct point equivalent from loyalty point used
        const pointsDeducted = Math.floor(orderData.pointsUsedDiscount / loyaltyPointsExchangeRate);
        finalPoints = Math.max(0, finalPoints - pointsDeducted);
      }

      finalPoints += pointsGain;

      // Calculate membership evolution
      let newMembership = currentUser.membership;
      const totalPointsAccrued = finalPoints;
      if (totalPointsAccrued > 4000) {
        newMembership = 'Platinum';
      } else if (totalPointsAccrued > 2000) {
        newMembership = 'Gold';
      } else if (totalPointsAccrued > 800) {
        newMembership = 'Silver';
      } else {
        newMembership = 'Bronze';
      }

      // If user referred by another, update affiliate stats
      if (currentUser.referredBy) {
        const referrerIdx = users.findIndex(u => u.referralCode === currentUser.referredBy);
        if (referrerIdx > -1) {
          const promoBonus = Math.floor(orderData.totalAmount * 0.05); // 5% affiliate commis
          setUsers(prevU => prevU.map(u => u.referralCode === currentUser.referredBy ? {
            ...u,
            commissionsEarned: (u.commissionsEarned || 0) + promoBonus,
            points: u.points + 200 // Bonus points for referral shop
          } : u));
        }
      }

      const updatedUser: User = {
        ...currentUser,
        points: finalPoints,
        membership: newMembership
      };
      setCurrentUser(updatedUser);
    }

    return newOrder;
  };

  const updateOrderStatus = (orderId: string, updates: Partial<Order>) => {
    setOrders((prev) =>
      prev.map((ord) => (ord.id === orderId ? { ...ord, ...updates } : ord))
    );
  };

  const addProductReview = (review: Omit<Review, 'id' | 'createdAt'>) => {
    const newRev: Review = {
      ...review,
      id: `rev-${Date.now()}`,
      createdAt: new Date().toISOString()
    };

    setReviews((prev) => [newRev, ...prev]);

    // Recalculate product rating
    setProducts((prevProd) =>
      prevProd.map((prod) => {
        if (prod.id === review.productId) {
          const relevant = [newRev, ...reviews.filter(r => r.productId === prod.id)];
          const avgRating = Number(
            (relevant.reduce((sum, r) => sum + r.rating, 0) / relevant.length).toFixed(1)
          );
          return {
            ...prod,
            rating: avgRating,
            reviewsCount: relevant.length
          };
        }
        return prod;
      })
    );
  };

  const updateBanners = (newBanners: Banner[]) => {
    setBannersState(newBanners);
  };

  const updateCms = (newCms: Partial<BlogOrCms>) => {
    setCms_State((prev) => ({ ...prev, ...newCms }));
  };

  const recordLoginActivity = (activity: Omit<LoginActivity, 'id' | 'timestamp'>) => {
    const newAct: LoginActivity = {
      ...activity,
      id: `act-${Date.now()}`,
      timestamp: new Date().toISOString()
    };
    setLoginActivities((prev) => [newAct, ...prev].slice(0, 150)); // limit log to 150 elements
  };

  return (
    <AppContext.Provider
      value={{
        settings,
        updateSettings,
        users,
        currentUser,
        setCurrentUser,
        isEmailVerified,
        setEmailVerified,
        products,
        setProducts,
        categories: SEED_CATEGORIES,
        coupons,
        setCoupons,
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        appliedCoupon,
        applyCouponCode,
        removeCouponCode,
        orders,
        createOrder,
        updateOrderStatus,
        reviews,
        addProductReview,
        banners,
        updateBanners,
        cms,
        updateCms,
        loginActivities,
        recordLoginActivity,
        loyaltyPointsExchangeRate,
        isInstalled,
        installApp
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used inside an AppProvider');
  return context;
};
