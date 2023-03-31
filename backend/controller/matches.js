const Match = require("../model/match");
const Website = require("../model/website");
const Fancy = require("../model/fancy")
const MatchResultWebsite = require("../model/MatchResultWin")
const WhitelistWebsite = require("../model/website");
const AutoStatusAll = require("../model/autoResultAll")
const NewApiResult = require("../model/NewApiResult")
const DefaultScore = require("../model/defaultScoreTy");
const TossResult = require('../model/tossresult');
const MatchLogs = require("../model/matchlogs");
const WebLogs = require("../model/websiteLogs");
const FancyLogs =require("../model/fancyLogs");
const LimitLogs = require("../model/limitlogs")
const redis = require("redis");
const redisUrl = "redis://127.0.0.1:6379";
const client = redis.createClient(redisUrl);
const { promisify } = require("util");
const { default: axios } = require("axios");
const aget = promisify(client.get).bind(client);
const ahget = promisify(client.hget).bind(client);
var crypto = require('crypto');


// let asyncLoop = require("node-async-loop");
// const moment = require("moment");

// var md5 = require('md5');
const Block = require("../model/blockStatus");
const limitlogs = require("../model/limitlogs");




exports.getActiveMatches = (query) => {
  return Match.find(query).select("eventId  sportId  openDate").lean();
};

exports.getMatches = async (req, res) => {
    // console.log(req.body.sportId);
    // return
  try {  
    
    const matches = await Match.find({ isActive: true,sportId: req.body.sportId}).lean();
    // console.log(matches);    
    res.status(200).json({
      matches: matches,
      status: 1,
    });
  } catch (error) {
    res.json({
      error: "No data found",
      status: 0,
    });
  }
};

exports.toggleTrueFalse = async (req,res) =>{
    // console.log("bod",req.body);
    // return
  try {
      const updateTrueFalse = await Match.findOneAndUpdate({eventId:req.body.eventId},{$set:{isActive:req.body.isActive}},{ new: true })
    //   console.log(updateTrueFalse.isActive);
      let matchlogs = new MatchLogs({
        eventId: req.body.eventId,
        matchName: updateTrueFalse.eventName,
        createdBy:req.body.createdBy,
        action:`isActive status set to ${updateTrueFalse.isActive}`
      })     
    
      matchlogs.save();   
    //   console.log(matchlogs, 'Inserted Matches logs');
      res.status(200).json({
          message:'Status updated',
          result:updateTrueFalse,
          status:1
      })
  } catch (error) {
    //   console.log(error);
      res.status(200).json({
          messgae: 'Invalid updates!',
          status:0,
          result:[],
          error:error
      })
      
  }
}

exports.addwebsite = async (req, res) => {
//   console.log('add website', req.body);
  // // res.status(200).json({
  // //     status: 1,
  // //     mesage: 'ok add website'
  // // })
//   return
  try {
      let allinsertdata = []
      let alldata = req.body
      for (const [key, value] of Object.entries(alldata)) {
          if (value.type != undefined) {
            // console.log(value);
            const findUrl = await Website.find({websiteurl:value.url,type:value.type}).lean();
            
            if(findUrl.length == 0){
                let singledata = {
                    websiteurl: value.url,
                    websitename: value.website,
                    type: value.type,
                    rollback: value.rollendp,
                    endpoint: value.endp,
                    autoResult:value.autoResult
                }
                allinsertdata.push(singledata);
            }            
             
              // let savelogs = new Resultlog({
              //     message: 'Add',
              //     websiteurl: value.url,
              //     websitename: value.website,
              //     type: value.type,
              //     rollback: value.rollendp,
              //     endpoint: value.endp,
              //     typeid: '3',
              //     username: req.body.createdBy
              // });
              // await savelogs.save();

              let weblogs = new WebLogs({
                websitename:value.website,
                websiteurl:value.url,
                createdBy:value.createdBy,
                endpoint:value.endp,
                rollback:value.rollendp,
                typeofweb:value.type,
                action:'New Web Site added'
              });
            //   console.log(weblogs);
              await weblogs.save();
          }

      }
      await Website.insertMany(allinsertdata);




      res.status(200).json({
          status: 1,
          message: 'Add Successfully!!'
      })

  } catch (error) {
      res.status(500).json({
          status: 0,
          message: error.message
      })
  }
}


exports.getallwebsite = async (req, res) => {
  try {
      const resdata = await Website.find().sort({ updatedAt: -1 }).lean();
      res.status(200).json({
          status: 1,
          data: resdata
      });
  } catch (error) {
      res.status(500).json({
          status: 0,
          message: error.message
      })
  }
}

exports.websitedelete = async (req, res) => {
//   console.log(req.body.id._id);

//   return
  try {
      // console.log(req.params.id);
     
      const resdata = await Website.findByIdAndRemove(req.body.id._id);
    if(resdata){
        let weblogs = new WebLogs({
            websitename:req.body.id.websitename,
            websiteurl:req.body.id.websiteurl,
            createdBy:req.body.createdBy,
            typeofweb:req.body.id.type,
            action:'Web site has been removed'
          });
        //   console.log(weblogs);
          await weblogs.save();
    }
     
      // console.log(resdata);
      // return    

      res.status(200).json({
          status: 1,
          // data: resdata
      });
  } catch (error) {
      res.status(500).json({
          status: 0,
          message: error.message
      })
  }
}


exports.updatewebsite = async (req, res) => {
//   console.log(req.body.formData);
//   return
  try {
      // await Website.findByIdAndRemove(req.params.id)
      const resdata = await Website.findByIdAndUpdate(req.body.formData.id, { $set: { rollback: req.body.formData.NRollbackEnd, endpoint: req.body.formData.NEndpoint, websiteurl: req.body.formData.updateUrl } }, { new: true })
    //   console.log(resdata);    

      let weblogs = new WebLogs({
        websitename:resdata.websitename,
        websiteurl:resdata.websiteurl,
        createdBy:req.body.createdBy,
        endpoint:resdata.endpoint,
        rollback:resdata.rollback,
        typeofweb:resdata.type,
        action:'Web Site has been updated'
      });
    //   console.log(weblogs);
      await weblogs.save();

      res.status(200).json({
          status: 1,
          message: 'Update Successfully!!'
      });
  } catch (error) {
      res.status(500).json({
          status: 0,
          message: error.message
      })
  }
}

exports.websites = async(req,res) =>{
    try {
        let resDAta = await Website.find().lean();
        // console.log(resDAta);
        res.status(200).json({
            status: 1,
            data: resDAta
        })
    } catch (error) {
        res.status(500).json({
            status: 0
        })
    }
}

exports.allwhitelistwebsiteget = async (req, res) => {
  try {
      let resdata = await Website.find().lean();
      // console.log(resdata);
      let meito = resdata.map(m => ({
          websiteurl: m.websiteurl,
          type: m.type,
          websitename: m.websitename
      }));
      // console.log(meito);
      // return

      // let fnbieblfdmjf = []
      // for (let i = 0; i < meito.length; i++) {
      //     const element = meito[i];
      //     let enb = meito.filter(m => (m.websitename == element.websitename));
      //     // if (enb) {
      //     //     fnbieblfdmjf.push(enb)
      //     // }
      // }

      // console.log(fnbieblfdmjf.length);

      let newd = []
      let maindata = []
      for (let i = 0; i < meito.length; i++) {
          const singledata = meito[i];
          let singleurl = singledata.websiteurl
          let mfe = newd.some(s1 => (s1.url == singleurl));
          // console.log(mfe);
          if (!mfe) {
              let dfnei = { url: singleurl, websitename: singledata.websitename }
              newd.push(dfnei);
          }
      }

      // console.log(newd);
      let fnoebid = []
      for (let i = 0; i < newd.length; i++) {
          const singled = newd[i];
          // console.log(singled);i
          let fnobe = await Website.find({ websiteurl: singled.url }).lean();
          // let fnei = { fnobe}
          fnoebid.push(fnobe)
      }
    //   console.log(fnoebid);
      res.status(200).json({
          status: 1,
          data: fnoebid
      })
  } catch (error) {
      res.status(500).json({
          status: 0
      })
  }
}



exports.blockStatus = async (req,res)=>{
    try {
        // console.log(req.body.blockStatus);
        
        await Block.findOneAndUpdate({_id:'634843a5d1559751cb0dff0d'},{$set:{blockStatus:req.body.blockStatus}},{ new: true })
        let blockList = await Block.find()
        // console.log(blockList);
        res.status(200).json({
            status: 1,
            message: 'Add Successfully!!',
            result:blockList
        })
    } catch (error) {
        res.status(500).json({
            status: 0,
            message: error.message
        })
        // console.log(error);
  
    }
}

exports.getblockStatus = async(req,res)=>{    
    try {
        let blockList = await Block.find({_id:'634843a5d1559751cb0dff0d'}).lean();
        res.status(200).json({
            status: 1,
            message: 'find Successfully!!',
            result:blockList
        })
    } catch (error) {
        res.status(500).json({
            status: 0,
            message: error.message
        })
    }
}



exports.blockallwebsite = async (req, res) => {
    // try {
    //     // console.log(req.body);
    //     let id = req.body.website.map((m) => (m._id));
    //     // console.log(data);
    //     // Website.
    //     let d
    //     if (req.body.status == 'OFF') {
    //         d = await Website.updateMany({ _id: { $in: id } }, { "$set": { "block_status": 'OFF' } });
    //         await blockwebsitesend('OFF')
    //     } else {
    //         d = await Website.updateMany({ _id: { $in: id } }, { "$set": { "block_status": 'ON' } });
    //         await blockwebsitesend('ON')
    //     }

    //     res.status(200).json({
    //         status: 1,
    //         message: 'Update Successfully!!'
    //     })
    // } catch (error) {
    //     res.status(500).json({
    //         status: 0,
    //         message: error
    //     })
    // }
}

// async function blockwebsitesend(status) {
//     Website.find().then((resp) => {
//         var blockwebsite = resp.reduce(function (filtered, option) {
//             if (option.type == 'Block') {
//                 var someNewValue = { name: option.websiteurl, endpoint: option.endpoint }
//                 filtered.push(someNewValue);
//             }
//             return filtered;
//         }, []);

//         for (const element of blockwebsite) {
//             // http://4bet.in/api/BlockUnBlockAll?status=ON
//             let sendPremium = element.name + '/api/' + element.endpoint + '?status=' + status

//             // console.log(sendPremium);
//             axios.post(sendPremium, { headers: { 'Content-Type': 'application/json' } }).then((resp) => {
//                 // console.log(resp);
//             })
//         }
//     });
// }

exports.resultStatus = async (req, res) => {
    // console.log(req.body);
    // return
    try {
        const update  = await Website.findOneAndUpdate({ _id: req.body.websiteId }, { $set: { autoResult: req.body.autoResult } }, { new: true })
        if(update){
            let weblogs = new WebLogs({
                websitename:req.body.allData.websitename,
                websiteurl:req.body.allData.websiteurl,
                createdBy:req.body.createdBy,
                autoResult: req.body.autoResult,         
                action:'Auto Result has been set'
              });
            //   console.log(weblogs);
              await weblogs.save();
        }
        
        res.status(200).json({
            status: 1,
            message: 'Updated Successfully!!',
            
        })
    } catch (error) {
        // console.log(error);
        res.status(500).json({
            status: 0,
            message: error.message
        })
        // console.log(error);

    }
}

exports.resultStatusAll = async (req, res) => {       
    try {
        const autoResultFrAll = await AutoStatusAll.findOneAndUpdate({_id:'634843a5d1559751cb0dff0d'}, { $set: { autoResultAll: req.body.autoResultAll } }, { new: true });
        // console.log(autoResultFrAll.autoResultAll);
               
        const web = await Website.find().lean();
                
        for (const autoSt of web) {            
            let tets = await Website.findOneAndUpdate({type:"Normal",_id:autoSt._id}, { $set: { autoResult: autoResultFrAll.autoResultAll } }, { new: true });            
        }

        let weblogs = new WebLogs({            
            createdBy:req.body.createdBy,           
            action:'Auto Result for all web Set',
            autoResult:req.body.autoResultAll
          });
        //   console.log(weblogs);
          await weblogs.save();

        res.status(200).json({
            status: 1,
            message: 'Updated Successfully!!',
            
        })
    } catch (error) {
        // console.log(error);
        res.status(500).json({
            status: 0,
            message: error.message
        })
        // console.log(error);

    }
}
 
exports.autostatusAll = async(req,res)=>{
    try {
        const checkallweb = await AutoStatusAll.findOne().lean();
        // console.log(checkallweb.autoResultAll);
        res.status(200).json({
            status: 1,
            message: 'Updated Successfully!!',
            result: checkallweb.autoResultAll           
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            status: 0,
            message: error.message
        })
    }
}

exports.matchresultStatus = async (req, res) => {
    // console.log(req.body);
    // return
    try {
        const update = await Match.findOneAndUpdate({ eventId: req.body.eventId }, { $set: { autoResult: req.body.autoResult } }, { new: true });
        // console.log(update);
        let matchlogs = new MatchLogs({
            eventId: req.body.eventId,
            matchName: update.eventName,
            createdBy:req.body.createdBy,
            action:`Only Match autoResult status set to ${update.autoResult}`
          })     
        // console.log(matchlogs);
          matchlogs.save(); 
        res.status(200).json({
            status: 1,
            message: 'Updated Successfully!!',
            
        })
    } catch (error) {
        res.status(500).json({
            status: 0,
            message: error.message
        })
        // console.log(error);

    }
}

