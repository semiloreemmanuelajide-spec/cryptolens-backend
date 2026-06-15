const axios = require('axios');

const COINGECKO_API = 'https://api.coingecko.com/api/v3';

async function getTopCryptos(limit = 50) {
  try {
    const response = await axios.get(
      `${COINGECKO_API}/coins/markets`, {
        params: {
          vs_currency: 'usd',
          order: 'market_cap_desc',
          per_page: limit,
          page: 1,
          sparkline: false
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching crypto data:', error);
    throw error;
  }
}

module.exports = { getTopCryptos };