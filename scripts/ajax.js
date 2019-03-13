//Send an http request using AJAX
const AJAXReq = function(options, callback) {

  //Initiate the request
  let request = new XMLHttpRequest();                        //Create the request
  request.responseType = options.encoding || 'text';         //Set the expected respons type
  request.open(options.method, `/?${options.query || '/'}`); //Open the request using the provided method and query

  //Adding the headers to the request
  if (options.headers) {
    for (let header in options.headers) {
      request.setRequestHeader(header, options.headers[header]);
    }
  }

  request.send(); //Send the request

  //Run the callback with the data recieved
  request.onloadend = function() {
    callback(request.response, request);
  };
};