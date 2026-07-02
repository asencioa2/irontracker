// Vercel Serverless Function — /api/food-lookup
// Proxies Open Food Facts + USDA FoodData Central lookups server-side.

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
      const name = p.product_name || p.product_name_en || '';

      // serving_size_g gives us the gram weight of one serving
      // OFF stores both _serving and _100g keys — always prefer _serving
      // Only fall back to _100g if we also have a serving size to scale with
      const servingG = parseFloat(p.serving_size_g || p.serving_quantity || 0);

      let cal, protein, carbs, fat;

      if (n['energy-kcal_serving'] != null) {
        // Best case — per-serving values present
        cal     = Math.round(n['energy-kcal_serving']);
        protein = round1(n['proteins_serving']      ?? 0);
        carbs   = round1(n['carbohydrates_serving'] ?? 0);
        fat     = round1(n['fat_serving']           ?? 0);
      } else if (n['energy-kcal_100g'] != null && servingG > 0) {
        // Scale per-100g values to serving size
        const scale = servingG / 100;
        cal     = Math.round((n['energy-kcal_100g']      || 0) * scale);
        protein = round1((n['proteins_100g']             || 0) * scale);
        carbs   = round1((n['carbohydrates_100g']        || 0) * scale);
        fat     = round1((n['fat_100g']                  || 0) * scale);
      } else if (n['energy-kcal_100g'] != null) {
        // Last resort — no serving size, flag it so the user knows
        cal     = Math.round(n['energy-kcal_100g']);
        protein = round1(n['proteins_100g']      || 0);
        carbs   = round1(n['carbohydrates_100g'] || 0);
        fat     = round1(n['fat_100g']           || 0);
        if (name && (cal || protein)) {
          return res.status(200).json({
            name, cal, protein, carbs, fat,
            serving: 'per 100g (no serving size on file)',
            source: 'Open Food Facts',
            warning: 'Values are per 100g — adjust for your actual serving size'
          });
        }
      }

      if (name && cal > 0) {
        return res.status(200).json({
          name, cal, protein, carbs, fat,
          serving: p.serving_size || (servingG ? `${servingG}g` : null),
          source: 'Open Food Facts'
        });
      }
    }
  } catch (_) {}

  // ── 2. USDA FoodData Central ────────────────────────────────────────────────
  const usdaKey = process.env.USDA_API_KEY;
  if (!usdaKey) return res.status(404).json({ error: 'Product not found' });

  try {
    const usdaRes = await fetch(
      `https://api.nal.usda.gov/fdc/v1/foods/search?query=${barcode}&dataType=Branded&api_key=${usdaKey}&pageSize=3`
    );
    const usdaData = await usdaRes.json();

    if (usdaData.foods && usdaData.foods.length > 0) {
      // Pick the best match — prefer exact UPC match
      const food = usdaData.foods.find(f => f.gtinUpc === barcode) || usdaData.foods[0];
      const nutrients = food.foodNutrients || [];

      // USDA branded foods report nutrients per serving already
      // Use nutrient IDs for precision — don't match by name string which can grab wrong entries
      // 1008 = Energy (kcal), 1003 = Protein, 1005 = Carbohydrates, 1004 = Total fat
      const byId  = (id)  => nutrients.find(x => x.nutrientId === id || x.nutrientNumber === String(id));
      const byName = (str) => nutrients.find(x => x.nutrientName?.toLowerCase().includes(str));

      const energyN  = byId(1008) || byName('energy');
      const proteinN = byId(1003) || byName('protein');
      const carbsN   = byId(1005) || byName('carbohydrate');
      const fatN     = byId(1004) || byName('total lipid');

      const cal     = Math.round(energyN?.value  || 0);
      const protein = round1(proteinN?.value || 0);
      const carbs   = round1(carbsN?.value   || 0);
      const fat     = round1(fatN?.value     || 0);

      const servingSize = food.servingSize;
      const servingUnit = food.servingSizeUnit || 'g';
      const serving = servingSize ? `${servingSize}${servingUnit}` : null;

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
