require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectProducer, disconnectProducer } = require('./kafka/producer');

// Routers
const tradesRouter = require('./routes/trades');
const positionsRouter = require('./routes/positions');
const pnlRouter = require('./routes/pnl');

const app = express();
const PORT = Number(process.env.PORT) || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/trades', tradesRouter);
app.use('/positions', positionsRouter);
app.use('/pnl', pnlRouter);

// Health + root
app.get('/health', (_req, res) => {
res.json({ status: 'ok', service: 'Lotwise Backend', timestamp: new Date().toISOString() });
});
app.get('/', (_req, res) => {
res.json({
name: 'Lotwise Portfolio Tracker API',
version: '1.0.0',
endpoints: ['/trades', '/positions', '/pnl', '/health']
});
});

// Start
async function start() {
await connectProducer(); // best effort; API will still start even if Kafka connect fails
app.listen(PORT, () => {

});
}

// Graceful shutdown
process.on('SIGINT', async () => {
console.log('\n👋 Shutting down...');
await disconnectProducer();
process.exit(0);
});
process.on('SIGTERM', async () => {
console.log('\n👋 Shutting down...');
await disconnectProducer();
process.exit(0);
});

start();