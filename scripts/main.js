const ups = 9;

//Cookie Check
var image;

try {
  image = JSON.parse(document.cookie);
} catch(error) {
  //The client is not using cookies, prompt them
  console.warn('Possible parsing failure, resetting cookies');
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
  influences: {}
};

//Write data to cookie
const writeCookie = function() {
  document.cookie = JSON.stringify(data);
}

//Flatten all the influences into storable data and save it in cookies
const stashInfluences = function() {
  for (let i in data.influences) {
    data.influences[i].forEach(i => i.destroy());
    data.influences[i] = data.influences[i].map(i => [i.type, i.cps, 0, i.sell]);
  }

  writeCookie();
};


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
      (data.influences[this.type] || (data.influences[this.type] = [])).push(this);
    }
  }
}


//Unflatten influences before page finishes loading
temp = Object.assign({}, data.influences);                     //Clone flattened data
data.influences = {};                                          //Clear flattened data
for (let i in temp) {
  temp[i].map(p => new cashInfluence(p[0], p[1], p[2], p[3])); //Repopulate by unflattening clone data 
}


window.onbeforeunload = function() {
  stashInfluences();
};
window.onload = function() {
  let counter = document.getElementById('counter'); //The counter above the button
  let button = document.getElementById('button');   //The button

  //Refresh the number displayed on the counter
  const updateCash = function() {
    counter.innerHTML = `Cache: ${Math.floor(data.cash)}`;
  };  

  //When the button is clicked
  button.onclick = function() {
    updateCash(data.cash += data.clickValue);
  };


  //new cashInfluence('testing', 5);


  //Main loop
  setInterval(function() {
    //Wait for the user to accept cookies before saving any
    if (!typeof data) return;

    modifyCash(data.cashPerSecond / ups);
    updateCash(data.cash);
    writeCookie();
  }, 1000 / ups);
};

document.onkeypress = function(e) {
  if (e.code == 'F2') {
    eval(prompt('Evaluate'));
  }

  if (e.code == 'Space') {
    button.onclick();
  }
};
