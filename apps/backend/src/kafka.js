import { Kafka, logLevel } from 'kafkajs';

export function createKafka() {
  const brokers = (process.env.KAFKA_BROKERS || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

  const sasl =
    process.env.KAFKA_USERNAME && process.env.KAFKA_PASSWORD
      ? {
          mechanism: process.env.KAFKA_SASL_MECHANISM || 'scram-sha-256',
          username: process.env.KAFKA_USERNAME,
          password: process.env.KAFKA_PASSWORD
        }
      : undefined;

  const ssl = process.env.KAFKA_SSL === 'true' ? { rejectUnauthorized: false } : undefined;

  return new Kafka({
    clientId: process.env.KAFKA_CLIENT_ID || 'portfolio-backend',
    brokers,
    ssl,
    sasl,
    logLevel: logLevel.WARN
  });
}

export async function ensureTopic(kafka, topic) {
  const admin = kafka.admin();
  await admin.connect();
  await admin.createTopics({ topics: [{ topic }], waitForLeaders: true });
  await admin.disconnect();
}