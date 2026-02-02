const fetch = (...args) => import('node-fetch').then(({default: f}) => f(...args));

(async function(){
  const base = 'http://localhost:3001';
  try {
    console.log('Registering user mobiletest...');
    let res = await fetch(`${base}/api/register`, {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ username: 'mobiletest', password: 'test1234' })
    });
    console.log('Register status', res.status);

    console.log('Logging in...');
    res = await fetch(`${base}/api/login`, {
      method: 'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ username: 'mobiletest', password: 'test1234' })
    });
    const data = await res.json();
    console.log('Login status', res.status, 'body', data);
    const token = data.token;
    if(!token) { console.error('No token, aborting'); process.exit(1); }

    console.log('Create category');
    res = await fetch(`${base}/api/categories`, { method:'POST', headers:{'Content-Type':'application/json','Authorization':`Bearer ${token}`}, body: JSON.stringify({ name: 'Teste Mobile' }) });
    const cat = await res.json();
    console.log('Create category status', res.status, cat);

    console.log('Create transaction with categoryId');
    res = await fetch(`${base}/api/transactions`, { method:'POST', headers:{'Content-Type':'application/json','Authorization':`Bearer ${token}`}, body: JSON.stringify({ description: 'Compra app', amount: 9.9, type: 'outcome', categoryId: cat.id }) });
    const trx = await res.json();
    console.log('Create transaction status', res.status, trx);

    console.log('Update transaction description');
    res = await fetch(`${base}/api/transactions/${trx.id}`, { method:'PUT', headers:{'Content-Type':'application/json','Authorization':`Bearer ${token}`}, body: JSON.stringify({ description: 'Compra app (atualizado)', amount: 9.9, type: 'outcome', categoryId: cat.id }) });
    const trxUp = await res.json();
    console.log('Update status', res.status, trxUp);

    console.log('List transactions');
    res = await fetch(`${base}/api/transactions`, { headers: {'Authorization': `Bearer ${token}`} });
    const list = await res.json();
    console.log('List status', res.status, JSON.stringify(list, null, 2));

    console.log('All tests finished');
    process.exit(0);
  } catch (err) {
    console.error('Test script error', err);
    process.exit(2);
  }
})();
