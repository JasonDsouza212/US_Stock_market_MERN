const epxress = require("express");
const router = epxress.Router();

const auth = require("../controllers/middlewares/auth");

const { buy, sell, reset } = require("../controllers/orderController");

router.route("/buy").post(auth, buy);
router.route("/sell").post(auth, sell);
router.route("/reset").post(auth, reset);

module.exports = router;
