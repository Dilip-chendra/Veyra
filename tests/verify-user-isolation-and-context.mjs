import assert from 'assert';

async function testUserIsolationAndContext() {
  console.log('=== VERIFYING USER ISOLATION, RESUME, GITHUB, AND JD CONTEXT ===\n');

  // --- 1. Create User A ---
  const emailA = `user_a_${Date.now()}@veyra.test`;
  const password = 'Password123!';
  console.log('1. Creating User A:', emailA);
  const signupA = await fetch('http://localhost:3000/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: emailA, password, name: 'User A Candidate' })
  });
  assert.strictEqual(signupA.status, 200, 'User A signup should succeed');
  const cookieA = signupA.headers.get('set-cookie')?.split(';')[0];
  assert.ok(cookieA, 'User A must receive session cookie');

  // --- 2. Test 40: New User Cleanliness ---
  console.log('2. Verifying New User A has ZERO fake interviews or data...');
  const listA1 = await fetch('http://localhost:3000/api/interviews/list', {
    headers: { Cookie: cookieA }
  });
  const listA1Data = await listA1.json();
  console.log('User A initial interviews count:', listA1Data.interviews?.length);
  assert.strictEqual(listA1Data.interviews?.length, 0, 'New user must have 0 interviews');

  // --- 3. Test 4: Paste Resume ---
  console.log('\n3. Testing Paste Resume for User A...');
  const resumeText = `
    Dilip Chendra - Senior Distributed Systems Engineer
    Experience:
    - Built a high-throughput event processing platform using Kafka and Go handling 100k events/sec.
    - Optimized PostgreSQL query execution reducing p99 latency by 45%.
    - Architected microservices with gRPC and deployed on Kubernetes.
    Skills: Go, Python, PostgreSQL, Kafka, Redis, Kubernetes, Docker
  `;
  const pasteResumeRes = await fetch('http://localhost:3000/api/resumes/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookieA },
    body: JSON.stringify({ text: resumeText, filename: 'Dilip_Resume.txt' })
  });
  assert.strictEqual(pasteResumeRes.status, 200, 'Resume paste should succeed');
  const resumeData = await pasteResumeRes.json();
  console.log('Resume parsed! ID:', resumeData.resumeId);
  console.log('Extracted Skills:', resumeData.parsed?.skills);
  console.log('Extracted Claims Count:', resumeData.parsed?.claims?.length);
  assert.ok(resumeData.resumeId, 'Resume ID must be returned');
  assert.ok(resumeData.parsed?.claims?.length > 0, 'Claims must be extracted');

  // --- 4. Test 6: Job Description Parsing ---
  console.log('\n4. Testing Job Description Parsing for User A...');
  const jdText = `
    Role: Principal Infrastructure Engineer
    Company: ScaleGrid Systems
    Requirements:
    - 7+ years building large-scale distributed systems and storage layers.
    - Deep expertise in PostgreSQL, Raft consensus, and cache invalidation.
    - Experience handling high-availability systems with 99.999% uptime.
  `;
  const jdRes = await fetch('http://localhost:3000/api/jobs/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookieA },
    body: JSON.stringify({ rawText: jdText, title: 'Principal Infrastructure Engineer', company: 'ScaleGrid Systems' })
  });
  assert.strictEqual(jdRes.status, 200, 'JD analysis should succeed');
  const jdData = await jdRes.json();
  console.log('JD parsed! ID:', jdData.jobDescriptionId);
  console.log('Blueprint stages count:', jdData.blueprint?.stages?.length);
  assert.ok(jdData.jobDescriptionId, 'JD ID must be returned');

  // --- 5. Test 5: GitHub Repository Analysis ---
  console.log('\n5. Testing Real GitHub Repository Analysis for User A...');
  const githubRes = await fetch('http://localhost:3000/api/github/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookieA },
    body: JSON.stringify({ repoUrl: 'https://github.com/expressjs/express' })
  });
  console.log('GitHub analysis status:', githubRes.status);
  const githubData = await githubRes.json();
  if (githubRes.status === 200) {
    console.log('GitHub Repo Analyzed:', githubData.analysis?.repoName);
    console.log('Detected Primary Language:', githubData.analysis?.primaryLanguage);
    console.log('Architecture Summary:', githubData.analysis?.architectureSummary?.slice(0, 100));
  } else {
    console.warn('GitHub rate limit or network note:', githubData.error);
  }

  // --- 6. Create User A's Interview Session ---
  console.log('\n6. Creating interview session for User A with Marcus...');
  const createA = await fetch('http://localhost:3000/api/interviews/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookieA },
    body: JSON.stringify({
      role: 'Principal Infrastructure Engineer',
      durationMinutes: 30,
      gender: 'male',
      resumeId: resumeData.resumeId,
      jobDescriptionId: jdData.jobDescriptionId
    })
  });
  assert.strictEqual(createA.status, 200, 'Interview creation should succeed');
  const interviewA = await createA.json();
  console.log('User A Interview ID:', interviewA.interviewId);

  // Complete User A interview to generate report
  await fetch(`http://localhost:3000/api/interviews/${interviewA.interviewId}/complete`, {
    method: 'POST',
    headers: { Cookie: cookieA }
  });

  // --- 7. Test 41: User B Isolation ---
  const emailB = `user_b_${Date.now()}@veyra.test`;
  console.log('\n7. Creating User B:', emailB);
  const signupB = await fetch('http://localhost:3000/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: emailB, password, name: 'User B Candidate' })
  });
  const cookieB = signupB.headers.get('set-cookie')?.split(';')[0];
  assert.ok(cookieB, 'User B must receive session cookie');

  console.log('Verifying User B interview list is isolated...');
  const listB = await fetch('http://localhost:3000/api/interviews/list', {
    headers: { Cookie: cookieB }
  });
  const listBData = await listB.json();
  console.log('User B interviews count:', listBData.interviews?.length);
  assert.strictEqual(listBData.interviews?.length, 0, 'User B must have 0 interviews');

  console.log("Verifying User B CANNOT access User A's interview report...");
  const unauthorizedReport = await fetch(`http://localhost:3000/api/interviews/${interviewA.interviewId}/report-data`, {
    headers: { Cookie: cookieB }
  });
  console.log('User B access to User A report status:', unauthorizedReport.status);
  assert.ok(
    unauthorizedReport.status === 403 || unauthorizedReport.status === 404 || unauthorizedReport.status === 401,
    'User B must be forbidden from accessing User A report'
  );

  console.log('\n=== ALL USER ISOLATION, RESUME, AND JD TESTS PASSED! ===');
}

testUserIsolationAndContext().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
