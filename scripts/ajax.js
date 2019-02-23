//Send an http request using AJAX
const AJAXReq = function(method, query, encoding, callback) {
  //Use callback if encoding is undefined
  if (!callback) {
    callback = encoding;
    encoding = false;
  }

  //Initiate the request
  let request = new XMLHttpRequest();        //Create the request
  request.responseType = encoding || 'text'; //Set the expected respons type
  request.open(method, `/?${query}`);        //Open the request using the provided method and query
  request.send();                            //Send the request

  //Run the callback with the data recieved
  request.onloadend = function() {
    callback(request.response, request);
  };
};