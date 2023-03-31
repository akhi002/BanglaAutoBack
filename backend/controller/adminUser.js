const User = require("../model/adminUser");
const UserLogs = require("../model/userlogs");
const jwt = require("jsonwebtoken")
const {TOKEN_SECRET} = require("../constants/config");

exports.insert = async (req, res) => {
  try {
      const data = new User({
          userId: 'admin',
          role: '1',
          name: 'Admin',
          password: '12345'
      });
      const resdata = await data.save();
      res.status(500).json({
          status: 1,
          data: resdata
      })
  } catch (error) {
      res.status(500).json({
          status: 0,
          message: error.message
      })
  }
}


exports.adminLogin = async (req,res,next) =>{
  try {

    // console.log(req.body);
    // let userdata = await User.findOne({userId:req.body.userId});
    let userdata = await User.find();
    userdata = userdata.filter(ud=>{if(ud.userId == req.body.userId)return ud;})[0]
      //  console.log(userdata);
      //  return
       if(userdata){
        if(userdata.password == req.body.password ){
            // console.log(userdata);
            userdata.password = undefined
            const token = jwt.sign({result: userdata}, TOKEN_SECRET,{expiresIn:"7d"});
            // console.log(token);
            res.status(200).json({
                token:token,
                // expiresIn: 3600,
                // Id:fetchedUser._id,
                status:1,
                message:'Login Successfully'
              })
        }else{
            res.status(200).json({
                message:'Invalid Credentials',
                status:0,
                
              })
        }
       }else{
     res.status(404).json({
                  message:'Invalid Credentials',
                  status:0,
                })
       }
  } catch (error) {
    console.log(error);
      res.status(500).json({
        status:0,
        message:error
      })
  }
  
}

exports.createuser = async(req,res)=>{
  // console.log(req.body);
  // return
  try {
    const checkUser = await User.findOne({userId:req.body.form.userId.toLowerCase()});
    if(!checkUser){
      const data = User({
        userId:req.body.form.userId.toLowerCase(),
        password:req.body.form.password,
        role:"2",
        name:req.body.form.name
      });
      const resData = data.save();
      let userlogs = new UserLogs({
        userId:req.body.form.userId.toLowerCase(),
        password:req.body.form.password,
        createdBy:req.body.createdBy,
        name:req.body.form.name,
        role:data.role,         
        action:'New User has been added'
      });
      // console.log(userlogs);
      await userlogs.save();

      res.status(200).json({
        status: 1,
        data: resData
    })
    }else{
      res.status(200).json({
        status: 2,
        message: 'Username already exists!!'
    })
    }
  } catch (error) {
    res.status(500).json({
      status: 0,
      message: error.message
  })
  }
}


exports.getallusers = async(req,res)=>{
  try {
    const users = await User.find({role:2}).select({name:1,password:1,userId:1}).sort({updatedAt: -1});
    res.status(200).json({
      status: 1,
      data: users
  });
  } catch (error) {    
    res.status(500).json({
      status: 0,
      message: error.message
  });
  }
}

exports.changePwd = async (req,res) =>{
  // console.log(req.body);
  // return
  try {
    const updatePwd = await User.findByIdAndUpdate(req.body.id,{"$set":{"password":req.body.password,"change":0}},{new:true});
    let userlogs = new UserLogs({
      userId:req.body.alldata.userId.toLowerCase(),
      password:req.body.alldata.password,
      createdBy:req.body.createdBy,
      name:req.body.alldata.name,       
      action:'Password has been updated'
    });
    // console.log(userlogs);
    await userlogs.save();
    res.status(200).json({
      status: 1,
      data: updatePwd
  });
  } catch (error) {
    res.status(500).json({
      status: 0,
      message: error.message
  });
  }
}

exports.removeUser =  async (req,res) =>{
  // console.log(req.body);
  // return
  try {
    const deleteUser  = await User.findByIdAndDelete(req.body.id);
    let userlogs = new UserLogs({
      userId:req.body.item.userId.toLowerCase(),
      password:req.body.item.password,
      createdBy:req.body.createdBy,
      name:req.body.item.name,       
      action:'User has been delete'
    });
    await userlogs.save();
    res.status(200).json({
      status: 1,
      data: 'ok'
  });
  } catch (error) {
    res.status(500).json({
      status: 0,
      message: error.message
  });
  }


}

exports.checkuser = async (req, res) => {
  try {
      const resdata = await User.findById(req.body.id);
      if (resdata) {
          res.status(200).json({
              status: 1,
              message: 'Ok'
          })
      } else {
          res.status(200).json({
              status: 2,
              message: 'Wrong!!'
          })
      }

  } catch (error) {
      res.status(500).json({
          status: 0,
          message: error.message
      })
  }
}