exports.getAllMatches = async (req, res) => {
    // console.log(req.body);
    // return
    try {
      const matches = await Match.find({sportId: req.body.sportId}).lean();
    //   console.log(matches);
      res.status(200).json({
        matches: matches,
        status: 1,
      });
    } catch (error) {
      res.json({
        error: "No data found",
        status: 0,
      });
    }
  };


  exports.setResult = async(req,res) =>{
    // console.log(req.body);
    // return
    var AblockStatus = false;
    try {
        let allBlockStatus = await Block.find().lean();
    if (allBlockStatus.length > 0) {
      AblockStatus = allBlockStatus[0].blockStatus;
    }
    
    const { F_id, eventId,fancytype } = req.body
    const webSiteList = await Website.find().lean();
    const fancy = await Fancy.find({F_id,eventId,fancytype}).lean();  
    // console.log(fancy);
    // return
    if(fancy.length > 0){
        let fancyObj = fancy[0]
        const updaterollbackedFan = await Fancy.findOneAndUpdate({F_id,eventId},{ $set: { isRollbacked:false,isWorngsettled:false} },{new:true});
        for (let j = 0; j < webSiteList.length; j++) {
            const web = webSiteList[j];
            try {
                // console.log(fancyObj.fancytype);
                // return
                if(fancyObj.fancytype == 'Tiger'){
                    if(fancyObj.result != null && fancyObj.result != "-1"){
                        if (fancyObj.odd_type == "RUNS" && web.type == "Normal") {
                            let sendnormalend =
                              web.websiteurl +
                              "/api/" +
                              web.endpoint +
                              "?id=" +
                              fancyObj.eventId +
                              "-" +
                              fancyObj.F_id +
                              ".FY&eventid=" +
                              fancyObj.eventId +
                              "&winner=" +
                              +fancyObj.result;
                            
                            sendResult(sendnormalend, AblockStatus, web.autoResult);
                          }
                    }
                }else if(fancyObj.fancytype == 'Diamond'){
                    if (fancyObj.result != null && fancyObj.result != "-1") {
                        if (fancyObj.odd_type == "RUNS" && web.type == "Normal") {
                          let sendnormalend =
                            web.websiteurl +
                            "/api/" +
                            web.endpoint +
                            "?id=" +
                            fancyObj.eventId +
                            "-" +
                            fancyObj.F_id +
                            ".FY&eventid=" +
                            fancyObj.eventId +
                            "&winner=" +
                            +fancyObj.result;
                          sendResult(sendnormalend, AblockStatus, web.autoResult);
                        }
                      }
                }else if(fancyObj.fancytype == 'Sky3'){
                    // console.log(fancyObj.fancytype);
                    if (fancyObj.result != null && fancyObj.result != "-1") {
                        if (fancyObj.odd_type == "RUNS" && web.type == "Normal") {
                          let sendnormalend =
                            web.websiteurl +
                            "/api/" +
                            web.endpoint +
                            "?id=" +
                            fancyObj.eventId +
                            "-" +
                            fancyObj.F_id +
                            ".FY&eventid=" +
                            fancyObj.eventId +
                            "&winner=" +
                            +fancyObj.result;
                          sendResult(sendnormalend, AblockStatus, web.autoResult);

                       
                        }
                      }
                }
            } catch (error) {
                
            }
           
        }  

        let fancyLogs = new FancyLogs({
            eventId:req.body.eventId,
            fancyName:req.body.name,
            result:req.body.result,
            fancytype:req.body.fancytype,
            createdBy:req.body.createdBy,
            action:"SetFancy Result for all web"
          });
        //   console.log(fancyLogs);
          await fancyLogs.save();
        res.status(200).json({
            status:1,
            message:'Result Set successfully'

        })    

    }else{
        res.status(200).json({
            status:0,
            message:'Fancy not Avaliable'

        })
    }
    } catch (error) {
        res.status(200).json({
            status:0,
            message:'Fancy not Avaliable'

        })
    }

    
  }


  async function sendResult(url, AblockStatus, WblockStatus) {  
    // console.log(url);  
    // return
    // if (AblockStatus == false && WblockStatus == true) {
    // if (AblockStatus == false ) {   
        // console.log(url);
        // return     
      await axios
        .post(url, { headers: { "Content-Type": "application/json" } })
        .then((resp) => {
        //    console.log('result called',url,":",resp);
        })
        .catch(function (error) {
        //   console.log(error);
        });
    }
//   }

exports.suspendResult = async(req,res)=>{
    try {
        const { F_id, eventId,fancytype,name,createdBy } = req.body
        const webSiteList = await Website.find()
        const fancy = await Fancy.find({F_id,eventId,fancytype})  
        
        if(fancy.length > 0){
            let dbFancy = fancy[0]
            for (let i = 0; i < webSiteList.length; i++) {
                const web = webSiteList[i];
                try {
                    suspendResult(dbFancy,web)
                } catch (error) {
                    
                }
                
            }
            let fancyLogs = new FancyLogs({
                eventId:eventId,
                fancyName:name,
                fancytype:fancytype,
                createdBy:createdBy,
                action:"Fancy has been suspended for all web"
              });
            //   console.log(fancyLogs);
              await fancyLogs.save();
            res.status(200).json({
                status:1,
                message:'Fancy suspended successfully'
    
            })
        }
    
    } catch (error) {
        res.status(200).json({
            status:0,
            message:'Fancy not Avaliable'

        })
    }
}


  async function suspendResult(fancy,web) {
    var  mfid, type;
    mfid = fancy.eventId + '-' + fancy.F_id + '.FY'
    type = 'Fancy'
    // console.log(mfid);
   
    let sign = createSign({ mfid, type });
  
    Promise.all([sign]).then(async (value) => {
        let body = { mfid, type }
        let url =  web.websiteurl + '/api/suspendCommonMatchFancy' 
       
        await axios.post(url, body, {
            headers: {
                'signature': value[0]
            }
        }).then((resp) => {
            // console.log(resp.data);
        }).catch((e) => {
            console.log(e);
        });
    })
    }

    function createSign(data) {
      var privateKey = '-----BEGIN RSA PRIVATE KEY-----\n' +
          'MIICXAIBAAKBgQDtesHIqi9msC/e2VV32QNGMaNcQ8POEfD2pVY2B/LDaGuAzLjJ\n' +
          'EqCx/K3Ltx1dx2ER4Pm69ZEeeTlbdnQy1P7HZiLPIxAAUUamls0V/o8AnursIHAc\n' +
          'sbea1wVT/ZdMFFCP54jfQkWPk8ZUQtBs14qHO3opSB/HwwARrvqFYq7l5wIDAQAB\n' +
          'AoGATLu1kdkrp8qWLTOcYjVE0ZGIb2+V/Sfe7FNQH/VBg9JhqiR8MLxMIDa9EW4B\n' +
          'lyOtQdGn37kpQud4mQ0VTrdz+uqifzkK0qdA7pDg5ONMFSWAMVBIUZvfewnHY5Ov\n' +
          'fTJWpZHC2rUl/56HVuLo/cEq+inyjOeoXOuA4vr4X9iQvUECQQD+Y1ncdz6x9YzQ\n' +
          '001H6ATvfjBoWpz+hdLJQsM/4J5y/XLcoboKSbOMrsqtgZAO1lgrPXJSXAXCuGaA\n' +
          'is6USHBNAkEA7vv6aDpqjie718cJXS5HlgV1NZkaSzbroQZkswm+iGxCj/mpCfCV\n' +
          'Roxl9y7wZAQ43l9y2OFkuQdfaIU/Qd5pAwJAYVDCfKuFaXDFKNHcu4hP8wp0HEel\n' +
          'zVyGcYW/ybz1AIpimXKpB+x/6m6njE6HPJXU7t230Tfw4DfIxp3TPzii9QJBAICb\n' +
          'UVItvZHqiAfCsKNYeGWfYkgJsECxuXPaQO6oW8SGnftk2zbiJTLl8ylmNS9dpkzl\n' +
          'CKT2BoIcGZfhvPzxd4kCQG53kdW8aLEb9+ESJ6dnXDhAl24URBH5IHVasF5Abe8F\n' +
          'd1aHnnwc5D6GhMH9mN/KW7BioyzKBGKDh2yBcOyOse0=\n' +
          '-----END RSA PRIVATE KEY-----';
      let ajay = JSON.stringify(data);
      var signer = crypto.createSign('sha256');
      signer.update(ajay);
      var sign = signer.sign(privateKey, 'base64');
      // console.log(sign);
      return sign
  }


  exports.getFancy = async (req, res) => {      
    const {eventId,fancytype} = req.body 
    // console.log(req.body );
    try {     
        const fancyData = await Fancy.find({eventId,fancytype}).lean();
        res.status(200).json({
            fancyData: fancyData,
            status: 1,
        });
    } catch (error) {
        res.json({
            error: "No data found",
            status: 0,
        });
    }
};

exports.setmanualResult = async(req,res) =>{   
    // console.log(req.body);
    // return 
    var AblockStatus = false;
    try {
        let allBlockStatus = await Block.find().lean();
    if (allBlockStatus.length > 0) {
      AblockStatus = allBlockStatus[0].blockStatus;
    }
    
    const { F_id, eventId,fancytype,result,createdBy ,name} = req.body
    const webSiteList = await Website.find().lean();
    const fancy = await Fancy.find({F_id,eventId,fancytype}).lean();   
    
    if(fancy.length > 0){
        let fancyObj = await Fancy.findOneAndUpdate(
          {
            eventId: eventId,
            F_id: F_id,
            fancytype: fancytype,
          },
          { $set: { is_result: true , result:result,isWorngsettled:false,isRollbacked:false} },
          { new: true }
        );
        // let fancyObj = fancy[0]
        for (let j = 0; j < webSiteList.length; j++) {
            const web = webSiteList[j];
            try {
                if(fancyObj.fancytype == 'Tiger'){
                    if(fancyObj.result != null && fancyObj.result != "-1"){
                        if (fancyObj.odd_type == "RUNS" && web.type == "Normal") {
                            let sendnormalend =
                              web.websiteurl +
                              "/api/" +
                              web.endpoint +
                              "?id=" +
                              fancyObj.eventId +
                              "-" +
                              fancyObj.F_id +
                              ".FY&eventid=" +
                              fancyObj.eventId +
                              "&winner=" +
                              +fancyObj.result;
                            
                            sendResult(sendnormalend, AblockStatus, web.autoResult);
                          }
                    }
                }else if(fancyObj.fancytype == 'Diamond'){
                    if (fancyObj.result != null && fancyObj.result != "-1") {
                        if (fancyObj.odd_type == "RUNS" && web.type == "Normal") {
                          let sendnormalend =
                            web.websiteurl +
                            "/api/" +
                            web.endpoint +
                            "?id=" +
                            fancyObj.eventId +
                            "-" +
                            fancyObj.F_id +
                            ".FY&eventid=" +
                            fancyObj.eventId +
                            "&winner=" +
                            +fancyObj.result;
                          sendResult(sendnormalend, AblockStatus, web.autoResult);
                        }
                      }
                }else if(fancyObj.fancytype == 'Sky3'){
                    if (fancyObj.result != null && fancyObj.result != "-1") {
                        if (fancyObj.odd_type == "RUNS" && web.type == "Normal") {
                          let sendnormalend =
                            web.websiteurl +
                            "/api/" +
                            web.endpoint +
                            "?id=" +
                            fancyObj.eventId +
                            "-" +
                            fancyObj.F_id +
                            ".FY&eventid=" +
                            fancyObj.eventId +
                            "&winner=" +
                            +fancyObj.result;
                          sendResult(sendnormalend, AblockStatus, web.autoResult);
                        }
                      }
                }
            } catch (error) {
                
            }
           
        } 
        
        let fancyLogs = new FancyLogs({
            eventId:eventId,
            fancyName:name,
            result:result,
            fancytype:fancytype,
            createdBy:createdBy,
            action:"Manual Result has been set for all web"
          });
        //   console.log(fancyLogs);
          await fancyLogs.save();
        res.status(200).json({
            status:1,
            message:'Result Set successfully'

        })    

    }else{
        res.status(200).json({
            status:0,
            message:'Fancy not Avaliable'

        })
    }
    } catch (error) {
        res.status(200).json({
            status:0,
            message:'Fancy not Avaliable'

        })
    }

    
}

exports.setmanualResultselectedweb = async(req,res) =>{     
    var AblockStatus = false;
    try {
        let allBlockStatus = await Block.find().lean();
    if (allBlockStatus.length > 0) {
      AblockStatus = allBlockStatus[0].blockStatus;
    }  
    
    const { F_id, eventId,fancytype,result,webUrl,name,createdBy } = req.body;
    let fancyLogs = new FancyLogs({
        eventId:eventId,
        fancyName:name,
        result:result,
        fancytype:fancytype,
        createdBy:createdBy,
        action:"Set Manual Result"
      });
    //   console.log(fancyLogs);
      await fancyLogs.save();
    // const fancy = await Fancy.find({F_id,eventId,fancytype}).lean();
    const allwebSiteList = await Website.find({type:"Normal"}).lean();
    for (const webUrlLOp of webUrl) {
        // console.log(webUrlLOp);
    const webSiteList = allwebSiteList.filter((dt)=> dt.websiteurl == webUrlLOp );
    // console.log(webSite);
    // if(fancy.length > 0){
        let fancyObj = await Fancy.findOneAndUpdate(
          {
            eventId: eventId,
            F_id: F_id,
            fancytype: fancytype,
          },
          { $set: { is_result: true , result:result,isWorngsettled:false,isRollbacked:false} },
          { new: true }
        );


        let sendnormalend = webSiteList.map((dt)=> 
            dt.websiteurl +
            "/api/" +
            dt.endpoint +
            "?id=" +
            eventId +
            "-" +
            F_id +
            ".FY&eventid=" +
            eventId +
            "&winner=" +
            +result
            );
      
        sendResult(sendnormalend[0], AblockStatus);

      
    
    }
    res.status(200).json({
        status:1,
        message:'Result Set successfully'

    })  
  
    
    } catch (error) {
        // console.log(error);
        res.status(200).json({
            status:0,
            message:'Fancy not Avaliable'

        })
    }

    
}


  exports.getonlyallwebsite = async(req,res)=>{
    
    try {
        let allWeb = await Website.find().lean();
        let m = allWeb.filter((a,i) => allWeb.findIndex((s) => a.websiteurl == s.websiteurl) === i)
        
        res.status(200).json({
            status:1,
            result:m
        })
    } catch (error) {
        res.status(500).json({
            status: 0,
            message: error
        })
    }
  }

  exports.checkFancyActiveN = async (req, res) => {
    try {
        // console.log(req.body.websiteName + '/api/getActiveFancy?eventId=' + req.body.eventId);
        
        axios.post(req.body.websiteName + '/api/getActiveFancy?eventId=' + req.body.eventId).then((resp) => {
            // console.log(resp.data);
            if (resp.data.length == 0) {
                res.status(200).json({
                    status: 1,
                })
            } else {
                res.status(200).json({
                    status: 0,
                    result: resp.data
                })
            }

        }).catch((e) => {
            // console.log(e);
            res.status(500).json({
                status: 0,
                message: e
            })
        })
    } catch (error) {
        // console.log(error);
        res.status(500).json({
            status: 0,
            message: error
        })
    }
}

