#!/usr/bin/env node
import { createReadStream } from 'fs';
import { createServer } from 'http';
import { join } from 'path';

createServer((req, res) => {
	var stream = createReadStream(join(__dirname, 'assets', req.url));
	stream.on('error', () => {
		res.writeHead(404);
		res.end();
	});
	stream.pipe(res);
}).listen(process.env.PORT || 3000);