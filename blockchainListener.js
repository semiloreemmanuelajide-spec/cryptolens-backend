const WebSocket = require('ws');
const axios = require('axios');
const { Pair } = require('./models');

/**
 * Programmatic Rug-Check Scam Filter for Solana Tokens
 * Fetches token configuration records to flag honeypots instantly.
 * @param {string} mintAddress - The token's contract address (mint)
 * @returns {Promise<string>} - Returns 'Good', 'Warning', or 'Danger'
 */
async function checkTokenSafety(mintAddress) {
    try {
        // Fetch RugCheck's instant architectural configuration payload
        const response = await axios.get(`https://api.rugcheck.xyz/v1/tokens/${mintAddress}/report`, {
            timeout: 2500 // 2.5-second strict timeout to keep the live pipeline moving fast
        });

        const report = response.data;
        if (!report) return 'Warning';

        // 🚨 CRITICAL RULE 1: Active Mint Authority = Instant Danger
        if (report.mintAuthority !== null) {
            console.warn(`⚠️ SCAM ALERT: Token ${mintAddress} has active Mint Authority!`);
            return 'Danger';
        }

        // 🚨 CRITICAL RULE 2: Active Freeze Authority = Instant Danger
        if (report.freezeAuthority !== null) {
            console.warn(`⚠️ SCAM ALERT: Token ${mintAddress} has active Freeze Authority!`);
            return 'Danger';
        }

        // Rule 3: Check RugCheck's internal risk score threshold
        if (report.score && report.score > 2000) {
            return 'Warning'; // High risk structural parameters or heavy top holders
        }

        return 'Good';
    } catch (error) {
        console.error(`Error running rug-check on ${mintAddress}:`, error.message);
        // Default safely to Warning if the service is rate-limited or temporarily down
        return 'Warning';
    }
}

const startListener = (io) => {
    console.log('📡 Connecting directly to Pump.fun platform data stream...');

    const ws = new WebSocket('wss://pumpportal.fun/api/data');

    ws.on('open', () => {
        console.log('📡 Connected to PumpPortal! Subscribing to live token creations...');
        
        const payload = {
            method: "subscribeNewToken"
        };
        ws.send(JSON.stringify(payload));
    });

    ws.on('message', async (data) => {
        try {
            const message = JSON.parse(data);

            if (message && message.mint) {
                // 🛑 1. Duplicate Prevention Look-up
                const existingPair = await Pair.findOne({ where: { pairAddress: message.mint } });
                if (existingPair) return; 

                console.log(`✨ New Token Found: ${message.name} (${message.symbol})`);

                // 🛠️ 2. Run the Programmatic Rug-Check Scan
                const safetyRating = await checkTokenSafety(message.mint);

                // 📊 3. Dynamic Metric Calculations (No more placeholders)
                const initialMcap = message.usdMarketCap ? parseFloat(message.usdMarketCap) : 3000; 
                const calculatedPrice = initialMcap / 1000000000; // Mcap divided by 1B fixed supply
                const virtualSolLiquidity = message.vSolInPool ? parseFloat(message.vSolInPool) : 30.0;

                const realTokenData = {
                    pairAddress: message.mint,
                    chainId: 'solana',
                    baseTokenSymbol: message.symbol || 'UNKNOWN',
                    baseTokenName: message.name || 'Meme Coin',
                    baseTokenAddress: message.mint,
                    quoteTokenSymbol: 'SOL',
                    quoteTokenName: 'Solana',
                    quoteTokenAddress: 'So11111111111111111111111111111111111111112',
                    priceUsd: calculatedPrice,
                    volume24h: 0,
                    liquidity: virtualSolLiquidity, 
                    priceChange24h: 0,
                    riskLevel: safetyRating // ✨ Injected risk ranking metric field directly
                };

                // 💾 4. Permanent Database Registry Storage
                const savedPair = await Pair.create(realTokenData);
                
                // 📢 5. Emit Payload to Local WebSocket Interface Hook
                io.emit('new_token', savedPair);
                
                console.log(`✅ Token ${savedPair.baseTokenSymbol} [Risk: ${safetyRating}] saved seamlessly. Initial Price: $${calculatedPrice.toFixed(9)} | Liq: ${virtualSolLiquidity.toFixed(2)} SOL`);
            }
        } catch (err) {
            console.error('❌ Error handling streaming message execution:', err.message);
        }
    });

    ws.on('error', (err) => {
        console.error('❌ PumpPortal WebSocket Error Encountered:', err.message);
    });

    ws.on('close', () => {
        console.log('❌ Connection dropped. Reconnecting to Pump.fun feed in 5 seconds...');
        setTimeout(() => startListener(io), 5000);
    });
};

module.exports = { startListener };