exports.setMatchResultSuperSingleWebsite = async (req, res) => {
    try {
        const { matchId, selectionId, selectionName, websiteName, createdBy,matchName } = req.body
        // let insertlogs = new SuperLogs({
        //     eventId: matchId,
        //     key: 12,
        //     createdBy,
        //     winnerteam: selectionName,
        //     website: websiteName,
        //     message: 'Match Result Declared'
        // })
        // // console.log(insertlogs);
        // await insertlogs.save();
        // return
        let matchlogs = new MatchLogs({
            eventId: matchId,
            matchName: matchName,
            createdBy:createdBy,
            action:`set result`
          })     
        // console.log(matchlogs);
          matchlogs.save(); 
        let insert = new MatchResultWebsite({
            eventId: matchId,
            website: websiteName,
            status: '1',
            result: { selectionId: selectionId, name: selectionName }
        })
        await insert.save();
        let sign = createSign({ matchId, selectionId, selectionName });
        Promise.all([sign]).then(async (value) => {
            let headers = {
                headers: {
                    'signature': value[0]
                }
            }
            let body = { matchId, selectionId, selectionName }
            // console.log(body);
            // console.log(websiteName + '/api/setCommonMatchResult');
            await axios.post(websiteName + '/api/setCommonMatchResult', body, headers).then((resp) => {
                // console.log(resp.data);
            }).catch((e) => {
                console.log(e);
            });
        })
        res.status(201).json({
            status: 1,
            message: 'Result Successfully!!'
        })
    } catch (error) {
        res.status(500).json({
            status: 0,
            message: error
        })
    }
}

exports.getMatchResultSuperSingleWebsite = async (req, res) => {
    try {
        // console.log(req.body);
        const { eventId, createdBy } = req.body
        let resp = await MatchResultWebsite.find({ eventId: eventId }).lean();

        let resdata = await Website.find().lean();
        let allwebsite = resdata.filter((a, i) => resdata.findIndex((s) => a.websiteurl === s.websiteurl) === i)
        let newdata = []

        for (let i = 0; i < allwebsite.length; i++) {
            const element = allwebsite[i];
            // resp.filter((db) => (db.website == element.websiteurl))
            newdata.push({ ...element, ...resp.filter((db) => (db.website == element.websiteurl))[0] })
        }

        // console.log(newdata);
        res.status(200).json({
            status: 1,
            result: newdata
        })
    } catch (error) {
        res.status(500).json({
            status: 0,
            message: error
        })
    }
}

exports.SingleMatchActiveInactveSuper = async (req, res) => {
    try {
        // console.log(req.body);
        const { eventId, status, websitename,matchName, createdBy } = req.body
        // let insertlogs = new SuperLogs({
        //     eventId,
        //     key: status == 'true' ? 9 : 10,
        //     createdBy,
        //     website: websitename,
        //     message: status == 'true' ? 'Website Active' : 'Website InActive',
        // })
        // // console.log(insertlogs);
        // await insertlogs.save();
        // return
        let matchlogs = new MatchLogs({
            eventId: eventId,
            matchName: matchName,
            createdBy:createdBy,
            action:status == true ? 'Website Active' : 'Website InActive',
          })     
        // console.log(matchlogs);
          matchlogs.save(); 
                 
        let sign = createSign({ eventId, status });
        // console.log(sign);
        let body = { eventId, status }
        // console.log(websitename + '/api/makeGameCommonActiveInactive', body);
        await axios.post(websitename + '/api/makeGameCommonActiveInactive', body, {
            headers: {
                'signature': sign
            }
        }).then((resp) => {
            // console.log(resp.data);
        }).catch((e) => {
            console.log(e);
        });

        res.status(200).json({
            status: 1,
            message: 'Match Active Successfully!!'
        })

    } catch (error) {
        console.log(error);
        res.status(200).json({
            status: 0,
            message: error
        })
    }
}


exports.setSingleMatchSuspendsuper = async (req, res) => {
    try {
        // console.log(req.body);
        // return
        const { mfid, type, websiteName, susAnRoll, createdBy,matchName } = req.body
        // let insertlogs = new SuperLogs({
        //     eventId: mfid,
        //     key: susAnRoll == 1 ? 7 : 8,
        //     createdBy,
        //     website: websiteName,/api/Ro
        //     message: susAnRoll == 1 ? 'Suspend Website' : 'Suspend Website RollBack'
        // })
        // // console.log(insertlogs);
        // await insertlogs.save();
        // return
        let matchlogs = new MatchLogs({
            eventId: mfid,
            matchName: matchName,
            createdBy:createdBy,
            action:`Suspened`
          })     
        // console.log(matchlogs);
          matchlogs.save(); 
       
        let sign = createSign({ mfid, type });

        Promise.all([sign]).then(async (value) => {
            let body = { mfid, type }
            let url = susAnRoll == 1 ? websiteName + '/api/suspendCommonMatchFancy' : websiteName + '/api/RollbackCommonSuspendMatchFancy'
            // console.log(url);
            // return
            await axios.post(url, body, {
                headers: {
                    'signature': value[0]
                }
            }).then((resp) => {
                // console.log(resp.data);
            }).catch((e) => {
                console.log(e);
            });
        })
        res.status(200).json({
            status: 1,
            message: 'Match Suspend Successfully!!'
        })

    } catch (error) {
        res.status(200).json({
            status: 0,
            message: error
        })
    }
}

exports.setAllWebSuspened = async(req, res)=>{
    try {
        const { mfid, type, susAnRoll, createdBy,matchName } = req.body
        // console.log(req.body);
        // return
        // console.log(mfid,":",type,":",susAnRoll);
        // return
        // let insertlogs = new SuperLogs({
        //     eventId: mfid,
        //     key: susAnRoll == 1 ? 5 : 6,
        //     createdBy,
        //     website: 'All Website',
        //     message: susAnRoll == 1 ? 'Match Suspend' : 'Match Suspend RollBack'
        // })
        // // console.log(insertlogs);
        // await insertlogs.save();

        let matchlogs = new MatchLogs({
            eventId: mfid,
            matchName: matchName,
            createdBy:createdBy,
            action:`Match has been suspended for all websites`
          })     
        // console.log(matchlogs);
          matchlogs.save(); 
        // return
        let sign = createSign({ mfid, type });
        let allwebsite = await getallwebsite();

        Promise.all([allwebsite, sign]).then(async (value) => {
            let headers = {
                headers: {
                    'signature': value[1]
                }
            }
            let body = { mfid, type }
            for (const key of value[0]) {
                let url = susAnRoll == 1 ? key.websiteurl + '/api/suspendCommonMatchFancy' : key.websiteurl + '/api/RollbackCommonSuspendMatchFancy'
                await matchsusallwebsite(url, body, headers)
            }
        })
        res.status(200).json({
            status: 1,
            message: 'Match Suspend Successfully!!'
        })
    } catch (error) {
        res.status(500).json({
            status:0 ,
            message:error.message          
        })
    }
}

async function matchsusallwebsite(url, body, headers) {
    await axios.post(url, body, headers).then((resp) => {
        // console.log(resp.data);
    }).catch((e) => {
        // console.log(e);
    });
}


exports.setSingleMatchTimeDateSuper = async (req, res) => {
    try {
        // console.log(req.body);
        // return
        const { eventid, gamedate, websiteName, createdBy,matchName } = req.body
        // let insertlogs = new SuperLogs({
        //     eventId: eventid,
        //     key: 11,
        //     createdBy,
        //     website: websiteName,
        //     time: gamedate,
        //     message: 'Time Update'
        // })
        // // console.log(insertlogs);
        // // return
        // await insertlogs.save();
        let matchlogs = new MatchLogs({
            eventId: eventid,
            matchName: matchName,
            createdBy:createdBy,
            action:`Time updated ${gamedate}`
          })     
        // console.log(matchlogs);
          matchlogs.save(); 
        // return
        let sign = createSign({ eventid, gamedate });

        Promise.all([sign]).then(async (value) => {
            let body = { eventid, gamedate }
            await axios.post(websiteName + '/api/updateCommonGameDate', body, {
                headers: {
                    'signature': value[0]
                }
            }).then((resp) => {
                // console.log(resp.data);
            }).catch((e) => {
                console.log(e);
            });
        })
        res.status(200).json({
            status: 1,
            message: 'Match Date Time Update Successfully!!'
        })

    } catch (error) {
        res.status(200).JSON({
            status: 0,
            message: error
        })
    }
}


exports.sendSingleWebsiteProvider = async (req, res) => {
    try {
        // console.log(req.body);
        // return
        const { eventid, provider, websiteName,matchName, createdBy } = req.body
        // let insertlogs = new SuperLogs({
        //     eventId: eventid,
        //     key: 13,
        //     createdBy,
        //     website: websiteName,
        //     provider,
        //     message: 'Provider Update'
        // })
        // // console.log(insertlogs);
        // // return
        // await insertlogs.save();
        let matchlogs = new MatchLogs({
            eventId: eventid,
            matchName: matchName,
            createdBy:createdBy,
            action:`Provider Updated :-${provider}`
          })     
        // console.log(matchlogs);
          matchlogs.save(); 
        // return
        let sign = createSign({ eventId: eventid, type: provider });
        // return
        Promise.all([sign]).then(async (value) => {
            let body = { eventId: eventid, type: provider }
            // console.log(body);
            // return
            await axios.post(websiteName + '/api/changeCommonProvider', body, {
                headers: {
                    'signature': value[0]
                }
            }).then((resp) => {
                // console.log(resp.data);
            }).catch((e) => {
                // console.log(e);
            });
        })
        res.status(200).json({
            status: 1,
            message: 'Provider Update Successfully!!'
        })
    } catch (error) {
        // console.log(error);
        res.status(500).json({
            status: 0,
            message: error
        })
    }
}


exports.checkAllWebsitePassFail = async (req, res) => {
    try {
        let eventId = req.body.id
        // let allwebsite = (await getallwebsite()).map((m) => (m.websiteurl));
        let allwebsite = req.body.allwebsite
        // console.log(eventId, allwebsite);
        //  return
        let doneNot = []
        for (const key of allwebsite) {
            // console.log(key);
            let { data } = await axios.post(key + '/api/getActiveFancy?eventId=' + eventId).then(res => res).catch(err => err);
            let data2 = {
                length: data?.length,
                websiteUrl: key
            }    
            // console.log(data2);      
            doneNot.push(data2)
        }
        // console.log(doneNot);
        // return
        res.status(200).json({
            status: 1,
            data: doneNot
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            status: 0,
            message: error.message
        })
    }
}

exports.setMatchResultSuperAllWebsite = async (req, res) => {
    try {
        // console.log(req.body);
        // return
        const { matchId, selectionId, selectionName } = req.body
        let dbresult = await MatchResultWebsite.find({ eventId: matchId }).lean();
        let allwebsite = await getallwebsite();
        // console.log(allwebsite);
        // console.log(allwebsite.filter((e) =>
        // !dbresult.some((db) => (db.website == e.websiteurl))
        // ));
        // return
        let filtereddata = allwebsite.filter((e) =>
            !dbresult.some((db) => (db.website == e.websiteurl))
        ).map((m) => ({
            url: m.websiteurl
        }))
        // console.log(filtereddata);
        // return
        let sign = createSign({ matchId, selectionId, selectionName });
        let body = { matchId, selectionId, selectionName }

        Promise.all([sign, filtereddata]).then(async (value) => {
            let headers = {
                headers: {
                    'signature': value[0]
                }
            }
            for (const single of value[1]) {
                try {
                    // console.log(single.url + '/api/setCommonMatchResult', body, headers);
                // console.log(single);
                await sendSingleMatchResult(single.url + '/api/setCommonMatchResult', body, headers);
                
                // await saveinsertlogs(insertlogs); // working
                let insert = new MatchResultWebsite({
                    eventId: matchId,
                    website: single.url,
                    status: '1',
                    result: { selectionId: selectionId, name: selectionName }
                })
                // console.log(insert);
                await saveresultmatchresultwebsite(insert); // working
                } catch (error) {
                    console.log(error);
                }
                
            }
        });

        res.status(201).json({
            status: 1,
            message: 'Result Successfully!!'
        })
    } catch (error) {
        res.status(500).json({
            status: 0,
            message: error
        })
    }
}

// async function saveinsertlogs(data) {
//     await data.save()
// }

