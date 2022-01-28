const epxress = require("express");
const router = epxress.Router();

const auth = require("../controllers/middlewares/auth");

const { getNews } = require("../controllers/marketNewsController");

router.route("/").get(auth, getNews);

module.exports = router;
