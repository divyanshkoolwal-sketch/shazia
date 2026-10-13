// Daily keep-alive for the free-plan Supabase project behind the fitting form.
// Free projects pause after ~7 idle days; one authenticated read a day keeps it active.
// Triggered by the Vercel cron in vercel.json; rejects anyone without the CRON_SECRET.
module.exports = async function handler(req, res) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.authorization !== `Bearer ${secret}`) {
    return res.status(401).json({ ok: false });
  }
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return res.status(500).json({ ok: false, error: 'missing env' });
  try {
    const r = await fetch(`${url}/rest/v1/fitting_requests?select=id&limit=1`, {
      method: 'HEAD',
      headers: { apikey: key, Authorization: `Bearer ${key}`, Prefer: 'count=exact' },
    });
    return res.status(r.ok ? 200 : 502).json({ ok: r.ok, status: r.status, at: new Date().toISOString() });
  } catch (e) {
    return res.status(502).json({ ok: false, error: String(e && e.message || e) });
  }
};
