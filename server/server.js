//Import Required Modules
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

//MongoDB
const mongoDB = process.env.ATLAS_URI.replace(
    "<password>",
    process.env.AdminPassword
);
mongoose
    .connect(mongoDB, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true,
    })
    .then(() => {
        console.log("MongoDB Database Connection Established Successfully!");
    })
    .catch((err) => console.log(err));

mongoose.set("useFindAndModify", false);

//Routes
const authRouter = require("./routes/authRoute");
const checkValidSymbolRouter = require("./routes/checkValidSymbolRoute");
const dashboardRouter = require("./routes/dashboardRoute");
const getNewsRouter = require("./routes/marketNewsRoute");
const optionChainsRouter = require("./routes/optionChainsRoute");
const orderRouter = require("./routes/orderRoute");
const searchQuoteRouter = require("./routes/searchQuoteRoute");

app.use("/api/auth", authRouter);
app.use("/api/checkSymbol", checkValidSymbolRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/marketNews", getNewsRouter);
app.use("/api/optionChains", optionChainsRouter);
app.use("/api/order", orderRouter);
app.use("/api/searchQuote", searchQuoteRouter);

//App
app.listen(port, () => {
    console.log(`Server is running on port : ${port}`);
});
