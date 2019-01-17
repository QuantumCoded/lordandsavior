const http = require('http');
const url  = require('url');
const fs   = require('fs');

var port = process.env.PORT || 80;

new http.Server(function(req, res) {
  switch(url.parse(req.url).path) {
    case '/img.jpg':
      fs.createReadStream('./image.jpg').pipe(res);
      break;

    default:
      fs.createReadStream('./page.html').pipe(res);
  }
}).listen(port);