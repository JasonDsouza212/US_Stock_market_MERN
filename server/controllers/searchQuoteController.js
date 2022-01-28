const axios = require("axios");
const localRedis = require("../local-redis");

//Calculate Timestamp for Price Data
function calcPeriod1() {
    //market open time 930am EST for today;
    let market = new Date();
    market.setUTCHours(13);
    market.setUTCMinutes(30);
    market.setUTCSeconds(0);
    market.setUTCMilliseconds(0);

    //get todays's day 0 - 6 (Sun-Sat);
    let d = new Date();
    let day = d.getDay();

    //If today is normal weekday;
    if (day !== 0 && day !== 6) {
        //WeekDay
        //If Time now > Market Open Time
        //Return 930AM EST Today;
        if (d.valueOf() > market.valueOf()) {
            return market.valueOf() / 1000;
        }
        //Else Time now < Market Open Time
        else {
            //If Today is Monday
            //Return Last Friday's Market Open Time
            if (day === 1 && market.getDay() === 1) {
                return market.setDate(d.getDate() - 3).valueOf() / 1000;
            }
            //Return Previous Day Market Open Time
            return market.setDate(market.getDate() - 1).valueOf() / 1000;
        }
    }

    //If today is normal weekend;
    else {
        //WeekEnd
        if (day === 6) {
            //Sat
            //Get Friday's Time;
            return market.setDate(d.getDate() - 1).valueOf() / 1000;
        }
        if (day === 0) {
            //Sun
            //Get Friday's Time;
            return market.setDate(d.getDate() - 2).valueOf() / 1000;
        }
    }
}

//Get Stock's Price Chart Data
exports.getChart = async (req, res) => {
    const intervalExpire = {
        "1m": 30,
        "5m": 150,
        "15m": 900,
        "30m": 1800,
        "1h": 3600,
        "1d": 86400,
        "1mo": 86400,
        "3mo": 86400,
    };
    try {
        //get Symbol Interval
        let { symbol, interval } = req.query;

        //If symbol Missing, Return Fail Message;
        if (!symbol) {
            return res.status(200).json({
                status: "fail",
                message: "Missing Symbol!",
                data: {},
            });
        }
        //Set Interval as 1m as default
        if (!interval) {
            interval = "1m";
        }

        //Redis
        localRedis.get(`Chart_${symbol}_${interval}`, async (err, data) => {
            //If Redis Error;
            if (err)
                return res.status(200).json({
                    status: "fail",
                    error: err,
                });
            //If Value Not Equal Null;
            if (data !== null) {
                return res.status(200).json({
                    status: "success",
                    data: JSON.parse(data),
                });
            }
            //If Key Not Found In Redis
            else {
                // Call API for data;
                try {
                    const url = `https://query2.finance.yahoo.com/v8/finance/chart/${symbol}`;
                    const response = await axios({
                        method: "get",
                        url: url,
                        timeout: 2000,
                        params: {
                            symbol: symbol,
                            period1: interval === "1m" ? calcPeriod1() : null,
                            period2: 9999999999,
                            interval: interval,
                            includePrePost: interval === "1m" ? false : true,
                        },
                    });
                    const result = response.data.chart.result[0];
                    const quote = result.indicators.quote[0];
                    const ohlcData = result.timestamp.map((time, idx) => ({
                        date: time * 1000,
                        open: quote.open[idx],
                        high: quote.high[idx],
                        low: quote.low[idx],
                        close: quote.close[idx],
                        volume: quote.volume[idx],
                    }));

                    //Store it in redis based on interval;
                    localRedis.SETEX(
                        `Chart_${symbol}_${interval}`,
                        intervalExpire[interval],
                        JSON.stringify(ohlcData)
                    );

                    return res.status(200).json({
                        status: "success",
                        data: ohlcData,
                    });
                } catch (err) {
                    return res.status(200).json({
                        status: "fail",
                        error: err,
                    });
                }
            }
        });
    } catch (error) {
        return res.status(200).json({
            status: "fail",
            error: error.message,
        });
    }
};

