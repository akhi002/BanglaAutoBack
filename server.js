const app = require("./backend/app");
const cluster = require('cluster');
var SocketSingleton = require('./backend/socket');
const http = require("http");
let numClients = 0;
const io = require('socket.io-emitter')({ host: '127.0.0.1', port: 6379 });
// require('./backend/db/mongoose')

if (cluster.isMaster) {
  let numCPUs = require('os').cpus().length;
  // console.log(numCPUs);
  for (var i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
  cluster.on('online', function (worker) {
    //console.log('Worker ' + worker.process.pid + ' is listening');
  });

  cluster.on('exit', function (worker, code, signal) {
    console.log('Worker ' + worker.process.pid + ' died with code: ' + code + ', and signal: ' + signal);
    console.log('Starting a new worker');
    cluster.fork();
  });
}
else {

  const port = 4000
  app.set("port", port);

  const server = http.createServer(app);
  SocketSingleton.configure(server);

  SocketSingleton.io.on('connection', (socket) => {
    numClients++;
    // console.log(`user connected ${socket.id}`);

    socket.on('stats', function (data) {
      socket.join("room-stats");
    });
    // SocketSingleton.io.to('room-stats/').emit('stats/', { numClients: numClients });   

    socket.on('score', function (data) {
      // console.log(data);
      socket.join("room-score/" + data);
    });
    // SocketSingleton.io.to('room-score/').emit('score/', { numClients: numClients });   
    // socket.on('result', function (data) {
    //   socket.join("room-result");
    //   // console.log('Room Created');
    // });
  
    // socket.on('destroy_room', function () {
    //   var rooms = io.sockets.adapter.sids[socket.id];
    //   for (var room in rooms) {
    //     socket.leave(room);
    //   }
    // });


    socket.on('destroy_room', function (data) {
      // console.log(data);
      var rooms = socket.adapter.sids;
      const obj = Object.fromEntries(rooms);
      let che = obj[data];
      // console.log(che);
      let d = Array.from(che);
      for (const room of d) {
        socket.leave(room);
      }
     
    });

    socket.on('disconnect',  () => {
      console.log(`Socket ${socket.id} disconnected.`);
      numClients--;
      // SocketSingleton.io.to('room-stats/').emit('stats/', { numClients: numClients });
      console.log('disconnected');
    });
  });


  
  server.listen(port,()=>{
    console.log('Server is runing at Port no: ' + port);
  });
}