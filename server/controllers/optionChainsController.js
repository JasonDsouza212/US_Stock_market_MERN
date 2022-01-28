const axios = require("axios");
const localRedis = require("../local-redis");

// Process Options's Data
function processData(data) {
    var strikes = data.strikes;
    let cIdx = 0;
    const cOptions = data.options[0].calls;
    const cLen = data.options[0].calls.length;

    let pIdx = 0;
    const pOptions = data.options[0].puts;
    const pLen = data.options[0].puts.length;

    return strikes.map((s) => {
        return {
            strikes: s,
            calls:
                cIdx < cLen
                    ? cOptions[cIdx].strike === s
                        ? data.options[0].calls[cIdx++]
                        : null
                    : null,
            puts:
                pIdx < pLen
                    ? pOptions[pIdx].strike === s
                        ? data.options[0].puts[pIdx++]
                        : null
                    : null,
        };
    });
}

// Get Option Chain
exports.getOptionChains = async (req, res) => {
    try {
        // Get symbol date and Type
        const { symbol, date, type } = req.query;
        const url = `https://query2.finance.yahoo.com/v7/finance/options/${symbol}`;

        //return all the expiration date for symbol;
        if (type === "exp") {
            localRedis.get(`OptionExp_${symbol}`, async (err, data) => {
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
                    //Call API to obtain data.
                    try {
                        const response = await axios({
                            method: "get",
                            url: url,
                            timeout: 2000,
                            params: { date: date },
                        });
                        const result = response.data.optionChain.result[0];
                        const optionsData = processData(result);

                        const d = {
                            exp: result.expirationDates[0],
                            expDates: result.expirationDates,
                            optionsData: optionsData,
                        };
                        localRedis.SETEX(
                            `OptionExp_${symbol}`,
                            3600,
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
        }
        //return option data for specific date.
        else {
            localRedis.get(`Option_${symbol}_${date}`, async (err, data) => {
                //If Redis Error;
                if (err) {
                    return res.status(200).json({
                        status: "fail",
                        error: err,
                    });
                }
                //If Value Not Equal Null;
                if (data !== null) {
                    return res.status(200).json({
                        status: "success",
                        optionsData: JSON.parse(data),
                    });
                }
                //If Key Not Found In Redis
                else {
                    //Call API to obtain data.
                    try {
                        const response = await axios({
                            method: "get",
                            url: url,
                            timeout: 5000,
                            params: { date: date },
                        });
                        const result = response.data.optionChain.result[0];
                        const optionsData = processData(result);
                        localRedis.SETEX(
                            `Option_${symbol}_${date}`,
                            300,
                            JSON.stringify(optionsData)
                        );
                        return res.status(200).json({
                            status: "success",
                            optionsData: optionsData,
                        });
                    } catch (err) {
                        return res.status(200).json({
                            status: "fail",
                            optionsData: {},
                            error: err,
                        });
                    }
                }
            });
        }
    } catch (error) {
        return res.status(400).json({
            status: "fail",
            error: error.message,
        });
    }
};
