// Vercel Serverless Function — /api/food-lookup
// Proxies USDA FoodData Central and Open Food Facts lookups server-side
// so the USDA API key is never exposed in the browser.

export default async function handler(req, res) {
  // Allow CORS for your own domain
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { barcode } = req.query;
  if (!barcode || !/^\d{6,14}$/.test(barcode)) {
    return res.status(400).json({ error: 'Invalid barcode' });
  }

  // 1. Try Open Food Facts first (free, no key)
  try {
    const offRes = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
    const offData = await offRes.json();
    if (offData.status === 1 && offData.product) {
      const p = offData.product;
      const n = p.nutriments || {};
      const cal   = Math.round(n['energy-kcal_serving'] || n['energy-kcal_100g'] || 0);
      const protein = Math.round((n['proteins_serving']      || n['proteins_100g']      || 0) * 10) / 10;
      const carbs   = Math.round((n['carbohydrates_serving'] || n['carbohydrates_100g'] || 0) * 10) / 10;
      const fat     = Math.round((n['fat_serving']           || n['fat_100g']           || 0) * 10) / 10;
      const name    = p.product_name || p.product_name_en || '';
      if (name && (cal || protein || carbs || fat)) {
        return res.status(200).json({
          name, cal, protein, carbs, fat,
          serving: p.serving_size || null,
          source: 'Open Food Facts'
        });
      }
    }
  } catch (_) {}

  // 2. Fall back to USDA FoodData Central
  const usdaKey = process.env.USDA_API_KEY;
  if (!usdaKey) {
    return res.status(404).json({ error: 'Product not found' });
  }

  try {
    const usdaRes = await fetch(
      `https://api.nal.usda.gov/fdc/v1/foods/search?query=${barcode}&dataType=Branded&api_key=${usdaKey}&pageSize=1`
    );
    const usdaData = await usdaRes.json();
    if (usdaData.foods && usdaData.foods.length > 0) {
      const food = usdaData.foods[0];
      const nutrients = food.foodNutrients || [];
      const get = (name) => {
        const n = nutrients.find(x => x.nutrientName && x.nutrientName.toLowerCase().includes(name.toLowerCase()));
        return n ? Math.round((n.value || 0) * 10) / 10 : 0;
      };
      return res.status(200).json({
        name:    food.description || food.brandOwner || 'Unknown',
        cal:     Math.round(get('energy')),
        protein: get('protein'),
        carbs:   get('carbohydrate'),
        fat:     get('total lipid'),
        serving: food.servingSize ? `${food.servingSize}${food.servingSizeUnit || 'g'}` : null,
        source:  'USDA FoodData Central'
      });
    }
  } catch (_) {}

  return res.status(404).json({ error: 'Product not found in either database' });
}
