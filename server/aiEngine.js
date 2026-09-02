/**
 * AI Business Advisory Engine
 * Generates custom location-aware, capital-aware, and business-specific feasibility & financial profiles.
 */

export function generateBusinessAdvisory(params) {
  const {
    category,
    location,
    capital,
    skills,
    competitorsCount = 0,
    language = 'en'
  } = params;

  const numericCapital = Number(capital) || 100000;
  const categoryCode = category?.code || 'dairy';
  const categoryName = category?.name_en || 'Business';
  const villageName = location?.village || 'Selected Village/Town';
  const mandalName = location?.mandal || 'Mandal';
  const districtName = location?.district || 'District';
  const stateName = location?.state || 'State';
  const hasExp = skills?.hasSkills === 'yes';
  const expYears = Number(skills?.years) || 0;

  // Calculate Feasibility Suitability
  let suitability = 'Suitable';
  let suitColor = 'green';
  let suitabilityReason = '';

  const minRequiredCapital = category?.typical_investment_min || 100000;

  if (numericCapital < minRequiredCapital * 0.6) {
    suitability = 'Not Recommended Based on Current Data';
    suitColor = 'red';
    suitabilityReason = `Available capital of ₹${numericCapital.toLocaleString('en-IN')} is below the minimum recommended setup capital of ₹${minRequiredCapital.toLocaleString('en-IN')} for ${categoryName}. You may face severe initial cash flow shortages unless additional government scheme loans are availed.`;
  } else if (competitorsCount >= 5 && !hasExp) {
    suitability = 'Suitable with Conditions';
    suitColor = 'amber';
    suitabilityReason = `High competition detected (${competitorsCount} similar businesses within 15 KM in ${mandalName} region) combined with lack of prior domain experience. Recommended to start with a specialized niche product or obtain technical training before launching.`;
  } else if (numericCapital >= minRequiredCapital && hasExp) {
    suitability = 'Suitable';
    suitColor = 'green';
    suitabilityReason = `Excellent match! Your available capital of ₹${numericCapital.toLocaleString('en-IN')} is sufficient for initial setup, and your ${expYears} years of hands-on experience provides a strong competitive edge in the ${mandalName} market.`;
  } else {
    suitability = 'Suitable with Conditions';
    suitColor = 'amber';
    suitabilityReason = `Feasible to start in ${villageName}, but requires careful allocation of initial capital and leveraging government loan schemes for buffer margin.`;
  }

  // Financial Estimation Formulas scaled to capital and category
  const estimatedProjectCost = Math.max(numericCapital * 1.5, minRequiredCapital);
  
  // Initial Investment Breakdown
  const equipmentCost = Math.round(estimatedProjectCost * 0.45);
  const setupCost = Math.round(estimatedProjectCost * 0.20);
  const initialStockCost = Math.round(estimatedProjectCost * 0.20);
  const workingCapitalBuffer = Math.round(estimatedProjectCost * 0.15);

  // Monthly Expense Breakdown
  const rawMaterialMonthly = Math.round(estimatedProjectCost * 0.18);
  const rentMonthly = Math.round(estimatedProjectCost * 0.04);
  const electricityMonthly = Math.round(estimatedProjectCost * 0.02);
  const labourMonthly = hasExp && numericCapital < 200000 ? Math.round(estimatedProjectCost * 0.03) : Math.round(estimatedProjectCost * 0.07);
  const transportMonthly = Math.round(estimatedProjectCost * 0.02);
  const marketingMonthly = Math.round(estimatedProjectCost * 0.015);
  const totalMonthlyExpenses = rawMaterialMonthly + rentMonthly + electricityMonthly + labourMonthly + transportMonthly + marketingMonthly;

  // Monthly Revenue Scenarios
  const expectedMonthlyRevenue = Math.round(totalMonthlyExpenses * 1.35);
  const conservativeMonthlyRevenue = Math.round(totalMonthlyExpenses * 1.15);
  const optimisticMonthlyRevenue = Math.round(totalMonthlyExpenses * 1.60);

  const expectedMonthlyProfit = expectedMonthlyRevenue - totalMonthlyExpenses;
  const conservativeMonthlyProfit = conservativeMonthlyRevenue - totalMonthlyExpenses;
  const optimisticMonthlyProfit = optimisticMonthlyRevenue - totalMonthlyExpenses;

  // Custom SWOT Generator based on business & location
  const swot = getCategorySwot(categoryCode, villageName, mandalName, hasExp, competitorsCount);

  // Custom Sales & Operations Advice
  const salesAdvice = getSalesAndOperations(categoryCode, villageName, districtName);

  return {
    categoryCode,
    categoryName,
    locationSummary: `${villageName}, ${mandalName}, ${districtName}, ${stateName}`,
    capital: numericCapital,
    skills,
    suitability,
    suitColor,
    suitabilityReason,
    
    // Market Analysis
    marketDemand: `There is a growing daily consumer demand for ${categoryName.toLowerCase()} in ${mandalName} and surrounding villages in ${districtName}. Local consumption patterns favor quality and reliable local suppliers.`,
    customerBase: salesAdvice.customerBase,
    marketReach: `Approximately 15 KM radius covering nearby villages, towns, and weekly markets (shandies) in ${districtName}.`,
    competitionAnalysis: `There are ${competitorsCount} identified similar businesses within 15 KM. ${competitorsCount > 3 ? 'Market has existing players; differentiation through pricing, hygiene, and service speed is essential.' : 'Low to moderate competition observed in this radius, offering a great early entrant advantage.'}`,
    pricingGuidance: salesAdvice.pricingGuidance,
    salesChannels: salesAdvice.salesChannels,
    marketingAdvice: salesAdvice.marketingAdvice,
    rawMaterialSupply: salesAdvice.rawMaterialSupply,
    businessOperations: salesAdvice.businessOperations,

    // Financial Breakdown
    financials: {
      totalProjectCost: estimatedProjectCost,
      initialInvestment: [
        { item: 'Equipment & Machinery', amount: equipmentCost },
        { item: 'Shop / Shed / Infrastructure Setup', amount: setupCost },
        { item: 'Initial Stock & Raw Materials', amount: initialStockCost },
        { item: 'Working Capital & Contingency Reserve', amount: workingCapitalBuffer }
      ],
      monthlyExpenses: [
        { item: 'Raw Materials / Feed / Consumables', amount: rawMaterialMonthly },
        { item: 'Premises Rent / Space Cost', amount: rentMonthly },
        { item: 'Electricity & Utility Bills', amount: electricityMonthly },
        { item: 'Labour / Helper Wages', amount: labourMonthly },
        { item: 'Transportation & Fuel', amount: transportMonthly },
        { item: 'Local Marketing & Branding', amount: marketingMonthly }
      ],
      totalMonthlyExpenses,
      scenarios: {
        conservative: {
          dailyRevenue: Math.round(conservativeMonthlyRevenue / 26),
          monthlyRevenue: conservativeMonthlyRevenue,
          annualRevenue: conservativeMonthlyRevenue * 12,
          monthlyProfit: conservativeMonthlyProfit,
          annualProfit: conservativeMonthlyProfit * 12
        },
        expected: {
          dailyRevenue: Math.round(expectedMonthlyRevenue / 26),
          monthlyRevenue: expectedMonthlyRevenue,
          annualRevenue: expectedMonthlyRevenue * 12,
          monthlyProfit: expectedMonthlyProfit,
          annualProfit: expectedMonthlyProfit * 12
        },
        optimistic: {
          dailyRevenue: Math.round(optimisticMonthlyRevenue / 26),
          monthlyRevenue: optimisticMonthlyRevenue,
          annualRevenue: optimisticMonthlyRevenue * 12,
          monthlyProfit: optimisticMonthlyProfit,
          annualProfit: optimisticMonthlyProfit * 12
        }
      }
    },

    swot,
    risks: [
      { risk: 'Fluctuation in Raw Material Prices', impact: 'High', mitigation: 'Establish quarterly procurement contracts with regional wholesale suppliers.' },
      { risk: 'Seasonal Demand Variations', impact: 'Medium', mitigation: 'Diversify product offerings during festival seasons and off-peak months.' },
      { risk: 'Local Competition & Price Undercutting', impact: 'Medium', mitigation: 'Focus on superior product quality, customer loyalty programs, and home delivery.' },
      { risk: 'Working Capital Shortfall', impact: 'High', mitigation: 'Maintain a 2-month cash reserve and utilize Government Micro Finance / MUDRA loans.' }
    ],

    generatedAt: new Date().toISOString()
  };
}

