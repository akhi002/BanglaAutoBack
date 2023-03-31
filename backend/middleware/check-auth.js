const jwt = require("jsonwebtoken")



module.exports = (req,res, next) => {

  try {

    // const token = req.headers.Authorization;
   const token=  req.header('Authorization')
    // console.log(token2);
    const decodedToken = jwt.verify(token, 'myNameisking');
    // req.userData = { userId:decodedToken.userId}
    console.log(decodedToken);
    if(decodedToken){
      next();
    }else{
      res.status(401).json({
        message:'you are not authenticated!',
        
      })
    }
    

  } catch (error) {
    res.status(401).json({
      message:'you are not authenticated!'
    })

  }


}
