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
  if (port != 80) process.exit(); //Only shutdown if not running localy
});

//The routes of http paths to file paths
const routes = {
  // ./html/
  '/':                './html/login.html',
  '/signup':          './html/signup.html',
  '/main':            './html/main.html',
  '/console':         './html/console.html',

  // ./images/
  '/img-tomeo':       './images/tomeo.jpg',
  '/img-tomeo2':      './images/tomeo2.png',
  '/img-placeholder': './images/placeholder.png',

  // ./logs/
  '/log-changelog':   './logs/changelog.log',

  // ./scripts/
  '/js-main':         './scripts/main.js',
  '/js-shop':         './scripts/shop.js',
  '/js-console':      './scripts/console.js',
  '/js-signup':       './scripts/signup.js',
  '/js-login':        './scripts/login.js',
  '/js-ajax':         './scripts/ajax.js',

  // ./styles/
  '/css-default':     './styles/default.css',
  '/css-signup':      './styles/signup.css',
  '/css-login':       './styles/login.css'
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
      res.end('500 Internal server error');
      return true;
    }

    //If the database doesn't reply respon with service unavailable
    if (!rep) {
      res.writeHead(503, 'Redis server not available');
      res.end('503 Service unavailable');
      return true;
    }
  });
};

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
    if (query.type) {      //Ensure the query can be switched
      switch(query.type) { //Decide how to hande the query

        //Handle console issued commands
        case 'COMMAND':
          //If query parameters are missing respond with bad request
          if (!req.headers.auth || !req.headers.data) {
            res.writeHead(400, 'Invalid request headers');
            res.end('400 Bad request');

            return;
          }

          if (hash(req.headers.auth) != hash(process.env.AUTH_KEY)) {
            res.writeHead(401);
            res.end('401 Unauthorized');

            return;
          }

          //Handle running the command
          if (req.headers.data.startsWith('~')) { //If the command starts with "~" it is going to respond to the request
            try {
              eval(req.headers.data.substring(1)); //Run everything past the "~" and let it respond
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
              res.end(String(eval(req.headers.data)));  //Run the command and respond with the result
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
          user = req.headers.username && req.headers.username.toLowerCase();
          pass = req.headers.password && req.headers.password.toLowerCase();

          //If query parameters are missing respond with bad request
          if (!user || !pass) {
            res.writeHead(400, 'Invalid request headers');
            res.end('400 Bad request');

            return;
          }

          //Respond with and error if there is a problem with the redis database
          if (redisUnvailable(res)) return;

          //Check to see if the user already exists
          client.sismember('users', user, function(error, rep) {
            if (error) {
              res.writeHead(500, error);
              res.end('500 Internal server error');
              
              return;
            }

            //If the user exists respond with bad request
            if (rep) {
              res.writeHead(400, 'The user already exists');
              res.end('400 Bad request');

              return;
            }

            //Add the user to the list of created users
            client.sadd('users', user, function(error) {
              if (error) {
                res.writeHead(500, error);
                res.end('500 Internal server error');

                return;
              }
            });

            //Store the hashed password into the passwords hash
            client.hset('passwords', user, hash(pass), function(error) {
              if (error) {
                res.writeHead(500, error);
                res.end('500 Internal server error');

                return;
              }
            });

            //Set the user's cash to 0
            client.hset('cash', user, 0, function(error) {
              if (error) {
                res.writeHead(500, error);
                res.end('500 Internal server error');

                return;
              }
            });

            //Set the user's influences to an empty object
            client.hset('influences', user, '{}', function(error) {
              if (error) {
                res.writeHead(500, error);
                res.end('500 Internal server error');

                return;
              }
            });

            res.writeHead(201, 'User created successfully');
            res.end('201 Created');

            return;
          });
        break;

        //If the type is not supported respond with not implemented
        default:
          res.writeHead(501, 'Query type not supported');
          res.end('501 Not implemented');

          return;
        break;
      }
    } else {
      //If the query type is not included respond with bad request
      res.writeHead(400, 'No query type provided');
      res.end('400 Bad request');

      return;
    }
  }

  //Handle GET requests
  if (req.method == 'GET') {
    //If the request is a GET query
    if (query.type) {
      switch(query.type) {

        //If the client is trying to start a session using a login
        case 'MAKE_SESSION':

          //Storing the username and password to variables for convenience
          user = req.headers.username && req.headers.username.toLowerCase();
          pass = req.headers.password && req.headers.password.toLowerCase();

          //If query parameters are missing respond with bad request
          if (!user || !pass) {
            res.writeHead(400, 'Invalid request headers');
            res.end('400 Bad request');

            return;
          }

          //Respond with an error if the redis database is unavailable
          if(redisUnvailable(res)) return;

          //Check to see if the user exists
          client.sismember('users', user, function(error, rep) {
            if (error) {
              res.writeHead(500, error);
              res.end('500 Internal server error');
            }

            //If the user doesn't exist then respond with bad request
            if (!rep) {
              res.writeHead(400, 'User does not exist');
              res.end('400 Bad request');
            }

            //Check to make sure the user's password matches
            client.hget('passwords', user, function(error, rep) {
              if (error) {
                res.writeHead(500, error);
                res.end('500 Internal server error');

                return;
              }

              //If the passwords don't match respond with unauthorized
              if (hash(pass) != rep) {
                res.writeHead(401);
                res.end('401 Unauthorized');

                return;
              } else { //If the passwords do match
                let session = hash(user + process.env.SALT); //Get the user's session ID
                let ttl = 3600; //The number of seconds the session has before it can't be redeemed

                //Bind the session to the current user
                client.setex(session, ttl, user, function(error) {
                  if (error) {
                    res.writeHead(500, error);
                    res.end('500 Internal server error');

                    return;
                  }

                  res.writeHead(201, `Session has been started ttl=${ttl}`, {session: session});
                  res.end('201 Created');

                  return;
                });
              }
            });
          }); 
        break;

        //If the user is trying to restore their session
        case 'LOAD_SESSION':
          session = req.headers.session; //The session id requested

          //If query parameters are missing respond with bad request
          if (!session) {
            res.writeHead(400, 'Invalid request headers');
            res.end('400 Bad request');

            return;
          }

          //Respond with an error if the redis database is unavailable
          if (redisUnvailable(res)) return;

          //Validate that the session still exists
          client.exists(session, function(error, rep) {
            if (error) {
              res.writeHead(500, error);
              res.end('500 Internal server error');

              return;
            }

            //If the session has expired or hasn't been created, deny access
            if (!rep) {
              res.writeHead(401);
              res.end('401 Unauthorized');

              return;
            }

            //Validate that the user has the right session
            client.get(session, function(error, _rep) {
              if (error) {
                res.writeHead(500, error);
                res.end('500 Internal server error');

                return;
              }     

              let cash;
              let influences;

              //Store the user's cash value to a variable cash
              client.hget('cash', _rep, function(error, rep) {
                if (error) {
                  res.writeHead(500, error);
                  res.end('500 Internal server error');

                  return;
                }

                cash = rep;

                //Store the user's influences value to a variable influences
                client.hget('influences', _rep, function(error, rep) {
                  if (error) {
                    res.writeHead(500, error);
                    res.end('500 Internal server error');

                    return;
                  }

                  influences = rep;

                  //Respond with the user's data
                  res.writeHead(200, {cash: cash, influences: influences});
                  res.end();
                  return;
                });
              });
            });
          });
        break;

        //If the query type is not supported respond with not implemented
        default:
          res.writeHead(501, 'Query type not supported');
          res.end('501 Not implemented');

          return;
        break;
      }
    } else {                                                 //If the request is a GET request
      if (routes[req_url.path]) {                            //If the route has been mapped to a file
        fs.createReadStream(routes[req_url.path]).pipe(res); //Stream that file back to the client
      } else {                                               //Otherwise
        if (Object.entries(query).length > 0) {              //If the request has queries respon with bad request
          res.writeHead(400, 'Invalid  query parameters');
          res.end('400 Bad request');

          return;
        }

        //If the request is not a query respond with the 404 page
        res.writeHead(404, 'The route is not defined', {'content-type': 'text/html'});
        fs.createReadStream('./html/404.html').pipe(res);
      }
    }
  }

  //If the espond with a not implemented
  if (req.method != 'GET' && req.method != 'POST') {
    res.writeHead(501, 'Invalid request method');
    res.end('501 Not implemented');

    return;
  } //Tell the server to start listening on the HTTP port
}).listen(port, function() {
  console.log('server is running on port', port);
});

process.on('uncaughtException', function(err) {
  console.error(err);
});