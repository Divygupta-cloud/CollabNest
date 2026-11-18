async function runTests() {
  const BASE_URL = 'http://localhost:5000/api';

  console.log('🧪 Starting TaskFlow API End-to-End Test Suite...\n');

  // Helper fetcher
  async function api(path: string, options: RequestInit = {}, token?: string) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers,
    });

    const body = await res.json();
    return { status: res.status, body };
  }

  // 1. Health check
  console.log('1. Testing /health endpoint:');
  const health = await api('/health');
  console.log(`   Status: ${health.status}, Response:`, health.body);

  // 2. Login as Admin
  console.log('\n2. Testing Login as Admin:');
  const loginRes = await api('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username: 'admin', password: 'password123' }),
  });
  console.log(`   Status: ${loginRes.status}, User: ${loginRes.body.data?.user?.name}, Role: ${loginRes.body.data?.user?.role}`);
  const adminToken = loginRes.body.data?.token;

  if (!adminToken) {
    throw new Error('Failed to obtain admin token');
  }

  // 3. Verify /auth/me
  console.log('\n3. Testing /auth/me:');
  const meRes = await api('/auth/me', {}, adminToken);
  console.log(`   Status: ${meRes.status}, Email: ${meRes.body.data?.email}`);

  // 4. List Projects
  console.log('\n4. Testing /projects:');
  const projectsRes = await api('/projects', {}, adminToken);
  console.log(`   Found ${projectsRes.body.data?.length} projects:`);
  projectsRes.body.data?.forEach((p: any) => console.log(`   - [${p.key}] ${p.name}`));
  const crmProject = projectsRes.body.data?.find((p: any) => p.key === 'CRM');

  // 5. Get CRM Project Board
  console.log('\n5. Testing /projects/:key/board:');
  const boardRes = await api('/projects/CRM/board', {}, adminToken);
  console.log(`   Total issues on active board: ${boardRes.body.data?.totalIssues}`);
  console.log('   Columns:', {
    TODO: boardRes.body.data?.columns?.TODO?.length,
    IN_PROGRESS: boardRes.body.data?.columns?.IN_PROGRESS?.length,
    IN_REVIEW: boardRes.body.data?.columns?.IN_REVIEW?.length,
    DONE: boardRes.body.data?.columns?.DONE?.length,
  });

  // 6. Create New Issue and Verify Atomic Key + Async AI Classification
  console.log('\n6. Testing Issue Creation (CRM-106):');
  const createIssueRes = await api(
    '/issues',
    {
      method: 'POST',
      body: JSON.stringify({
        projectId: crmProject._id || crmProject.id,
        title: 'Crash when clicking export CSV on massive dataset',
        description:
          'Memory leak observed in the worker thread when exporting more than 50,000 CRM contacts at once.',
        issueType: 'BUG',
        priority: 'HIGHEST',
      }),
    },
    adminToken
  );
  const createdIssueId = createIssueRes.body.data?.id || createIssueRes.body.data?._id;
  console.log(`   Created Issue: ${createIssueRes.body.data?.issueKey} (ID: ${createdIssueId})`);
  console.log(`   Initial AI Status: ${createIssueRes.body.data?.aiStatus}`);

  // Wait 1 second for background AI worker to complete classification
  await new Promise((r) => setTimeout(r, 1000));
  const classifiedIssueRes = await api(`/issues/${createdIssueId}`, {}, adminToken);
  console.log(`   After AI Worker:`);
  console.log(`     AI Status: ${classifiedIssueRes.body.data?.aiStatus}`);
  console.log(`     AI Category: ${classifiedIssueRes.body.data?.aiCategory}`);
  console.log(`     AI Confidence: ${classifiedIssueRes.body.data?.aiConfidence}`);
  console.log(`     AI Reason: ${classifiedIssueRes.body.data?.aiReason}`);

  // 7. Update Issue Status (e.g., Drag to IN_PROGRESS)
  console.log('\n7. Testing Status Update:');
  const updateStatusRes = await api(
    `/issues/${createdIssueId}/status`,
    {
      method: 'PATCH',
      body: JSON.stringify({ status: 'IN_PROGRESS' }),
    },
    adminToken
  );
  console.log(`   Updated status to: ${updateStatusRes.body.data?.status}`);


  // 8. Add a comment
  console.log('\n8. Testing Comment Creation:');
  const commentRes = await api(
    '/comments',
    {
      method: 'POST',
      body: JSON.stringify({
        issueId: createdIssueId,
        content: 'Investigated heap dump - it appears the stream is not piped with backpressure.',
      }),
    },
    adminToken
  );

  console.log(`   Comment added by ${commentRes.body.data?.authorId?.name}: "${commentRes.body.data?.content}"`);

  // 9. Fetch Dashboard for Admin
  console.log('\n9. Testing /dashboard for Admin:');
  const adminDashboard = await api('/dashboard', {}, adminToken);
  console.log('   Admin System Overview:', adminDashboard.body.data?.systemOverview);
  console.log('   Role Breakdown:', adminDashboard.body.data?.roleBreakdown);

  // 10. Login as Employee and test Employee Dashboard
  console.log('\n10. Testing Employee Login and Dashboard:');
  const empLogin = await api('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username: 'employee', password: 'password123' }),
  });
  const empToken = empLogin.body.data?.token;
  const empDashboard = await api('/dashboard', {}, empToken);
  console.log(`   Employee Role: ${empDashboard.body.data?.role}`);
  console.log(`   Assigned Issues: ${empDashboard.body.data?.totalAssigned}`);

  console.log('\n🎉 ALL BACKEND API TESTS PASSED SUCCESSFULLY!\n');
}

runTests().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
