const FancyLogs = require("../model/fancyLogs");
const MatchLogs = require("../model/matchlogs");
const UserLogs = require("../model/userlogs");
const Limitlogs = require("../model/limitlogs");
const WebLogs = require("../model/websiteLogs");

exports.getFancySingle = async (req,res) =>{
    // console.log(req.body);
    try {
        const findFancyEvent = await FancyLogs.find({eventId:req.body.eventId}).sort({ updatedAt: -1 }).lean();
        res.status(200).json({
            status:1,
            result:findFancyEvent,
            message:'data fetched!!'
        })
    } catch (error) {
        // console.log(error);
        res.status(200).json({
            status:0,
            message:error
        })
    }
}


exports.getmtachlogs = async (req,res)=>{
    try {
        const findMatchLogs = await MatchLogs.find().sort({updatedAt: -1}).lean();
        // console.log(findMatchLogs);
        res.status(200).json({
            status:1,
            result:findMatchLogs,
            message:'data fetched!!'
        })
    } catch (error) {
        res.status(200).json({
            status:0,
            message:error
        })
    }
}

exports.getUserLogs = async (req,res) =>{
    // console.log('test');
    try {
        const finduserLogs = await UserLogs.find().sort({updatedAt:-1}).lean();
        // console.log(finduserLogs);
        res.status(200).json({
            status:1,
            result:finduserLogs,
            message:'data fetched!!'
        })
    } catch (error) {
        res.status(200).json({
            status:0,
            message:error
        })
    }
}


exports.getLimitlogs = async (req,res) =>{
    // console.log('teeee');
    try {
        const findLimitlog = await Limitlogs.find().sort({updatedAt: -1}).lean();
        // console.log(findLimitlog);
        res.status(200).json({
            status:1,
            result:findLimitlog,
            message:'data fetched!!'
        })
    } catch (error) {
        res.status(200).json({
            status:0,
            message:error
        })
    }
}

exports.getweblogs = async (req,res)=>{
    // console.log('asas');
    try {
    const findweb = await WebLogs.find().sort({updatedAt:-1}).lean();
            
        res.status(200).json({
            status:1,
            result:findweb,
            message:'data fetched!!'
        })
    } catch (error) {
        res.status(200).json({
            status:0,
            message:error
        })
    }
}