const http = require('http');
const url  = require('url');
const fs   = require('fs');

const port = process.env.PORT || 80;

const routes = {
  // ./html/
  '/':           './html/index.html',

  // ./images/
  '/img-tomeo':  './images/tomeo.jpg',
  '/img-tomeo2': './images/tomeo2.png',

  // ./scripts
  '/js-main': './scripts/main.js',

  // ./styles/
  '/css-default': './styles/default.css'
};

new http.Server(function(req, res) {
  let path = url.parse(req.url).path;

  if (routes[path]) {
    fs.createReadStream(routes[path]).pipe(res);
  } else {
    fs.createReadStream('./html/404.html').pipe(res);
  }
}).listen(port);