const app = require("./backend/app");
// const db = require("./firebase");
const axios = require("axios");
const Match = require("./backend/model/match");
const Fancy = require("./backend/model/fancy");
const FancyLogs = require("./backend/model/fancyLogs")
var crypto = require("crypto");
const WhitelistWebsite = require("./backend/model/website");
const Block = require("./backend/model/blockStatus");
const io = require("socket.io-emitter")({ host: "127.0.0.1", port: 6379 });
const { setIntervalAsync } = require("set-interval-async/dynamic");
const redis = require("redis");
const redisUrl = "redis://127.0.0.1:6379";
const client = redis.createClient(redisUrl);
const { promisify } = require("util");
const asyncLoop = require("node-async-loop");
const aget = promisify(client.get).bind(client);

const config = {
  headers: {
    Authorization: "MutualFundsSahiHai",
  },
};

const getDimaondJ = async () => {
  var AblockStatus = false;
  const whitelistWeb = await WhitelistWebsite.find({
    type: "Normal",
    autoResult: true,
  }).lean();
  let allBlockStatus = await Block.find().lean();

  if (allBlockStatus.length > 0) {
    AblockStatus = allBlockStatus[0].blockStatus;
  }

  // const activeM =  await Match.find({
  //     isActive: true,
  //     isInplay: true,
  //   }).lean();
  // const autoAMatch = activeM.filter((dt) => dt.autoResult);

  const active = JSON.parse(await aget("matchintoRedis")) || [];
  const autoAMatch = active.filter(
    (m) => m.isActive == true && m.isInplay == true && m.autoResult
  );

  for (const match of autoAMatch) {
    const parsedDimond =
      JSON.parse(await aget("DiamondFancy-" + match.eventId)) || [];

    // const parsedDimond = JSON.parse(data[key].johnr);
    // console.log("Diamonnn",parsedDimond);
    for (let j = 0; j < parsedDimond?.length; j++) {
      try {
        const jFancy = parsedDimond[j];
        const fancy = await Fancy.findOne({
          eventId: jFancy.Eventid,
          F_id: jFancy.SID,
          fancytype: "Diamond",
        }).lean();
        // console.log("fancy",fancy);
        if (fancy.length == 0) {
          let addFancy = {
            F_id: jFancy.SID,
            name: jFancy.Fancy,
            type_code: "1",
            odd_type: "RUNS",
            eventId: jFancy.Eventid,
            result: jFancy.Result,
            is_result: true,
            fancytype: "Diamond",
            isWorngsettled: false,
          };
          // console.log(addFancy);
          await Fancy.insertMany(addFancy);
          
          let fancyLogs = new FancyLogs({
            eventId:jFancy.Eventid,
            fancyName:jFancy.Fancy,
            result:jFancy.Result,
            fancytype:"Diamond",
            createdBy:"Auto",
            action:"Fancy Auto Added"
          });
          // console.log(fancyLogs);
          await fancyLogs.save();

          for (let f = 0; f < whitelistWeb.length; f++) {
            const fancyele = whitelistWeb[f];
            let webBlockMatchvia = match.blockedWeb?.includes(fancyele.websiteurl)
            try {
              if (addFancy.result == "-1") {
                suspendResult(addFancy, fancyele);
              } else {
                let sendnormalend =
                  fancyele.websiteurl +
                  "/api/" +
                  fancyele.endpoint +
                  "?id=" +
                  addFancy.eventId +
                  "-" +
                  addFancy.F_id +
                  ".FY&eventid=" +
                  addFancy.eventId +
                  "&winner=" +
                  addFancy.result;
                  if(webBlockMatchvia == false || webBlockMatchvia == undefined){
                    sendResult(
                       sendnormalend,
                       AblockStatus,
                       fancyele.autoResult,
                       addFancy
                    );
                  }
                // console.log("3",sendnormalend);
              }
            } catch (error) {}
          }
        }
      } catch (error) {}
    }
  }
};

