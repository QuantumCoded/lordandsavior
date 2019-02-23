var submit; //Declaring submit to global scope

//Wait for the page to load
window.onload = function() {
  submit = document.getElementById('submit'); //The login button
  let user = document.getElementById('user'); //The username textbox
  let pass = document.getElementById('pass'); //The password textbox
  let alert = document.getElementById('alert'); //The warning box when an error occurs

  const invalid = function() {
    alert.style.width = '13ch';
    alert.style.height ='1em';
    alert.style.padding = '4px';
    alert.style.paddingTop = '0';
  };

  //When the submit button is clicked
  submit.onclick = function() {
    //Send an AJAX request for the user's data
    new AJAXReq('GET', `type=MAKE_SESSION&username=${user.value}&password=${pass.value}`, function(data, request) {
      if (!data) {
        invalid();
        return;
      } else {
        switch(String(data).toLowerCase()) {
          case '401 unauthorized': 
            invalid();
            return;
          break;

          case '400 bad request':
            invalid();
            return;
          break;

          default:
            console.warn('Unexpected response', data);
          break;
        }
      }

      document.cookie = `session=${request.getResponseHeaders('session')};path="/"`;

      setTimeout(function() {
        location.href = '/main';
      }, 2);
    });
  };
};

//When the user presses a key
document.onkeydown = function(e) {
  //If the key is space and the submit button exists
  if (e.code == 'Enter' && submit && submit.onclick) {
    submit.onclick(); //Send the AJAX request
  }
};