//Get Stock's Overview Info
exports.getInfo = async (req, res) => {
    try {
        //get Symbol
        const { symbol } = req.query;
        //If symbol Missing, Return Fail Message;
        if (!symbol) {
            return res.status(200).json({
                status: "fail",
                message: "Missing Symbol!",
                data: {},
            });
        }

        //Redis
        localRedis.get(`Info_${symbol}`, async (err, data) => {
            //If Redis Error;
            if (err)
                return res.status(200).json({
                    status: "fail",
                    error: err,
                });
            //If Value Not Equal Null;
            if (data !== null) {
                return res.status(200).json({
                    status: "success",
                    data: JSON.parse(data),
                });
            }
            //If Key Not Found In Redis
            else {
                // Call API for data;
                try {
                    const url = `https://query2.finance.yahoo.com/v10/finance/quoteSummary/${symbol}`;
                    const response = await axios({
                        method: "get",
                        url: url,
                        timeout: 3000,
                        params: {
                            modules: "price,summaryProfile,summaryDetail",
                        },
                    });
                    const priceResult =
                        response.data.quoteSummary.result[0].price || [];
                    const summaryProfileResult =
                        response.data.quoteSummary.result[0].summaryProfile ||
                        [];
                    const summaryDetailResult =
                        response.data.quoteSummary.result[0].summaryDetail ||
                        [];

                    let stockInfo =
                        priceResult !== [] && summaryProfileResult !== []
                            ? {
                                  name: priceResult.shortName,
                                  website: summaryProfileResult.website,
                                  symbol: symbol,
                                  exchangeName:
                                      priceResult.exchangeName.toUpperCase(),
                                  sector: summaryProfileResult.sector || null,
                                  industry:
                                      summaryProfileResult.industry || null,
                                  lastPrice:
                                      priceResult.regularMarketPrice.raw.toFixed(
                                          2
                                      ),
                                  currency: priceResult.currency,
                                  priceChange:
                                      priceResult.regularMarketChange.fmt,
                                  priceChangePercent:
                                      priceResult.regularMarketChangePercent
                                          .fmt,
                                  color:
                                      priceResult.regularMarketChange.raw > 0
                                          ? "green"
                                          : "red",
                              }
                            : {};

                    let keyData =
                        summaryDetailResult !== []
                            ? {
                                  previousClose:
                                      summaryDetailResult.previousClose.raw.toFixed(
                                          2
                                      ),
                                  open: summaryDetailResult.open.raw.toFixed(2),
                                  high: summaryDetailResult.dayHigh.raw.toFixed(
                                      2
                                  ),
                                  low: summaryDetailResult.dayLow.raw.toFixed(
                                      2
                                  ),
                                  close: priceResult.regularMarketPrice.raw.toFixed(
                                      2
                                  ),
                                  volume: summaryDetailResult.volume.fmt,
                                  averageVolume:
                                      summaryDetailResult.averageVolume.fmt,
                                  marketCap: summaryDetailResult.marketCap.fmt,
                                  ma50: summaryDetailResult.fiftyDayAverage.raw.toFixed(
                                      2
                                  ),
                                  ma200: summaryDetailResult.twoHundredDayAverage.raw.toFixed(
                                      2
                                  ),
                              }
                            : {};
                    let d = { stockInfo: stockInfo, keyData: keyData };

                    //Store it in redis for 5 sec
                    localRedis.SETEX(`Info_${symbol}`, 5, JSON.stringify(d));
                    return res.status(200).json({
                        status: "success",
                        data: { stockInfo: stockInfo, keyData: keyData },
                    });
                } catch (err) {
                    return res.status(200).json({
                        status: "fail",
                        error: err,
                    });
                }
            }
        });
    } catch (error) {
        return res.status(200).json({
            status: "fail",
            error: error.message,
        });
    }
};

//Create an object that map type into modules params
const type_modules = {
    overview: "assetProfile",
    revenue: "earnings",
    earning: "earnings",
    financial:
        "incomeStatementHistory,incomeStatementHistoryQuarterly,cashflowStatementHistory,cashflowStatementHistoryQuarterly,balanceSheetHistory,balanceSheetHistoryQuarterly",
};
//Function taht extract data based on differnt type;
function extractData(data, type) {
    if (data === undefined) {
        return {};
    } else {
        switch (type) {
            case "overview":
                data = data[type_modules[type]];
                return {
                    summary: data.longBusinessSummary,
                    city: data.city,
                    state: data.state,
                    country: data.country,
                    employees: data.fullTimeEmployees,
                    ceoName: data.companyOfficers[0].name,
                    ceoTitle: data.companyOfficers[0].title,
                };
            case "revenue":
                data = data[type_modules[type]];
                return {
                    financialsChart: data.financialsChart,
                };

            case "earning":
                data = data[type_modules[type]];
                return {
                    earningsChart: data.earningsChart,
                };

            case "financial":
                return {
                    incomeStatementHistoryQuarterly:
                        data.incomeStatementHistoryQuarterly
                            .incomeStatementHistory,
                    incomeStatementHistoryAnnual:
                        data.incomeStatementHistory.incomeStatementHistory,
                    balanceSheetHistoryQuarterly:
                        data.balanceSheetHistoryQuarterly
                            .balanceSheetStatements,
                    balanceSheetHistoryAnnual:
                        data.balanceSheetHistory.balanceSheetStatements,
                    cashflowStatementHistoryQuarterly:
                        data.cashflowStatementHistoryQuarterly
                            .cashflowStatements,
                    cashflowStatementHistoryAnnual:
                        data.cashflowStatementHistory.cashflowStatements,
                };

            default:
                return {};
        }
    }
}

//Get Stock's Financial Info;
exports.getData = async (req, res) => {
    try {
        // Get Symbol Type
        const { symbol, type } = req.query;
        //If symbol Missing, Return Fail Message;
        if (!symbol) {
            return res.status(200).json({
                status: "fail",
                message: "Missing Symbol!",
            });
        }
        //If type Missing, Return Fail Message;
        if (!type) {
            return res.status(200).json({
                status: "fail",
                message: "Missing Parameter",
            });
        }

        // format the type
        let redisType = type[0].toUpperCase() + type.slice(1);

        //Redis
        localRedis.get(`${redisType}_${symbol}`, async (err, data) => {
            //If Redis Error;
            if (err)
                return res.status(200).json({
                    status: "fail",
                    error: err,
                });
            //If Value Not Equal Null;
            if (data !== null) {
                return res.status(200).json({
                    status: "success",
                    data: JSON.parse(data),
                });
            }
            //If Key Not Found In Redis
            else {
                try {
                    // Call API for data;
                    const url = `https://query2.finance.yahoo.com/v10/finance/quoteSummary/${symbol}`;

                    const response = await axios({
                        method: "get",
                        url: url,
                        timeout: 3000,
                        params: {
                            modules: type_modules[type],
                        },
                    });
                    const result = response.data.quoteSummary.result[0];

                    const d = extractData(result, type);

                    localRedis.SETEX(
                        `${redisType}_${symbol}`,
                        86400,
                        JSON.stringify(d)
                    );
                    return res.status(200).json({
                        status: "success",
                        data: d,
                    });
                } catch (err) {
                    return res.status(200).json({
                        status: "fail",
                        error: err,
                    });
                }
            }
        });
    } catch (error) {
        return res.status(200).json({
            status: "fail",
            error: error.message,
        });
    }
};
