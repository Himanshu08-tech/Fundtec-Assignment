// require('dotenv').config();
// const { Kafka } = require('kafkajs');

// const brokers = (process.env.KAFKA_BROKERS || 'localhost:9092').split(',');
// const clientId = process.env.KAFKA_CLIENT_ID || 'portfolio-backend';
// const TRADES_TOPIC = process.env.KAFKA_TRADES_TOPIC || 'trades';

// const kafka = new Kafka({ clientId, brokers });
// const producer = kafka.producer();

// async function connectProducer() {
// try {
// await producer.connect();
// console.log('✅ Kafka producer connected');
// } catch (err) {
// console.error('❌ Kafka producer connection failed:', err.message);
// }
// }

// async function publishTrade(trade) {
// // trade is expected to be a plain object (DB row)
// await producer.send({
// topic: TRADES_TOPIC,
// messages: [
// {
// key: trade.symbol,
// value: JSON.stringify(trade),
// timestamp: Date.now().toString()
// }
// ]
// });

// }

// async function disconnectProducer() {
// try {
// await producer.disconnect();
// console.log('👋 Kafka producer disconnected');
// } catch {}
// }

// module.exports = {
// connectProducer,
// publishTrade,
// disconnectProducer
// };

require('dotenv').config();
const { Kafka } = require('kafkajs');

const brokers = (process.env.KAFKA_BROKERS || 'localhost:9092').split(',');
const clientId = process.env.KAFKA_CLIENT_ID || 'portfolio-backend';
const TRADES_TOPIC = process.env.KAFKA_TRADES_TOPIC || 'trades';

const kafka = new Kafka({ clientId, brokers });
const producer = kafka.producer();

async function connectProducer() {
  try {
    await producer.connect();
    console.log('✅ Kafka producer connected');
  } catch (err) {
    console.error('❌ Kafka producer connection failed:', err.message);
  }
}

async function publishTrade(trade) {
  try {
    await producer.send({
      topic: TRADES_TOPIC,
      messages: [
        {
          key: trade.symbol,
          value: JSON.stringify(trade),
          timestamp: Date.now().toString(),
        },
      ],
    });
    console.log(`📤 Trade published to Kafka topic "${TRADES_TOPIC}"`, trade);
  } catch (err) {
    console.error('⚠️ Kafka publish failed:', err.message);
  }
}

async function disconnectProducer() {
  try {
    await producer.disconnect();
    console.log('👋 Kafka producer disconnected');
  } catch (err) {
    console.error('⚠️ Error during producer disconnect:', err.message);
  }
}

module.exports = {
  connectProducer,
  publishTrade,
  disconnectProducer,
};
