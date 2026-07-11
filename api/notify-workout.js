// Vercel Serverless Function — /api/notify-workout
// Sends Web Push notifications when a friend starts a workout
// Uses VAPID for authentication (no paid service needed — 100% free)
//
// Required env vars:
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
//   VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY  (generate once with: node -e "require('web-push').generateVAPIDKeys()")
//   VAPID_SUBJECT = "mailto:your@email.com"

import webpush from 'web-push';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { fromName, fromUsername, toUserIds, type, message } = req.body || {};
  if (!fromName || !toUserIds?.length) return res.status(400).json({ error: 'Missing fields' });

  const vapidPublic  = process.env.VAPID_PUBLIC_KEY;
  const vapidPrivate = process.env.VAPID_PRIVATE_KEY;
  const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:admin@irontracker.app';
  const supabaseUrl  = process.env.SUPABASE_URL;
  const serviceKey   = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!vapidPublic || !vapidPrivate) {
    return res.status(500).json({ error: 'VAPID keys not configured' });
  }
  if (!supabaseUrl || !serviceKey) {
    return res.status(500).json({ error: 'Supabase service role not configured' });
  }

  webpush.setVapidDetails(vapidSubject, vapidPublic, vapidPrivate);

  // Fetch push subscriptions for the target users from Supabase
  const subRes = await fetch(
    `${supabaseUrl}/rest/v1/push_subscriptions?user_id=in.(${toUserIds.map(id => `"${id}"`).join(',')})`,
    {
      headers: {
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`,
      },
    }
  );
  const subscriptions = await subRes.json();
  if (!subscriptions?.length) return res.status(200).json({ sent: 0 });

  const payload = JSON.stringify({
    title: `🏋️ ${fromName} is training now!`,
    body: message || `${fromName} (@${fromUsername}) just started a workout. Open IronTracker to follow along live!`,
    tag: 'workout-start',
    url: 'https://irontracker-five.vercel.app',
  });

  // Send to all subscriptions, remove stale ones
  const stale = [];
  const results = await Promise.allSettled(
    subscriptions.map(async (row) => {
      try {
        await webpush.sendNotification(JSON.parse(row.subscription), payload);
      } catch (err) {
        if (err.statusCode === 404 || err.statusCode === 410) {
          stale.push(row.id); // subscription expired — clean up
        }
      }
    })
  );

  // Delete stale subscriptions
  if (stale.length) {
    await fetch(`${supabaseUrl}/rest/v1/push_subscriptions?id=in.(${stale.map(id => `"${id}"`).join(',')})`, {
      method: 'DELETE',
      headers: { 'apikey': serviceKey, 'Authorization': `Bearer ${serviceKey}` },
    });
  }

  const sent = results.filter(r => r.status === 'fulfilled').length;
  return res.status(200).json({ sent });
}