const getDiamondResult = async () => {
  try {
    // const activeM = await Match.find({ isActive: true, isInplay: true }).lean();
    const activeM = JSON.parse(await aget("matchintoRedis")) || [];

    const marketIds = activeM
      .filter((dt) => dt.isActive == true && dt.isInplay == true && dt.autoResult)
      .map((dt) => dt.marketId);

    const { data } = await axios.get(
      "http://172.105.51.41:3000/v1-api/fancy/getSky2?marketId=" +
        marketIds.toString()
    );


    Object.keys(data).forEach(function (key) {
      data[key]?.johnr && client.set("DiamondFancy-" + key, data[key].johnr);
    });
  } catch (error) {
    // console.log(error);
  }
};

// const getDimaondJ = async ()=>{

//   var AblockStatus = false
//   const whitelistWeb = await WhitelistWebsite.find().lean();
//   let allBlockStatus = await Block.find().lean();

//   if(allBlockStatus.length>0){
//     AblockStatus = allBlockStatus[0].blockStatus

//   }

//   const activeM =  await Match.find({
//       isActive: true,
//       isInplay: true,
//     }).lean();
//     let mktId = ''
//     for (let i = 0; i < activeM.length; i++) {
//       const mkt = activeM[i];
//       if(mktId == ''){
//           mktId = mkt.marketId

//       }else{
//           mktId = mktId + "," + mkt.marketId
//       }

//     }

//   const responseD = await axios.get("http://128.199.24.35/anurag1odds/fancy/getSky2?marketId=" + mktId.toString(), config)
//   const data = responseD.data

//   Object.keys(data).forEach(async function (key) {
//       try {
//           const parsedDimond = JSON.parse(data[key].johnr)
//           // console.log("johnr",parsedDimond);
//           for (let j = 0; j < parsedDimond?.length; j++) {
//               try {
//                   const jFancy = parsedDimond[j];
//                   const fancy= await Fancy.find({eventId: jFancy.Eventid,F_id:jFancy.SID,fancytype:'Diamond'});
//                   if(fancy.length == 0){
//                       let addFancy = {
//                         F_id:jFancy.SID,
//                         name:jFancy.Fancy,
//                         type_code:'1',
//                         odd_type:'RUNS',
//                         eventId:jFancy.Eventid,
//                         result:jFancy.Result,
//                         is_result:true,
//                         fancytype:'Diamond',
//                         isWorngsettled:false,
//                       }
//                       // console.log("AddFancy",addFancy);
//                       await Fancy.insertMany(addFancy)

//       const whiteWeb = whitelistWeb.filter((dt)=> dt.type == "Normal" && dt.autoResult == true );
//       if(addFancy.result == "-1"){
//         suspendResult(addFancy,whiteWeb)
//       }else{
//         const urls = whiteWeb.map((dt)=> dt.websiteurl + '/api/' + dt.endpoint + '?id=' + addFancy.eventId + '-' + addFancy.F_id + '.FY&eventid=' +  addFancy.eventId + '&winner=' + addFancy.result )
//          sendResult(urls,AblockStatus,whiteWeb.autoResult,addFancy);
//       }

//                       for (let f = 0; f < whitelistWeb.length; f++) {
//                           const fancyele = whitelistWeb[f];
//                           try {

//                               if(  fancyele.type == "Normal" ){
//                                 if(addFancy.result == '-1'){

//                                     suspendResult(addFancy,fancyele)

//                                 }else{
//                                   let sendnormalend = fancyele.websiteurl + '/api/' + fancyele.endpoint + '?id=' + addFancy.eventId + '-' + addFancy.F_id + '.FY&eventid=' +  addFancy.eventId + '&winner=' + addFancy.result
//                                   sendResult(sendnormalend,AblockStatus,fancyele.autoResult,addFancy);
//                                   // console.log("3",sendnormalend);
//                                 }

//                               }

//                           } catch (error) {
//                             console.log("1",error);
//                           }

//                         }
//                   }
//               } catch (error) {
//                 console.log("2",error);

//               }

//           }

//       } catch (error) {
//           console.log("3",error);
//       }

//   })

// }

getDimaondJ();
getDiamondResult();

const getDimaondInter = setInterval( () => {
   getDimaondJ();
   getSky();
  // getvirualMatch()
}, 1 * 60 * 1000);

