const epxress = require("express");
const router = epxress.Router();

const auth = require("../controllers/middlewares/auth");
const { getDashboardInfo } = require("../controllers/dashboardController");

router.route("/getDashboardInfo").get(auth, getDashboardInfo);

module.exports = router;
