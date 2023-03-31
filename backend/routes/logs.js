const express = require("express")
const logscontrollers = require("../controller/logs")


const router = express.Router();

router.post("/getFancySingle",logscontrollers.getFancySingle);
router.get("/getmtachlogs",logscontrollers.getmtachlogs);
router.get("/getUserLogs",logscontrollers.getUserLogs);
router.get("/getLimitlogs",logscontrollers.getLimitlogs);
router.get("/getweblogs",logscontrollers.getweblogs);


module.exports = router;