async function saveresultmatchresultwebsite(data) {
    await data.save();
}

async function getallwebsite() {
    let resdata = await Website.find().lean();
    return resdata.filter((a, i) => resdata.findIndex((s) => a.websiteurl === s.websiteurl) === i)
}


async function sendSingleMatchResult(url, body, headers) {
    // console.log(url, body, headers);
    // return
    await axios.post(url, body, headers).then((resp) => {
        // console.log(resp);
    }).catch((e) => {
        // console.log(e);
    });
}


exports.setNewApiResultAll = async (req, res) => {
    try {
        // console.log(req.body);
        // return
        let check = await NewApiResult.countDocuments({ eventId: req.body.eventId, runnerId: req.body.fancyId });
        if (check == 0) {
            let insertdata = new NewApiResult({
                eventId: req.body.eventId,
                fancyName: req.body.fancyname,
                type: req.body.type,
                result: req.body.result,
                runnerId: req.body.fancyId,
            })
            await insertdata.save();
        }

        let fancyLogs = new FancyLogs({
            eventId:req.body.eventId,
            fancyName:req.body.fancyname,
            result:req.body.result,
            fancytype:req.body.type ,
            createdBy:req.body.createdBy,
            action:"Set Premium Fancy result"
          });
        //   console.log(fancyLogs);
          await fancyLogs.save();

        res.status(201).json({
            status: 1,
            message: 'Result Update Successfully!!'
        })
    } catch (error) {
        res.status(500).json({
            status: 0,
            message: error
        })
    }
}


// -------------------------------

exports.resultsendendpoint = async (req, res) => {
    // console.log(req.body);
    // return
    // let savelogs = new Resultlog({
    //     message: 'Result Set',
    //     eventid: req.body.eventId,
    //     result: req.body.result,
    //     fancyname: req.body.fancyname,
    //     username: req.body.createdBy,
    //     type: req.body.type
    // });
    // savelogs.save();

    // return
    let resdata = req.body

    Website.find().then((resp) => {
        var normal = resp.reduce(function (filtered, option) {
            if (option.type == 'Normal') {
                var someNewValue = { name: option.websiteurl, endpoint: option.endpoint }
                filtered.push(someNewValue);
            }
            return filtered;
        }, []);

        // console.log(normal);
        // return
        var fancy1 = resp.reduce(function (filtered, option) {
            if (option.type == 'Fancy1') {
                var someNewValue = { name: option.websiteurl, endpoint: option.endpoint }
                filtered.push(someNewValue);
            }
            return filtered;
        }, []);

        // console.log(fancy1);
        var premium = resp.reduce(function (filtered, option) {
            if (option.type == 'Premium') {
                var someNewValue = { name: option.websiteurl, endpoint: option.endpoint }
                filtered.push(someNewValue);
            }
            return filtered;
        }, []);

        var Other = resp.reduce(function (filtered, option) {
            if (option.type == 'Other') {
                var someNewValue = { name: option.websiteurl, endpoint: option.endpoint }
                filtered.push(someNewValue);
            }
            return filtered;
        }, []);

        // getdata sky3 end point

        if (resdata.type == 'Sky3') {
            if (resdata.sky3odds_yes_no_1_hai == 'Yes') {
                // console.log('if');
                for (const element of fancy1) {
                    let sendfancy1 = element.name + '/api/' + element.endpoint + '?id=' + resdata.eventId + '-' + resdata.runnerId + '.FY&eventid=' + resdata.eventId + '&winner=' + +resdata.result
                    // console.log(sendfancy1);
                    axios.post(sendfancy1, { headers: { 'Content-Type': 'application/json' } })
                        .then((resp) => {
                            // console.log(resp.data);
                            // if (resp.status == 200) {
                            // }
                        }).catch(function (error) {
                            // logger.log({
                            //     type: 'Sky3 Yes',
                            //     level: 'error',
                            //     api: sendfancy1,
                            //     message: error.response.data
                            // });
                        })
                }
            } else {
                // console.log('else');
                for (const element of normal) {
                    // sendresultallsend(element.name, resdata, 'Normal', element.endpoint)
                    let sendnormalend = element.name + '/api/' + element.endpoint + '?id=' + resdata.eventId + '-' + resdata.runnerId + '.FY&eventid=' + resdata.eventId + '&winner=' + +resdata.result
                    // console.log(sendnormalend);
                    sendResultSky3(sendnormalend);
                    // axios.post(sendnormalend, { headers: { 'Content-Type': 'application/json' } })
                    //     .then((resp) => {

                    //     }).catch(function (error) {

                    //     })
                }
            }
        }
        if (resdata.type == 'Diamond' || resdata.type == 'Normal' || resdata.type == 'JDiamond' || resdata.type == 'Virtual' || resdata.type == 'Sky' || resdata.type == 'WorldNormal' || resdata.type == 'WorldFBBB') {
            // let alldoneresult = []
            // console.log('d');
            // console.log(resdata);
            for (const element of normal) {
                // sendresultallsend(element.name, resdata, 'Normal', element.endpoint)
                let sendnormalend = element.name + '/api/' + element.endpoint + '?id=' + resdata.eventId + '-' + resdata.runnerId + '.FY&eventid=' + resdata.eventId + '&winner=' + +resdata.result
                // console.log(sendnormalend);
                // return
                sendResultDiamondJDiamondVirtualSkyWorldNormalWorldFBBB(sendnormalend)
                // axios.post(sendnormalend, { headers: { 'Content-Type': 'application/json' } })
                //     .then((resp) => {

                //     }).catch(function (error) {

                //     })
            }
            // console.log('b', alldoneresult);
            // resultwebsitedoneinsert(alldoneresult);

        }
        if (resdata.type == 'Fancy1' || resdata.type == 'WorldF1' || resdata.type == 'JDiamondFancy1') {
            // console.log(resdata);
            for (const element of fancy1) {
                // console.log('fancy1', element);
                // return
                // sendresultallsend(element.name, resdata, 'Fancy1', element.endpoint)
                let sendfancy1 = element.name + '/api/' + element.endpoint + '?id=' + resdata.eventId + '-' + resdata.runnerId + '.FY&eventid=' + resdata.eventId + '&winner=' + +resdata.result
                // console.log(sendfancy1);
                // return
                sendResultFancy1WorldF1JDiamondFancy1(sendfancy1)

                // axios.post(sendfancy1, { headers: { 'Content-Type': 'application/json' } })
                //     .then((resp) => {

                //     }).catch(function (error) {

                //     })
            }
        }
        if (resdata.type == 'Premium') {
            for (const element of premium) {
                // sendresultallsend(element.name, resdata, 'Premium', element.endpoint)
                let me = resdata.result
                let o = me.split(' ')[0]
                let sendpremium = element.name + '/api/' + element.endpoint + '?id=' + resdata.runnerId + '&eventid=' + resdata.eventId + '&winner=' + +o
                // console.log(sendpremium);
                // return
                sendResultPremium(sendpremium)

                // axios.post(sendpremium, { headers: { 'Content-Type': 'application/json' } })
                //     .then((resp) => {

                //     }).catch(function (error) {

                //     })
            }
        }
        if (resdata.type == 'PremiumNew') {
            for (const element of premium) {
                // console.log(element);
                // sendresultallsend(element.name, resdata, 'Premium', element.endpoint)
                let me = resdata.result
                let o = me.split(' ')[0]
                let sendpremium = element.name + '/api/' + element.endpoint + '?id=' + resdata.runnerId + '&eventid=' + resdata.eventId + '&winner=' + +o
                // console.log('sendpremium',sendpremium);
                // return
                sendResultPremiumNew(sendpremium)

                // axios.post(sendpremium, { headers: { 'Content-Type': 'application/json' } })
                //     .then((resp) => {

                //     }).catch(function (error) {

                //     })
            }
        }

        // --------------
        if (resdata.type == 'soccer-tennis') {
            for (const element of premium) {
                // console.log(element);
                // sendresultallsend(element.name, resdata, 'Premium', element.endpoint)
                let me = resdata.result
                let o = me.split(' ')[0]
                let sendpremium = element.name + '/api/' + element.endpoint + '?id=' + resdata.runnerId + '&eventid=' + resdata.eventId + '&winner=' + +o
                // console.log('sendpremium',sendpremium);
                // return
                sendResultsoccerTennis(sendpremium)

                // axios.post(sendpremium, { headers: { 'Content-Type': 'application/json' } })
                //     .then((resp) => {

                //     }).catch(function (error) {

                //     })
            }
        }
        if (resdata.type == 'OtherNew') {
            // console.log('ajay kumar');
            // return
            for (const element of Other) {
                // console.log(element);
                // sendresultallsend(element.name, resdata, 'Premium', element.endpoint)
                let me = resdata.result
                let o = me.split(' ')[0]
                let sendpremium = element.name + '/api/' + element.endpoint + '?id=' + resdata.runnerId + '&eventid=' + resdata.eventId + '&winner=' + +o
                // console.log('sendpremium',sendpremium);
                // return
                sendResultOtherNew(sendpremium)

                // axios.post(sendpremium, { headers: { 'Content-Type': 'application/json' } })
                //     .then((resp) => {

                //     }).catch(function (error) {

                //     })
            }
        }

        if (resdata.type == 'Other') {
            // console.log('ajay kumar');
            // return
            for (const element of Other) {
                // console.log(element);
                // sendresultallsend(element.name, resdata, 'Premium', element.endpoint)
                let me = resdata.result
                let o = me.split(' ')[0]
                let sendpremium = element.name + '/api/' + element.endpoint + '?id=' + resdata.runnerId + '&eventid=' + resdata.eventId + '&winner=' + +o
                // console.log('sendpremium', sendpremium);
                // return
                sendResultOther(sendpremium)

                // axios.post(sendpremium, { headers: { 'Content-Type': 'application/json' } })
                //     .then((resp) => {

                //     }).catch(function (error) {

                //     })
            }
        }

    });
    await redisApiFancyUpdate(req.body)

    // console.log(req.body);
    // console.log("🚀 ~ file: match.js ~ line 1601 ~ exports.resultsendendpoint= ~ body", req.body)




    let providernew = req.body.type == 'Sky3' ? 'sk' : req.body.type;
    let selectionIdnew = req.body.eventId + '-' + req.body.runnerId + '.FY';
    let datasend = {
        status: 'Inactive', // i.e.Active, Inactive
        eventId: req.body.eventId,
        selectionId: selectionIdnew,
        name: req.body.fancyname,
        provider: providernew.toLowerCase(), // i.e.diamond, sky, sk, world
        runnerId: +req.body.runnerId,
        type: "Fancy",
        createdBy: 'BetBihari' + '-' + req.body.createdBy
    }
    // console.log(providernew);
    // console.log(selectionIdnew);
    // console.log(datasend);
    // // return
    // Centralpanel.find().then((resp) => {
    //     for (const element of resp) sendstatuscenterpa(element.websiteurl + '/api/fancy/setCommonFancyStatus', datasend)
    // });
    res.status(200).json({
        status: 1
    })
}


async function sendResultSky3(url) {
    // console.log(url);
    await axios.post(url, { headers: { 'Content-Type': 'application/json' } })
        .then((resp) => {
            // console.log(resp.data);
        }).catch(function (error) {
            // console.log(error);
        })
}


async function sendstatuscenterpa(sendcentrals, datasend) {
    axios.post(sendcentrals, datasend).then((resp) => {
        // console.log(resp);
    }).catch((error) => {
        // console.log(error);
    })
}

async function redisApiFancyUpdate(data) {
    // console.log(data);
    // {
    //     matchName: 'Southern Vipers v Sunrisers',
    //     type: 'Diamond',
    //     marketId: '31604902',
    //     result: '10',
    //     eventId: '31604902',
    //     runnerId: '50',
    //     fancyname: '50 over run SV W 2',
    //     sky3odds_yes_no_1_hai: '',
    //     createdBy: 'Admin (admin)'
    //   }
    // let dbdata = await NewApiResult.find({ eventId: data.eventId, status: 1 }).lean();
    // console.log(dbdata);
    // return
    let newrunnerId = (data.type == 'Premium' || data.type == 'Other' || data.type == 'soccer-tennis') ? data.runnerId : data.eventId + '-' + data.runnerId + '.FY'

    // console.log(newrunnerId);
    let redisdata = JSON.parse(await aget('Fancy-' + data.eventId + '-NewApi'));
    // console.log(redisdata.length)
    // return
    let d = redisdata?.filter((m) => (m.fancyid != newrunnerId));
    // client.set('Fancy-' + data.eventId + '-NewApi', JSON.stringify(d), 'EX', 25);

    // let asdf = JSON.parse(await aget('Fancy-' + data.eventId + '-NewApi'));
    // console.log(asdf.length);
}

async function sendResultOther(url) {
    await axios.post(url, { headers: { 'Content-Type': 'application/json' } })
        .then((resp) => {
            // console.log(resp.data);
        }).catch(function (error) {
            // console.log(error);
        })
}

async function sendResultOtherNew(url) {
    await axios.post(url, { headers: { 'Content-Type': 'application/json' } })
        .then((resp) => {
            // console.log(resp.data);
        }).catch(function (error) {
            // console.log(error);
        })
}

async function sendResultsoccerTennis(url) {
    await axios.post(url, { headers: { 'Content-Type': 'application/json' } })
        .then((resp) => {
            // console.log(resp.data);
        }).catch(function (error) {
            // console.log(error);
        })
}

async function sendResultDiamondJDiamondVirtualSkyWorldNormalWorldFBBB(url) {
    await axios.post(url, { headers: { 'Content-Type': 'application/json' } })
        .then((resp) => {
            // console.log(resp.data);
        }).catch(function (error) {
            // console.log(error);
        })
}
async function sendResultFancy1WorldF1JDiamondFancy1(url) {
    await axios.post(url, { headers: { 'Content-Type': 'application/json' } })
        .then((resp) => {
            // console.log(resp.data);
        }).catch(function (error) {
            // console.log(error);
        })
}

