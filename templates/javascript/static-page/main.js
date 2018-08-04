#!/usr/bin/env node

var http = require('http');

http.createServer((req, res) => {
	var stream = fs.createReadStream(path.join(__dirname, 'assets', req.url));
    stream.on('error', () => {
        res.writeHead(404);
        res.end();
    });
    stream.pipe(res);
}).listen(process.env.PORT || 3000);