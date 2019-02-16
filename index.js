const crypto = require('crypto');
const redis  = require('redis');
const http   = require('http');
const url    = require('url');
const fs     = require('fs');
const qs     = require('querystring');

const port   = process.env.PORT || 80;
const client = redis.createClient(process.env.REDIS_URL);

//Shutdown if the redis server is unresponsive (heroku should auto-restart and re-attempt connection)
client.on('error', function() {
  process.exit();
});

//The routes of http paths to file paths
const routes = {
  // ./html/
  '/':                './html/index.html',
  '/console':         './html/console.html',

  // ./images/
  '/img-tomeo':       './images/tomeo.jpg',
  '/img-tomeo2':      './images/tomeo2.png',
  '/img-placeholder': './images/placeholder.png',

  // ./scripts
  '/js-main':         './scripts/main.js',
  '/js-shop':         './scripts/shop.js',
  '/js-console':      './scripts/console.js',

  // ./styles/
  '/css-default':     './styles/default.css'
};

//Preform a sha256 hash on data and return the base64 digest
const hash = function(data) {
  let hash = crypto.createHash('sha256');
  hash.update(data);
  return hash.digest('base64');
};

//Validates a query to ensure propper authorization
const validateQuery = function(query) {
  if (!typeof query.auth) return false;                       //Invalid if no auth key is provided
  if (!typeof query.type) return false;                       //Invalid if no request type is provided
  if (hash(query.auth) != process.env.AUTH_KEY) return false; //Invalid the auth key is invalid
  return true;
};

new http.Server(function(req, res) {
  let req_url = url.parse(req.url);    //The request URL
  let query = qs.parse(req_url.query); //The query the request made

  //Handle post requests
  if (req.method == 'POST') {
    if (validateQuery(query)) { //Ensure the query is valid
      switch(query.type) {      //Decide how to hande the query

        //Handle console issued commands
        case 'COMMAND':
          try {
            res.end(String(eval(query.data)));  //Run the command and respond with the result
          } catch(error) {
            res.end(`ERROR: ${String(error)}`); //If there was an error, respond with the error
          }
        break;

        //If the type is not supported, respond with not implemented
        default:
          res.writeHead(501, 'Query type not supported');
          res.end('501 Not Implemented');
        break;
      }
    } else {
      //Tell the client they are unauthorized if the key is wrong
      res.writeHead(401, 'Invalid authentication token');
      res.end('401 Unauthorized');
    }
  }

  //Handle all defined routes
  if (routes[req_url.path]) {                            //If the route has been mapped to a file
    fs.createReadStream(routes[req_url.path]).pipe(res); //Stream that file back to the client
  } else {                                               //If the route has not been mapped
    fs.createReadStream('./html/404.html').pipe(res);    //Steam the 404 page back to the client
  }
}).listen(port);