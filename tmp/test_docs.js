
async function testGeneration(type, details) {
  try {
    const res = await fetch('http://localhost:5000/generate-document', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, details })
    });
    const data = await res.json();
    console.log(`\n--- TEST: ${type} ---`);
    console.log(data.content ? data.content.substring(0, 300) + '...' : 'ERROR: No content');
    console.log(`Length: ${data.content ? data.content.length : 0}`);
  } catch (e) {
    console.error(`Error testing ${type}:`, e.message);
  }
}

async function runTests() {
  await testGeneration('Rental Agreement', { landlordName: 'John Doe', tenantName: 'Jane Smith', propertyAddress: '123 Baker St' });
  await testGeneration('Power of Attorney', { principalName: 'Alice', agentName: 'Bob' });
  await testGeneration('Will Draft', { testatorName: 'Charlie', beneficiaryName: 'Daisy' });
}

runTests();
