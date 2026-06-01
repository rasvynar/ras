import { promises as fs } from 'fs';
import path from 'path';
import {
  User,
  UserActivity,
  Product,
  Category,
  Order,
  Review,
  Coupon,
  Banner,
  SystemSettings,
  CMSPages,
  PaymentDetails
} from './types';

// Database seed configurations
const SEED_CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'Hoodie', slug: 'hoodie', description: 'Premium heavyweight oversized streetwear hoodies' },
  { id: 'cat-2', name: 'T-Shirt', slug: 't-shirt', description: 'Luxury heavy pima cotton tees' },
  { id: 'cat-3', name: 'Sweater', slug: 'sweater', description: 'Modern knit and vintage crewnecks' },
  { id: 'cat-4', name: 'Jacket', slug: 'jacket', description: 'Techwear, windbreakers and street jackets' },
  { id: 'cat-5', name: 'Polo Shirt', slug: 'polo-shirt', description: 'Minimalist athletic fit polo collars' },
  { id: 'cat-6', name: 'Pants', slug: 'pants', description: 'Functional streetwear and tailored cargo trousers' },
  { id: 'cat-7', name: 'Cap', slug: 'cap', description: 'Distressed strapback and tactical headwear' },
  { id: 'cat-8', name: 'Accessories', slug: 'accessories', description: 'Heavy silver chains, industrial belts, wallets' },
  { id: 'cat-9', name: 'Limited Edition', slug: 'limited-edition', description: 'Highly exclusive experimental designs' }
];

