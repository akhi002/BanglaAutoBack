var admin = require('firebase-admin');
var serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://cricflame-bsfdb.firebaseio.com"
});

var db = admin.database();
module.exports = db;