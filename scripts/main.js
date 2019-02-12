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

//Influence the cashPerSecond value
const influence = function(value) {
  data.cashPerSecond += value;
};

//Safely modify the ammount of cash the player has
const modifyCash = function(value) {
  if (data.cash += value < 0) return false;
  data.cash += value;
  return true;
};

class cashInfluence {
  constructor(cps, cost, sell) {
    this.cps  = cps  || 0;
    this.cost = cost || 0;
    this.sell = sell || 0;

    if (modifyCash(-this.cost)) {
      influence(this.cps);
    }
  }
  
  destroy() {
    modifyCash(sell);
    influence(-cps);
  }
}

window.onload = function() {
  let counter = document.getElementById('counter'); //The counter above the button
  let button = document.getElementById('button');   //The button

  //Refresh the number displayed on the counter
  const updateCash = function() {
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

