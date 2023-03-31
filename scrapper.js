const app = require("./backend/app");
// const db = require("./firebase");
const Raxios = require("axios");
const axios = Raxios.create({
  timeout: 2000,
});
const redis = require("redis");
const Match = require("./backend/model/match");
const Fancy = require("./backend/model/fancy");
const WhitelistWebsite = require("./backend/model/website");
const matchController = require("./backend/controller/matches");
const MatchLogs = require("./backend/model/matchlogs");
const FancyLogs =require("./backend/model/fancyLogs")
const Block = require("./backend/model/blockStatus");
var crypto = require("crypto");
const CryptoJS = require("crypto-js");
const { setIntervalAsync } = require("set-interval-async/dynamic");
const redisUrl = "redis://127.0.0.1:6379";
const client = redis.createClient(redisUrl);
const { promisify } = require("util");

const moment = require("moment");
const asyncLoop = require("node-async-loop");
const aget = promisify(client.get).bind(client);
const config = {
  headers: {
    Authorization: "MutualFundsSahiHai",
  },
};

// process.on('uncaughtException', (err) => {
//   process.exit(1);
// });

// process.on('unhandledRejection', (reason, promise) => {
//   console.log('Unhandled rejection at ', promise, `reason: ${reason.message}`)
// })

const getAllMatches = async () => {
  try {
    const response = await axios.get(
      "https://data.mainredis.in/api/match/getMatches?isActive=true&isResult=false&type=own&sportId=124"
    );
    const Alldata = response.data.result;
    // console.log(Alldata);
    // return
    let pointInclude = Alldata.filter((m) => m.marketId.includes("."));
    let selectedData = pointInclude.map((m) => ({
      eventid: m.eventId,
      marketId: m.marketId,
      mType: m.mType,
      sportId: m.sportId,
    }));
    // console.log('cri',selectedData);
    // return

    if (selectedData.length > 0) {
      client.set("matchF", JSON.stringify(selectedData));
      await addmatch(Alldata);
    }
  } catch (error) {
    // console.log(error);
  }
};

async function addmatch(matchdata) {
  const dbMatch = await Match.find()
    .select({ _id: 0, eventId: 1 })
    .lean();
   
  const eventIds = dbMatch.map((dt) => dt.eventId);
  
  const notExistsMatch = matchdata.filter(
    (dt) => !eventIds.includes(dt.eventId)
  );
 
  const addNewMatch = notExistsMatch.map((dt) => {
    return {
      mType: dt.mType,
      eventId: dt.eventId,
      marketId: dt.marketId,
      eventName: dt.eventName,
      competitionName: "0",
      sportId: dt.sportId,
      sportName: dt.sportName,
      openDate: dt.openDate,
      type: "auto",
      isActive: true,
      isResult: false,
      isInplay: checkInplay(dt.openDate),
      matchRunners: dt.matchRunners,
      autoResult: true,
    };
  });

  const insertNewMatch = await Match.insertMany(addNewMatch);
  // console.log(insertNewMatch.length, 'Inserted Matches');

 const addnewMatchLog =  notExistsMatch.map((dt)=>{
  return{
    eventId: dt.eventId,
    matchName: dt.eventName,
    createdBy:'Auto',
    action:"Auto-Added Match"
  }
 });

 const insertnewMatchlog = await MatchLogs.insertMany(addnewMatchLog);
  // console.log(insertnewMatchlog.length, 'Inserted Matches logs');


  const deleteMatch = eventIds.filter(
    (evt) =>
      !matchdata.some(({ eventId }) => {
        return evt === eventId;
      })
  );
   
 

  const deletedFancyy = await Fancy.deleteMany({
    eventId: { $in: deleteMatch },
  }); 

  const removedOldMatch = await Match.deleteMany({
    eventId: { $in: deleteMatch },
  });

  // console.log("match",removedOldMatch);
  // client.del('matchintoRedis');
  // client.del('matchF');
  // client.del('Active_MatchesF');
  client.del('virtualFancy-'+{ $in: deleteMatch });
  client.del('SkyResult-'+ { $in: deleteMatch })

  // console.log(removedOldMatch.deletedCount, 'Removed Matches');

  // for (let element of matchdata) {

  //   const findMatch = await Match.findOne({ eventId: element.eventId }).lean();

  //   if (!findMatch) {
  //     const matchDataList = new Match({
  //       mType: element.mType,
  //       eventId: element.eventId,
  //       marketId: element.marketId,
  //       eventName: element.eventName,
  //       competitionName: "0",
  //       sportId: element.sportId,
  //       sportName: element.sportName,
  //       openDate: element.openDate,
  //       type: "auto",
  //       isActive: true,
  //       isResult: false,
  //       isInplay: await checkInplay(element.openDate),
  //       matchRunners: element.matchRunners,
  //       autoResult:true,
  //     });
  //     // console.log("matchDataList", matchDataList);

  //     const result = await matchDataList.save();
  //   }
  // }

  // await removeMatch(matchdata);
}

