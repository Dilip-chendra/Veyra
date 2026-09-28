async function testE2E() {
  console.log('--- Veyra Live API End-to-End Verification ---');

  // 1. Create a test user account or login
  const email = `test_engineer_${Date.now()}@veyra.test`;
  const password = 'Password123!';

  console.log('1. Signing up test user:', email);
  const signupRes = await fetch('http://localhost:3000/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      password,
      name: 'Dilip Test Candidate'
    })
  });

  const cookieHeader = signupRes.headers.get('set-cookie');
  console.log('Signup status:', signupRes.status, 'Cookie received:', !!cookieHeader);

  const cookie = cookieHeader ? cookieHeader.split(';')[0] : '';

  // 2. Test Marcus Session Creation
  console.log('\n2. Creating interview session with Marcus (Male)...');
  const marcusCreateRes = await fetch('http://localhost:3000/api/interviews/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': cookie
    },
    body: JSON.stringify({
      role: 'Staff Infrastructure Engineer',
      durationMinutes: 30,
      gender: 'male',
      interviewerName: 'Marcus Vance',
      interviewerTitle: 'Senior Engineering Director'
    })
  });

  const marcusData = await marcusCreateRes.json();
  console.log('Marcus Session Created! ID:', marcusData.interviewId);
  console.log('Blueprint interviewerGender:', marcusData.blueprint?.interviewerGender);
  console.log('Blueprint interviewerName:', marcusData.blueprint?.interviewerName);

  if (marcusData.blueprint?.interviewerGender !== 'male') {
    throw new Error('Expected interviewerGender === "male"');
  }

  // 3. Test Elena Session Creation
  console.log('\n3. Creating interview session with Elena (Female)...');
  const elenaCreateRes = await fetch('http://localhost:3000/api/interviews/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': cookie
    },
    body: JSON.stringify({
      role: 'Principal Distributed Systems Architect',
      durationMinutes: 45,
      gender: 'female',
      interviewerName: 'Elena Rostova',
      interviewerTitle: 'VP of Engineering & Principal Technical Architect'
    })
  });

  const elenaData = await elenaCreateRes.json();
  console.log('Elena Session Created! ID:', elenaData.interviewId);
  console.log('Blueprint interviewerGender:', elenaData.blueprint?.interviewerGender);
  console.log('Blueprint interviewerName:', elenaData.blueprint?.interviewerName);

  if (elenaData.blueprint?.interviewerGender !== 'female') {
    throw new Error('Expected interviewerGender === "female"');
  }

  // 4. Test Turn Execution on Marcus Session
  console.log('\n4. Submitting candidate turn on Marcus interview session...');
  const turnRes = await fetch(`http://localhost:3000/api/interviews/${marcusData.interviewId}/turn`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': cookie
    },
    body: JSON.stringify({
      candidateAnswer: 'I built a distributed key-value store in Go with Raft consensus and PostgreSQL persistence.',
      elapsedSeconds: 60
    })
  });

  console.log('Turn API Status:', turnRes.status);
  const turnData = await turnRes.json();
  console.log('Speaker:', turnData.speaker);
  console.log('Next Question:', turnData.question);
  console.log('Behavior State:', turnData.behavior?.state);
  console.log('Is Complete:', turnData.isComplete);

  if (turnData.isComplete === true) {
    throw new Error('Interview should not complete after turn 1');
  }

  // 5. Test Cartesia TTS generation for the returned question using Marcus voice
  console.log('\n5. Generating Cartesia Sonic-3.6 speech for returned question with Marcus voice...');
  const ttsRes = await fetch('http://localhost:3000/api/cartesia/tts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': cookie
    },
    body: JSON.stringify({
      text: turnData.question,
      gender: 'male'
    })
  });

  console.log('TTS Status:', ttsRes.status, 'Content-Type:', ttsRes.headers.get('content-type'));
  const ttsText = await ttsRes.text();
  console.log('Received audio byte stream length:', ttsText.length);

  if (ttsRes.status !== 200 || ttsText.length < 1000) {
    throw new Error('TTS generation failed or returned empty stream');
  }

  // 6. Test Interview Completion and Report Generation
  console.log('\n6. Completing Marcus interview session explicitly...');
  const completeRes = await fetch(`http://localhost:3000/api/interviews/${marcusData.interviewId}/complete`, {
    method: 'POST',
    headers: { 'Cookie': cookie }
  });
  console.log('Complete API Status:', completeRes.status);

  console.log('\n7. Fetching report data for completed session...');
  const reportRes = await fetch(`http://localhost:3000/api/interviews/${marcusData.interviewId}/report-data`, {
    headers: { 'Cookie': cookie }
  });
  console.log('Report API Status:', reportRes.status);
  const reportData = await reportRes.json();
  console.log('Report generated for candidate:', reportData.candidateName);
  console.log('Total Questions in report:', reportData.questionsCount || reportData.turns?.length);
  console.log('Report Competencies Count:', reportData.competencies?.length);

  console.log('\nALL E2E API VERIFICATIONS PASSED SUCCESSFULLY!');
}

testE2E().catch(err => {
  console.error('E2E verification failed:', err);
  process.exit(1);
});