const SEED_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'RASVYNAR Ghost Monogram Hoodie',
    slug: 'rasvynar-ghost-monogram-hoodie',
    description: 'A masterpiece in premium street apparel. Featuring an ultra-heavy weight 480gsm organic loopback cotton, oversized slouchy fit, double-lined hood without drawcords for an ultra-clean appearance, and our iconic tonal ghost-monogram high density 3D print across the chest.',
    details: '• 100% organic loopback cotton (480gsm)\n• High-density 3D tonal brand branding\n• Dropped shoulder slouch fit\n• Ribbed knit cuffs and hem paneling\n• Pre-shrunk and silicone washed for a cashmere soft touch',
    price: 1249000,
    discountPrice: 1099000,
    stock: 24,
    weight: 950,
    sku: 'RSV-HOD-01',
    categoryId: 'cat-1',
    images: [
      'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=800&auto=format&fit=crop'
    ],
    rating: 4.9,
    salesCount: 142,
    sizes: ['M', 'L', 'XL', 'XXL'],
    colors: ['Jet Black', 'Space Gray', 'Alabaster White'],
    isNew: true
  },
  {
    id: 'prod-2',
    name: 'RASVYNAR Cyber-Street Utility Anorak',
    slug: 'rasvynar-cyber-street-utility-anorak',
    description: 'An advanced outerwear garment incorporating elements of brutalist functional design. Water-resistant matte nylon shell with magnetic quick-release tactical buckles, multi-pocket configurations, and adjustable ergonomic toggles.',
    details: '• Membrane matte nylon ripstop with hydrophobic coating\n• Premium industrial utility utility snaps and YKK aquaguard zippers\n• Modular detachable zip pockets\n• Reflective silver branding accents\n• Breathable mesh lining',
    price: 1899000,
    discountPrice: 1549000,
    stock: 12,
    weight: 850,
    sku: 'RSV-JKT-04',
    categoryId: 'cat-4',
    images: [
      'https://images.unsplash.com/photo-1548883354-7622d03aca27?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=800&auto=format&fit=crop'
    ],
    rating: 4.8,
    salesCount: 64,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Onyx Matte Black', 'Concrete Gray', 'Acid Lime Burst'],
    isNew: true
  },
  {
    id: 'prod-3',
    name: 'RASVYNAR Vintage heavy Knit Sweater',
    slug: 'rasvynar-vintage-heavy-knit-sweater',
    description: 'Exquisite drop-shoulder sweater engineered with a premium heavy-gauge structured cable weave. Styled in collaboration with master weavers, it represents the modern evolution of traditional knitwear with futuristic proportions.',
    details: '• 70% merino wool, 30% recycled acrylic blend\n• Custom complex heavy structured stitch patterns\n• Rib-knit mock-neck collar and cuffs\n• Unisex relaxed boxy silhouette',
    price: 1150000,
    discountPrice: 950000,
    stock: 18,
    weight: 780,
    sku: 'RSV-SWT-02',
    categoryId: 'cat-3',
    images: [
      'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?q=80&w=800&auto=format&fit=crop'
    ],
    rating: 5.0,
    salesCount: 38,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Taupe Pearl', 'Brutalist Concrete', 'Carbon Void'],
    isNew: false
  },
  {
    id: 'prod-4',
    name: 'RASVYNAR Heavy Silken Pima Tee',
    slug: 'rasvynar-heavy-silken-pima-tee',
    description: 'The ultimate canvas. Tailored from highly sought-after 260gsm double-twisted Peruvian pima cotton, featuring a silken pre-wash finish, micro-rib high neck collar, and structural rear shoulder seam detailing.',
    details: '• 100% long-staple silken pima cotton (260gsm)\n• Micro-rib high neckline block\n• Architectural shoulder shape definition\n• Subtly screenprinted core coordinates at neck outer-back',
    price: 499000,
    discountPrice: 399000,
    stock: 50,
    weight: 320,
    sku: 'RSV-TEE-02',
    categoryId: 'cat-2',
    images: [
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=800&auto=format&fit=crop'
    ],
    rating: 4.7,
    salesCount: 310,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Pristine White', 'Void Black', 'Cement Moss'],
    isNew: false
  },
  {
    id: 'prod-5',
    name: 'RASVYNAR Tech Tactical Cargo Pants',
    slug: 'rasvynar-tech-tactical-cargo-pants',
    description: 'Engineered pants for urban commutes and daily luxury. Equipped with double-pleated knees for standard articulation, adjustable Velcro ankle bands, internal nylon tension straps, and water-repellent zippers.',
    details: '• Structured cotton-nylon stretch twill fabric\n• Articulated knee construction for 360-degree mobility\n• Integrated quick-draw magnetic cargo pockets\n• Tactical key loop on front-left belt ring',
    price: 1399000,
    discountPrice: 1199000,
    stock: 15,
    weight: 680,
    sku: 'RSV-PAN-05',
    categoryId: 'cat-6',
    images: [
      'https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=800&auto=format&fit=crop'
    ],
    rating: 4.9,
    salesCount: 89,
    sizes: ['M', 'L', 'XL'],
    colors: ['Carbon Black', 'Stardust Slate', 'Earth Khaki'],
    isNew: true
  },
  {
    id: 'prod-6',
    name: 'RASVYNAR Silver Monogram Zip Wallet',
    slug: 'rasvynar-silver-monogram-zip-wallet',
    description: 'A precious, highly durable luxury accessory. Handcrafted from top-grade crossgrain saffiano leather featuring a laser-engraved steel branding plate and full YKK Excella silver metallic zip enclosure.',
    details: '• 100% full grain Saffiano leather\n• Electroplated anti-corrosive silver monogram emblem\n• 6 dedicated card slots, central zip divider and bill pocket\n• RFID blockage technology embedded inside leather liner',
    price: 899000,
    discountPrice: 749000,
    stock: 30,
    weight: 150,
    sku: 'RSV-ACC-03',
    categoryId: 'cat-8',
    images: [
      'https://images.unsplash.com/photo-1627124424074-76576d9daeca?q=80&w=800&auto=format&fit=crop'
    ],
    rating: 4.8,
    salesCount: 55,
    sizes: ['S'],
    colors: ['Sterling Silver', 'Brushed Platinum', 'Onyx Leather'],
    isNew: false
  },
  {
    id: 'prod-7',
    name: 'RASVYNAR Distressed Metal Strap Cap',
    slug: 'rasvynar-distressed-metal-strap-cap',
    description: 'Unstructured, custom curved-brim cap with industrial treatment. Distressed paint splashes, frayed edge details, and a heavy laser-etched metal brand badge linked directly to the back adjustment belt.',
    details: '• Vintage heavy washed 100% cotton drill canvas\n• Real oxidized rust-proof vintage metal slider adjustment buckle\n• Double frayed edge finish with industrial contrast stitching\n• Embroidered signature monogram',
    price: 399000,
    discountPrice: 299000,
    stock: 45,
    weight: 110,
    sku: 'RSV-CAP-01',
    categoryId: 'cat-7',
    images: [
      'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?q=80&w=800&auto=format&fit=crop'
    ],
    rating: 4.6,
    salesCount: 124,
    sizes: ['M', 'L'],
    colors: ['Coal Black', 'Washed Dust', 'Vandals Red'],
    isNew: false
  },
  {
    id: 'prod-8',
    name: 'RASVYNAR Liquid Silver Astronaut Coat',
    slug: 'rasvynar-liquid-silver-astronaut-coat',
    description: 'A crowning achievement of the futuristic streetwear line. Made of a reflective technical thermochromatic material that moves and shines with dynamic temperature and light, mimicking futuristic chrome layers.',
    details: '• Holographic reflective silver outer shell (windproof + waterproof)\n• Thermally regulating down filler feathering\n• Custom laser-numbered interior branding label\n• Integrated emergency back strap for easy wearability when warm',
    price: 3499000,
    discountPrice: 2999000,
    stock: 5,
    weight: 1200,
    sku: 'RSV-LTD-99',
    categoryId: 'cat-9',
    images: [
      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=800&auto=format&fit=crop'
    ],
    rating: 5.0,
    salesCount: 16,
    sizes: ['M', 'L', 'XL'],
    colors: ['Liquid Chrome', 'Nebula Iridescent'],
    isNew: true
  }
];

