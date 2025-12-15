const axios = require('axios');

function createClient(baseURL) {
  return axios.create({
    baseURL,
    timeout: 5000,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

module.exports = {
  createClient,
};

