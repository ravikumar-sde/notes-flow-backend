const { connect, StringCodec } = require('nats');
const config = require('../config');

let natsConnection = null;
const sc = StringCodec();

async function getNatsConnection() {
  if (!natsConnection) {
    try {
      natsConnection = await connect({ servers: config.natsUrl });
      console.log('NATS connected (page-service)');

      (async () => {
        for await (const status of natsConnection.status()) {
          console.log('NATS status:', status.type);
        }
      })();
    } catch (err) {
      console.error('NATS connection error (page-service)', err);
      throw err;
    }
  }
  return natsConnection;
}

async function publish(subject, data) {
  try {
    const nc = await getNatsConnection();
    nc.publish(subject, sc.encode(JSON.stringify(data)));
    console.log(`Published to ${subject}:`, data);
  } catch (err) {
    console.error(`Error publishing to ${subject}:`, err);
  }
}

async function subscribe(subject, handler) {
  try {
    const nc = await getNatsConnection();
    const sub = nc.subscribe(subject);
    console.log(`Subscribed to ${subject}`);

    (async () => {
      for await (const msg of sub) {
        try {
          const data = JSON.parse(sc.decode(msg.data));
          await handler(data);
        } catch (err) {
          console.error(`Error handling message from ${subject}:`, err);
        }
      }
    })();
  } catch (err) {
    console.error(`Error subscribing to ${subject}:`, err);
  }
}

module.exports = {
  getNatsConnection,
  publish,
  subscribe,
};

