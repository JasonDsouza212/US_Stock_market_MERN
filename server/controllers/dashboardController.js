// Import Mongoose Model;
let UserPortfolio = require("../models/userPortfolioModel");

const axios = require("axios");
const localRedis = require("../local-redis");

// Get Dashboard Info
exports.getDashboardInfo = async (req, res) => {
    try {
        // Get UserID;
        const { userID } = req.query;

        // If UserID Missing, Return Fail Message;
        if (!userID) {
            return res.status(200).json({
                status: "fail",
                message: "userID Missing!",
            });
        }
        const existingPortfolio = await UserPortfolio.findOne({
            userID: userID,
        });
        // If User Portfolio Not exist, Return Fail Message;
        if (!existingPortfolio) {
            return res.status(200).json({
                status: "fail",
                message: "Fail ! Portfolio Doesn't Exist !",
            });
        }

        let data = {
            userPortfolio: existingPortfolio,
            portfolioData: [],
            portfolioValue: existingPortfolio.balance,
        };
        let symbolArray = Array.from(existingPortfolio.portfolio.keys());

        // Call API to get currentPrice and Previous Close
        for (var i = 0; i < symbolArray.length; i++) {
            const symbol = symbolArray[i];

            const pC_cP_cN = await new Promise((resolve) => {
                localRedis.get(`CurrentInfo_${symbol}`, async (err, data) => {
                    if (err) return null;
                    if (data != null) {
                        resolve(JSON.parse(data));
                    } else {
                        try {
                            let url = `https://query2.finance.yahoo.com/v10/finance/quoteSummary/${symbol}?modules=price`;
                            let response = await axios.get(url);
                            let currentInfo = {
                                previousClose:
                                    response.data.quoteSummary.result[0].price
                                        .regularMarketPreviousClose.raw,
                                currentPrice:
                                    response.data.quoteSummary.result[0].price
                                        .regularMarketPrice.raw,
                                companyName:
                                    response.data.quoteSummary.result[0].price
                                        .shortName,
                            };
                            localRedis.SETEX(
                                `CurrentInfo_${symbol}`,
                                5,
                                JSON.stringify(currentInfo)
                            );
                            resolve(currentInfo);
                        } catch (err) {
                            return null;
                        }
                    }
                });
            });

            const previousClose = pC_cP_cN.previousClose;
            const currentPrice = pC_cP_cN.currentPrice;
            const companyName = pC_cP_cN.companyName;

            // const symbol = symbolArray[i];
            // let url = `https://query2.finance.yahoo.com/v10/finance/quoteSummary/${symbol}?modules=price`;

            // let response = await axios.get(url);

            // const previousClose =
            //     response.data.quoteSummary.result[0].price
            //         .regularMarketPreviousClose.raw;
            // const currentPrice =
            //     response.data.quoteSummary.result[0].price.regularMarketPrice
            //         .raw;
            // const companyName =
            //     response.data.quoteSummary.result[0].price.shortName;
            const position = existingPortfolio.portfolio.get(symbol);
            const unitPrice = existingPortfolio.unitPrice.get(symbol);
            const marketValue = Math.abs(position) * currentPrice;

            const previousClose_unitPrice =
                unitPrice > previousClose ? unitPrice : previousClose;

            data.portfolioValue += marketValue;

            // Append everything to data.
            data.portfolioData.push({
                symbol: symbol,
                currentPrice: currentPrice.toFixed(2),
                companyName: companyName,
                position: position,
                averageCost: unitPrice.toFixed(2),
                marketValue: parseFloat(marketValue).toFixed(2),
                todayReturn: {
                    raw: (
                        Math.abs(position) *
                        parseFloat(currentPrice - previousClose_unitPrice)
                    ).toFixed(2),
                    fmt:
                        (
                            ((currentPrice - previousClose_unitPrice) /
                                previousClose_unitPrice) *
                            100
                        ).toFixed(2) + "%",
                },
                totalReturn: {
                    raw: (
                        Math.abs(position) *
                        parseFloat(currentPrice - unitPrice)
                    ).toFixed(2),
                    fmt:
                        (
                            ((currentPrice - unitPrice) / unitPrice) *
                            100
                        ).toFixed(2) + "%",
                },
            });
        }

        return res.status(200).json({
            status: "success",
            data: data,
        });
    } catch (error) {
        return res.status(200).json({
            status: "fail",
            error: error.message,
        });
    }
};