const resultInt = setInterval( () => {
   getSkyResult();
   getDiamondResult();
   getvirtualmatchFancy();

  // getvirtualMatch()
}, 10 * 1000);

async function suspendResult(fancy, web) {
  var mfid, type;
  mfid = fancy.eventId + "-" + fancy.F_id + ".FY";
  type = "Fancy";

  let sign = createSign({ mfid, type });

  Promise.all([sign]).then(async (value) => {
    let body = { mfid, type };
    let url = web.websiteurl + "/api/suspendCommonMatchFancy";

    await axios
      .post(url, body, {
        headers: {
          signature: value[0],
        },
      })
      .then((resp) => {
        // console.log("respPro",resp.data);
      })
      .catch((e) => {
        // console.log("errorPro",e);
      });
  });
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

async function sendResult(url, AblockStatus, WblockStatus, addFancy) {
  // console.log(AblockStatus == false && WblockStatus.autoResult == true && addFancy.isWorngsettled == null || addFancy.isWorngsettled == false && WblockStatus.blockedMatch == false);
  // return

  try {
    if (
      (AblockStatus == false &&
        WblockStatus == true ) ||
      addFancy.isWorngsettled == undefined ||
      addFancy.isWorngsettled == false &&  addFancy.isRollbacked == undefined || addFancy.isRollbacked == false 
    ) {
      // console.log(url);
      // return
      await axios
        .post(url, { headers: { "Content-Type": "application/json" } })
        .then((resp) => {
          //  console.log('result called',resp);
        })
        .catch(function (error) {
          // console.log(error);
        });
    }
  } catch (error) {
    // console.log(error);
  }
}

const getSky = async () => {
  // console.log("sky");
  var AblockStatus = false;
  const whitelistWeb = await WhitelistWebsite.find({
    type: "Normal",
    autoResult: true,
  }).lean();
  let allBlockStatus = await Block.find().lean();
  if (allBlockStatus.length > 0) {
    AblockStatus = allBlockStatus[0].blockStatus;
  }
  // const activeM = await Match.find({ isActive: true, isInplay: true }).lean();
  // const autoAMatch = activeM.filter((dt) => dt.autoResult);

  const active = JSON.parse(await aget("matchintoRedis")) || [];
  const autoAMatch = active.filter(
    (m) => m.isActive == true && m.isInplay == true && m.autoResult
  );
  // console.log(autoAMatch.length);

  for (const match of autoAMatch) {
    // get fancies from redis
    const parsedSky =
      JSON.parse(await aget("SkyResult-" + match.eventId)) || [];
    // console.log(parsedSky);

    for (let j = 0; j < parsedSky.length; j++) {
      try {
        const jSky = parsedSky[j];
        // console.log(jSky);
        const fancy = await Fancy.findOne({
          eventId: jSky.eventId,
          F_id: jSky.sky_fancy_id,
          fancytype: "Sky3",
        }).lean();
        // console.log("dir",fancy);

        // if(fancy.length == 0){
        if (!fancy) {
          let addFancy = {
            F_id: jSky.sky_fancy_id,
            name: jSky.marketName,
            type_code: "1",
            odd_type: "RUNS",
            eventId: jSky.eventId,
            result: jSky.result,
            is_result: true,
            fancytype: "Sky3",
            isWorngsettled: false,
          };
          // console.log("add",addFancy);
          await Fancy.insertMany(addFancy);
          let fancyLogs = new FancyLogs({
            eventId:jSky.eventId,
            fancyName:jSky.marketName,
            result:jSky.result,
            fancytype:"Sky3",
            createdBy:"Auto",
            action:"Fancy Auto Added"
          });
          // console.log(fancyLogs);
          await fancyLogs.save();

          for (let f = 0; f < whitelistWeb.length; f++) {
            //
            // at once send result to all websites
            const fancyele = whitelistWeb[f];
            let webBlockMatchvia = match.blockedWeb?.includes(fancyele.websiteurl)
            // console.log("144",webBlockMatchvia);
            // console.log(fancyele);
            try {
              if (addFancy.result == "-1") {
                suspendResult(addFancy, fancyele);
              } else {
                let sendnormalend =
                  fancyele.websiteurl +
                  "/api/" +
                  fancyele.endpoint +
                  "?id=" +
                  addFancy.eventId +
                  "-" +
                  addFancy.F_id +
                  ".FY&eventid=" +
                  addFancy.eventId +
                  "&winner=" +
                  addFancy.result;
                  if(webBlockMatchvia == false || webBlockMatchvia == undefined ){
                   sendResult(
                     sendnormalend,
                     AblockStatus,
                     fancyele.autoResult,
                     addFancy
                     );
                   }
                // console.log("4",sendnormalend);
              }
            } catch (error) {}
          }
        }
      } catch (error) {}
    }
  }
};

const getSkyResult = async () => {
  try {
    
    // const activeM = await Match.find({ isActive: true, isInplay: true }).lean();
    // const autoAMatch = activeM.filter((dt) => dt.autoResult);
    const active = JSON.parse(await aget("matchintoRedis")) || [];
    const eventID = active.filter(
      (m) => m.isActive == true && m.isInplay == true && m.autoResult
    ).map((dt)=> dt.eventId);
    // console.log(eventID);

    // for (const eId of autoAMatch) {
    //   if (eventId == "") {
    //     eventId = eId?.eventId;
    //   } else {
    //     eventId = eventId + "," + eId?.eventId;
    //   }
    // }

    const { data } = await axios.get(
      "http://172.105.51.41:3000/v1-api/fancy/getResult?eventId=" +
        eventID.toString()
    );

    Object.keys(data).forEach(function (key) {
      data[key]?.sky3_result &&
        client.set("SkyResult-" + key, data[key].sky3_result);
    });
  } catch (error) {
    // console.log("er01",error);
  }
};

getSky();
getSkyResult();

const getvirtualMatch = async () => {
  var AblockStatus = false;
  const whitelistWeb = await WhitelistWebsite.find({
    type: "Normal",
    autoResult: true,
  }).lean();
  let allBlockStatus = await Block.find().lean();
  if (allBlockStatus.length > 0) {
    AblockStatus = allBlockStatus[0].blockStatus;
  }
  // const activeM = await Match.find({
  //   isInplay: true,
  //   mType: "virtual",
  //   isActive: true,
  // }).lean();
  // const vMatchList = activeM.filter((dt) => dt.autoResult);

  const active = JSON.parse(await aget("matchintoRedis")) || [];
  const vMatchList = active.filter(
    (m) =>
      m.mType == "virtual" &&
      m.isActive == true &&
      m.isInplay == true &&
      m.autoResult
  );
  // console.log(vMatchList);

  try {
    if (vMatchList.length > 0) {
      for (let i = 0; i < vMatchList.length; i++) {
        const eventID = vMatchList[i].eventId;
        const match = vMatchList[i]
        // console.log(eventID);

        const data = JSON.parse(await aget("virtualFancy-" + eventID));
        // console.log("hgf",data);
        // return
        for (let j = 0; j < data?.length; j++) {
          const dresult = data[j];
          // console.log(dresult.gameId);
          try {
            const findResult = await Fancy.find({
              eventId: dresult.gameId,
              F_id: dresult.sid,
              fancytype: "Diamond",
            }).lean();
            // console.log(findResult);
            if (findResult.length == 0) {
              let addFancy = {
                F_id: dresult.sid,
                name: dresult.nat,
                type_code: "1",
                odd_type: "RUNS",
                eventId: dresult.gameId,
                result: dresult.result,
                is_result: true,
                fancytype: "Diamond",
                isWorngsettled: false,
              };
              // console.log(addFancy);
              // return
              await Fancy.insertMany(addFancy);

              let fancyLogs = new FancyLogs({
                eventId:dresult.gameId,
                fancyName:dresult.nat,
                result:dresult.result,
                fancytype:"Diamond",
                createdBy:"Auto",
                action:"Fancy Auto Added"
              });
              // console.log(fancyLogs);
              await fancyLogs.save();
              for (let f = 0; f < whitelistWeb.length; f++) {
                const fancyele = whitelistWeb[f];
              let webBlockMatchvia = match.blockedWeb?.includes(fancyele.websiteurl)

                try {
                  //  console.log(fancyele.type);

                  // console.log("nor","normal");
                  if (addFancy?.result == "...") {
                    //  console.log("...");
                    // suspendResult(addFancy,fancyele)
                  } else {
                    // console.log("1",addFancy.result);
                    let sendnormalend =
                      fancyele.websiteurl +
                      "/api/" +
                      fancyele.endpoint +
                      "?id=" +
                      addFancy.eventId +
                      "-" +
                      addFancy.F_id +
                      ".FY&eventid=" +
                      addFancy.eventId +
                      "&winner=" +
                      addFancy.result;
                      if(webBlockMatchvia == false || webBlockMatchvia == undefined){
                        sendResult(
                        sendnormalend,
                        AblockStatus,
                        fancyele.autoResult,
                        addFancy
                    );
                      }
                    // console.log("1",sendnormalend);
                  }
                } catch (error) {
                  // console.log(error);
                }
              }
            } else {
              for (let f = 0; f < whitelistWeb.length; f++) {
                const fancyele = whitelistWeb[f];
                let webBlockMatchvia = match.blockedWeb?.includes(fancyele.websiteurl)
                let fancyResult = findResult[0];
                //  console.log(fancyResult);
                if (dresult.result != "...") {
                  // console.log(dresult.result);

                  if (fancyResult.result == "...") {
                    const updateTrueFalse = await Fancy.findOneAndUpdate(
                      {
                        eventId: eventID,
                        F_id: fancyResult.F_id,
                        fancytype: "Diamond",
                      },
                      {
                        $set: { result: dresult.result, is_result: true },
                      },
                      { new: true }
                    );
                    if (fancyResult.odd_type == "RUNS") {
                      // console.log("2",dresult.result);
                      let sendnormalend =
                        fancyele.websiteurl +
                        "/api/" +
                        fancyele.endpoint +
                        "?id=" +
                        eventID +
                        "-" +
                        fancyResult.F_id +
                        ".FY&eventid=" +
                        eventID +
                        "&winner=" +
                        +dresult.result;
                        if(webBlockMatchvia == false || webBlockMatchvia == undefined){
                          sendResult(
                            sendnormalend,
                            AblockStatus,
                            fancyele.autoResult,
                            addFancy
                            );
                        }
                      // console.log("2",sendnormalend);
                    }

                    // console.log("2",updateTrueFalse);
                  } else if (
                    fancyResult.result != null &&
                    fancyResult.result == "-1" &&
                    fancyResult.is_result == false
                  ) {
                    const updateTrueFalse = await Fancy.findOneAndUpdate(
                      {
                        eventId: eventID,
                        F_id: fancyResult.F_id,
                        fancytype: "Diamond",
                      },
                      {
                        $set: { result: dresult.result, is_result: true },
                      },
                      { new: true }
                    );
                    // console.log("1",updateTrueFalse);
                    // suspendResult(updateTrueFalse,fancyele)
                  }
                }
              }
            }
          } catch (error) {
            // console.log(error);
          }
        }
      }
    }
  } catch (error) {}
};

const getvirtualmatchFancy = async () => {
  try {
    // const activeM = await Match.find({
    //   isInplay: true,
    //   mType: "virtual",
    //   isActive: true,
    // }).lean();
    // const vMatchList = activeM.filter((dt) => dt.autoResult);

    const active = JSON.parse(await aget("matchintoRedis")) || [];
    const vMatchList = active.filter(
      (m) =>
        m.mType == "virtual" &&
        m.isActive == true &&
        m.isInplay == true &&
        m.autoResult
    );

    // console.log("vMatchList",vMatchList);

    for (const element of vMatchList) {
      const { data } = await axios.get(
        "http://172.105.49.104:3000/resultbygameid?eventId=" + element?.eventId
      );
      //  console.log("MK",data);
      client.set("virtualFancy-" + element?.eventId, JSON.stringify(data));
    }
  } catch (error) {
    // console.log("er02",error);
  }
};

getvirtualMatch();
getvirtualmatchFancy();

const getvirtualInter = setIntervalAsync(async () => {
  await getvirtualMatch();
}, 1 * 60 * 1000);
