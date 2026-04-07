/**
 * Fulfillment KPI Data — Demo Mode (static sample data).
 * In production, this fetches from Cloudflare KV.
 */

// Global array used by fulfillment.js
const fullData = [];

// Seeded random for reproducible data
let _seed = 42;
function seededRandom() {
  _seed = (_seed * 16807 + 0) % 2147483647;
  return (_seed - 1) / 2147483646;
}

// Monthly performance profiles: [4-day base, 4-day range, 7-day base, 7-day range]
// Varies by month to show realistic dips and improvements
const monthlyPerformance = {
  // 2024: rocky start, improving through year, holiday dip
  '2024-1':  [78, 8, 89, 7],   // Jan: post-holiday recovery, slower
  '2024-2':  [80, 7, 91, 6],   // Feb: improving
  '2024-3':  [82, 6, 93, 5],   // Mar: getting better
  '2024-4':  [83, 6, 94, 4],   // Apr: stable
  '2024-5':  [84, 5, 94, 4],   // May: mothers day rush
  '2024-6':  [85, 5, 95, 3],   // Jun: solid
  '2024-7':  [83, 6, 93, 5],   // Jul: summer slump
  '2024-8':  [84, 5, 94, 4],   // Aug: back to normal
  '2024-9':  [86, 4, 95, 3],   // Sep: strong
  '2024-10': [85, 5, 95, 3],   // Oct: pre-holiday prep
  '2024-11': [79, 9, 90, 7],   // Nov: Black Friday overwhelm
  '2024-12': [76, 10, 87, 8],  // Dec: holiday crunch
  // 2025: stronger year with occasional dips
  '2025-1':  [80, 7, 91, 6],   // Jan: post-holiday
  '2025-2':  [83, 6, 93, 5],   // Feb: valentines rush
  '2025-3':  [85, 5, 95, 3],   // Mar: hitting targets
  '2025-4':  [86, 4, 96, 3],   // Apr: strong
  '2025-5':  [84, 6, 94, 4],   // May: mothers day volume
  '2025-6':  [87, 4, 96, 2],   // Jun: peak performance
  '2025-7':  [85, 5, 95, 3],   // Jul: steady
  '2025-8':  [86, 4, 95, 3],   // Aug: solid
  '2025-9':  [87, 4, 96, 2],   // Sep: excellent
  '2025-10': [86, 5, 95, 3],   // Oct: pre-holiday
  '2025-11': [81, 8, 91, 6],   // Nov: Black Friday strain
  '2025-12': [78, 9, 88, 7],   // Dec: holiday overload
  // 2026: continued growth, Q1 data
  '2026-1':  [82, 6, 92, 5],   // Jan: new year recovery
  '2026-2':  [84, 5, 94, 4],   // Feb: steady improvement
  '2026-3':  [86, 5, 95, 3],   // Mar: strong Q1 finish
  '2026-4':  [87, 4, 96, 2],   // Apr: hitting stride (partial month)
};

function generateMonth(year, month, baseOrders, isWholesale) {
  const days = new Date(year, month, 0).getDate();
  const rows = [];
  const key = `${year}-${month}`;
  const perf = monthlyPerformance[key] || [84, 5, 94, 4];
  // Wholesale is slightly lower performance
  const wOffset4 = isWholesale ? -3 : 0;
  const wOffset7 = isWholesale ? -2 : 0;

  for (let d = 1; d <= days; d++) {
    // For April 2026, only generate up to the 6th (current date)
    if (year === 2026 && month === 4 && d > 6) break;

    const dow = new Date(year, month - 1, d).getDay();
    const isWeekend = dow === 0 || dow === 6;
    let orders;
    if (isWeekend) {
      orders = Math.round(baseOrders * (0.18 + seededRandom() * 0.14));
    } else {
      orders = Math.round(baseOrders * (0.82 + seededRandom() * 0.36));
    }

    // Rates vary based on monthly profile + daily noise
    const dailyNoise = (seededRandom() - 0.5) * 2; // -1 to +1
    let rate4 = perf[0] + wOffset4 + (seededRandom() * perf[1]) + dailyNoise;
    let rate7 = perf[2] + wOffset7 + (seededRandom() * perf[3]) + dailyNoise * 0.5;

    // Mondays tend to be worse (backlog from weekend)
    if (dow === 1) { rate4 -= 2; rate7 -= 1; }
    // Fridays tend to be better (push to clear)
    if (dow === 5) { rate4 += 1.5; rate7 += 0.5; }

    // Clamp to realistic bounds
    rate4 = Math.max(65, Math.min(95, rate4));
    rate7 = Math.max(78, Math.min(99, rate7));

    rate4 = rate4.toFixed(1);
    rate7 = rate7.toFixed(1);

    const f4 = Math.round(orders * parseFloat(rate4) / 100);
    const f7 = Math.round(orders * parseFloat(rate7) / 100);
    rows.push({
      date: `${month}/${d}/${year}`,
      orders,
      fulfilled_4day: f4,
      fulfilled_7day: f7,
      fill_rate_4day: rate4 + '%',
      fill_rate_7day: rate7 + '%',
    });
  }
  return rows;
}

// Seasonal order volume multipliers (index 0=Jan)
const retailSeasonal =    [0.85, 0.92, 0.95, 1.0, 1.05, 0.90, 0.88, 0.92, 0.95, 1.0, 1.35, 1.50];
const wholesaleSeasonal = [0.80, 0.85, 0.90, 1.0, 1.02, 0.88, 0.85, 0.90, 0.92, 0.98, 1.20, 1.30];

const DEMO_KPI_DATA = { retail: [], wholesale: [] };

// Generate 2024 data (full year)
for (let m = 1; m <= 12; m++) {
  const rBase = Math.round(175 * retailSeasonal[m - 1]);
  const wBase = Math.round(55 * wholesaleSeasonal[m - 1]);
  DEMO_KPI_DATA.retail.push(...generateMonth(2024, m, rBase, false));
  DEMO_KPI_DATA.wholesale.push(...generateMonth(2024, m, wBase, true));
}

// Generate 2025 data (full year)
for (let m = 1; m <= 12; m++) {
  const rBase = Math.round(185 * retailSeasonal[m - 1]);
  const wBase = Math.round(58 * wholesaleSeasonal[m - 1]);
  DEMO_KPI_DATA.retail.push(...generateMonth(2025, m, rBase, false));
  DEMO_KPI_DATA.wholesale.push(...generateMonth(2025, m, wBase, true));
}

// Generate 2026 data (Jan - Apr partial)
for (let m = 1; m <= 4; m++) {
  const rBase = Math.round(192 * retailSeasonal[m - 1]);
  const wBase = Math.round(61 * wholesaleSeasonal[m - 1]);
  DEMO_KPI_DATA.retail.push(...generateMonth(2026, m, rBase, false));
  DEMO_KPI_DATA.wholesale.push(...generateMonth(2026, m, wBase, true));
}

/**
 * Demo: return static data for the given year/dataset.
 */
async function fetchKPIYear(year, dataset = "retail") {
  const data = DEMO_KPI_DATA[dataset] || DEMO_KPI_DATA.retail;
  return data.filter(r => r.date.endsWith('/' + year));
}

/**
 * Load data into the global fullData array.
 */
async function loadKPIData(year, month, dataset = "retail") {
  const data = await fetchKPIYear(year, dataset);
  fullData.length = 0;
  fullData.push(...data);
  return data;
}

/**
 * Load full year into the global fullData array.
 */
async function loadKPIYear(year, dataset = "retail") {
  return loadKPIData(year, 0, dataset);
}
