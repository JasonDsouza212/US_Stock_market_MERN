const epxress = require("express");
const router = epxress.Router();

const auth = require("../controllers/middlewares/auth");

const { getOptionChains } = require("../controllers/optionChainsController");

router.route("/").get(auth, getOptionChains);

module.exports = router;
