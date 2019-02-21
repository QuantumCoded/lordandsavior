const crypto = require('crypto');      //Encryption/Hashing/Encoding API
const redis  = require('redis');       //Redis database API
const http   = require('http');        //Handles traffic using the HTTP protocol
const url    = require('url');         //Parses a url into JSON
const fs     = require('fs');          //Accesses the filesystem
const qs     = require('querystring'); //Parses the queries in the url into JSON

const port   = process.env.PORT || 80;                    //The port the HTTP server should listen on
const client = redis.createClient(process.env.REDIS_URL); //The redis API client

//Shutdown if the redis client can't connect (should automatically resolve)
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

//Check if the redis database is online
const redisUnvailable = function(res) {
  //Validating database integrity
  client.ping(function(error, rep) {
    //If the server has an error respond with internal server error
    if (error) {
      res.writeHead(500, error);
      res.end('500 Internal Server Error');
      return true;
    }

    //If the database doesn't reply respon with service unavailable
    if (!rep) {
      res.writeHead(503, 'Redis server not available');
      res.end('503 Service Unavailable');
      return true;
    }
  });
}

//Start the HTTP server
new http.Server(function(req, res) {
  let req_url = url.parse(req.url);    //The request URL
  let query = qs.parse(req_url.query); //The query the request made

  //The handler for redis queries for responding to the request (console use only)
  const clientRes = function(error, rep) {
    if (error) {
      res.writeHead(500, error);
      res.end('500 Internal server error');

      return;
    }

    res.end(String(rep));
  };

  //Handle POST queries
  if (req.method == 'POST') {
    if (query.type) { //Ensure the query can be switched
      switch(query.type) {   //Decide how to hande the query

        //Handle console issued commands
        case 'COMMAND':
          //If query parameters are missing respond with bad request
          if (!query.auth || !query.data) {
            res.writeHead(400, 'Invalid query parameters');
            res.end('400 Bad Request');

            return;
          }

          if (hash(query.auth) != process.env.AUTH_KEY) {
            res.writeHead(401, 'The auth key is invalid');
            res.end('401 Unauthorized');

            return;
          }

          //Handle running the command
          if (query.data.startsWith('~')) { //If the command starts with "~" it is going to respond to the request
            try {
            eval(query.data.substring(1)); //Run everything past the "~" and let it respond
            setTimeout(function() { //Wait 3 seconds before timing out (if the code hasn't responded yet)
              if (!res.headersSent) {
                res.writeHead(408, 'Code did not respond to request');
                res.end('408 Request timed out');
              }
            }, 3000);
            } catch (error) {
              res.end(`ERROR: ${String(error)}`);
              return;
            }
          } else {
            try {
              res.end(String(eval(query.data)));  //Run the command and respond with the result
              return;
            } catch(error) {
              res.end(`ERROR: ${String(error)}`); //If there was an error respond with the error
              return;
            }
          }     
        break;

        //Handle the creation of a new user in the database
        case 'INIT_USER':
          //Convert both the username and password to lowercase (prevent duplicate account names)
          let user = query.username && query.username.toLowerCase();
          let pass = query.password && query.password.toLowerCase();

          //If query parameters are missing respond with bad request
          if (!user || !pass) {
            res.writeHead(400, 'Invalid query parameters');
            res.end('400 Bad Request');

            return;
          }

          //Respond with and error if there is a problem with the redis database
          if (redisUnvailable(res)) return;

          //Check to see if the user already exists
          client.sismember('users', user, function(error, rep) {
            if (error) {
              res.writeHead(500, error);
              res.end('500 Internal Server Error');
              
              return;
            }

            console.log(`checking if user ${user} exists in database, result is ${rep}`);
            if (rep == 1) {
              res.writeHead(400, 'The user already exists');
              res.end('400 Bad Request');

              return;
            }
          });

          //Add the user to the list of created users
          client.sadd('users', user, function(error) {
            if (error) {
              res.writeHead(500, error);
              res.end('500 Internal Server Error');

              return;
            }
          });

          //Store the hashed password into the passwords hash
          client.hset('passwords', user, hash(pass), function(error) {
            if (error) {
              res.writeHead(500, error);
              res.end('500 Internal Server Error');

              return;
            }
          });

          //Set the user's cash to 0
          client.hset('cash', user, 0, function(error) {
            if (error) {
              res.writeHead(500, error);
              res.end('500 Internal Server Error');

              return;
            }
          });

          //Set the user's influences to an empty object
          client.hset('influences', user, '{}', function(error) {
            if (error) {
              res.writeHead(500, error);
              res.end('500 Internal Server Error');

              return;
            }
          });

          res.writeHead(201, 'User created successfully');
          res.end('201 Created');

          return;
        break;

        //If the type is not supported respond with not implemented
        default:
          res.writeHead(501, 'Query type not supported');
          res.end('501 Not Implemented');

          return;
        break;
      }
    } else {
      //If the query type is not included respond with bad request
      res.writeHead(400, 'No query type provided');
      res.end('400 Bad Request');

      return;
    }
  }

  //Handle GET requests
  if (req.method == 'GET') {
    //If the request is a GET query
    if (Object.entries(query).length > 0 && typeof query.type) {
      switch(query.type) {

        //If the client is trying to request a user's data
        case 'LOAD_USER':

          //Storing the username and password to variables for convenience
          let user = query.username && query.username.toLowerCase();
          let pass = query.password && query.password.toLowerCase();

          //If query parameters are missing respond with bad request
          if (!user || !pass || user == '' || pass == '') {
            res.writeHead(400, 'Invalid query parameters');
            res.end('400 Bad Request');

            return;
          }

          //Respond with an error if the redis database is unavailable
          if(redisUnvailable(res)) return;

          //Check to make sure the user's password matches
          client.hget('passwords', user, function(error, rep) {
            if (error) {
              res.writeHead(500, error);
              res.end('500 Internal Server Error');

              return;
            }

            //If the passwords don't match respond with unauthorized
            if (hash(pass) != rep) {
              res.writeHead(401, 'The password is incorrect');
              res.end('401 Unauthorized');

              return;
            }
          });

          let cash;
          let influences;

          //Store the user's cash value to a variable cash
          client.hget('cash', user, function(error, rep) {
            if (error) {
              res.writeHead(500, error);
              res.end('500 Internal Server Error');

              return;
            }

            cash = rep;
          });

          //Store the user's influences value to a variable influences
          client.hget('influences', user, function(error, rep) {
            if (error) {
              res.writeHead(500, error);
              res.end('500 Internal Server Error');

              return;
            }

            influences = rep;
          });

          //Respond with an object containing the user's data
          res.end(JSON.stringify({cash: cash, influences: influences}));
          return;
        break;

        //If the query type is not supported respond with not implemented
        default:
          res.writeHead(501, 'Query type not supported');
          res.end('501 Not Implemented');

          return;
        break;
      }
    } else {                                                 //If the request is a GET request
      if (routes[req_url.path]) {                            //If the route has been mapped to a file
        fs.createReadStream(routes[req_url.path]).pipe(res); //Stream that file back to the client
      } else {                                               //Otherwise return a 404 error back to the client
        res.writeHead(404, 'The route is not defined', {'content-type': 'text/html'});
        fs.createReadStream('./html/404.html').pipe(res);
      }
    }
  }
}).listen(port); //Tell the server to start listening on the HTTP port