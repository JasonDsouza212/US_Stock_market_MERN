// Import Mongoose Model;
let UserPortfolio = require("../models/userPortfolioModel");

const axios = require("axios");

// Return Market Hours (True / False)
function marketHours() {
    let now = new Date();

    let day = now.getUTCDay();

    //WeekDay
    if (day !== 0 || day !== 6) {
        //Between 9 to 4;
        if (now.getUTCHours() >= 13 && now.getUTCHours < 20) {
            // If before 930 Return false;
            if (now.getUTCHours() === 13 && now.getUTCMinutes() < 30) {
                return false;
            }
            //Return true;
            return true;
        }
    }
    //WeekEnd
    else {
        return false;
    }
}

// Buy Order
exports.buy = async (req, res) => {
    try {
        //Get UserID Symbol Quantity
        const { userID, symbol, quantity } = req.body;

        //If not market hours, Return Fail Message;
        if (!marketHours()) {
            return res.status(200).json({
                status: "fail",
                message: "Order Fail ! Market Not Open !",
            });
        }

        //If Quantity < 0, Return Fail Message;
        if (quantity <= 0) {
            return res.status(200).json({
                status: "fail",
                message: "Order Fail ! Invalid Quantity !",
            });
        }

        const existingPortfolio = await UserPortfolio.findOne({
            userID: userID,
        });
        // If User Portfolio Not exist, Return Fail Message;
        if (!existingPortfolio) {
            return res.status(200).json({
                status: "fail",
                message: "Order Fail ! Portfolio Doesn't Exist !",
            });
        }

        const response = await axios({
            method: "get",
            url: `https://query2.finance.yahoo.com/v10/finance/quoteSummary/${symbol}`,
            timeout: 1000,
            params: {
                modules: "price",
            },
        });

        const currentPrice =
            response.data.quoteSummary.result[0].price.regularMarketPrice.raw;

        // If currentPrice not exist, Return Fail Message;
        if (!currentPrice) {
            return res.status(200).json({
                status: "fail",
                message: "Order Fail ! Please Try Again !",
            });
        }

        // Calculate PNL and Update it
        const totalPrice = Math.abs(currentPrice * quantity);
        let balance = existingPortfolio.balance;

        let avgPrice = existingPortfolio.unitPrice.get(symbol);
        avgPrice = avgPrice === undefined ? 0 : avgPrice;
        let position = existingPortfolio.portfolio.get(symbol);
        position = position === undefined ? 0 : position;

        let newAvgPrice = avgPrice;
        let newBalance = balance;
        let pnl = 0;

        if (position >= 0) {
            if (balance < totalPrice) {
                return res.status(200).json({
                    status: "fail",
                    message: "Order Fail ! Insufficient Balance !",
                });
            }
            newBalance -= totalPrice;
            newAvgPrice =
                (position * avgPrice + currentPrice * quantity) /
                (position + quantity);
        } else if (position < 0) {
            newBalance += Math.min(Math.abs(position), quantity) * avgPrice;
            pnl =
                (avgPrice - currentPrice) *
                Math.min(Math.abs(position), quantity);
            newBalance += pnl;

            if (quantity > -position) {
                newAvgPrice = currentPrice;
                newBalance -= (position + quantity) * currentPrice;
            }

            if (position == -quantity) {
                newAvgPrice = 0;
            }
        }

        if (newAvgPrice === 0) {
            existingPortfolio.portfolio.delete(symbol);
            existingPortfolio.unitPrice.delete(symbol);
        } else {
            existingPortfolio.unitPrice.set(symbol, newAvgPrice);
            existingPortfolio.portfolio.set(`${symbol}`, position + quantity);
        }
        existingPortfolio.save();

        const updatedPortfolio = await UserPortfolio.findByIdAndUpdate(
            existingPortfolio._id,
            {
                balance: newBalance,
                $push: {
                    transaction: {
                        symbol: symbol,
                        quantity: quantity,
                        price: currentPrice,
                        pnl: pnl,
                        date: new Date(),
                    },
                },
            }
        );

        return res.status(200).json({
            status: "success",
            message: `Bought ${quantity} Share of ${symbol} @ ${currentPrice} !`,
            balance: newBalance,
            transaction: existingPortfolio.transaction,
            unitPrice: existingPortfolio.unitPrice,
            portfolio: existingPortfolio.portfolio,
        });
    } catch (error) {
        return res.status(200).json({
            status: "fail",
            error: error.message,
        });
    }
};

