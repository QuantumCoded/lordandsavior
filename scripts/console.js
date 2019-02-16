//Send an http request using AJAX
const AJAXReq = function(method, query, encoding, callback) {
  //Use callback if encoding is undefined
  if (!callback) {
    callback = encoding;
    encoding = false;
  }

  //Initiate the request
  let request = new XMLHttpRequest();
  request.responseType = encoding || 'text';
  request.open(method, `/?${query}`);
  request.send();

  //Call the callback with the data recieved
  request.onloadend = function() {
    callback(request.response);
  };
};

window.onload = function() {
  const auth = prompt('Redis DB Auth Key');

  document.onkeydown = function(e) {
    if (e.code == 'Enter') {
      let data = String(prompt('Command:'));

      //Escape reserved characters
      data = data.split('').map(c => {
        return c
          .replace('+', '%2B');

      }).join('');

      //Send the AJAX request
      new AJAXReq('POST', `auth=${auth}&type=COMMAND&data=${data}`, function(data) {
        alert(data);
      });
    } 
  }
};