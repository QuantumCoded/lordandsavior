//Cookie Check
var image;

try {
  image = JSON.parse(document.cookie);
} catch(error) {
  //The client is not using cookies, prompt them
  console.warn('Possible parsing failure, reseting cookies');
  if (!confirm('This site uses cookies to save your progress, is this okay?'))
    location.href = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
    //Rick Roll all the scrubs that don't agree
}

//The main data object, what's stored in cookies
var data = image ||
{
  cash: 0,
  cashPerSecond: 0,
  clickValue: 1
};

window.onload = function() {
  let counter = document.getElementById('counter'); //The counter above the button
  let button = document.getElementById('button');   //The button

  //Refresh the number displayed on the counter
  var updateCash = function() {
    counter.innerHTML = `Cash: ${Math.floor(data.cash)}`;
  };  

  //When the button is clicked
  button.onclick = function() {
    updateCash(data.cash += data.clickValue);
  };

  //Main loop
  setInterval(function() {
    //Wait for the user to accept cookies before saving any
    if (!typeof data) return;

    updateCash(data.cash);
    document.cookie = JSON.stringify(data);
  }, 100);
};

