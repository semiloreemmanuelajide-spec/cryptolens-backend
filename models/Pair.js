// models/pair.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Pair = sequelize.define('Pair', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        pairAddress: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        chainId: {
            type: DataTypes.STRING,
            allowNull: false
        },
        // Flattening the Base Token fields
        baseTokenSymbol: {
            type: DataTypes.STRING,
            allowNull: false
        },
        baseTokenName: {
            type: DataTypes.STRING,
            allowNull: false
        },
        baseTokenAddress: {
            type: DataTypes.STRING,
            allowNull: false
        },
        // Flattening the Quote Token fields
        quoteTokenSymbol: {
            type: DataTypes.STRING,
            allowNull: false
        },
        quoteTokenName: {
            type: DataTypes.STRING,
            allowNull: false
        },
        quoteTokenAddress: {
            type: DataTypes.STRING,
            allowNull: false
        },
        priceUsd: {
            type: DataTypes.DECIMAL(18, 8),
            allowNull: false,
            defaultValue: 0.00
        },
        volume24h: {
            type: DataTypes.DECIMAL(18, 2),
            allowNull: false,
            defaultValue: 0.00
        },
        liquidity: {
            type: DataTypes.DECIMAL(18, 2),
            allowNull: false,
            defaultValue: 0.00
        },
        priceChange24h: {
            type: DataTypes.FLOAT,
            allowNull: false,
            defaultValue: 0.0
        }
    }, {
        timestamps: true
    });

    return Pair;
};