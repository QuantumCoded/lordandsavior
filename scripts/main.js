var image;

try {
  image = JSON.parse(document.cookie);
} catch(error) {console.warn(error)}

var data = image ||
{
  cash: 0,
  cashPerSecond: 0,
  clickValue: 1
};

window.onload = function() {
  let counter = document.getElementById('counter');
  let button = document.getElementById('button');

  var updateCash = function() {
    counter.innerHTML = `Cash: ${Math.floor(data.cash)}`;
  };  

  button.onclick = function() {
    updateCash(data.cash += data.clickValue);
  };

  setInterval(function() {
    updateCash(data.cash);
    document.cookie = JSON.stringify(data);
  }, 100);
};