async function sendResultPremium(url) {
    await axios.post(url, { headers: { 'Content-Type': 'application/json' } })
        .then((resp) => {
            // console.log(resp.data);
        }).catch(function (error) {
            // console.log(error);
        })
}
async function sendResultPremiumNew(url) {
    await axios.post(url, { headers: { 'Content-Type': 'application/json' } })
        .then((resp) => {
            // console.log(resp.data);
        }).catch(function (error) {
            // console.log(error);
        })
}



exports.getstatusWebsite = async (req, res) => {
    try {
        // console.log(req.body);
        // console.log(req.body.websiteName + '/api/getAddSetting');
        // return
        let { data } = await axios.post(req.body.websiteName + '/api/getAddSetting');
        res.status(200).json({
            status: 1,
            result: data
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            status: 0,
            message: error
        })
    }
}

exports.sentStatusWebsite = async (req, res) => {
    try {
        // console.log(req.body);
        let data = req.body
        let website = req.body.websiteName
        delete data.createdBy
        delete data.websiteName
        // console.log(data);
        let sign = createSign(data);
        Promise.all([sign]).then(async (value) => {
            let headers = {
                headers: {
                    'signature': value[0]
                }
            }
            // console.log(website + '/api/setAddSetting');
            await axios.post(website + '/api/setAddSetting', data, headers).then((resp) => {
                // console.log(resp.data);
            }).catch((e) => {
                // console.log(e.data);
            })
        });
        res.status(200).json({
            status: 1,
            message: 'ok'
        })
    } catch (error) {
        res.status(500).json({
            status: 0,
            message: error
        })
    }
}


exports.singlematchget = async (req, res) => {
    try {
        const resdata = await Match.findOne({ eventId: req.params.id, isActive: true, isResult: false });
        res.status(200).json({
            status: 1,
            data: resdata
        });
    } catch (error) {
        res.status(500).json({
            status: 0,
            message: err._message
        });
    }
}


async function senddatetimeupdate(websiteurl, body, headers) {

    await axios.post(websiteurl + '/api/updateCommonGameDate', body, headers).then((resp) => {
        // await axios.post('http://192.168.29.78/api/updateCommonGameDate', body, headers).then((resp) => {
        console.log(resp.data);
    }).catch((e) => {
        console.log(e);
    })
}

exports.updatematchDateTime = async(req,res)=>{
    try {
        const { eventid, gamedate ,createdBy} = req.body
        // const currentDatetime = new Date()
        // console.log(currentDatetime.toISOString().slice(0,20) ,":" ,gamedate);
        const updatedatetime = await Match.findOneAndUpdate({eventId:eventid},{$set:{openDate:gamedate, isInplay: await checkInplay(gamedate)}},{ new: true });

        let matchlogs = new MatchLogs({
            eventId: eventid,
            matchName: updatedatetime.eventName,
            createdBy:createdBy,
            action:`Match date and time updated to ${gamedate}`
          })     
        //   console.log(matchlogs);
          matchlogs.save();     
        //   return
        
        let sign = createSign({ eventid, gamedate });
        let allwebsite = await getallwebsite();
        Promise.all([allwebsite, sign]).then(async (value) => {
            let headers = {
                headers: {
                    'signature': value[1]
                }
            }
            let body = { eventid, gamedate }
            for (const key of value[0]) {
                // console.log(key);

                // console.log(body);
                await senddatetimeupdate(key.websiteurl, body, headers)
            }
        })
       

        res.status(200).json({
            status: 1,
            message: 'Match Date Time Update Successfully!!'
        })
    } catch (error) {
        res.status(200).JSON({
            status: 0,
            message: error
        })
    }
}

async function checkInplay(openDate) {
    var ToDate = new Date();
  
    if (new Date(openDate).getTime() <= ToDate.getTime()) {
      return true;
    }
    return false;
  }


exports.updateDefaultresult = async (req,res)=>{
    try {
        const defaultS = await DefaultScore.findOneAndUpdate(
            { _id: "62a0df0ea51dce2afc8a6264" },
            { $set: { defaultScore: req.body.defaultScore } },
            { new: true }
          );      
        
          res.status(200).json({
            status: 1,
            message: "Updated",
          });
    } catch (error) {
        res.status(500).json({
            status: 0,
            message: "Not Updated",
          });
    }
}

exports.getDefaultscore = async (req, res) => {
    try {
      const score = await DefaultScore.find().lean();
      // console.log(score);
      res.status(200).json({
        status: 1,
        result: score,
        message: "Data Found",
      });
    } catch (error) {
      res.status(500).json({
        status: 0,
        result: [],
        message: "no Data Found",
      });
    }
  };


async function sendmatchActiveinactivedata(url, body, headers) {
    // console.log(url + '/api/makeGameCommonActiveInactive', body);
    await axios.post(url + '/api/makeGameCommonActiveInactive', body, headers).then((resp) => {
        // console.log(resp.data);
    }).catch((e) => {
        // console.log(e);
    })
}

exports.matchActiveInactveSuper = async (req, res) => {
    try {
        // console.log(req.body);
        // return
        const { eventId, status, createdBy,matchName } = req.body
        // let insertlogs = new SuperLogs({
        //     eventId,
        //     key: status == true ? 1 : 2,
        //     createdBy,
        //     website: 'All Website'
        // })
        // await insertlogs.save();
        // console.log(insertlogs);
        let matchlogs = new MatchLogs({
            eventId: eventId,
            matchName: matchName,
            createdBy:createdBy,
            action:status == true ? 'Match has been set mActive':'Match has been set InActive'
          })     
        // console.log(matchlogs);
          matchlogs.save(); 
        // return

        let sign = createSign({ eventId, status });

        let allwebsite = await getallwebsite({type:"Normal"});        
        Promise.all([allwebsite, sign]).then(async (value) => {
            let headers = {
                headers: {
                    'signature': value[1]
                }
            }
            let body = { eventId, status }
            for (const key of value[0]) {
                // console.log(key.websiteurl);
                await sendmatchActiveinactivedata(key.websiteurl, body, headers)
            }
        })
        res.status(200).json({
            status: 1,
            message: 'Match Active Successfully!!'
        })

    } catch (error) {
        res.status(200).JSON({
            status: 0,
            message: error
        })
    }
}

async function sendapiheader(websiteName, body) {
    // http://192.168.1.14/api/updateBookMakerHeader
    await axios.post(websiteName + '/api/updateBookMakerHeader', body).then((resp) => {
        // console.log(resp.data);
    }).catch((e) => {
        // console.log(e);
    });
}

exports.sendUpdateHeader = async (req, res) => {
    try {
        let alldata = req.body
        // console.log(alldata);
        // return

        // let insertlogs = new SuperLogs({
        //     eventId: alldata.eventid,
        //     key: 3,
        //     createdBy: alldata.createdBy,
        //     website: 'All Website',
        //     header: alldata,
        //     message: 'Header Update'
        // })
        // // console.log(insertlogs);
        // await insertlogs.save();

        let matchlogs = new MatchLogs({
            eventId: alldata.eventid,
            matchName: alldata.eventName,
            createdBy:alldata.createdBy,
            action:`Headers has been updated ${alldata.header},${alldata.team1},${alldata.team2},${alldata.team3} for all websites`
          });        
        
          matchlogs.save();  
        // return
        let allwebsite = await getallwebsite({type:"Normal"});
        Promise.all([allwebsite]).then(async (value) => {
            for (const key of value[0]) {
                // console.log(key.websiteurl);
                await sendapiheader(key.websiteurl, req.body)
            }
        })
        res.status(200).json({
            status: 1,
            message: 'Send Header Successfully!!'
        })

    } catch (error) {
        res.status(500).json({
            status: 0,
            message: error
        })
    }
}


exports.sendSetLimitWebsiteAndSingle = async (req, res) => {
    // console.log(req.body);
    // return
    try {
        let limtLog = new LimitLogs({
            eventId:req.body.eventId,
            createdBy:req.body.createdBy,
            action:"Set Limit Updated"  
        });
        // console.log(limtLog);
        await limtLog.save();
        // return
        // console.log(req.body);
        let websitesend = req.body.website
        let data = req.body
        if (data.website == 'All') {
            // console.log('allwebsite');
            delete data.website
            delete data.createdBy
            delete data.eventId

            // console.log(data);
            // return
            let sign = createSign(data);
            // console.log(sign);
            // return
            let allwebsite = await getallwebsite();
            // console.log(data);
            Promise.all([allwebsite, sign]).then(async (value) => {
                let headers = {
                    headers: {
                        'signature': value[1]
                    }
                }
                // console.log(headers);
                let body = data
                for (const key of value[0]) {
                    // console.log(key.websiteurl);
                    await sendsetLimit(key.websiteurl, body, headers)
                }
            })
        } else {
            delete data.createdBy
            delete data.website
            // delete data.eventId
            let sign = createSign(data);
            Promise.all([sign]).then(async (value) => {
                let headers = {
                    headers: {
                        'signature': value[0]
                    }
                }
                let body = data
                await sendsetLimit(websitesend, body, headers)

            })
        }
        res.status(200).json({
            status: 1,
            message: 'Send Successfully!!'
        })
    } catch (error) {
        res.status(500).json({
            status: 0,
            message: error
        })
    }
}

async function sendsetLimit(websiteurl, body, headers) {
    
    // console.log(websiteurl + '/api/setMatchLimit');
    // console.log(websiteurl, body, headers);
    // // return
    await axios.post(websiteurl + '/api/setMatchLimit', body, headers).then((resp) => {
        // console.log(resp.data);
    }).catch((e) => {
        // console.log(e.data);
    })
}

exports.defaultSendLimtCricketSoccerTennis = async (req, res) => {
    try {
        let limtLog = new LimitLogs({
            eventId:req.body.eventId,
            createdBy:req.body.createdBy,
            action:`${req.body.sportName} Set Limit Updated`
        });
        // console.log(limtLog);
        await limtLog.save();
        // return
        let data = req.body

        // console.log(data);
        delete data.createdBy
        delete data.eventId
        let sign = createSign(data);
        Promise.all([sign]).then(async (value) => {
            let headers = {
                headers: {
                    'signature': value[0]
                }
            }
            let body = data
            await sendsetLimitDefault(data.website, body, headers)

        });
        res.status(200).json({
            status: 1,
            message: 'ok'
        })
    } catch (error) {
        res.status(500).json({
            status: 0,
            message: error
        })
    }
}

async function sendsetLimitDefault(websiteurl, body, headers) {
    // console.log(websiteurl + '/api/setMatchLimit');
    // return
    // console.log(websiteurl, body, headers);
    await axios.post(websiteurl + '/api/setCommonlimitbean', body, headers).then((resp) => {
        // console.log(resp.data);
    }).catch((e) => {
        // console.log(e.data);
    })
}


const getAllMatches = async (req, res) => {
    try {
      const response = await axios.get(
        "https://data.mainredis.in/api/match/getMatches?isActive=true&isResult=false&type=own&sportId=4"
      );
      const Alldata = response.data.result;
      // console.log(Alldata);
  
      let pointInclude = Alldata.filter((m) => m.marketId.includes("."));
      let selectedData = pointInclude.map((m) => ({
        eventid: m.eventId,
        marketId: m.marketId,
        mType: m.mType,
      }));
      // console.log('cri',selectedData);
  
      if (selectedData) {
        client.set("matchF", JSON.stringify(selectedData), "Ex", 1000 * 660000);
        await addmatch(Alldata);
      }
    } catch (error) {
      // console.log(error);
    }
  };

  async function addmatch(matchdata) {
    // console.log(Alldata);
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

  const deleteMatch = eventIds.filter(
    (evt) =>
      !matchdata.some(({ eventId }) => {
        return evt === eventId;
      })
  );

  

  await Fancy.deleteMany({
    eventId: { $in: deleteMatch },
  });

  const removedOldMatch = await Match.deleteMany({
    eventId: { $in: deleteMatch },
  });

  // console.log(removedOldMatch.deletedCount, 'Removed Matches');

  
    // for (let i = 0; i < matchdata.length; i++) {
    //   const element = matchdata[i];
    //   // console.log(element);
    //   // return
    //   const findMatch = await Match.findOne({ eventId: element.eventId });
  
    //   if (!findMatch) {
    //     const matchDataList = new Match({
    //       mType: element.mType,
    //       eventId: element.eventId,
    //       marketId: element.marketId,
    //       eventName: element.eventName,
    //       competitionName: "0",
    //       sportId: 4,
    //       sportName: "Cricket",
    //       openDate: element.openDate,
    //       type: "auto",
    //       isActive: true,
    //       isResult: false,
    //       isInplay: await checkInplay(element.openDate),
    //       matchRunners:element.matchRunners,
    //       autoResult:true,

    //     });
    //     // console.log("matchDataList", matchDataList);
    //     const result = await matchDataList.save();
        
    //   }
    // }
  
    // removeMatch(matchdata);
  }
  
  async function removeMatch(matchdata) {
    try {
      const response = await matchController.getActiveMatches({
        // isActive: true,
        // isResult: false,
      });
      if (response) {
        const matches = response;
        var unique = [];
        for (var i = 0; i < matches.length; i++) {
          var found = false;
  
          for (var j = 0; j < matchdata.length; j++) {
            // j < is missed;
            if (matches[i].eventId == matchdata[j].mEventId) {
              found = true;
              break;
            }
          }
          if (found == false) {
            unique.push(matches[i]);
          }
        }
        // console.log(unique);
        for (let i = 0; i < unique.length; i++) {
          const element = unique[i];
          const updateTrueFalse = await Match.findOneAndUpdate(
            { eventId: element.eventId },
            { $set: { isActive: false } },
            { new: true }
          );
        }
      }
    } catch (error) {
      // console.log(error);
    }
  }

