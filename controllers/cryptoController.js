const { Pair } = require('../models');

exports.getTrendingPairs = async (req, res) => {
    try {
        const pairs = await Pair.findAll({
            order: [['volume24h', 'DESC']],
            limit: 25
        });
        res.status(200).json({ success: true, data: pairs });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.createPair = async (req, res) => {
    try {
        const newPair = await Pair.create(req.body);
        res.status(201).json({ success: true, data: newPair });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};