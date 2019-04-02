"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const http = require("http");
let app = express();
app.use(require('morgan')('dev'));
const bodyParser = require("body-parser");
const SocketServerAgent_1 = require("./SocketServerAgent");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(require('cookie-parser')());
app.use(express.static(__dirname + '/../client_dist'));
let port = 3000;
//Set up the server
let server = http.createServer(app);
server.listen(port);
server.on('error', function (error) {
    if (error.syscall !== 'listen') {
        throw error;
    }
    let bind = typeof port === 'string'
        ? 'Pipe ' + port
        : 'Port ' + port;
    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
});
server.on("listening", function onListening() {
    let addr = server.address();
    let bind = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'port ' + addr.port;
    console.info("Listening on " + bind);
});
let socketServerAgent = new SocketServerAgent_1.SocketServerAgent(server);
//# sourceMappingURL=www.js.map