const SEED_BANNERS: Banner[] = [
  {
    id: 'ban-1',
    title: 'THE CORE OF NEW CHROME',
    subtitle: 'Limited Edition Drop - Vol 03',
    imageUrl: 'https://images.unsplash.com/photo-1548883354-7622d03aca27?q=80&w=1600&auto=format&fit=crop',
    linkUrl: '/shop?category=limited-edition',
    isActive: true
  },
  {
    id: 'ban-2',
    title: 'STYLE BEYOND ORDINARY',
    subtitle: 'Signature Streetwear Staples',
    imageUrl: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=1600&auto=format&fit=crop',
    linkUrl: '/shop?category=hoodie',
    isActive: true
  }
];

const SEED_CMS: CMSPages = {
  aboutUs: `# ABOUT RASVYNAR

**Style Beyond Ordinary.**

RASVYNAR is a high-concept fashion brand bridging the gap between luxury haute couture, modern utilitarian design, and tactical futuristic streetwear. Founded with a vision to transcend transient trends, we combine high-density performance fabrics, rigorous architectural cuts, and high-contrast styling to define a new wardrobe statement.

Our philosophy stands on three pristine pillars:
- **Material Superiority:** Using loopback organic cottons, long-staple pima silken fiber weaving, and advanced technomaterials like thermochromatic layers.
- **Architectural Cuts:** Precision oversized styling, drop-shoulder silhouettes, and multi-functional garments engineered to adapt.
- **Minimalist Aesthetic:** Subdued luxury branding, high-concept monograms, and monochrome dominance.`,

  contact: `# HARBOR / USER CUSTOMER SERVICE

We operate on digital, fast channels. Our command central is ready to assist you.

**HEADQUARTERS & ATELIER**
RASVYNAR ATELIER
Level 12, Capital Grid SOHO, SCBD
Jakarta Selatan, Indonesia 12190

**DIRECT COMMUNICATION CHANNELS**
- **Business WhatsApp Command:** +62 811-9238-1200
- **Secure Email Portal:** rasvynar@gmail.com
- **Instagram Command Center:** @rasvynar.studio

**SERVICE HOURS**
Monday to Friday: 09:00 - 18:00 (GMT+7)
Saturday: 10:00 - 15:00 (GMT+7)
Our response rate is typically under 15 minutes during central office windows.`,

  faq: `# FREQUENT QUERIES (FAQ)

### 1. Are these items limited drops or permanently stocked?
Most RASVYNAR items are produced in numbered, limited drops. Some essential items, like the Pima Tee, may see periodic re-runs. "Limited Edition" drops will never be reproduced once stocks deplete.

### 2. How are shipping and distance costs handled?
We leverage intelligent location tracking via Google Maps coordinates. Distances are computed automatically from our flagship SCBD terminal in Jakarta to your checked delivery coordinate, giving accurate live quotes instantly.

### 3. What payment options are supported?
We integrate real-time automated payment gateways supporting QRIS, E-Wallets (DANA, GoPay, OVO, ShopeePay), bank transfers, and Virtual Accounts for BCA, Mandiri, BNI, BRI, and SeaBank.

### 4. How long does deliveries take?
All commands are fulfilled in under 24 hours. Delivery estimates:
- Jabodetabek: 1 - 2 business days
- Outside Java Island: 3 - 5 business days`,

  privacyPolicy: `# SECURE CUSTOMER DATA PRIVACY POLICY

Your security is the foundation of RASVYNAR. We implement Enterprise-grade security policies:
- **Zero Raw Storage:** No plain text credentials. Password hashes use salt-loaded bcrypt algorithms.
- **Integrations:** Maps API is processed directly via private tokens, and checkout paths are fully rate-limited.
- **Device Logs:** Login histories, device fingerprints, and IPs are mapped strictly for anti-fraud analysis.
- **Third Party Gateways:** Credit cards and payment hashes are handled securely by PCI-DSS tier Midtrans and Xendit processing engines. We never see or store your payment cards.`,

  termsOfService: `# TERMS OF SERVICE COMMAND

By using RASVYNAR domain, portals, and services, you submit to our terms:
- **Authenticity Mandate:** We guarantee 100% original designs manufactured in clean, verified ateliers.
- **Order Limit Security:** We reserve the right to limit quantities of high-demand items (particularly "Limited Edition" lines) to maintain accessibility.
- **Account Verification:** Verification of email and WhatsApp is mandatory to maintain account active status for purchasing and points.`,

  returnRefundPolicy: `# RETURN & REFUND PROTOCOL

Our products represent the highest level of craftsmanship. If an item fails to meet your expectations:
- **Returns window:** Within 7 calendar days of receipt.
- **Conditions:** Unworn, unwashed, brand tags fully intact, enclosed in original brand boxes.
- **Process:** Submit return intent via your order page, or ping our WhatsApp team directly.
- **Refunding:** We refund 100% of order totals to your bank or E-wallet within 3 business days of atelier verification.`,

  shippingPolicy: `# COURIER & SHIPPING LOGISTICS

We enforce high safety thresholds during transit. All shipments include tracking links and real-time status updates:
- **Couriers:** Partners include JNE, J&T, SiCepat, POS Indonesia, and AnterAja.
- **Estimates:** Automatically pre-calculated during the automated Checkout step.
- **Refused deliveries:** If a delivery fails after 3 tries, it is returned to SCBD HQ for rescheduling.`,

  sizeGuide: `# ARCHITECTURAL SIZE DECODING

Our garments skew heavily relaxed and oversized. Please review exact measurements below:

| Style Class | Chest (cm) | Length (cm) | Ideal Height (cm) |
| --- | --- | --- | --- |
| **S** | 114 | 68 | 155 - 165 |
| **M** | 120 | 70 | 165 - 175 |
| **L** | 126 | 72 | 175 - 182 |
| **XL**| 132 | 74 | 182 - 190 |
| **XXL**| 138 | 76 | 190+ |`
};

