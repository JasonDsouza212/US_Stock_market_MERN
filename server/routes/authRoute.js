const epxress = require("express");
const router = epxress.Router();

const {
    createAccount,
    loginAccount,
    validateToken,
} = require("../controllers/authController");

router.route("/register").post(createAccount);
router.route("/login").post(loginAccount);
router.route("/validate").post(validateToken);

module.exports = router;
