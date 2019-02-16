const crypto = require('crypto');
const redis  = require('redis');
const http   = require('http');
const url    = require('url');
const fs     = require('fs');
const qs     = require('querystring');
const port   = process.env.PORT || 80;

const auth   = process.env.AUTH_KEY || 'fdUlNSLPCqmjw3evPwAhkFVS+KGKgL9HSdoSAPP8Crw=';

const routes = {
  // ./html/
  '/':                './html/index.html',
  '/redis':           './html/db-console.html',

  // ./images/
  '/img-tomeo':       './images/tomeo.jpg',
  '/img-tomeo2':      './images/tomeo2.png',
  '/img-placeholder': './images/placeholder.png',

  // ./scripts
  '/js-main':         './scripts/main.js',
  '/js-shop':         './scripts/shop.js',
  '/js-console':      './scripts/console.js',

  // ./styles/
  '/css-default': './styles/default.css'
};

const hash = function(data) {
  let hash = crypto.createHash('sha256');
  hash.update(data);
  return hash.digest('base64');
};

new http.Server(function(req, res) {
  let u = url.parse(req.url);
  let q = qs.parse(u.query);

  //Handle AJAX post requests
  if (req.method == 'POST') {
    if (Object.entries(q).length != 0) {
      if (q.type && q.auth) {
        if (auth == hash(q.auth)) {
          switch(q.type) {
            case 'COMMAND':
              try {
                res.end(String(eval(q.data)));
              } catch(error) {
                res.end(`ERROR: ${String(error)}`);
              }
              break;
          }

          return;
        }
      }
    }
  }

  //Handle all defined routes
  if (routes[u.path]) {
    fs.createReadStream(routes[u.path]).pipe(res);
  } else {
    fs.createReadStream('./html/404.html').pipe(res);
  }
}).listen(port);