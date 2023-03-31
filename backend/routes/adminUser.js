const express = require("express")
const adminUserController = require("../controller/adminUser")


const router = express.Router();

router.post("/login",adminUserController.adminLogin);
router.get("/",adminUserController.insert);
router.post("/createuser",adminUserController.createuser);
router.get("/getallusers",adminUserController.getallusers);
router.post("/changePwd",adminUserController.changePwd);
router.post("/removeUser",adminUserController.removeUser);
router.post("/checkuser", adminUserController.checkuser);

module.exports = router;
