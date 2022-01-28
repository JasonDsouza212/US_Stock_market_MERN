const jwt = require("jsonwebtoken");

//Authentication
const auth = async (req, res, next) => {
    try {
        //Get Token
        const token = req.headers.authorization;

        //If Token Missing Return Fail Message.
        if (!token) {
            return res.status(401).json({
                staus: "fail",
                message: "Unauthorized Request!",
            });
        }
        const verified = jwt.verify(token, process.env.JWT_Token);

        //If Token Not Verified Return Fail Message.
        if (!verified) {
            return res.status(401).json({
                staus: "fail",
                message: "Unauthorized Request!",
            });
        }

        next();
    } catch (error) {
        return res.status(200).json({
            staus: "fail",
            message: error.message,
        });
    }
};

module.exports = auth;