// Sell Order
exports.sell = async (req, res) => {
    try {
        //Get UserID Symbol Quantity
        const { userID, symbol, quantity } = req.body;

        //If not market hours, Return Fail Message;
        if (!marketHours()) {
            return res.status(200).json({
                status: "fail",
                message: "Order Fail ! Market Not Open !",
            });
        }

        //If Quantity > 0, Return Fail Message;
        if (quantity >= 0) {
            return res.status(200).json({
                status: "fail",
                message: "Order Fail ! Invalid Quantity !",
            });
        }

        const existingPortfolio = await UserPortfolio.findOne({
            userID: userID,
        });
        // If User Portfolio Not exist, Return Fail Message;
        if (!existingPortfolio) {
            return res.status(200).json({
                status: "fail",
                message: "Order Fail ! Portfolio Doesn't Exist !",
            });
        }

        const response = await axios({
            method: "get",
            url: `https://query2.finance.yahoo.com/v10/finance/quoteSummary/${symbol}`,
            timeout: 1000,
            params: {
                modules: "price",
            },
        });
        const currentPrice =
            response.data.quoteSummary.result[0].price.regularMarketPrice.raw;

        // If currentPrice not exist, Return Fail Message;
        if (!currentPrice) {
            return res.status(200).json({
                status: "fail",
                message: "Order Fail ! Please Try Again !",
            });
        }

        // Calculate PNL and Update it
        const totalPrice = Math.abs(currentPrice * quantity);
        let balance = existingPortfolio.balance;

        let avgPrice = existingPortfolio.unitPrice.get(symbol);
        avgPrice = avgPrice === undefined ? 0 : avgPrice;
        let position = existingPortfolio.portfolio.get(symbol);
        position = position === undefined ? 0 : position;

        let newAvgPrice = avgPrice;
        let newBalance = balance;
        let pnl = 0;

        if (position <= 0) {
            if (balance < totalPrice) {
                return res.status(200).json({
                    status: "fail",
                    message: "Order Fail ! Insufficient Balance !",
                });
            }
            newBalance -= totalPrice;
            newAvgPrice =
                (Math.abs(position) * avgPrice +
                    currentPrice * Math.abs(quantity)) /
                (Math.abs(position) + Math.abs(quantity));
        } else if (position > 0) {
            newBalance += Math.min(position, Math.abs(quantity)) * avgPrice;
            pnl =
                (currentPrice - avgPrice) *
                Math.min(position, Math.abs(quantity));
            newBalance += pnl;

            if (-quantity > position) {
                newAvgPrice = currentPrice;
                newBalance -= (-quantity - position) * currentPrice;
            }

            if (position == -quantity) {
                newAvgPrice = 0;
            }
        }
        if (newAvgPrice === 0) {
            existingPortfolio.portfolio.delete(symbol);
            existingPortfolio.unitPrice.delete(symbol);
        } else {
            existingPortfolio.unitPrice.set(symbol, newAvgPrice);
            existingPortfolio.portfolio.set(`${symbol}`, position + quantity);
        }
        existingPortfolio.save();

        const updatedPortfolio = await UserPortfolio.findByIdAndUpdate(
            existingPortfolio._id,
            {
                balance: newBalance,
                $push: {
                    transaction: {
                        symbol: symbol,
                        quantity: quantity,
                        price: currentPrice,
                        pnl: pnl,
                        date: new Date(),
                    },
                },
            }
        );

        return res.status(200).json({
            status: "success",
            message: `Sold ${Math.abs(
                quantity
            )} Share of ${symbol} @ ${currentPrice} !`,
            balance: newBalance,
            transaction: existingPortfolio.transaction,
            unitPrice: existingPortfolio.unitPrice,
            portfolio: existingPortfolio.portfolio,
        });
    } catch (error) {
        return res.status(200).json({
            status: "fail",
            error: error.message,
        });
    }
};

// Reset Account
exports.reset = async (req, res) => {
    try {
        // Get UserID
        const { userID } = req.body;

        const existingPortfolio = await UserPortfolio.findOne({
            userID: userID,
        });
        // If User Portfolio Not exist, Return Fail Message;
        if (!existingPortfolio) {
            return res.status(200).json({
                status: "fail",
                message: "Fail Reset! Portfolio Doesn't Exist !",
            });
        }
        // Update It on MongoDB
        const updatedPortfolio = await UserPortfolio.findByIdAndUpdate(
            existingPortfolio._id,
            {
                balance: 25000,
                transaction: [],
                portfolio: {},
                unitPrice: {},
            }
        );
        return res.status(200).json({
            status: "success",
            message: "Resetted Everything!",
            balance: 25000,
            transaction: [],
            portfolio: {},
            unitPrice: {},
        });
    } catch (error) {
        return res.status(200).json({
            status: "fail",
            error: error.message,
        });
    }
};
