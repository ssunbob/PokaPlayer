const router = require("express").Router();
const User = require("../db/user"); // userDB
router.get("/", (_, res) => res.send("Poka API v2"))
router.use("/playlist", require("./playlist"));
router.use("/user", require("./user"));
router.use("/pin", require("./pin"));
router.use("/record", require("./record"));
// admin
router.use(async (req, res, next) => {
    if (req.session.user && await User.isUserAdmin(req.session.user))
        next()
    else
        res.status(403).send("Permission Denied Desu");
});
router.use("/users", require("./users"));
module.exports = router;