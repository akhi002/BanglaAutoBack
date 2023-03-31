const express = require("express")
const matchController = require('../controller/matches');
const checkAuth = require("../middleware/check-auth");
const match = require("../model/match");

const router = express.Router();

router.post("/getMatches", matchController.getMatches);
router.post("/getAllMatches", matchController.getAllMatches)
// router.post("/getUpScoreMatchList", matchController.getUpScoreMatchList);
// router.post("/getScoreMatchList", matchController.getScoreMatchList);
// router.post("/getCricExchScoreMatchList", matchController.getCricExchScoreMatchList);
// router.patch("/updateScore", matchController.updateScore)
router.patch("/toggleTrueFalse", matchController.toggleTrueFalse)
// router.get("/getScore",matchController.getScore)
// router.post("/getNinjaMatchlist", matchController.getNinjaMatchlist)
// router.post("/getKeedamatchList",matchController.getKeedaMatchlist)
// router.post("/getAddamatchList",matchController.getAddamatchList)
// router.post("/getEspnMatchList",matchController.getEspnMatchList)
// router.post("/runScrapperManual", scrapperController.runScrapperManual)
// router.post("/updateDefaultscore", matchController.updateDefaultscore)
// router.post("/getDefaultscore",matchController.getDefaultscore)
// router.post("/getMatchByEventId",matchController.getMatchByEventId)
// router.post("/updateScoreId",matchController.updateScoreId)
// router.post("/getCmptlist",matchController.getCmptlist)
// router.post("/getCmptEvent",matchController.getCmptEvent)
// router.post("/getCmptEventMkt",matchController.getCmptEventMkt)
// router.get("/getBetfairEvent/:id",matchController.getBetfairEvent)
// router.post("/getAllEvent",matchController.getAllEvent)
// router.post("/getOpenTym",matchController.getOpenTym)
// router.patch("/setliveTv",matchController.setliveTv)
// router.post("/geteventTvUrl",matchController.geteventTvUrl)
// router.get("/getchid",matchController.getTvUrl);
// router.get("/getResult",matchController.getResult);
// router.post("/sportsRadarScore",matchController.sportsRadarScore);
// router.post("/setTvUrlOld",matchController.setTvUrlOld);
// router.get("/getWhitelist",matchController.getWhitelist);
// router.post("/whitelistIp", matchController.whitelistIp);
// router.get('/deleteWhitelist/:id', matchController.deleteWhitelist);
// router.get('/deleteAllMatch',matchController.deleteAllMatch)
// router.get('/getUserid',matchController.getUserId)
router.post('/addwebsite',  matchController.addwebsite);
router.get('/getallwebsite',  matchController.getallwebsite);
router.post('/websitedelete',  matchController.websitedelete);
router.post('/updatewebsite', matchController.updatewebsite);
router.get('/allwhitelistwebsiteget', matchController.allwhitelistwebsiteget);
router.post('/blockallwebsite',  matchController.blockallwebsite);
router.post('/blockStatus',matchController.blockStatus);
router.post('/getblockStatus',matchController.getblockStatus)
router.post('/resultStatus',matchController.resultStatus);
router.post("/matchresultStatus",matchController.matchresultStatus);
router.post('/setResult',matchController.setResult);
router.post('/suspendResult',matchController.suspendResult);
router.post("/getFancy",matchController.getFancy);
router.post("/setmanualResult",matchController.setmanualResult);
router.get("/getonlyallwebsite",matchController.getonlyallwebsite);
router.post("/checkFancyActiveN",matchController.checkFancyActiveN);
router.post("/setMatchResultSuperSingleWebsite",matchController.setMatchResultSuperSingleWebsite);
router.post("/getMatchResultSuperSingleWebsite",matchController.getMatchResultSuperSingleWebsite);
router.post("/SingleMatchActiveInactveSuper",matchController.SingleMatchActiveInactveSuper);
router.post("/setSingleMatchSuspendsuper",matchController.setSingleMatchSuspendsuper);
router.post("/setSingleMatchTimeDateSuper",matchController.setSingleMatchTimeDateSuper);
router.post("/setNewApiResultAll",matchController.setNewApiResultAll);
router.post("/setMatchResultSuperAllWebsite",matchController.setMatchResultSuperAllWebsite);
router.post("/resultsendendpoint",matchController.resultsendendpoint);
router.post('/getstatusWebsite', matchController.getstatusWebsite);
router.post('/sentStatusWebsite', matchController.sentStatusWebsite);
router.get("/singlematchget/:id",  matchController.singlematchget);
router.post('/checkAllWebsitePassFail', matchController.checkAllWebsitePassFail);
router.post('/updatematchDateTime',matchController.updatematchDateTime);
router.post("/updateDefaultresult",matchController.updateDefaultresult);
router.post("/getDefaultscore",matchController.getDefaultscore);
router.post('/matchActiveInactveSuper', matchController.matchActiveInactveSuper);
router.post('/sendUpdateHeader', matchController.sendUpdateHeader);
router.post("/sendSetLimitWebsiteAndSingle",matchController.sendSetLimitWebsiteAndSingle);
router.post("/defaultSendLimtCricketSoccerTennis",matchController.defaultSendLimtCricketSoccerTennis)
router.post("/runScrapperManual", matchController.runScrapperManual);
router.post("/TossResultStore",matchController.TossResultStore);
router.get("/TossResultGet",matchController.TossResultGet);
router.get("/websites",matchController.websites);
router.post("/getPendingResult",matchController.getPendingResult);
router.post("/setAllWebSuspened",matchController.setAllWebSuspened);
router.post("/checkallwebsiteresultdoneornot",matchController.checkallwebsiteresultdoneornot);
router.post("/againSendResultallWebsite",matchController.againSendResultallWebsite);
router.post("/rollbackfancyNewApi",matchController.rollbackfancyNewApi);
router.post("/setmanualResultPendingpage",matchController.setmanualResultPendingpage);
router.post("/suspendResultPending",matchController.suspendResultPending);
router.post("/rollbackfancyNewApiPre",matchController.rollbackfancyNewApiPre);
router.post("/getResultStatus",matchController.getResultStatus);
router.post("/wrongSettled",matchController.wrongSettled);
router.post("/getwrongSettled",matchController.getwrongSettled);
router.post("/resultStatusAll",matchController.resultStatusAll);
router.get("/autostatusAll",matchController.autostatusAll);
router.post("/storeBlockedWeb",matchController.storeBlockedWeb);
router.post("/getblockedweb",matchController.getblockedweb);
router.post("/getFancyByF_id",matchController.getFancyByF_id);
router.post("/rollbackfancyNewApisingleWeb",matchController.rollbackfancyNewApisingleWeb);
router.post("/rollbackfancyNewApiselectedweb",matchController.rollbackfancyNewApiselectedweb);
router.post("/getrollBackedFancy",matchController.getrollBackedFancy);
router.post("/setmanualResultselectedweb",matchController.setmanualResultselectedweb);
router.post("/sendSingleWebsiteProvider",matchController.sendSingleWebsiteProvider);



module.exports = router;