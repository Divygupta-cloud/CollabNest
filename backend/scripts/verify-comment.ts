async function run() {
  const login = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'password123' })
  }).then(r => r.json());
  const token = login.data.token;

  const issueRes = await fetch('http://localhost:5000/api/issues/key/CRM-101', {
    headers: { 'Authorization': 'Bearer ' + token }
  }).then(r => r.json());
  const issueId = issueRes.data.id || issueRes.data._id;

  const addRes = await fetch('http://localhost:5000/api/comments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
    body: JSON.stringify({ issueId, content: 'Testing comment integration from React frontend client' })
  }).then(r => r.json());

  console.log('✅ Added comment response:', addRes.success, addRes.data?.content);

  const fetchRes = await fetch('http://localhost:5000/api/comments/issue/' + issueId, {
    headers: { 'Authorization': 'Bearer ' + token }
  }).then(r => r.json());

  console.log('✅ All comments on CRM-101 in MongoDB count:', fetchRes.data?.length);
  fetchRes.data?.forEach((c: any) => console.log('   -', c.authorId?.name + ':', c.content));
}

run().catch(console.error);
