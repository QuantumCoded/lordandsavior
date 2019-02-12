const ups = 10;

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
  clickValue: 1,
  influences: {
    testing: []
  }
};

//Clear the testing influences on startup
data.influences.testing.forEach(function(i) {i.destroy()});

//Influence the cashPerSecond value
const influence = function(value) {
  data.cashPerSecond += value;
};

//Safely modify the ammount of cash the player has
const modifyCash = function(value) {
  if (data.cash + value < 0) return false;
  data.cash += value;
  return true;
};

class cashInfluence {
  constructor(type, cps, cost, sell) {
    this.type = type || 'testing';
    this.cps  = cps  || 0;
    this.cost = cost || 0;
    this.sell = sell || 0;

    this.destroy = function() {
      modifyCash(sell);
      influence(-cps);
    };

    if (modifyCash(-this.cost)) {
      influence(this.cps);
      (data.influences[this.type] || data.influences.testing).push(this);
    }
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


  new cashInfluence('testing', 5, 0);


  //Main loop
  setInterval(function() {
    //Wait for the user to accept cookies before saving any
    if (!typeof data) return;

    modifyCash(data.cashPerSecond / ups);
    updateCash(data.cash);
    document.cookie = JSON.stringify(data);
  }, 1000 / ups);
};

document.onkeydown = function(e) {
  if (e.code == 'F2') {
    eval(prompt('Terminal','>'));
  }
};