const addmatchesIntoRedis = async () => {
  const matchListDb = await Match.find().lean();
  // console.log("list",matchListDb);
  client.set("matchintoRedis", JSON.stringify(matchListDb));
};
// addmatchesIntoRedis()

const redismatchInter = setInterval(() => {
  addmatchesIntoRedis();
}, 1000 * 10);

// async function removeMatch(matchdata) {
//   // console.log(matchdata);
//   try {
//     const response = await matchController.getActiveMatches({
//       isActive: true,
//       isResult: false,
//     });
//     // console.log("res",response.length);

//     // const responRed = JOSN.parse(await aget('matchintoRedis')) || [];
//     // const response = responRed.filter((dt)=>dt.isActive == true && dt.isResult == false);

//     if (response) {
//       const matches = response;
//       var unique = [];

//       for (var i = 0; i < matches.length; i++) {
//         var found = false;

//         for (var j = 0; j < matchdata.length; j++) {
//           // j < is missed;
//           if (matches[i].eventId == matchdata[j].mEventId) {
//             found = true;
//             break;
//           }
//         }
//         if (found == false) {
//           unique.push(matches[i]);
//         }
//       }
//       // console.log("uni",unique);

//       for (let element of unique) {
//         // const element = unique[i];
//         // console.log("ddd",element.eventId);
//         // const updateTrueFalse = await Match.findOneAndUpdate(
//         //   { eventId: element.eventId },
//         //   { $set: { isActive: false } },
//         //   { new: true }
//         // );
//         const deleteFancy = await Fancy.deleteMany({
//           eventId: element.eventId,
//         });
//         const deleteMatch = await Match.findOneAndDelete({
//           eventId: element.eventId,
//         });
//       }
//     }
//   } catch (error) {
//     // console.log(error);
//   }
// }

getAllMatches();

const OddsInterval = setIntervalAsync(async () => {
  await getAllMatches();
}, 1000 * 60 * 10);

const getActiveMatches = async () => {
  try {
    const response = await matchController.getActiveMatches({
      isActive: true,
      isResult: false,
    });
    if (response) {
      const matches = JSON.stringify(response);
      client.set("Active_MatchesF", matches);
    }
  } catch (error) {
    // console.log(error);
  }
};

const getActiveMachesInter = setIntervalAsync(async () => {
  await updateInplay();
}, 1000 * 60 * 10);

const getActiveMachesInter1 = setIntervalAsync(async () => {
  await getActiveMatches();
}, 1000 * 10);

function checkInplay(openDate) {
  var ToDate = new Date();

  if (new Date(openDate).getTime() <= ToDate.getTime()) {
    return true;
  }
  return false;
}

