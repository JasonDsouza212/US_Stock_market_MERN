// Import Mongoose Model;
let User = require("../models/userModel");
let UserPortfolio = require("../models/userPortfolioModel");

const localRedis = require("../local-redis");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const axios = require("axios");

// Create New Account;
exports.createAccount = async (req, res) => {
    try {
        // Get Username and Password;
        const { username, password } = req.body;

        //If Either is Missing, Return Fail Message;
        if (!username || !password) {
            return res.status(200).json({
                status: "fail",
                message: "Credentials Missing !!!",
            });
        }

        // Bounded The Username Between 4 - 16 Character;
        if (username.length < 4 || username.length > 16) {
            return res.status(200).json({
                status: "fail",
                message: "Username must be between 4 - 16 Character !!!  ",
            });
        }

        const existingUser = await User.findOne({ username });
        // If Existing User Not Found, Return Fail Message;
        if (existingUser) {
            return res.status(200).json({
                status: "fail",
                message: "Username already exists :(",
            });
        }

        //Hash The Password with 10 salt
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            username: username,
            password: hashedPassword,
        });

        //Save User's Info In Mongo DB
        newUser
            .save()
            .then(
                () => (
                    new UserPortfolio({
                        username: username,
                        userID: newUser._id,
                    }).save(),
                    res.status(201).json({
                        status: "scuccess",
                        message: "User Created : " + username + " !",
                    })
                )
            )
            .catch((err) =>
                res.status(200).json({ status: "fail", message: err.message })
            );
    } catch (error) {
        return res.status(200).json({ status: "fail", message: error.message });
    }
};

//Log User In
exports.loginAccount = async (req, res) => {
    try {
        //Get User's Username and Password
        const { username, password } = req.body;

        //If Either is Missing, Return Fail Message;
        if (!username || !password) {
            return res.status(200).json({
                status: "fail",
                message: "Credentials Missing !!!",
            });
        }
        const existingUser = await User.findOne({ username });

        // If Existing User Not Found, Return Fail Message;
        if (!existingUser) {
            return res.status(200).json({
                status: "fail",
                message: "Invalid Credentials! Please Try Again!",
            });
        }

        const match = await bcrypt.compare(password, existingUser.password);
        // If Password Not Match, Return Fail Message;
        if (!match) {
            return res.status(200).json({
                status: "fail",
                message: "Invalid Credentials! Please Try Again!",
            });
        }

        const existingPortfolio = await UserPortfolio.findOne({
            userID: existingUser._id,
        });
        // If User Portfolio Not exist, Return Fail Message;
        if (!existingPortfolio) {
            return res.status(400).json({
                status: "fail",
                message: "Fail ! Portfolio Doesn't Exist !",
            });
        }

        let jwt_token = jwt.sign(
            { id: existingUser._id },
            process.env.JWT_Token
        );

        //Return Account's Informations along with JWT-Token
        return res.status(200).json({
            status: "success",
            token: jwt_token,
            message: "Welcome Back " + username + "!",
            username: username,
            userID: existingUser._id,
            joinDate: existingUser._id.getTimestamp(),
            balance: existingPortfolio.balance,
            portfolio: existingPortfolio.portfolio,
            transaction: existingPortfolio.transaction,
            unitPrice: existingPortfolio.unitPrice,
        });
    } catch (error) {
        return res.status(200).json({ status: "fail", message: error.message });
    }
};

// Validate Auth Token and Return Info, So User dont have to log in again.
exports.validateToken = async (req, res) => {
    try {
        const token = req.headers.authorization;
        // If no Token, Return Fail Message;
        if (!token) {
            return res.status(400).json({ status: "fail" });
        }

        const validation = jwt.verify(token, process.env.JWT_Token);
        // If Token not match, Return Fail Message;
        if (!validation) {
            return res.status(400).json({ status: "fail" });
        }

        const existingUser = await User.findById(validation.id);
        // If No Existing User, Return Fail Message;
        if (!existingUser) {
            return res.status(400).json({ status: "fail" });
        }

        const existingPortfolio = await UserPortfolio.findOne({
            userID: existingUser._id,
        });
        // If Cant Find Portfolio, Return Fail Message;
        if (!existingPortfolio) {
            return res.status(400).json({
                status: "fail",
                message: "Fail ! Portfolio Doesn't Exist !",
            });
        }

        //Return Account's Informations
        return res.status(200).json({
            status: "success",
            username: existingUser.username,
            userID: existingUser._id,
            joinDate: existingUser._id.getTimestamp(),
            balance: existingPortfolio.balance,
            portfolio: existingPortfolio.portfolio,
            transaction: existingPortfolio.transaction,
            unitPrice: existingPortfolio.unitPrice,
        });
    } catch (error) {
        return res.status(400).json({ status: "fail", message: error.message });
    }
};
