const epxress = require("express");
const router = epxress.Router();

const {
    getInfo,
    getChart,
    getData,
} = require("../controllers/searchQuoteController");

router.route("/getInfo").get(getInfo);
router.route("/getChart").get(getChart);
router.route("/getData").get(getData);

module.exports = router;
