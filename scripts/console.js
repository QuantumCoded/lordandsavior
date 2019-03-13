//Wait for the window to load
window.onload = function() {
  const auth = prompt('Auth Key:'); //Prompt the user for an authentication key

  //When the user presses a key
  document.onkeydown = function(e) {
    if (e.code == 'Enter') {                 //If the key was Enter
      let data = String(prompt('Command:')); //Prompt the user for a command

      //Make an AJAX request to issue the command
      new AJAXReq(
        {
          method: 'POST',
          query: 'type=COMMAND',
          headers: {
            auth: auth,
            data: data
          }
        },
        function(data) {
          alert(data);
        }
      );
    }
  }
};