function getCategorySwot(code, village, mandal, hasExp, compCount) {
  switch (code) {
    case 'dairy':
      return {
        strengths: [
          'Constant daily cash flow from morning and evening milk sales.',
          'High demand for fresh unadulterated milk and dairy products in ' + village,
          hasExp ? 'Owner has prior hands-on cattle management experience.' : 'Low complexity operational routine once established.'
        ],
        weaknesses: [
          'High initial cattle acquisition cost and feed price sensitivity.',
          'Requires 365-day active management without daily breaks.'
        ],
        opportunities: [
          'Value addition through curd, ghee, paneer, and buttermilk processing.',
          'Government subsidies available under NABARD Dairy Entrepreneurship Scheme.'
        ],
        threats: [
          'Seasonal cattle disease outbreaks and vet medical expenses.',
          'Fluctuation in green fodder availability during dry summer months.'
        ]
      };
    case 'tailoring':
      return {
        strengths: [
          'Low overhead electricity and space cost.',
          'High profit margins on customized stitching and designer boutique wear.',
          hasExp ? 'Established stitching craftsmanship and design skills.' : 'Quick skill learning curve.'
        ],
        weaknesses: [
          'Dependence on skilled labor for peak festival rushes.',
          'Need for updated fashion sewing and overlock machinery.'
        ],
        opportunities: [
          'Bulk stitching orders for school uniforms, local hotel staff, and event wear in ' + mandal,
          'Online boutique sales via WhatsApp catalog and Instagram.'
        ],
        threats: [
          'Competition from cheap mass-produced ready-made garments.',
          'Seasonal fluctuations (high demand during festival/marriage seasons, quiet in monsoon).'
        ]
      };
    case 'bakery':
      return {
        strengths: [
          'High impulse purchase items with repeat daily customers.',
          'Excellent margins on cakes, snacks, and customized baked items.'
        ],
        weaknesses: [
          'Perishable nature of bakery products requiring strict inventory control.',
          'Dependence on reliable commercial baking ovens and steady power.'
        ],
        opportunities: [
          'Supplying fresh bread, rusks, and snacks to local tea stalls and grocery shops in ' + mandal,
          'Birthday and event cake orders with door delivery.'
        ],
        threats: [
          'Raw material price hikes (wheat flour, commercial butter, sugar).',
          'Competition from branded packaged snack distributors.'
        ]
      };
    default:
      return {
        strengths: [
          'Essential daily utility/service needed by local residents in ' + village,
          'Direct customer relationship without middleman commissions.',
          hasExp ? 'Strong domain knowledge.' : 'Standard operational model.'
        ],
        weaknesses: [
          'Initial customer trust building required in new market.',
          'Requires continuous working capital management.'
        ],
        opportunities: [
          'Expansion into surrounding mandal villages through home delivery.',
          'Government loan scheme financial assistance (Micro Finance & MUDRA).'
        ],
        threats: [
          'Local price competition from existing market vendors in ' + mandal,
          'General economic inflation impact on consumer spending.'
        ]
      };
  }
}

