var socket = require('socket.io');
const redis = require('socket.io-redis');

var SocketSingleton = (function() {
  this.io = null;
  this.configure = function(server) {
    this.io = socket(server, {
      serveClient: true,
      cookie: false
    });
    this.io.adapter(redis({ host: '127.0.0.1', port: 6379 }));
  }
  return this;
})();

module.exports = SocketSingleton;