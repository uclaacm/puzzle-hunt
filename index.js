const express = require('express');
let server = express();

server.use(express.static('www/public'));

server.listen(3000, () => {
    console.log("Server listening on port 3000");
});