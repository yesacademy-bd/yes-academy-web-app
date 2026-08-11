const now = new Date();
const serverDate = new Date();
serverDate.setMinutes(serverDate.getMinutes() + 60);

const isoStr = serverDate.toISOString();
console.log('ISO saved to DB:', isoStr);

// Simulated client
const clientNow = new Date();
const fromDb = new Date(isoStr);

console.log('fromDb > clientNow:', fromDb > clientNow);
