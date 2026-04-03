
async function testDetector(docContent, docType) {
  try {
    const res = await fetch('http://localhost:5000/detect-fake-doc', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ docContent, docType })
    });
    const data = await res.json();
    console.log(`\n--- TEST: ${docType} ---`);
    console.log(`Status: ${data.status}`);
    console.log(`Confidence: ${data.confidence}`);
    console.log(`Analysis: ${data.analysis}`);
    console.log(`Signals:`, data.signals);
  } catch (e) {
    console.error(`Error testing detector:`, e.message);
  }
}

async function runTests() {
  await testDetector(
    "This rental agreement is between Landlord X and Tenant Y. The rent is 5000 rupees. The agreement is dated Feb 30, 2026.",
    "Legal Contract"
  );
}

runTests();