exports.runScrapperManual = async(req, res) => { 
    
    try {
       await getAllMatches();
       await getActiveMatches(); 
      res.status(200).json({
          message:'Matches Fetched!',
          status:1
      })
    } catch (error) {
        res.status(200).json({
            message:'failed',
            status:0
        })
    }
  };


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


exports.TossResultStore = async (req, res) => {
    // console.log(req.body);
    // return
    try {
        const { matchName, EventId, winnerTossRunn_Name, winnerTossRunn_Id,createdBy } = req.body
        const insertdata = new TossResult({ matchName, EventId, winnerTossRunn_Name, winnerTossRunn_Id })
        await insertdata.save();
        // let savelogs = new Resultlog({
        //     message: 'Toss Result',
        //     eventid: EventId,
        //     result: winnerTossRunn_Name,
        //     // fancyname: asdf.eventName,
        //     username: req.body.createdBy,
        //     typeid: 10
        //     // type: req.body.type
        // });

        // await savelogs.save();

        let matchlogs = new MatchLogs({
            eventId:EventId,
            matchName: matchName,
            createdBy:createdBy,
            action:`Toss winner has been set ${winnerTossRunn_Name}`
          })             
          matchlogs.save(); 

        Website.find().then((resp) => {
            var toss = resp.reduce(function (filtered, option) {
                // console.log(option);
                if (option.type == 'Toss') {
                    var someNewValue = { name: option.websiteurl, endpoint: option.endpoint }
                    filtered.push(someNewValue);
                }
                return filtered;
            }, []);

            // http://bethonk.com/api/setTossFancyCommonResultThread?eventid=sdf&selection=

            for (const element of toss) {
                try {
                    let sendtoss = element.name + '/api/' + element.endpoint + '?eventid=' + EventId + '&selection=' + winnerTossRunn_Id
                    // console.log('sendpremium', sendtoss);
                    // return
                    axios.post(sendtoss, { headers: { 'Content-Type': 'application/json' } })
                        .then((resp) => {
                            // console.log(resp);
                        }).catch(function (error) {
                            // console.log(error);
                        })
                } catch (error) {
                    
                }
               
            }
        });
        res.status(200).json({
            message: 'Updated Successfully!',
        });
    } catch (error) {
        res.status(500).json({
            status: 0,
            message: error.message
        })
    }
}


exports.TossResultGet = async (req, res) => {

    try {
        let alld = await TossResult.find().lean();
        res.status(200).json({
            status: 1,
            result: alld
        })
    } catch (error) {
        res.status(500).json({
            status: 0,
            message: error.message
        })
    }
}

exports.getPendingResult = async(req,res) =>{
    const {eventId} = req.body
    // console.log(eventId);
    // return
    let webUrl = ''
    let webEndpoint = ''
    try {    
        let fancyResponse = []        
        const regWeb = await WhitelistWebsite.find({type:"Active Fancy"});
        // console.log(regWeb); 
        // return
        
          for (let j = 0; j < regWeb.length; j++) {
            try {
                const web = regWeb[j];  
                // console.log(web);
                // return          
                const getActiveF = await axios.post(
                web.websiteurl + "/api/"+ web.endpoint +"?eventId=" + eventId);
                for (let i = 0; i < getActiveF.data.length; i++) {
                    const element = getActiveF.data[i];
                // console.log("asdasda",element);
                fancyResponse.push(element)       

                    
                }
                // fancyResponse.push(getActiveF.data)       
                // console.log("asdasda",fancyResponse);
                
            } catch (error) {
                // console.log(error);                
            }
           
                            
         }  
        //  fancyResponse = [...fancyResponse] 
        //  console.log(fancyResponse);

        res.status(200).json({
            status: 1,
            result: fancyResponse
        })
      } catch (error) {
        // console.log(error);
        res.status(500).json({
            status:0,
            message: error.message

        })
      }
}



exports.rollbackfancyNewApi = async (req, res) => {
    // console.log("sss",req.body);
    // return
    try {
        // const resdata = await Resultfancy.find({ marketId: req.params.id, active: true }).lean();
        let ghj = await NewApiResult.findByIdAndDelete(req.body.id._id);
        // console.log(ghj);
        // return
        // callrollback
        // console.log(req.body);
        // let savelogs = new Resultlog({
        //     message: 'Roll Back',
        //     eventid: req.body.eventid,
        //     result: req.body.id.result,
        //     fancyname: req.body.id.fancyName,
        //     username: req.body.createdBy,
        //     type: req.body.id.type
        // });
        // await get10ApiDataAnuragBhaiFun();

        // const fnbei = await savelogs.save();
        let fancyLogs = new FancyLogs({
            eventId:req.body.id.eventId,
            fancyName:req.body.id.name,
            result:req.body.id.result,
            fancytype:req.body.id.fancytype,
            createdBy:req.body.createdBy,
            action:"Fancy has been rollbacked for all web"
          });
        //   console.log(fancyLogs);
          await fancyLogs.save();

        let resdata = req.body.id
        let eventid = resdata.eventId
        // console.log(resdata.eventId,resdata.F_id);
        const updateIsrollbackStatus = await Fancy.findOneAndUpdate({eventId:resdata.eventId,F_id:resdata.F_id},{ $set: { isRollbacked: true } },{ new: true });
        // console.log(updateIsrollbackStatus);


        Website.find().then((resp) => {
            var normal = resp.reduce(function (filtered, option) {
                if (option.type == 'Normal') {
                    var someNewValue = { name: option.websiteurl, rollback: option.rollback }
                    filtered.push(someNewValue);
                }
                return filtered;
            }, []);

            // console.log(normal);
            // return
            // var fancy1 = resp.reduce(function (filtered, option) {
            //     if (option.type == 'Fancy1') {
            //         var someNewValue = { name: option.websiteurl, rollback: option.rollback }
            //         filtered.push(someNewValue);
            //     }
            //     return filtered;
            // }, []);

            // console.log(fancy1);
            // var premium = resp.reduce(function (filtered, option) {
            //     if (option.type == 'Premium') {
            //         var someNewValue = { name: option.websiteurl, rollback: option.rollback }
            //         filtered.push(someNewValue);
            //     }
            //     return filtered;
            // }, []);


            // var Other = resp.reduce(function (filtered, option) {
            //     if (option.type == 'Other') {
            //         var someNewValue = { name: option.websiteurl, rollback: option.rollback }
            //         filtered.push(someNewValue);
            //     }
            //     return filtered;
            // }, []);

                // console.log('normal', normal);
                // return
                for (const element of normal) {
                    try {
                    rollbacksend(element.name, resdata, 'Normal', element.rollback, eventid)
                        
                    } catch (error) {
                        
                    }
                }
            
            // if (resdata.type == 'Fancy1' || resdata.type == 'JDiamondFancy1') {
            //     for (const element of fancy1) {
            //         rollbacksend(element.name, resdata, 'Fancy1', element.rollback, eventid)
            //     }
            // }
            // if (resdata.type == 'Premium') {
            //     for (const element of premium) {
            //         rollbacksend(element.name, resdata, 'Premium', element.rollback, eventid)
            //     }
            // }

            // if (resdata.type == 'PremiumNew') {
            //     for (const element of premium) {
            //         rollbacksend(element.name, resdata, 'Premium', element.rollback, eventid)
            //     }
            // }

            // if (resdata.type == 'Other') {
            //     for (const element of Other) {
            //         rollbacksend(element.name, resdata, 'Other', element.rollback, eventid)
            //     }
            // }
        });
        
        res.status(200).json({
            message: 'RollBack Successfully!!',
            status: 1
        });

    } catch (error) {
        res.status(500).json({ message: err.message });

    }
}

exports.rollbackfancyNewApiPre = async (req, res) => {
    // console.log(req.body);
    // return
    try {
        // const resdata = await Resultfancy.find({ marketId: req.params.id, active: true }).lean();
        let ghj = await NewApiResult.findByIdAndDelete(req.body.id._id);
        // console.log(ghj);
        // return
        // callrollback
        // console.log(req.body);
        // let savelogs = new Resultlog({
        //     message: 'Roll Back',
        //     eventid: req.body.eventid,
        //     result: req.body.id.result,
        //     fancyname: req.body.id.fancyName,
        //     username: req.body.createdBy,
        //     type: req.body.id.type
        // });
        // await get10ApiDataAnuragBhaiFun();

        // const fnbei = await savelogs.save();

        let resdata = req.body.id
        let eventid = resdata.eventId

        Website.find().then((resp) => {
            var premium = resp.reduce(function (filtered, option) {
                if (option.type == 'Premium') {
                    var someNewValue = { name: option.websiteurl, rollback: option.rollback }
                    filtered.push(someNewValue);
                }
                return filtered;
            }, []);

            // console.log(normal);
            // return
            // var fancy1 = resp.reduce(function (filtered, option) {
            //     if (option.type == 'Fancy1') {
            //         var someNewValue = { name: option.websiteurl, rollback: option.rollback }
            //         filtered.push(someNewValue);
            //     }
            //     return filtered;
            // }, []);

            // console.log(fancy1);
            // var premium = resp.reduce(function (filtered, option) {
            //     if (option.type == 'Premium') {
            //         var someNewValue = { name: option.websiteurl, rollback: option.rollback }
            //         filtered.push(someNewValue);
            //     }
            //     return filtered;
            // }, []);


            // var Other = resp.reduce(function (filtered, option) {
            //     if (option.type == 'Other') {
            //         var someNewValue = { name: option.websiteurl, rollback: option.rollback }
            //         filtered.push(someNewValue);
            //     }
            //     return filtered;
            // }, []);

                // console.log('normal', normal);
                // return
                // for (const element of normal) {
                //     rollbacksend(element.name, resdata, 'Normal', element.rollback, eventid)
                // }
            
            // if (resdata.type == 'Fancy1' || resdata.type == 'JDiamondFancy1') {
            //     for (const element of fancy1) {
            //         rollbacksend(element.name, resdata, 'Fancy1', element.rollback, eventid)
            //     }
            // }
            if (resdata.type == 'Premium') {
                for (const element of premium) {
                    rollbacksendPre(element.name, resdata, 'Premium', element.rollback, eventid)
                }
            }

            // if (resdata.type == 'PremiumNew') {
            //     for (const element of premium) {
            //         rollbacksend(element.name, resdata, 'Premium', element.rollback, eventid)
            //     }
            // }

            // if (resdata.type == 'Other') {
            //     for (const element of Other) {
            //         rollbacksend(element.name, resdata, 'Other', element.rollback, eventid)
            //     }
            // }
        });
        res.status(200).json({
            message: 'RollBack Successfully!!',
            status: 1
        });

    } catch (error) {
        res.status(500).json({ message: err.message });

    }
}

function rollbacksendPre(url, body, type, rollback, eventid) {
    // console.log(url, body, type, rollback, eventid);
    // return
    let headers = { 'Content-Type': 'application/json' }

    let sendnormal
    // if (type == 'Normal') {
    //     // ?fancyid = 31161405 - 216.FY
    //     sendnormal = url + '/api/' + rollback + '?fancyid=' + eventid + '-' + body.F_id + '.FY'
    // }
    // console.log(sendnormal);
    // return

    // axios.post(sendnormal, { headers: { 'Content-Type': 'application/json' } })
    // http://bethonk.com/api/rollbackCommonFancy1Result?fancyid=31161405-216.FY -> fancy1
    // let sendfancy1
    // if (type == 'Fancy1') {
    //     // ?fancyid = 31161405 - 216.FY
    //     sendfancy1 = url + '/api/' + rollback + '?fancyid=' + eventid + '-' + body.runnerId + '.FY'
    // }
    // axios.post(sendfancy1, { headers: { 'Content-Type': 'application/json' } })
    // http://bethonk.com/api/rollbackCommonPremFancyResult?fancyid=31161405-216.FY - > Premium
    let sendPremium
    if (type == 'Premium') {
        // ?fancyid = 31161405 - 216.FY
        sendPremium = url + '/api/' + rollback + '?fancyid=' + body.fancyid
    }
    // console.log('sendPremium', sendPremium);
    axios.post(sendPremium, { headers: { 'Content-Type': 'application/json' } })

    // let sendOther
    // if (type == 'Other') {
    //     sendOther = url + '/api/' + rollback + '?fancyid=' + body.runnerId
    // }
    // // console.log('sendOther', sendOther);
    // axios.post(sendOther, { headers: { 'Content-Type': 'application/json' } })
}


function rollbacksend(url, body, type, rollback, eventid) {
    // console.log(url, body, type, rollback, eventid);
    // return
    let headers = { 'Content-Type': 'application/json' }

    let sendnormal
    if (type == 'Normal') {
        // ?fancyid = 31161405 - 216.FY
        sendnormal = url + '/api/' + rollback + '?fancyid=' + eventid + '-' + body.F_id + '.FY'
    }
    // console.log(sendnormal);
    // return

    axios.post(sendnormal, { headers: { 'Content-Type': 'application/json' } })
    // http://bethonk.com/api/rollbackCommonFancy1Result?fancyid=31161405-216.FY -> fancy1
    // let sendfancy1
    // if (type == 'Fancy1') {
    //     // ?fancyid = 31161405 - 216.FY
    //     sendfancy1 = url + '/api/' + rollback + '?fancyid=' + eventid + '-' + body.runnerId + '.FY'
    // }
    // axios.post(sendfancy1, { headers: { 'Content-Type': 'application/json' } })
    // http://bethonk.com/api/rollbackCommonPremFancyResult?fancyid=31161405-216.FY - > Premium
    // let sendPremium
    // if (type == 'Premium') {
    //     // ?fancyid = 31161405 - 216.FY
    //     sendPremium = url + '/api/' + rollback + '?fancyid=' + body.runnerId
    // }
    // // console.log('sendPremium', sendPremium);
    // axios.post(sendPremium, { headers: { 'Content-Type': 'application/json' } })

    // let sendOther
    // if (type == 'Other') {
    //     sendOther = url + '/api/' + rollback + '?fancyid=' + body.runnerId
    // }
    // // console.log('sendOther', sendOther);
    // axios.post(sendOther, { headers: { 'Content-Type': 'application/json' } })
}


