// Simple end-to-end sanity test against local server
// Requires backend server running on http://localhost:3000
(async () => {
  const base = 'http://localhost:3000';
  const email = `cloud+${Date.now()}@local.test`;
  const password = '123456';
  const name = 'Cloud User';
  const headers = { 'Content-Type': 'application/json' };
  const post = async (url, body, token) => {
    const h = token ? { ...headers, Authorization: `Bearer ${token}` } : headers;
    const res = await fetch(`${base}${url}`, { method: 'POST', headers: h, body: JSON.stringify(body) });
    const txt = await res.text();
    try { return JSON.parse(txt); } catch { return txt; }
  };
  const get = async (url, token) => {
    const h = token ? { Authorization: `Bearer ${token}` } : {};
    const res = await fetch(`${base}${url}`, { headers: h });
    const txt = await res.text();
    try { return JSON.parse(txt); } catch { return txt; }
  };
  try {
    const reg = await post('/auth/register', { name, email, password });
    console.log('REGISTER:', typeof reg === 'string' ? reg : reg.message || reg.user?.email);
    const login = await post('/auth/login', { email, password });
    const token = login.token;
    if (!token) throw new Error('No token from login');
    console.log('LOGIN OK for', login.user?.email);
    const create = await post('/transactions', { description: 'Test Income', amount: 123.45, type: 'income', category: 'Teste', date: new Date().toISOString() }, token);
    console.log('CREATE TX:', create.transaction?.id);
    const list = await get('/transactions', token);
    console.log('LIST COUNT:', Array.isArray(list.transactions) ? list.transactions.length : list.length);
    const stats = await get('/dashboard/stats', token);
    console.log('STATS:', stats.totals);
  } catch (e) {
    console.error('SANITY TEST FAILED:', e);
    process.exit(1);
  }
})(); 