function getSalesAndOperations(code, village, district) {
  switch (code) {
    case 'dairy':
      return {
        customerBase: `Household consumers in ${village}, local tea stalls, sweet shops, hotels, and dairy collection centers.`,
        pricingGuidance: `Sell fresh cow milk at ₹55 - ₹65 / liter and buffalo milk at ₹75 - ₹85 / liter based on FAT content.`,
        salesChannels: [
          'Direct daily morning & evening doorstep household delivery',
          'Supply tie-up with local tea shops and restaurants in ' + village,
          'Bulk sale to regional cooperative dairy collection centers'
        ],
        marketingAdvice: `Offer free 2-day trial milk samples, highlight zero-adulteration fresh milk, distribute pamhplets in morning newspapers.`,
        rawMaterialSupply: `Procure green fodder from local farms in ${district}, dry fodder, and branded cattle feed concentrates.`,
        businessOperations: `Early morning 5 AM milking routine, daily cleanliness of cattle shed, cold storage milk cans, monthly veterinary checkup.`
      };
    case 'tailoring':
      return {
        customerBase: `Women, men, school students, and wedding families in ${village} and surrounding mandal.`,
        pricingGuidance: `Basic blouse stitching ₹150-₹300, Designer blouse ₹500-₹1200, Shirt/Pant stitching ₹350-₹700.`,
        salesChannels: [
          'Walk-in retail boutique shop',
          'Order booking via WhatsApp catalog & video calls',
          'Institutional uniform stitching contracts for local schools/hospitals'
        ],
        marketingAdvice: `Display finished designer dresses in shop window, post before/after stitching reels on Instagram, offer 10% discount on first stitching.`,
        rawMaterialSupply: `Wholesale threads, zips, buttons, canvas, lining cloth from regional textile hubs.`,
        businessOperations: `Measuring desk, single needle lockstitch machine, 4-thread overlock machine, steam iron station, fitting trial room.`
      };
    default:
      return {
        customerBase: `Local residents, pass-through commuters, local businesses, and households in ${village}.`,
        pricingGuidance: `Competitive market pricing with a 5% promotional introductory discount for the first 30 days.`,
        salesChannels: [
          'Direct retail counter sales',
          'Local phone & WhatsApp delivery orders',
          'B2B supply to neighboring small shops'
        ],
        marketingAdvice: `Grand opening banner, localized Google Business listing, promotional flyers distribution in local daily newspapers.`,
        rawMaterialSupply: `Verified regional wholesale distributors and genuine OEM equipment suppliers.`,
        businessOperations: `Clean commercial premises, systematic inventory tracking, digital UPI payment acceptance, polite customer service.`
      };
  }
}
