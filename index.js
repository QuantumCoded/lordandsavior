const http = require('http');
const url  = require('url');
const fs   = require('fs');

const port = process.env.PORT || 80;

const routes = {
  // ./html/
  '/'                     : './html/index.html',
  // ./images/
  '/images/background.jpg': './images/background.jpg',
  '/images/tomeo.png'     : './images/tomeo.png',
  // ./scripts/
  '/scripts/main.js'      : './scripts/main.js',
  // ./sounds/
  '/sounds/background.mp3': './sounds/background.mp3',
  // ./styles/
  '/styles/default.css'   : './styles/default.css'
};

new http.Server(function(req, res) {
  let path = url.parse(req.url).path;

  if (routes[path]) {
    fs.createReadStream(routes[path]).pipe(res);
  } else {
    fs.createReadStream('./html/404.html').pipe(res);
  }
}).listen(port);