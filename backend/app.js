const express = require("express");
const app = express();
const bodyParser = require("body-parser");
let compression = require('compression');
var cors = require('cors')
const promBundle = require("express-prom-bundle");
const metricsMiddleware = promBundle({ includeMethod: true, includePath: true });
const mongoose = require('mongoose')
const axios = require("axios");
const checkAuth = require("./middleware/auth")


const matchRoutes = require("../backend/routes/matches")
const adminUserRoutes = require("../backend/routes/adminUser")
const logsRoutes = require("../backend/routes/logs")
// const url = 'mongodb://banglaautoresultuser:banglaautoresultpassword@194.195.113.139:27017/admin';
const url = 'mongodb://127.0.0.1:27017/Bangla_auto';


mongoose.connect(url, {
    // useUnifiedTopology: true,
    // useNewUrlParser: true,
    // useFindAndModify: false,
}).then(() => {
    console.log('Connected to database!');
}).catch((error) => {
    console.log(error);
    console.log('Connection failed!');
});



app.use(cors())
app.use(metricsMiddleware);
app.use(compression()); //use compression 
app.use(bodyParser.json('application/json'));
app.use(bodyParser.urlencoded({ extended: false }));

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, PUT, DELETE, OPTIONS");
    next();
});

app.get('/', (req, res) => {
    // console.log('call');
  res.status(200).json({
      status:1
  })
})  

app.get('/get/:id', async (req, res) => {
    const eventid = req.params.id
try {
    console.log(eventid);    
    const response = await axios.get("http://139.162.234.115:8880/api/fancy-list/"+eventid)
    // console.log(response.data.data)
      res.status(200).json({
      status:1,
      result:response.data
        })
} 
catch (error) {
    res.status(200).json({
        status:0,
        result:'Data not Fetched' + error
        
    })
}
})  

// app.use('/api/match',checkAuth);
app.use('/api/match', matchRoutes);
app.use('/api',adminUserRoutes);
app.use('/api/logs',logsRoutes);



module.exports = app;