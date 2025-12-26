const { connect } = require('nats');
const config = require('../config');

let nc;

async function getNatsConnection() {
  if (!nc) {
    nc = await connect({ servers: config.natsUrl });
    console.log('Workspace service connected to NATS');
  }
  return nc;
}

async function publish(subject, data) {
  try {
    const conn = await getNatsConnection();
    const payload = Buffer.from(JSON.stringify(data));
    conn.publish(subject, payload);
  } catch (err) {
    console.error('Workspace NATS publish failed', { subject, err });
  }
}

module.exports = {
  getNatsConnection,
  publish,
};

