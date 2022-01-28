const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userPortfolioSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            minlength: 4,
            maxlength: 16,
        },
        userID: {
            type: mongoose.ObjectId,
            required: true,
            unique: true,
        },
        balance: {
            type: Number,
            required: true,
            default: 25000,
        },
        unitPrice: {
            type: Map,
            default: {},
        },
        portfolio: {
            type: Map,
            default: {},
        },
        transaction: {
            type: Array,
            default: [],
        },
    },
    { timestamps: true }
);

const UserPortfolio = mongoose.model("UserPortfolio", userPortfolioSchema);

module.exports = UserPortfolio;