exports.checkallwebsiteresultdoneornot = async (req, res) => {
    try {
        // console.log(req.body);
        let allwebsite = await getallwebsite(); 
        let filtereddata = allwebsite.map((m) => (m.websiteurl))
        let senddata = []
        for (let i = 0; i < filtereddata.length; i++) {
            const singlewebsite = filtereddata[i];
            // console.log(singlewebsite);
            let data = await getResultAndOpen(singlewebsite + '/api/getFancyStatus?fancyId=' + req.body.data.eventId + '-' +  req.body.data.F_id + '.FY')
            // let { data } = await axios.post(singlewebsite + '/api/getFancyStatus?fancyId=' + req.body.data.runnerId).then(res => res).catch(err => err);
            // console.log("da",data);
            if (data) senddata.push(data)
        }
        let openstatus = senddata.filter((e) => (e.status == 'OPEN'))
        // console.log(senddata);
        res.status(200).json({
            status: 1,
            data: openstatus
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            status: 0,
            message: error
        })
    }
}

async function getResultAndOpen(url) {
    // console.log("sdasda",url);
    let data = await axios.post(url).then(res => res).catch(err => err);
    return (data.status == 200) ? data.data : []
}


// exports.againSendResultallWebsite = async (req, res) => {
//     try {
//         // console.log(req.body);
//         const { data, pendingresult } = req.body
//         if (data.type == 'Premium' || data.type == 'Other') {
//             let endp = data.type == 'Premium' ? 'setPremFancyResultThreadCommon' : 'setOtherFancyResultThreadCommon'
//             for (let i = 0; i < pendingresult.length; i++) await sendpremiumAgain(pendingresult[i].url + '/api/' + endp + '?id=' + data.runnerId + '&eventid=' + data.eventId + '&winner=' + +data.result.split(' ')[0]);
//         }
//         if (data.type == 'diamond' || data.type == 'Diamond' || data.type == 'Virtual' || data.type == 'Sky' || data.type == 'WorldNormal') for (const element of pendingresult) await sendpremiumAgain(element.url + '/api/setFancyResultThreadCommon' + '?id=' + data.runnerId + '&eventid=' + data.eventId + '&winner=' + +data.result);
//         if (data.type == 'Fancy1' || data.type == 'WorldF1' || data.type == 'JDiamondFancy1') for (const element of pendingresult) await sendpremiumAgain(element.url + '/api/setFancy1ResultThreadCommon' + '?id=' + data.runnerId + '&eventid=' + data.eventId + '&winner=' + +data.result);
//         if (data.type == 'Sky3' || data.type == 'sk' || data.type == 'Sk') for (const element of pendingresult) await sendpremiumAgain(element.url + '/api/setFancyResultThreadCommon' + '?id=' + data.runnerId + '&eventid=' + data.eventId + '&winner=' + +data.result)

//         res.status(200).json({
//             status: 1,
//             message: 'Result Successfully!!'
//         })
//     } catch (error) {
//         res.status(500).json({
//             status: 0,
//             message: error
//         })
//     }
// }

exports.againSendResultallWebsite = async (req, res) => {
    try {
        // console.log(req.body);
        const { data, pendingresult } = req.body       
        const type = data.fancytype
        // console.log(type);
        if (type == 'Premium' || type == 'Other') {
            let endp = type == 'Premium' ? 'setPremFancyResultThreadCommon' : 'setOtherFancyResultThreadCommon'
            for (let i = 0; i < pendingresult.length; i++) await sendpremiumAgain(pendingresult[i].url + '/api/' + endp + '?id=' +data.eventId+"-"+ data.F_id + '.FY&eventid=' + data.eventId + '&winner=' + +data.result.split(' ')[0]);
        }
        if (type == 'Diamond' || type == 'diamond' || type == 'Virtual' || type == 'Sky' || type == 'WorldNormal') {
            for (let j = 0; j < array.pendingresult; j++) {
                const element1 = pendingresult[j];
                await sendpremiumAgain(element1.url + '/api/setFancyResultThreadCommon' + '?id=' +data.eventId+"-"+ data.F_id + '.FY&eventid=' + data.eventId + '&winner=' + +data.result);
                
            }
            // for (const element of pendingresult) await sendpremiumAgain(element.url + '/api/setFancyResultThreadCommon' + '?id=' + data.F_id + '&eventid=' + data.eventId + '&winner=' + +data.result);
        }
        if (type == 'Fancy1' || type == 'WorldF1' || type == 'JDiamondFancy1'){
            for (let k = 0; k < pendingresult.length; k++) {
                const element2 = pendingresult[k];
                await sendpremiumAgain(element2.url + '/api/setFancy1ResultThreadCommon' + '?id=' +data.eventId+"-"+ data.F_id + '.FY&eventid=' + data.eventId + '&winner=' + +data.result);
            }
            //  for (const element of pendingresult) await sendpremiumAgain(element.url + '/api/setFancy1ResultThreadCommon' + '?id=' + data.F_id + '&eventid=' + data.eventId + '&winner=' + +data.result);
            }
        if (type == 'Sky3' || type == 'sk' || type == 'Sk'){ 
            // console.log(type);

            for (let n = 0; n < pendingresult.length; n++) {
                const element3 = pendingresult[n];
                await sendpremiumAgain(element3.url + '/api/setFancyResultThreadCommon' + '?id=' +data.eventId+"-"+ data.F_id + '.FY&eventid=' + data.eventId + '&winner=' + +data.result);
            }
            // for (const element of pendingresult)  await sendpremiumAgain(element.url + '/api/setFancyResultThreadCommon' + '?id=' + data.F_id + '&eventid=' + data.eventId + '&winner=' + +data.result);
        }
        
        res.status(200).json({
            status: 1,
            message: 'Result Successfully!!'
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            status: 0,
            message: error
        })
    }
}

async function sendpremiumAgain(sendpremium) {
    // console.log(sendpremium);
    // return
    axios.post(sendpremium, { headers: { 'Content-Type': 'application/json' } })
        .then((resp) => {
            // console.log(resp.data);
        }).catch(function (error) {
            // console.log(error);
        })
}

exports.setmanualResultPendingpage = async(req,res) =>{   
// console.log("guyfytdyt",req.body);
// return
    var AblockStatus = false;
    try {
        let allBlockStatus = await Block.find().lean();
    if (allBlockStatus.length > 0) {
      AblockStatus = allBlockStatus[0].blockStatus;
    }
    
    let { F_id, eventId,fancytype,result,name ,createdBy} = req.body
    let fancyLogs = new FancyLogs({
        eventId:eventId,
        fancyName:name,
        result:result,
        fancytype:fancytype,
        createdBy:createdBy,
        action:"Set Manual Result"
      });
    //   console.log(fancyLogs);
      await fancyLogs.save();
    const webSiteList = await Website.find()
    // console.log("1",fancytype);
    try {
        fancytype = fancytype.trim()
        if(fancytype == 'diamond'){
            fancytype = 'Diamond'
            // console.log("2",fancytype);
        }else if( fancytype == 'sk' || fancytype == 'Sk'){
            fancytype = 'Sky3'
    
        }else if(fancytype == 'tiger'){
            fancytype = 'Tiger'
        }
    } catch (error) {
        console.log(error);
    }
   
    // console.log("3",fancytype);
    let fancy = await Fancy.find({F_id,eventId,fancytype}).lean();
    // console.log(fancy);
    // return
    if(fancy.length == 0){
       
        let addFancy = {
            F_id:  F_id,
            name: name,
            type_code: "1",
            odd_type: "RUNS",
            eventId: eventId,
            result: result,
            is_result: true,
            fancytype: fancytype,
          };

          await Fancy.insertMany(addFancy);
    }
    fancy = await Fancy.find({F_id,eventId,fancytype}).lean();
    // console.log(fancy);
    // return
    if(fancy.length > 0){
        let fancyObj = await Fancy.findOneAndUpdate(
          {
            eventId: eventId,
            F_id: F_id,
            fancytype: fancytype,
          },
          { $set: { is_result: true , result:result} },
          { new: true }
        );
        // console.log("55",fancyObj);
        // return
        // let fancyObj = fancy[0]
        for (let j = 0; j < webSiteList.length; j++) {
            const web = webSiteList[j];
            try {
                if(fancyObj.fancytype == 'Tiger'){
                    if(fancyObj.result != null && fancyObj.result != "-1"){
                        if (fancyObj.odd_type == "RUNS" && web.type == "Normal") {
                            let sendnormalend =
                              web.websiteurl +
                              "/api/" +
                              web.endpoint +
                              "?id=" +
                              fancyObj.eventId +
                              "-" +
                              fancyObj.F_id +
                              ".FY&eventid=" +
                              fancyObj.eventId +
                              "&winner=" +
                              +fancyObj.result;
                            
                            sendResult(sendnormalend, AblockStatus, web.autoResult);
                          }
                    }
                }else if(fancyObj.fancytype == 'Diamond'){
                    if (fancyObj.result != null && fancyObj.result != "-1") {
                        if (fancyObj.odd_type == "RUNS" && web.type == "Normal") {
                          let sendnormalend =
                            web.websiteurl +
                            "/api/" +
                            web.endpoint +
                            "?id=" +
                            fancyObj.eventId +
                            "-" +
                            fancyObj.F_id +
                            ".FY&eventid=" +
                            fancyObj.eventId +
                            "&winner=" +
                            +fancyObj.result;
                          sendResult(sendnormalend, AblockStatus, web.autoResult);
                        }
                      }
                }else if(fancyObj.fancytype == 'Sky3'){
                    if (fancyObj.result != null && fancyObj.result != "-1") {
                        if (fancyObj.odd_type == "RUNS" && web.type == "Normal") {
                          let sendnormalend =
                            web.websiteurl +
                            "/api/" +
                            web.endpoint +
                            "?id=" +
                            fancyObj.eventId +
                            "-" +
                            fancyObj.F_id +
                            ".FY&eventid=" +
                            fancyObj.eventId +
                            "&winner=" +
                            +fancyObj.result;
                          sendResult(sendnormalend, AblockStatus, web.autoResult);
                        }
                      }
                }
            } catch (error) {
                console.log("2",error);
            }
           
        }  
        res.status(200).json({
            status:1,
            message:'Result Set successfully'

        })    

    }else{
        
        res.status(200).json({
            status:0,
            message:'Fancy not Avaliable'

        })
    }
    } catch (error) {
        console.log("1",error);

        res.status(200).json({
            status:0,
            message:'Fancy not Avaliable'

        })
    }

    
  }

  exports.suspendResultPending = async(req,res)=>{
    try {
        let { F_id, eventId,fancytype,name ,createdBy} = req.body
        // console.log(eventId,F_id,fancytype,name);
        // return
        const webSiteList = await Website.find().lean();
        try {
            fancytype = fancytype.trim()
            if(fancytype == 'diamond'){
                fancytype = 'Diamond'
                // console.log("2",fancytype);
            }else if( fancytype == 'sk' || fancytype == 'Sk'){
                fancytype = 'Sky3'
        
            }else if(fancytype == 'tiger'){
                fancytype = 'Tiger'
            }
        } catch (error) {
            // console.log(error);
        }

        let fancyLogs = new FancyLogs({
            eventId:eventId,
            fancyName:name,
            fancytype:fancytype,
            createdBy:createdBy,
            action:"Suspend pending"
          });
        //   console.log(fancyLogs);
          await fancyLogs.save();
        
        let fancy = await Fancy.find({F_id,eventId,fancytype}).lean();  

        if(fancy.length == 0){
       
            let addFancy = {
                F_id:  F_id,
                name: name,
                type_code: "1",
                odd_type: "RUNS",
                eventId: eventId,
                result: "-1",
                is_result: true,
                fancytype: fancytype,
              };
    
              await Fancy.insertMany(addFancy);
        }
        
        fancy = await Fancy.find({F_id,eventId,fancytype}) 
        
        if(fancy.length > 0){
            let dbFancy = fancy[0]
            for (let i = 0; i < webSiteList.length; i++) {
                const web = webSiteList[i];
                try {
                    suspendResult(dbFancy,web)
                } catch (error) {
                    
                }
                
            }
            res.status(200).json({
                status:1,
                message:'Fancy suspended successfully'
    
            })
        }
    
    } catch (error) {
        res.status(200).json({
            status:0,
            message:'Fancy not Avaliable'

        })
    }
}