async function updateInplay() {
  try {
    const response = await matchController.getActiveMatches({
      isActive: true,
      isResult: false,
    });

    // const responRed = JOSN.parse(await aget('matchintoRedis')) || [];
    // const response = responRed.filter((m)=> m.isActive == true && m.isResult == false);

    for (let element of response) {
      // const element = response[i];
      const updateTrueFalse = await Match.findOneAndUpdate(
        { eventId: element.eventId },
        { $set: { isInplay: checkInplay(element.openDate) } },
        { new: true }
      );
      // console.log("asd1",updateTrueFalse);
    }
    

  } catch (error) {
    // console.log(error);
  }
}

updateInplay();

const getFancy = async () => {
  try {
    var AblockStatus = false;
    const whitelistWeb = await WhitelistWebsite.find().lean();
    const allBlockStatus = await Block.find().lean();
    if (allBlockStatus.length > 0) {
      AblockStatus = allBlockStatus[0].blockStatus;
    }
    // console.log(allBlockStatus.blockStatus);
    // const matches = await Match.find({       //fe get data from redis and filter  isActive:  true, isInplay: true,
    //   isActive: true,
    //   isInplay: true,
    // }).lean();

    const matc = JOSN.parse(await aget("matchintoRedis")) || [];
    const matches = matc.filter(
      (m) => m.isActive == true && m.isInplay == true
    );

    for (let element of matches) {
      try {
        // const element = matches[i];
        await getEFancy(
          element.eventId,
          whitelistWeb,
          AblockStatus,
          element.autoResult
        );
      } catch (error) {
        // console.log("1",error);
      }
    }
  } catch (error) {
    // console.log("2",error);
  }
};

const getEFancy = async (
  eventId,
  whitelistWeb,
  AblockStatus,
  matchBlockstatus
) => {
  const whiteWeb = whitelistWeb.filter(
    (dt) => dt.type == "Normal" && dt.autoResult == true
  );
  const fancyResp = await axios.get("http://3.6.89.250:4000/get/" + eventId);

  asyncLoop(
    fancyResp?.data?.result?.data,
    async function (match, next) {
      const parsedFancy = JSON.parse(match.value);
      try {
        const findFancyId_EventId = await Fancy.findOne({
          eventId: eventId,
          F_id: parsedFancy.id,
          fancytype: "Tiger",
        }).lean();
        // console.log(findFancyId_EventId);

        if (!findFancyId_EventId) {
          let addFancy = {
            F_id: parsedFancy.id,
            name: parsedFancy.name,
            type_code: parsedFancy.type_code,
            odd_type: parsedFancy.odd_type,
            eventId: eventId,
            result: parsedFancy.result,
            is_result: false,
            fancytype: "Tiger",
            isWorngsettled: false,
          };

          await Fancy.insertMany(addFancy);
          
          let fancyLogs = new FancyLogs({
            eventId:eventId,
            fancyName:parsedFancy.name,
            result:parsedFancy.result,
            fancytype:"Diamond",
            createdBy:"Auto",
            action:"Fancy Auto Added"
          });
          // console.log(fancyLogs);
          await fancyLogs.save();
          if (parsedFancy.result != null && parsedFancy.result != "-1") {
            //get normal type website
            // const whiteWeb = whitelistWeb.filter(
            //   (dt) => dt.type == "Normal" && dt.autoResult == true
            // );
            // console.log("web",whiteWeb);

            if (
              !AblockStatus &&
              parsedFancy.odd_type == "RUNS" &&
              matchBlockstatus && (addFancy.isWorngsettled == undefined) ||
              addFancy.isWorngsettled == false
            ) {
              const urls = whiteWeb.map((dt) =>
              {if(!blockedWeb.includes(dt.websiteurl)){
                axios.post(
                  dt.websiteurl +
                    "/api/" +
                    dt.endpoint +
                    "?id=" +
                    eventId +
                    "-" +
                    parsedFancy.id +
                    ".FY&eventid=" +
                    eventId +
                    "&winner=" +
                    parsedFancy.result,
                  { headers: { "Content-Type": "application/json" } }
                )
              }}
              );

              const responses = await Promise.allSettled(urls);
              const fulfilled = responses.map((result) => result.status);
              // console.log("kkjnj00",fulfilled);

              const updateTrueFalse = await Fancy.findOneAndUpdate(
                {
                  eventId: eventId,
                  F_id: parsedFancy.id,
                  fancytype: "Tiger",
                },
                { $set: { is_result: true } },
                { new: true }
              );
            }
          }
        } else {
          // for (let f = 0; f < whitelistWeb.length; f++) {

          if (
            findFancyId_EventId[0].result == null &&
            parsedFancy.result != null &&
            parsedFancy.result != "-1" &&
            findFancyId_EventId[0].is_result == false
          ) {
            if (
              !AblockStatus &&
              parsedFancy.odd_type == "RUNS" &&
              matchBlockstatus
            ) {
              const urls = whiteWeb.map((dt) =>
                axios.post(
                  dt.websiteurl +
                    "/api/" +
                    dt.endpoint +
                    "?id=" +
                    eventId +
                    "-" +
                    parsedFancy.id +
                    ".FY&eventid=" +
                    eventId +
                    "&winner=" +
                    parsedFancy.result,
                  { headers: { "Content-Type": "application/json" } }
                )
              );

              const responses = await Promise.allSettled(urls);
              const fulfilled = responses.map((result) => result.status);
              const updateTrueFalse = await Fancy.findOneAndUpdate(
                {
                  eventId: eventId,
                  F_id: parsedFancy.id,
                  fancytype: "Tiger",
                },
                {
                  $set: { result: parsedFancy.result, is_result: true },
                },
                { new: true }
              );
            }
          } else if (
            parsedFancy.result != null &&
            parsedFancy.result == "-1" &&
            parsedFancy.is_result == false
          ) {
            const updateTrueFalse = await Fancy.findOneAndUpdate(
              {
                eventId: eventId,
                F_id: parsedFancy.id,
                fancytype: "Tiger",
              },
              {
                $set: { result: parsedFancy.result, is_result: true },
              },
              { new: true }
            );
            suspendResult(updateTrueFalse, whiteWeb);
          }
          // }
        }
        next();
      } catch (error) {
        // console.log("3",error);
      }
    },
    function (err) {
      if (err) {
        // console.error('Error: ' + err.message);
        return;
      }
    }
  );
};

