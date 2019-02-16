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
    callback(request.response);
  };
};

//Wait for the window to load
window.onload = function() {
  const auth = prompt('Auth Key:'); //Prompt the user for an authentication key

  //When the user presses a key
  document.onkeydown = function(e) {
    if (e.code == 'Enter') {                 //If the key was Enter
      let data = String(prompt('Command:')); //Prompt the user for a command

      //Replace any reserved characters with their escape codes
      data = data.split('').map(c => {
        return c
          .replace('+', '%2B');

      }).join('');

      //Make an AJAX request to issue the command
      new AJAXReq('POST', `auth=${auth}&type=COMMAND&data=${data}`, function(data) {
        alert(data);
      });
    } 
  }
};