exports.getResultStatus = async(req,res)=>{    
    try {
        // console.log(req.body);        
        const { eventid, type} = req.body
        let allwebsite = req.body.allwebsite
        // console.log(allwebsite);
        // let allwebsite = await getallwebsite(); 
        // let filtereddata = allwebsite.map((m) => m)
        // console.log(allwebsite);
        // return
        let senddata = []   
        // var senddata1 = []     
           
        // let data = getResultStatus(eventId, type, filtereddata)  
        // for(const key of allwebsite){
        //     console.log(key.websiteurl);
        // }     
        for (const singlewebsite of allwebsite) {
            try {
                // const singlewebsite = filtereddata[i];
            // console.log("abcd",singlewebsite.websiteurl);
            // let data = getResultStatus(eventId, type, singlewebsite)
            let sign = createSign({ eventid, type });
            // console.log(sign);
            await Promise.all([sign]).then(async (value) => {
                let body = { eventid, type }
                let url =  singlewebsite.websiteurl + '/api/CommonGameStatus' 
                // console.log(body,"  ",url);              
                await axios.post(url, body, {
                    headers: {
                        'signature': value[0]
                    }
                })
                .then((resp) => {
                    // console.log("dsada",resp.data);
                    let resPP = resp.data
                    if(resPP.length > 0){
                        for (let i = 0; i < resPP.length; i++) {
                            const element = resPP[i];
                            element.web = singlewebsite.websiteurl
                            element.blankBet = ""
                            element.websitename = singlewebsite.websitename
                            senddata.push(element) 
                        }
                    }else{
                        var webLeft = {}
                        webLeft.web = singlewebsite.websiteurl
                        webLeft.liabSettled = true
                        webLeft.betSettled = true
                        webLeft.blankBet = "BLANK"
                        webLeft.websitename = singlewebsite.websitename
                        senddata.push(webLeft)
                    }
                   
                }).catch((e) => {
                    // console.log(e);
                }); 
                    
            //  console.log("da1",senddata); 
                      
            })
            //  console.log("da",senddata);
            // senddata.push(senddata)
             
            
            } catch (error) {
                // console.log(error);
            }
            
            
        }
        // return
        let openstatus = senddata.filter((e) => (e.status == 'OPEN'))
        // console.log("abc",senddata);
        res.status(200).json({
            status: 1,
            data: senddata
        }) 
       
    } catch (error) {
        // console.log(error);
        res.status(500).json({
            status: 0,
            message: error
        })
    }
}

// exports.getResultStatus = async(req,res)=>{    
//     try {
//         // console.log(req.body);
//         const { eventid, type } = req.body
//         // console.log(eventid);
//         let allwebsite = await getallwebsite(); 
//         let filtereddata = allwebsite.map((m) => (m.websiteurl))
//         // console.log(allwebsite);
//         let senddata = []   
//         // var senddata1 = []     
           
//         // let data = getResultStatus(eventId, type, filtereddata)       
//         for (let i = 0; i < filtereddata.length; i++) {
//             try {
//                 const singlewebsite = filtereddata[i];
//             // console.log("abcd",singlewebsite);
//             // let data = getResultStatus(eventId, type, singlewebsite)
//             let sign = createSign({ eventid, type });
//             // console.log(sign);
//             await Promise.all([sign]).then(async (value) => {
//                 let body = { eventid, type }
//                 let url =  singlewebsite + '/api/CommonGameStatus' 
//                 // console.log(body,"  ",url);              
//                 await axios.post(url, body, {
//                     headers: {
//                         'signature': value[0]
//                     }
//                 })
//                 .then((resp) => {
//                     // console.log("dsada",resp.data);
//                     let resPP = resp.data
//                     if(resPP.length > 0){
//                         for (let i = 0; i < resPP.length; i++) {
//                             const element = resPP[i];
//                             element.web = singlewebsite
//                             senddata.push(element) 
//                         }
//                     }else{
//                         var webLeft = {}
//                         webLeft.web = singlewebsite
//                         webLeft.liabSettled = true
//                         webLeft.betSettled = true
//                         senddata.push(webLeft)
//                     }
                   
//                     // let array2 = [{web:singlewebsite}]
//                     // return
//                     // resPP = resPP
//                 // if (resPP) senddata.push(resPP)   
//                 // return senddata                                          
//                 }).catch((e) => {
//                     console.log(e);
//                 }); 
                    
//             //  console.log("da1",senddata); 
                      
//             })
//             //  console.log("da",senddata);
//             // senddata.push(senddata)
             
//             // let data = await axios.post(singlewebsite + '/api/CommonGameStatus').then(res => res).catch(err => err);
//             // let { data } = await axios.post(singlewebsite + '/api/getFancyStatus?fancyId=' + req.body.data.runnerId).then(res => res).catch(err => err);
            
//             } catch (error) {
//                 // console.log(error);
//             }
            
            
//         }
//         // return
//         let openstatus = senddata.filter((e) => (e.status == 'OPEN'))
//         // console.log("abc",senddata);
//         res.status(200).json({
//             status: 1,
//             data: senddata
//         }) 
       
//     } catch (error) {
//         console.log(error);
//         res.status(500).json({
//             status: 0,
//             message: error
//         })
//     }
// }

// async function getResultStatus(eventId,type,wesinglewebsiteb) { 
//     console.log("function",wesinglewebsiteb);  
//     // return
   
//     let sign = createSign({ eventId, type });
  
//     Promise.all([sign]).then(async (value) => {
//         let body = { eventId, type }
//         let url =  web.websiteurl + '/api/CommonGameStatus' 
       
//         await axios.post(url, body, {
//             headers: {
//                 'signature': value[0]
//             }
//         }).then((resp) => {
//             console.log(resp.data);
//         }).catch((e) => {
//             console.log(e);
//         });
//     })
//     }

exports.wrongSettled = async(req,res)=>{
    // console.log(req.body);
    // return
    const {eventId,F_id, fancytype} = req.body
    // console.log(eventId);
    // return
    try {
        let fancyLogs = new FancyLogs({
            eventId:req.body.eventId,
            fancyName:req.body.name,            
            fancytype:req.body.fancytype,
            createdBy:req.body.createdBy,
            action:"WrongSettled"
          });
        //   console.log(fancyLogs);
          await fancyLogs.save();
        const updatewrongsettledStatus = await Fancy.findOneAndUpdate({eventId,F_id,fancytype},
            { $set: { isWorngsettled: true } },
            { new: true })
            // console.log(updatewrongsettledStatus);
        res.status(200).json({
            status: 1,
            
        }) 
    } catch (error) {
        res.status(500).json({
            status: 0,
            message: error
        })
    }
}

exports.getwrongSettled = async(req,res)=>{
    const eventId = req.body.eventId
    try {
        const getwrongSettled = await Fancy.find({eventId,isWorngsettled:true}).lean();
        // console.log(getwrongSettled);
        res.status(200).json({
            status: 1,
            data:getwrongSettled
        }) 
    } catch (error) {
        res.status(500).json({
            status: 0,
            message: error
        })
    }
}

exports.getrollBackedFancy = async(req,res)=>{
    const eventId = req.body.eventId
    try {
        const getwrongSettled = await Fancy.find({eventId,isRollbacked:true}).lean();
        // console.log(getwrongSettled);
        res.status(200).json({
            status: 1,
            data:getwrongSettled
        }) 
    } catch (error) {
        res.status(500).json({
            status: 0,
            message: error
        })
    }
}

exports.storeBlockedWeb = async(req,res)=>{
    
    let blockedweb = '';
    try {
        
        // const responRed = JSON.parse(await aget('matchintoRedis')) || [];
        const response = await Match.find({eventId:req.body.eventId})
        // console.log("asdasd",response[0].eventId);
        // return
        if(req.body.autoResult == true){
        if(response[0].blockedWeb == undefined || response[0].blockedWeb == '' || response[0].blockedWeb == ""){
             blockedweb = req.body.blockedWeb 
             const updateBlockedWeb = await Match.findOneAndUpdate({eventId:req.body.eventId},{$set:{blockedWeb:blockedweb}},{new:true});

        }else{
            
            if(!response[0].blockedWeb.includes(req.body.blockedWeb)){
                // console.log(true);
                // return
                blockedweb = response[0].blockedWeb  + "," + req.body.blockedWeb
                const updateBlockedWeb = await Match.findOneAndUpdate({eventId:req.body.eventId},{$set:{blockedWeb:blockedweb}},{new:true});

            }
        }
    }else{
        // console.log(response[0].blockedWeb.split(","));
        const storedWeb = response[0].blockedWeb.split(",")
        const ab = storedWeb.filter((dt)=>dt != req.body.blockedWeb)
        blockedweb = blockedweb.concat(ab)
        const updateBlockedWeb = await Match.findOneAndUpdate({eventId:req.body.eventId},{$set:{blockedWeb:blockedweb}},{new:true});
        
        res.status(200).json({
            status: 1,
            
        }) 
        
    }
        
        // return
        
    } catch (error) {
        // console.log(error);
        res.status(500).json({
            status: 0,
            
        }) 
    }
}

// exports.getblockedweb = async(req,res)=>{
    
//     try {
//         const blockedweb = await Match.findOne({eventId:req.body.eventId}).lean();
//         // console.log(blockedweb.blockedWeb);
//         res.status(200).json({
//             status: 1,
//             data:blockedweb.blockedWeb
//         }) 
//     } catch (error) {
//         res.status(500).json({
//             status: 0,
//             message: error
//         })
//     }
// }

exports.getblockedweb = async(req,res)=>{
    let onlyMatch = [];
    let updateWeb
    try {
        let blockedweb = await Match.findOne({eventId:req.body.eventId}).lean();
        // console.log("sadad",blockedweb);        
        let allWeb = await Website.find().lean();
        let m = allWeb.filter((a,i) => allWeb.findIndex((s) => a.websiteurl == s.websiteurl) === i)
        // console.log(m);
        for (const item of m) {            
            if(blockedweb.blockedWeb?.includes(item.websiteurl)){
                //  item.blockedMatch == true   
                 updateWeb = await Website.findOneAndUpdate({websiteurl:item.websiteurl},{ $set: { blockedMatch:true} },{new:true})             
            }else{
                //  item.blockedMatch == false
                 updateWeb = await Website.findOneAndUpdate({websiteurl:item.websiteurl},{ $set: { blockedMatch:false} },{new:true})             

            }
            onlyMatch.push(updateWeb)
            // console.log(onlyMatch);

        }
        res.status(200).json({
            status:1,
            result:onlyMatch
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            status: 0,
            message: error
        })
    }
  }

  exports.getFancyByF_id = async (req, res) => {      
    const {eventId,F_id} = req.body 
    // console.log(req.body );
    // return
    try {     
        const fancyData = await Fancy.find({eventId,F_id}).lean();
        res.status(200).json({
            fancyData: fancyData,
            status: 1,
        });
    } catch (error) {
        res.json({
            error: "No data found",
            status: 0,
        });
    }
};

exports.rollbackfancyNewApisingleWeb = async (req, res) => {
    // console.log("sss",req.body);
    // return
    try {
        // const resdata = await Resultfancy.find({ marketId: req.params.id, active: true }).lean();
        let ghj = await NewApiResult.findByIdAndDelete(req.body.id._id);
        // console.log(ghj);
        // return
        // callrollback
        // console.log(req.body);
        // let savelogs = new Resultlog({
        //     message: 'Roll Back',
        //     eventid: req.body.eventid,
        //     result: req.body.id.result,
        //     fancyname: req.body.id.fancyName,
        //     username: req.body.createdBy,
        //     type: req.body.id.type
        // });
        // await get10ApiDataAnuragBhaiFun();

        // const fnbei = await savelogs.save();
        let fancyLogs = new FancyLogs({
            eventId:req.body.eventid,
            fancyName:req.body.id.name,
            result:req.body.id.result,
            fancytype:req.body.id.fancytype,
            createdBy:req.body.createdBy,
            action:"Roll Back"
          });
        //   console.log(fancyLogs);
          await fancyLogs.save();

        let resdata = req.body.id
        let eventid = resdata[0].eventId
        let websiteurl = req.body.websiteUrl
        // console.log(resdata[0].name);
        const updateIsrollbackStatus = await Fancy.findOneAndUpdate({eventId:resdata[0].eventId,F_id:resdata[0].F_id},{ $set: { isRollbacked: true } },{ new: true });
        // console.log(updateIsrollbackStatus);
        const findwebRollback = await Website.findOne({websiteurl:websiteurl,type:"Normal"}).lean();        
        // console.log("dssds",findwebRollback.rollback);           
              
                    try {
                    rollbacksend(websiteurl, resdata[0], 'Normal', findwebRollback.rollback, eventid)                        
                    } catch (error) {
                        
                    }
                
            
           
        
        res.status(200).json({
            message: 'RollBack Successfully!!',
            status: 1
        });

    } catch (error) {
        res.status(500).json({ message: error.message });

    }
}

exports.rollbackfancyNewApiselectedweb = async (req,res)=>{
    // console.log(req.body.createdBy);
    // return
    try {
        let fancyLogs = new FancyLogs({
            eventId:req.body.fancyData[0].eventId,
            fancyName:req.body.fancyData[0].name,
            result:req.body.fancyData[0].result,
            fancytype:req.body.fancyData[0].fancytype,
            createdBy:req.body.createdBy,
            action:"Roll Back"
          });
        //   console.log(fancyLogs);
          await fancyLogs.save();
        let weburl = req.body.webdata;
        let fancyData = req.body.fancyData;
        let eventid = fancyData[0].eventId
        const updateIsrollbackStatus = await Fancy.findOneAndUpdate({eventId:fancyData[0].eventId,F_id:fancyData[0].F_id},{ $set: { isRollbacked: true } },{ new: true });
    //    console.log(updateIsrollbackStatus);
        let rollbackfind
        weburl = weburl.map((dt)=> dt.web)
        // console.log(weburl);
        for (const web of  weburl) {
            // console.log(web);
        rollbackfind = await Website.find({websiteurl:web,type:"Normal"}).lean();
        for (const filteredweb of rollbackfind) {
        // console.log(filteredweb.websiteurl,"sds",filteredweb.rollback);
            try {
                rollbacksend(filteredweb.websiteurl, fancyData[0], 'Normal', filteredweb.rollback, eventid)                        
                } catch (error) {
                    
                }
            
        }
      
        }
        res.status(200).json({
            message: 'RollBack Successfully!!',
            status: 1
        });
    } catch (error) {
        res.status(500).json({ message: error.message });

    }
}