getFancy();

const getFancyInter = setIntervalAsync(async () => {
  await getFancy();
},  1 * 60 * 1000);

async function sendResult(
  url,
  AblockStatus,
  WblockStatus,
  addFancy,
  matchBlockstatus
) {
  // console.log("jjyggg",url,":::",AblockStatus,":::",WblockStatus.autoResult,":::",addFancy.isWorngsettled,":::", matchBlockstatus,":::",WblockStatus.blockedMatch);
  // return;
  if (
    (AblockStatus == false &&
      WblockStatus == true &&
      addFancy.isWorngsettled == null) ||
    (addFancy.isWorngsettled == undefined && matchBlockstatus) ||
    addFancy.isWorngsettled == false && addFancy.isRollbacked == false || addFancy.isRollbacked == undefined
  ) {
    // console.log("true",url);
    // return
    await axios
      .post(url, { headers: { "Content-Type": "application/json" } })
      .then((resp) => {
        //  console.log('result called',url,":::",resp);
      })
      .catch(function (error) {
        // console.log(error);
      });
  }
}

const getActiveFancy = async () => {
  var AblockStatus = false;
  try {
    let allBlockStatus = await Block.find().lean();
    if (allBlockStatus.length > 0) {
      AblockStatus = allBlockStatus[0].blockStatus;
    }

    const response = await Match.find({
      isActive: true,
      isInplay: true,
      sportId: 4,
    }).lean();
    // const respRed = JSON.parse(await aget('matchintoRedis')) || []
    // const response = respRed.filter((m)=> m.isActive == true && m.isInplay == true)
    // console.log("Match",response );
    // return

    const regWeb = await WhitelistWebsite.find({
      type: "Normal",
      autoResult: true,
    }).lean();
    // console.log("sdf",regWeb);
    // return

    for (let match of response) {
      // const match = response[i];
      // console.log(match.isActive,"------",match.isInplay,"---",match.eventId);
      for (let web of regWeb) {
        // const web = regWeb[j];
        // console.log("web",web.websiteurl);

        const getActiveF = await axios.post(
          web.websiteurl + "/api/getActiveFancy?eventId=" + match.eventId
        );
        // console.log("tttttt",getActiveF.data);

        for (let fancy of getActiveF.data) {
          // const fancy = getActiveF.data[k];
          // console.log("dffrfr",fancy);
          if (fancy.fancySource == "tiger") {
            const findFancyId_EventId = await Fancy.find({
              eventId: fancy.eventid,
              F_id: fancy.runnerid,
              fancytype: "Tiger",
            }).lean();
            if (findFancyId_EventId.length > 0) {
              const dbFancy = findFancyId_EventId[0];
              if (dbFancy?.result != null && dbFancy?.result != "-1") {
                if (dbFancy?.odd_type == "RUNS" && web?.type == "Normal") {
                  let sendnormalend =
                    web.websiteurl +
                    "/api/" +
                    web.endpoint +
                    "?id=" +
                    match.eventId +
                    "-" +
                    dbFancy.F_id +
                    ".FY&eventid=" +
                    match.eventId +
                    "&winner=" +
                    +dbFancy.result;

                  sendResult(
                    sendnormalend,
                    AblockStatus,
                    web.autoResult,
                    findFancyId_EventId,
                    match.autoResult
                  );
                }
              } else if (dbFancy.result != null && dbFancy.result == "-1") {
                suspendResult(dbFancy, web);
              }
            }
          } else if (fancy.fancySource == "diamond") {
            const findFancyId_EventId = await Fancy.find({
              eventId: fancy.eventid,
              F_id: fancy.runnerid,
              fancytype: "Diamond",
            }).lean();

            // console.log("Diamond",findFancyId_EventId);

            if (findFancyId_EventId.length > 0) {
              const dbFancy = findFancyId_EventId[0];
              // console.log(dbFancy.result);
              if (
                dbFancy?.result != null &&
                dbFancy?.result != "-1" &&
                dbFancy?.result != "..."
              ) {
                if (dbFancy?.odd_type == "RUNS" && web?.type == "Normal") {
                  let sendnormalend =
                    web.websiteurl +
                    "/api/" +
                    web.endpoint +
                    "?id=" +
                    match.eventId +
                    "-" +
                    dbFancy.F_id +
                    ".FY&eventid=" +
                    match.eventId +
                    "&winner=" +
                    +dbFancy.result;
                  sendResult(
                    sendnormalend,
                    AblockStatus,
                    web.autoResult,
                    findFancyId_EventId,
                    match.autoResult
                  );
                  // if(match.mType == "virtual"){
                  //   console.log(sendnormalend);
                  // }
                }
              } else if (dbFancy.result != null && dbFancy.result == "-1") {
                suspendResult(dbFancy, web);
              }
            }
          } else if (
            fancy.fancySource == "sky" ||
            fancy.fancySource == "Sk" ||
            fancy.fancySource == "sk"
          ) {
            // console.log(fancy);
            const findFancyId_EventId = await Fancy.find({
              eventId: fancy.eventid,
              F_id: fancy.runnerid,
              fancytype: "Sky3",
            }).lean();
            // console.log("sky",findFancyId_EventId);
            if (findFancyId_EventId.length > 0) {
              const dbFancy = findFancyId_EventId[0];
              if (dbFancy?.result != null && dbFancy?.result != "-1") {
                if (dbFancy?.odd_type == "RUNS" && web?.type == "Normal") {
                  let sendnormalend =
                    web.websiteurl +
                    "/api/" +
                    web.endpoint +
                    "?id=" +
                    match.eventId +
                    "-" +
                    dbFancy.F_id +
                    ".FY&eventid=" +
                    match.eventId +
                    "&winner=" +
                    +dbFancy.result;
                  sendResult(
                    sendnormalend,
                    AblockStatus,
                    web.autoResult,
                    findFancyId_EventId,
                    match.autoResult
                  );
                }
              } else if (dbFancy.result != null && dbFancy.result == "-1") {
                suspendResult(dbFancy, web);
              }
            }
          }
        }
      }
    }
  } catch (error) {
    // console.log(error);
  }
};