export interface DatabaseSchema {
  users: User[];
  userActivities: UserActivity[];
  categories: Category[];
  products: Product[];
  orders: Order[];
  payments: PaymentDetails[];
  reviews: Review[];
  coupons: Coupon[];
  banners: Banner[];
  settings: SystemSettings;
  cms: CMSPages;
}

const DB_FILE_PATH = path.join(process.cwd(), 'database.json');

export class JSONDataStore {
  private schema!: DatabaseSchema;
  private initialized = false;

  async init() {
    if (this.initialized) return;

    try {
      const exists = await fs.stat(DB_FILE_PATH).then(() => true).catch(() => false);
      if (exists) {
        const fileContent = await fs.readFile(DB_FILE_PATH, 'utf-8');
        this.schema = JSON.parse(fileContent);
      } else {
        await this.bootstrapDefault();
      }
      this.initialized = true;
    } catch (error) {
      console.error('Error initializing database:', error);
      await this.bootstrapDefault();
      this.initialized = true;
    }
  }

  private async bootstrapDefault() {
    this.schema = {
      users: [],
      userActivities: [],
      categories: SEED_CATEGORIES,
      products: SEED_PRODUCTS,
      orders: [],
      payments: [],
      reviews: [
        {
          id: 'rev-1',
          productId: 'prod-1',
          userId: 'user-mock-1',
          userName: 'Arsa Wijaya',
          userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150',
          rating: 5,
          comment: 'Kualitas bahan hoodie gila sih, tebal banget (480gsm beneran). Jahitan super rapi dan potongan boxy fitting-nya dapet banget. Worth every single Rupiah!',
          createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'rev-2',
          productId: 'prod-1',
          userId: 'user-mock-2',
          userName: 'Dian Saputra',
          userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150',
          rating: 4,
          comment: 'Warna Space Gray-nya elegan abis. Cuma karena tebal agak anget kalau dipakai siang bolong, tapi sangat premium!',
          createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'rev-3',
          productId: 'prod-4',
          userId: 'user-mock-3',
          userName: 'Bagas Aditya',
          rating: 5,
          comment: 'Kaos paling berkualitas yang pernah saya beli di brand lokal. Tekstur pima cotton-nya licin, kerah kencang tidak melar walau dicuci berkali-kali.',
          createdAt: new Date().toISOString()
        }
      ],
      coupons: [
        { code: 'RASVYNARFIRST', type: 'PERCENTAGE', value: 10, minSpend: 500000, expiresAt: '2027-12-31T23:59:59Z', isActive: true },
        { code: 'LUXURYSTREET', type: 'FIXED', value: 150000, minSpend: 1500000, expiresAt: '2027-12-31T23:59:59Z', isActive: true },
        { code: 'CHROME30', type: 'PERCENTAGE', value: 30, minSpend: 2500000, expiresAt: '2027-12-31T23:59:59Z', isActive: true }
      ],
      banners: SEED_BANNERS,
      settings: {
        brandName: 'RASVYNAR',
        tagline: 'Style Beyond Ordinary',
        emailAdmin: 'rasvynar@gmail.com',
        phoneBusiness: '6281192381200',
        addressBusiness: 'Level 12, Capital Grid SOHO, SCBD, Jakarta Selatan, 12190',
        shippingBasePrice: 4000, // Rp 4,000 per km
        installationCompleted: false // wizard triggers if false
      },
      cms: SEED_CMS
    };
    await this.save();
  }

