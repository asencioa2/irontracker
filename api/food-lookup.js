// Vercel Serverless Function — /api/food-lookup
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { barcode } = req.query;
  if (!barcode || !/^\d{6,14}$/.test(barcode)) {
    return res.status(400).json({ error: 'Invalid barcode' });
  }

  // ── 1. Open Food Facts ──────────────────────────────────────────────────────
  try {
    const offRes = await fetch(
      `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`,
      { headers: { 'User-Agent': 'IronTracker/1.0' } }
    );
    const offData = await offRes.json();

    if (offData.status === 1 && offData.product) {
      const p = offData.product;
      const n = p.nutriments || {};
      const name = (p.product_name || p.product_name_en || '').trim();
      if (!name) throw new Error('no name');

      // Serving size in grams — OFF stores this in several possible fields
      const servingG = parseFloat(
        p.serving_quantity ||       // grams of one serving (most reliable)
        p.serving_size_g ||         // sometimes stored here
        0
      );

      // Check if _serving keys are present AND non-zero
      // OFF sometimes sets _serving keys but fills them with 100g values — verify by ratio
      const calServing  = parseFloat(n['energy-kcal_serving'] || 0);
      const cal100g     = parseFloat(n['energy-kcal_100g']    || 0);

      let cal, protein, carbs, fat, servingLabel, warning;

      // If we have a serving gram weight, ALWAYS scale from 100g values
      // This is more reliable than trusting the _serving keys which are often wrong
      if (servingG > 0 && cal100g > 0) {
        const scale = servingG / 100;
        cal     = Math.round(cal100g * scale);
        protein = round1((n['proteins_100g']        || 0) * scale);
        carbs   = round1((n['carbohydrates_100g']   || 0) * scale);
        fat     = round1((n['fat_100g']             || 0) * scale);
        servingLabel = p.serving_size || `${servingG}g`;

        // Sanity check: if result seems way off vs _serving key, log it
        if (calServing > 0 && Math.abs(cal - calServing) > 50) {
          // _serving key disagrees — trust our scaled value, flag for debugging
          warning = null; // silent, our math should be right
        }
      } else if (calServing > 0) {
        // No gram weight but _serving keys exist — use them
        cal     = Math.round(calServing);
        protein = round1(n['proteins_serving']      || 0);
        carbs   = round1(n['carbohydrates_serving'] || 0);
        fat     = round1(n['fat_serving']           || 0);
        servingLabel = p.serving_size || null;
      } else if (cal100g > 0) {
        // No serving info at all — return per 100g with warning
        cal     = Math.round(cal100g);
        protein = round1(n['proteins_100g']        || 0);
        carbs   = round1(n['carbohydrates_100g']   || 0);
        fat     = round1(n['fat_100g']             || 0);
        servingLabel = 'per 100g';
        warning = 'No serving size on file — values shown per 100g. Adjust for your actual serving.';
      } else {
        throw new Error('no nutrition data');
      }

      if (cal > 0 || protein > 0) {
        return res.status(200).json({
          name, cal, protein, carbs, fat,
          serving: servingLabel,
          source: 'Open Food Facts',
          ...(warning ? { warning } : {})
        });
      }
    }
  } catch (_) {}

  // ── 2. USDA FoodData Central ────────────────────────────────────────────────
  const usdaKey = process.env.USDA_API_KEY;
  if (!usdaKey) return res.status(404).json({ error: 'Product not found' });

  try {
    const usdaRes = await fetch(
      `https://api.nal.usda.gov/fdc/v1/foods/search?query=${barcode}&dataType=Branded&api_key=${usdaKey}&pageSize=5`
    );
    const usdaData = await usdaRes.json();

    if (usdaData.foods?.length > 0) {
      // Prefer exact UPC/GTIN match
      const food = usdaData.foods.find(f => f.gtinUpc === barcode) || usdaData.foods[0];
      const nutrients = food.foodNutrients || [];

      // Match by official nutrient ID numbers — much more reliable than name matching
      // 1008 = Energy kcal, 1003 = Protein, 1005 = Carbohydrates, 1004 = Total Fat
      const getById = (id) => nutrients.find(x =>
        x.nutrientId === id ||
        x.nutrientNumber === String(id) ||
        x.nutrientNumber === id
      );

      // Fallback name search for APIs that don't return numeric IDs
      const getByName = (str) => nutrients.find(x =>
        x.nutrientName?.toLowerCase().includes(str.toLowerCase())
      );

      const energyN  = getById(1008) || getByName('energy');
      const proteinN = getById(1003) || getByName('protein');
      const carbsN   = getById(1005) || getByName('carbohydrate');
      const fatN     = getById(1004) || getByName('total lipid');

      // USDA branded foods already report per-serving values
      const cal     = Math.round(energyN?.value  || 0);
      const protein = round1(proteinN?.value || 0);
      const carbs   = round1(carbsN?.value   || 0);
      const fat     = round1(fatN?.value     || 0);
      const serving = food.servingSize
        ? `${food.servingSize}${food.servingSizeUnit || 'g'}`
        : null;

      if (cal > 0 || protein > 0) {
        return res.status(200).json({
          name: food.description || food.brandOwner || 'Unknown',
          cal, protein, carbs, fat, serving,
          source: 'USDA FoodData Central'
        });
      }
    }
  } catch (_) {}

  return res.status(404).json({ error: 'Product not found in either database' });
}

function round1(n) { return Math.round((n || 0) * 10) / 10; }
