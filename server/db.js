import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.resolve(__dirname, 'database.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Connected to SQLite database at:', dbPath);
  }
});

// Enable foreign keys
db.run('PRAGMA foreign_keys = ON');

export function initDatabase() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // 1. Users Table
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          mobile TEXT NOT NULL,
          password_hash TEXT NOT NULL,
          role TEXT DEFAULT 'user',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // 2. Business Categories Table
      db.run(`
        CREATE TABLE IF NOT EXISTS business_categories (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          code TEXT UNIQUE NOT NULL,
          name_en TEXT NOT NULL,
          name_te TEXT NOT NULL,
          name_hi TEXT NOT NULL,
          icon TEXT NOT NULL,
          description TEXT,
          typical_investment_min INTEGER,
          typical_investment_max INTEGER
        )
      `);

      // 3. Government Schemes Table
      db.run(`
        CREATE TABLE IF NOT EXISTS schemes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          code TEXT UNIQUE NOT NULL,
          name_en TEXT NOT NULL,
          name_te TEXT NOT NULL,
          name_hi TEXT NOT NULL,
          department TEXT NOT NULL,
          min_cost INTEGER DEFAULT 0,
          max_cost INTEGER DEFAULT 5000000,
          max_loan_pct REAL DEFAULT 90.0,
          max_loan_amount INTEGER DEFAULT 4500000,
          interest_rate REAL DEFAULT 8.0,
          tenure_years INTEGER DEFAULT 7,
          moratorium_months INTEGER DEFAULT 6,
          margin_pct REAL DEFAULT 10.0,
          eligibility TEXT NOT NULL,
          benefits TEXT NOT NULL,
          documents_json TEXT NOT NULL,
          official_link TEXT NOT NULL,
          rules TEXT NOT NULL,
          last_updated TEXT DEFAULT '2026-08-15'
        )
      `);

      // 4. Products & Machinery Table
      db.run(`
        CREATE TABLE IF NOT EXISTS products (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          category_code TEXT NOT NULL,
          name TEXT NOT NULL,
          brand TEXT NOT NULL,
          model TEXT NOT NULL,
          price INTEGER NOT NULL,
          specs TEXT NOT NULL,
          capacity TEXT NOT NULL,
          warranty TEXT NOT NULL,
          supplier_name TEXT NOT NULL,
          supplier_status TEXT CHECK(supplier_status IN ('Verified Company', 'Verified Supplier', 'Verification Pending')) DEFAULT 'Verification Pending',
          official_link TEXT NOT NULL,
          image_url TEXT
        )
      `);

      // 5. Competitors Mock Spatial Table
      db.run(`
        CREATE TABLE IF NOT EXISTS competitors (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          category_code TEXT NOT NULL,
          name TEXT NOT NULL,
          state TEXT NOT NULL,
          district TEXT NOT NULL,
          mandal TEXT NOT NULL,
          lat REAL NOT NULL,
          lng REAL NOT NULL,
          address TEXT NOT NULL
        )
      `);

      // Seed Initial Categories
      seedInitialData();
      resolve();
    });
  });
}