getActiveFancy();

const getActiveFancyInt = setInterval(async () => {
  await getActiveFancy();
},  2 * 60 * 1000); // 3 min

async function suspendResult(fancy, website) {
  var mfid, type;
  mfid = fancy.eventId + "-" + fancy.F_id + ".FY";
  type = "Fancy";

  let sign = createSign({ mfid, type });

  for (const web of website) {
    Promise.all([sign]).then(async (value) => {
      let body = { mfid, type };
      let url = web.websiteurl + "/api/suspendCommonMatchFancy";

      const { data } = await axios.post(url, body, {
        headers: {
          signature: value[0],
        },
      });
      // console.log(data);
    });
  }
}

function createSign(data) {
  var privateKey =
    "-----BEGIN RSA PRIVATE KEY-----\n" +
    "MIICXAIBAAKBgQDtesHIqi9msC/e2VV32QNGMaNcQ8POEfD2pVY2B/LDaGuAzLjJ\n" +
    "EqCx/K3Ltx1dx2ER4Pm69ZEeeTlbdnQy1P7HZiLPIxAAUUamls0V/o8AnursIHAc\n" +
    "sbea1wVT/ZdMFFCP54jfQkWPk8ZUQtBs14qHO3opSB/HwwARrvqFYq7l5wIDAQAB\n" +
    "AoGATLu1kdkrp8qWLTOcYjVE0ZGIb2+V/Sfe7FNQH/VBg9JhqiR8MLxMIDa9EW4B\n" +
    "lyOtQdGn37kpQud4mQ0VTrdz+uqifzkK0qdA7pDg5ONMFSWAMVBIUZvfewnHY5Ov\n" +
    "fTJWpZHC2rUl/56HVuLo/cEq+inyjOeoXOuA4vr4X9iQvUECQQD+Y1ncdz6x9YzQ\n" +
    "001H6ATvfjBoWpz+hdLJQsM/4J5y/XLcoboKSbOMrsqtgZAO1lgrPXJSXAXCuGaA\n" +
    "is6USHBNAkEA7vv6aDpqjie718cJXS5HlgV1NZkaSzbroQZkswm+iGxCj/mpCfCV\n" +
    "Roxl9y7wZAQ43l9y2OFkuQdfaIU/Qd5pAwJAYVDCfKuFaXDFKNHcu4hP8wp0HEel\n" +
    "zVyGcYW/ybz1AIpimXKpB+x/6m6njE6HPJXU7t230Tfw4DfIxp3TPzii9QJBAICb\n" +
    "UVItvZHqiAfCsKNYeGWfYkgJsECxuXPaQO6oW8SGnftk2zbiJTLl8ylmNS9dpkzl\n" +
    "CKT2BoIcGZfhvPzxd4kCQG53kdW8aLEb9+ESJ6dnXDhAl24URBH5IHVasF5Abe8F\n" +
    "d1aHnnwc5D6GhMH9mN/KW7BioyzKBGKDh2yBcOyOse0=\n" +
    "-----END RSA PRIVATE KEY-----";
  let ajay = JSON.stringify(data);
  var signer = crypto.createSign("sha256");
  signer.update(ajay);
  var sign = signer.sign(privateKey, "base64");
  // console.log(sign);
  return sign;
}