  async save() {
    try {
      await fs.writeFile(DB_FILE_PATH, JSON.stringify(this.schema, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed writing file state database', e);
    }
  }

  // Getters
  async getUsers() { await this.init(); return this.schema.users; }
  async getUserActivities() { await this.init(); return this.schema.userActivities; }
  async getCategories() { await this.init(); return this.schema.categories; }
  async getProducts() { await this.init(); return this.schema.products; }
  async getOrders() { await this.init(); return this.schema.orders; }
  async getPayments() { await this.init(); return this.schema.payments; }
  async getReviews() { await this.init(); return this.schema.reviews; }
  async getCoupons() { await this.init(); return this.schema.coupons; }
  async getBanners() { await this.init(); return this.schema.banners; }
  async getSettings() { await this.init(); return this.schema.settings; }
  async getCMS() { await this.init(); return this.schema.cms; }

  // Setters/Updates
  async setUsers(users: User[]) { this.schema.users = users; await this.save(); }
  async setUserActivities(activites: UserActivity[]) { this.schema.userActivities = activites; await this.save(); }
  async setCategories(categories: Category[]) { this.schema.categories = categories; await this.save(); }
  async setProducts(products: Product[]) { this.schema.products = products; await this.save(); }
  async setOrders(orders: Order[]) { this.schema.orders = orders; await this.save(); }
  async setPayments(payments: PaymentDetails[]) { this.schema.payments = payments; await this.save(); }
  async setReviews(reviews: Review[]) { this.schema.reviews = reviews; await this.save(); }
  async setCoupons(coupons: Coupon[]) { this.schema.coupons = coupons; await this.save(); }
  async setBanners(banners: Banner[]) { this.schema.banners = banners; await this.save(); }
  async setSettings(settings: SystemSettings) { this.schema.settings = settings; await this.save(); }
  async setCMS(cms: CMSPages) { this.schema.cms = cms; await this.save(); }
}

export const dbStore = new JSONDataStore();