function seedInitialData() {
  // Check if categories exist
  db.get("SELECT COUNT(*) as count FROM business_categories", [], (err, row) => {
    if (err || row.count > 0) return;

    console.log("Seeding initial Business Categories, Schemes, Products, and Competitor data...");

    const categories = [
      { code: 'dairy', name_en: 'Dairy Farming', name_te: 'పాడి పరిశ్రమ (Dairy)', name_hi: 'डेयरी फार्मिंग', icon: 'Milk', description: 'Milk production, cattle breeding, and milk processing.', min: 100000, max: 1500000 },
      { code: 'poultry', name_en: 'Poultry Farming', name_te: 'కోళ్ళ పెంపకం (Poultry)', name_hi: 'पोल्ट्री फार्मिंग', icon: 'Egg', description: 'Layer and broiler chicken farming for eggs and meat.', min: 150000, max: 2500000 },
      { code: 'goat_farming', name_en: 'Goat & Sheep Farming', name_te: 'మేకల & గొర్రెల పెంపకం', name_hi: 'बकरी व भेड़ पालन', icon: 'Footprints', description: 'Livestock rearing for meat and breeding.', min: 80000, max: 1000000 },
      { code: 'agriculture', name_en: 'Agriculture & Organic Farming', name_te: 'వ్యవసాయం & ఆర్గానిక్ సాగు', name_hi: 'कृषि व जैविक खेती', icon: 'Sprout', description: 'Crop cultivation, horticulture, and organic produce.', min: 50000, max: 800000 },
      { code: 'fish_farming', name_en: 'Fish & Aquaculture', name_te: 'చేపల పెంపకం (Aquaculture)', name_hi: 'मत्स्य पालन', icon: 'Fish', description: 'Pond aquaculture, Biofloc, and fish hatchery.', min: 120000, max: 2000000 },
      { code: 'food_processing', name_en: 'Food Processing & Spices', name_te: 'ఆహార ಸಂస్కరణ & మసాలాలు', name_hi: 'खाद्य प्रसंस्करण व मसाले', icon: 'Utensils', description: 'Grain milling, spice grinding, pickles, and oil extraction.', min: 100000, max: 3000000 },
      { code: 'bakery', name_en: 'Bakery & Confectionery', name_te: 'బేకరీ & బ్రెడ్ తయారీ', name_hi: 'बेकरी व कन्फेक्शनरी', icon: 'Cake', description: 'Baking bread, cakes, cookies, and rusks.', min: 150000, max: 1200000 },
      { code: 'tailoring', name_en: 'Tailoring & Garments', name_te: 'టైలరింగ్ & రెడీమేడ్ దుస్తులు', name_hi: 'सिलाई व वस्त्र उद्योग', icon: 'Scissors', description: 'Stitching, embroidery, and boutique garment making.', min: 50000, max: 600000 },
      { code: 'mobile_repair', name_en: 'Mobile & Electronics Repair', name_te: 'మొబైల్ & ఎలక్ట్రానిక్స్ రిపేర్', name_hi: 'मोबाइल रिपेयरिंग', icon: 'Smartphone', description: 'Smartphone repair, accessories sales, and servicing.', min: 40000, max: 400000 },
      { code: 'retail_grocery', name_en: 'Grocery & Supermarket', name_te: 'కిరాణా సరుకుల దుకాణం', name_hi: 'किराना व सुपरमार्केट', icon: 'ShoppingBag', description: 'Retail store for daily fast-moving consumer goods.', min: 100000, max: 2000000 },
      { code: 'restaurant_tiffin', name_en: 'Tiffin Center & Restaurant', name_te: 'టిఫిన్ సెంటర్ & రెస్టారెంట్', name_hi: 'टिफिन सेंटर व रेस्टोरेंट', icon: 'Coffee', description: 'South/North Indian breakfast, meals, and food takeaway.', min: 80000, max: 1500000 },
      { code: 'salon_beauty', name_en: 'Salon & Beauty Parlor', name_te: 'సలూన్ & బ్యూటీ పార్లర్', name_hi: 'सैलून व ब्यूटी पार्लर', icon: 'Sparkles', description: 'Grooming, hair styling, and beauty spa services.', min: 60000, max: 800000 },
      { code: 'solar_energy', name_en: 'Solar & Renewable Energy Services', name_te: 'సోలార్ సిస్టమ్స్ సేవలు', name_hi: 'सोलर ऊर्जा सेवाएं', icon: 'Sun', description: 'Rooftop solar installation, pump setup, and servicing.', min: 200000, max: 4000000 },
      { code: 'automobile_service', name_en: 'Automobile Repair & Wash', name_te: 'ఆటోమొబైల్ రిపేర్ & వాషింగ్', name_hi: 'ऑटोमोबाइल सेवा व वाश', icon: 'Wrench', description: 'Two-wheeler/four-wheeler servicing and water wash.', min: 100000, max: 1500000 },
      { code: 'manufacturing_plastic', name_en: 'Small Scale Manufacturing', name_te: 'చిన్న తరహా తయారీ పరిశ్రమ', name_hi: 'लघु निर्माण उद्योग', icon: 'Factory', description: 'Paper cups, plastic molding, packaging materials.', min: 200000, max: 5000000 },
      { code: 'printing_digital', name_en: 'Digital Printing & Flex Banner', name_te: 'డిజిటల్ ప్రింటింగ్ & ఫ్లెక్స్', name_hi: 'डिजिटल प्रिंटिंग', icon: 'Printer', description: 'Flex banners, offset printing, graphic designing.', min: 150000, max: 2000000 }
    ];

    const stmtCat = db.prepare("INSERT INTO business_categories (code, name_en, name_te, name_hi, icon, description, typical_investment_min, typical_investment_max) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
    categories.forEach(c => stmtCat.run(c.code, c.name_en, c.name_te, c.name_hi, c.icon, c.description, c.min, c.max));
    stmtCat.finalize();

    // Seed Official Schemes
    const schemes = [
      {
        code: 'MICRO_FINANCE',
        name_en: 'Micro Finance Scheme (MFS)',
        name_te: 'మైక్రో ఫైనాన్స్ పథకం (Micro Finance)',
        name_hi: 'माइक्रो फाइनेंस योजना',
        department: 'National Backward Classes Finance & Development Corporation (NBCFDC)',
        min_cost: 0,
        max_cost: 140000,
        max_loan_pct: 90.0,
        max_loan_amount: 125000,
        interest_rate: 6.5,
        tenure_years: 3,
        moratorium_months: 3,
        margin_pct: 10.0,
        eligibility: 'Micro-entrepreneurs, small artisans, village businesses with project cost up to ₹1.40 Lakh.',
        benefits: 'Low interest rate of 6.5% p.a. Repayment in 3 years with 3-month moratorium.',
        documents_json: JSON.stringify(['Identity Proof (Aadhaar/Voter ID)', 'Address Proof (Ration Card/Electricity Bill)', 'Bank Passbook Copy', 'Quotation for Equipment/Stock', 'Self-Declaration Form']),
        official_link: 'https://nbcfdc.gov.in/en/micro-finance-scheme',
        rules: 'Project cost must not exceed ₹1.40 Lakh. 90% loan component capped at ₹1.25 Lakh. Beneficiary brings 10% margin capital.'
      },
      {
        code: 'TERM_LOAN',
        name_en: 'Term Loan Scheme (TLS)',
        name_te: 'టర్మ్ లోన్ పథకం (Term Loan Scheme)',
        name_hi: 'टर्म लोन योजना',
        department: 'Ministry of Micro, Small & Medium Enterprises (MSME)',
        min_cost: 140001,
        max_cost: 5000000,
        max_loan_pct: 90.0,
        max_loan_amount: 4500000,
        interest_rate: 8.0,
        tenure_years: 7,
        moratorium_months: 6,
        margin_pct: 10.0,
        eligibility: 'Individuals starting small or medium commercial enterprises up to ₹50 Lakh project cost.',
        benefits: 'Funding up to ₹45 Lakh (90% of cost) at 8% annual interest. 7 years repayment + 6 months moratorium.',
        documents_json: JSON.stringify(['Aadhaar & PAN Card', 'Detailed Project Report (DPR)', 'Machinery Quotations', 'Bank Statement (Last 6 Months)', 'Land / Lease Document', 'GST Registration (if applicable)']),
        official_link: 'https://msme.gov.in/schemes',
        rules: 'Project cost between ₹1.40 Lakh and ₹50 Lakh. Beneficiary margin contribution mandatory 10%.'
      },
      {
        code: 'PMEGP',
        name_en: 'Prime Minister Employment Generation Programme (PMEGP)',
        name_te: 'పిఎంఈజిపి పథకం (PMEGP)',
        name_hi: 'प्रधान मंत्री रोजगार सृजन कार्यक्रम',
        department: 'KVIC / Ministry of MSME',
        min_cost: 200000,
        max_cost: 5000000,
        max_loan_pct: 95.0,
        max_loan_amount: 4750000,
        interest_rate: 8.5,
        tenure_years: 7,
        moratorium_months: 6,
        margin_pct: 5.0,
        eligibility: 'Individuals above 18 years, VIII standard pass for projects > ₹10 Lakh in manufacturing.',
        benefits: 'Subsidy up to 35% in rural areas for SC/ST/OBC/Women entrepreneurs.',
        documents_json: JSON.stringify(['Aadhaar Card', 'Educational Qualification Certificate', 'Category / Caste Certificate', 'Detailed Project Report', 'EDP Training Certificate']),
        official_link: 'https://www.kviconline.gov.in/pmegpeportal/pmegphome/index.jsp',
        rules: 'Subsidy routed via bank after successful EDP training.'
      },
      {
        code: 'MUDRA_KISHOR',
        name_en: 'Pradhan Mantri MUDRA Yojana (Kishor / Tarun)',
        name_te: 'ముద్రా యోజన (MUDRA Loan)',
        name_hi: 'प्रधानमंत्री मुद्रा योजना',
        department: 'MUDRA Ltd / Department of Financial Services',
        min_cost: 50000,
        max_cost: 1000000,
        max_loan_pct: 90.0,
        max_loan_amount: 900000,
        interest_rate: 8.25,
        tenure_years: 5,
        moratorium_months: 6,
        margin_pct: 10.0,
        eligibility: 'Non-farm micro enterprise in manufacturing, trading, or service sector.',
        benefits: 'Collateral-free loans up to ₹10 Lakh. MUDRA Card provided for working capital.',
        documents_json: JSON.stringify(['MUDRA Application Form', 'Identity Proof & Address Proof', 'Quotations of Machinery', 'Business Address Proof']),
        official_link: 'https://www.mudra.org.in/',
        rules: 'No collateral or third-party guarantee required.'
      }
    ];

    const stmtScheme = db.prepare("INSERT INTO schemes (code, name_en, name_te, name_hi, department, min_cost, max_cost, max_loan_pct, max_loan_amount, interest_rate, tenure_years, moratorium_months, margin_pct, eligibility, benefits, documents_json, official_link, rules) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    schemes.forEach(s => stmtScheme.run(s.code, s.name_en, s.name_te, s.name_hi, s.department, s.min_cost, s.max_cost, s.max_loan_pct, s.max_loan_amount, s.interest_rate, s.tenure_years, s.moratorium_months, s.margin_pct, s.eligibility, s.benefits, s.documents_json, s.official_link, s.rules));
    stmtScheme.finalize();

    // Seed Products & Machinery with Verified Supplier status
    const products = [
      // Dairy Products
      { category_code: 'dairy', name: 'Automatic Single Bucket Milking Machine', brand: 'DeLaval / MilkMaster Pro', model: 'MM-200S', price: 38500, specs: '0.5 HP Single Phase Motor, Stainless Steel 25L Can, Pulsator Rate 60 PPM', capacity: '10-12 Cows/hr', warranty: '2 Years Manufacturer Warranty', supplier_name: 'DeLaval India Pvt Ltd', supplier_status: 'Verified Company', official_link: 'https://www.delaval.com/en-in/' },
      { category_code: 'dairy', name: 'Heavy Duty Stainless Steel Milk Can (40 Liter)', brand: 'DairyTech India', model: 'SS-304-40L', price: 4200, specs: 'Food grade SS 304, Jointless design, Anti-spill lid', capacity: '40 Liters', warranty: '1 Year Warranty', supplier_name: 'DairyTech Equipment Suppliers', supplier_status: 'Verified Supplier', official_link: 'https://www.dairytech.in/' },
      { category_code: 'dairy', name: 'Chaff Cutter & Fodder Shredder (Motorized)', brand: 'Kirloskar Agro', model: 'CC-MAX-3HP', price: 28000, specs: '3 HP Commercial Copper Motor, 4 High Carbon Steel Blades', capacity: '800-1000 kg/hr', warranty: '1.5 Years Warranty', supplier_name: 'Kirloskar Brothers Agro Division', supplier_status: 'Verified Company', official_link: 'https://www.kirloskarpumps.com/' },

      // Tailoring Products
      { category_code: 'tailoring', name: 'Industrial Single Needle Lockstitch Sewing Machine', brand: 'Juki / Usha Heavy Duty', model: 'DDL-8700 / Straight Stitch', price: 21500, specs: 'Direct Drive Motor, Automatic Thread Trimmer, LED Light, 5500 SPM', capacity: '5500 Stitches/min', warranty: '3 Years Warranty', supplier_name: 'Juki India Pvt Ltd', supplier_status: 'Verified Company', official_link: 'https://www.juki.com/' },
      { category_code: 'tailoring', name: '4-Thread Overlock Industrial Machine', brand: 'Singer / Jack', model: 'E4S-4-M03/333', price: 27000, specs: 'Integrated Direct Drive, Differential Feed Ratio 0.7-2mm', capacity: '6000 Stitches/min', warranty: '2 Years Warranty', supplier_name: 'Jack Sewing Machine Co.', supplier_status: 'Verified Supplier', official_link: 'https://www.jack-sewing.com/' },
      { category_code: 'tailoring', name: 'Vacuum Ironing Table with Steam Generator Boiler', brand: 'Hasel / Ramsons', model: 'R-VIB-500', price: 45000, specs: 'Heavy Duty Suction Blower, 3L Stainless Steel Boiler, Iron Included', capacity: 'Commercial Garment Finishing', warranty: '1 Year Warranty', supplier_name: 'Ramsons Garment Machinery', supplier_status: 'Verified Company', official_link: 'https://www.ramsonsindia.com/' },

      // Bakery Products
      { category_code: 'bakery', name: 'Commercial 2 Deck 4 Tray Gas Baking Oven', brand: 'CSK / Chefmate', model: 'CSK-2D4T-GAS', price: 85000, specs: 'Digital Temperature Controller, Stainless Steel Body, Top & Bottom Burners', capacity: '4 Trays (16x24 inch)', warranty: '2 Years Warranty', supplier_name: 'CSK Bakery Equipment Ltd', supplier_status: 'Verified Company', official_link: 'https://www.cskbakery.com/' },
      { category_code: 'bakery', name: 'Spiral Dough Mixer (20 kg Flour Capacity)', brand: 'Mastro / BakeryKing', model: 'SM-50L', price: 62000, specs: 'Dual Speed Motor (1.5 kW / 2.2 kW), Heavy Duty Bowl Guard', capacity: '20 kg Flour / 50L Bowl', warranty: '1 Year Warranty', supplier_name: 'BakeryKing Machinery India', supplier_status: 'Verified Supplier', official_link: 'https://www.bakeryking.in/' },

      // Mobile Repair
      { category_code: 'mobile_repair', name: 'SMD Rework Station & Soldering Machine', brand: 'Quick / Sugon', model: 'Quick 861DW', price: 14500, specs: '1000W Power, Digital Display, 3 Preset Channels, Auto Standby', capacity: 'Precision SMD Soldering', warranty: '1 Year Warranty', supplier_name: 'Quick Tools India Ltd', supplier_status: 'Verified Supplier', official_link: 'https://www.quicktool.in/' },
      { category_code: 'mobile_repair', name: 'LCD Screen Separator & Vacuum Laminating Machine', brand: 'TBK / Sunshine', model: 'TBK-288', price: 32000, specs: 'Built-in Vacuum Pump, Automatic Temperature Hold, Universal Mold', capacity: 'Screen Repair up to 7 inches', warranty: '1 Year Warranty', supplier_name: 'Sunshine Mobile Tools', supplier_status: 'Verification Pending', official_link: 'https://www.sunshinetools.in/' }
    ];

    const stmtProd = db.prepare("INSERT INTO products (category_code, name, brand, model, price, specs, capacity, warranty, supplier_name, supplier_status, official_link, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    products.forEach(p => stmtProd.run(p.category_code, p.name, p.brand, p.model, p.price, p.specs, p.capacity, p.warranty, p.supplier_name, p.supplier_status, p.official_link, p.image_url || null));
    stmtProd.finalize();

    // Seed Mock Competitors across Andhra Pradesh / Telangana / India coords
    const competitors = [
      { category_code: 'dairy', name: 'Sri Lakshmi Dairy Farm & Milk Center', state: 'Andhra Pradesh', district: 'Guntur', mandal: 'Tadepalli', lat: 16.483, lng: 80.601, address: 'Main Road, Tadepalli, Guntur' },
      { category_code: 'dairy', name: 'Venkateswara Milk Chilling Unit', state: 'Andhra Pradesh', district: 'Guntur', mandal: 'Mangalagiri', lat: 16.435, lng: 80.562, address: 'Near Bypass, Mangalagiri' },
      { category_code: 'dairy', name: 'Srinivasa Dairy Products', state: 'Telangana', district: 'Rangareddy', mandal: 'Shamshabad', lat: 17.251, lng: 78.435, address: 'Village Road, Shamshabad' },
      { category_code: 'tailoring', name: 'Royal Fashion Tailors & Boutique', state: 'Andhra Pradesh', district: 'Guntur', mandal: 'Tadepalli', lat: 16.488, lng: 80.608, address: 'Bypass Road, Tadepalli' },
      { category_code: 'tailoring', name: 'New Trend Ladies Tailoring Works', state: 'Andhra Pradesh', district: 'Guntur', mandal: 'Vijayawada Rural', lat: 16.512, lng: 80.635, address: 'Auto Nagar, Vijayawada' },
      { category_code: 'bakery', name: 'Iyengar Bakery & Sweets', state: 'Andhra Pradesh', district: 'Guntur', mandal: 'Tadepalli', lat: 16.479, lng: 80.598, address: 'Station Road, Tadepalli' },
      { category_code: 'bakery', name: 'Hot Oven Bakers & Confectionery', state: 'Telangana', district: 'Hyderabad', mandal: 'Kukatpally', lat: 17.484, lng: 78.401, address: 'Housing Board Colony, Kukatpally' },
      { category_code: 'poultry', name: 'Sri Rama Broiler Poultry Farm', state: 'Andhra Pradesh', district: 'Krishna', mandal: 'Gannavaram', lat: 16.538, lng: 80.798, address: 'Rural Route 4, Gannavaram' }
    ];

    const stmtComp = db.prepare("INSERT INTO competitors (category_code, name, state, district, mandal, lat, lng, address) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
    competitors.forEach(c => stmtComp.run(c.category_code, c.name, c.state, c.district, c.mandal, c.lat, c.lng, c.address));
    stmtComp.finalize();

    // Create default admin user
    db.run("INSERT INTO users (name, email, mobile, password_hash, role) VALUES (?, ?, ?, ?, ?)", [
      'Administrator',
      'admin@antigravity.ai',
      '9999999999',
      '$2a$10$wE/K3M/n6yRzR4E9iFp3yO4n5sK6w9P8u7t6r5e4w3q2a1s0d', // hashed admin123
      'admin'
    ]);

    console.log("Database successfully seeded!");
  });
}

export default db;
