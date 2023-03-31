const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const {TOKEN_SECRET} = require("../constants/config");

router.use(function(req, res, next) {
    const authHeader = req.headers.authorization
    
    const token = authHeader
    // console.log(token);
    if (token == null) return res.status(401).send({message:"Unauthorized Request"});  
    jwt.verify(token, TOKEN_SECRET , (err, user) => {
  
      if (err) return res.status(401).send({message:"Unauthorized Request"})
      user = user  
      next()
    })
  });

  module.exports = router;