

async function runTests() {
  console.log("Running security and rate limit tests...");

  const contactUrl = "http://localhost:5000/api/contact";
  
  // 1. Test validation on Contact (invalid payload)
  console.log("\n[Test 1] Validation check on Contact endpoint (Empty body)");
  const valRes = await fetch(contactUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });
  console.log(`Status: ${valRes.status}`); // Should be 400
  console.log("Response:", await valRes.json());

  // 2. Test string length boundaries (Message > 1000 chars)
  console.log("\n[Test 2] Contact message > 1000 characters");
  const tooLongRes = await fetch(contactUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "John Doe",
      email: "test@example.com",
      subject: "Hello",
      message: "a".repeat(1005),
    }),
  });
  console.log(`Status: ${tooLongRes.status}`); // Should be 400
  console.log("Response:", await tooLongRes.json());

  // 3. Test Rate Limiter on Contact (Limit is 5 per 15 minutes)
  console.log("\n[Test 3] Rate Limiting on Contact endpoint (Spamming > 5 requests)");
  let rateLimitHit = false;
  for (let i = 1; i <= 7; i++) {
    const res = await fetch(contactUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: `User ${i}`,
        email: `test${i}@example.com`,
        subject: "Spam test",
        message: "This is a valid length message for testing.",
      }),
    });
    
    console.log(`Request ${i} -> Status: ${res.status}`);
    if (res.status === 429) {
      rateLimitHit = true;
      console.log("Rate limit successfully triggered! Response:", await res.json());
      break;
    }
  }

  if (!rateLimitHit) {
    console.log("FAIL: Rate limiter was not triggered.");
  }

  // 4. Test missing Authentication on protected route
  console.log("\n[Test 4] Access protected route without token (Account Profile)");
  const authRes = await fetch("http://localhost:5000/api/account/profile");
  console.log(`Status: ${authRes.status}`); // Should be 401
  console.log("Response:", await authRes.json());
}

runTests().catch(console.error);
