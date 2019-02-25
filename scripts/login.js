var submit; //Declaring submit to global scope

//Store a cookie and set it to expire in 30 seconds
const setCookie = function(name, value) {
  document.cookie=name + "=" + escape(value) + "; path=/; max-age=30000";
};

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
    new AJAXReq('GET', `type=MAKE_SESSION&username=${String(user.value).toLowerCase()}&password=${pass.value}`, function(data, request) {
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

          case '201 created':
            setCookie('session', escape(request.getResponseHeader('session')));
            setCookie('username', escape(user.value.toLowerCase()));

            setTimeout(function() {
              location.href = '/main';
            }, 2);
          break;

          default:
            console.warn('Unexpected response', data);
          break;
        }
      }
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