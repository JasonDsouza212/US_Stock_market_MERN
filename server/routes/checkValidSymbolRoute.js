const epxress = require("express");
const router = epxress.Router();

const { checkSymbol } = require("../controllers/checkValidSymbolController");

router.route("/").get(checkSymbol);

module.exports = router;
