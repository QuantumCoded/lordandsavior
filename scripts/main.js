//Predefined variables
const ups = 9;       //Updates Per Second (how fast the counter re-renders)
var debounce = true; //Debounce variable used to prevent DAS autoclick on space

var image; //Cookie stored in browser [TO BE DEPRICATED]

//Templates support check
if (!document.createElement('template').content) {
  alert('Your browser doesn\'t support my trash, sorry');
  location.href = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
  //Rick Roll all the scrubs that use propritary browsers
}

console.log('Cookie:', document.cookie);
document.cookie = '';

//Cookie Check
try {
  image = JSON.parse(document.cookie);
} catch(error) {
  //The client is not using cookies, prompt them
  console.warn('Possible parsing failure, resetting cookies');
  if (!confirm('This site uses cookies to save your progress, is this okay?'))
    location.href = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
    //Rick Roll all the scrubs that don't agree to the ToS
}

//The main data object, what's stored in cookies [TO BE REFACTORED]
var data = image ||
{
  cash: 0,
  cashPerSecond: 0,
  clickValue: 1,
  influences: {}
};

//Write data to cookie [TO BE REFACTORED]
const writeCookie = function() {
  document.cookie = JSON.stringify(data);
};

//Flatten all the influences into storable data and save it in cookies [TO BE REFACTORED]
const stashInfluences = function() {
  for (let i in data.influences) {                                                //For each of the influence groupings
    data.influences[i].forEach(i => i.destroy());                                 //Remove influences' effects
    data.influences[i] = data.influences[i].map(i => [i.type, i.cps, 0, i.sell]); //Convert influences into construction params
  }

  writeCookie(); //Save the user's state to their browser cookies
};

//Influence the cashPerSecond value
const influence = function(value) {
  data.cashPerSecond += value;
};

//Safely modify the ammount of cash the player has
const modifyCash = function(value) {
  if (data.cash + value < 0) return false; //Make sure that the modification doesn't make you cash go below 0
  data.cash += value;
  return true;
};

//Class for affecting cash over a period of time [TO BE REFACTORED]
class cashInfluence {
  constructor(type, cps, cost, sell) {
    this.type = type || 'testing'; //What grouping the influence belongs in
    this.cps  = cps  || 0;         //How much the influence effects the user's cashPerSecond
    this.cost = cost || 0;         //How much cash this influence takes when it's created
    this.sell = sell || 0;         //How much cash this influence return when it's destroyed

    //The method for removing the influence from the user's cashPerSecond value
    this.destroy = function() {
      modifyCash(sell);
      influence(-cps);
    };

    //If creating this influence makes the user's cash less than zero then don't create the influence
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

//When the user's leaving the page save the user's data to the browser [TO BE REFACTORED]
window.onbeforeunload = function() {
  stashInfluences(); //Save the user's data to the cookies
};

//Wait for the window to load before setting up the code behind page operation
window.addEventListener('load', function() {
  let counter = document.getElementById('counter'); //The counter above the button
  let button = document.getElementById('button');   //The button

  //Refresh the number displayed on the counter
  const updateCash = function() {
    counter.innerHTML = `Cash: ${Math.floor(data.cash)}`;
  };  

  //When the button is clicked increase the user's cash by the click value
  button.onclick = function() {
    modifyCash(data.clickValue);
  };

  //Main loop
  setInterval(function() {
    if (!typeof data) return; //Wait for the user to accept cookies before saving any

    modifyCash(data.cashPerSecond / ups); //Add the cashPerSecond to the user's cash value
    updateCash();                         //Update the counter number
    writeCookie();                        //Save the user's data to the browser [TO BE REFACTORED]
  }, 1000 / ups);
});

//When the user presses a key
document.onkeydown = function(e) {
  if (e.code == 'F2') {       //If the user presses the console key
    eval(prompt('Evaluate')); //Evaluate the command that the user inputs
  }
  
  if (debounce && e.code == 'Space') button.onclick(); //If the user presses space then run the click function
  if (e.code == 'Space') debounce = false;             //Disable the ability to use space to click until space is lifted (DAS autoclick prevention)
};

//When the user lifts a key
document.onkeyup = function(e) {
  if (e.code == 'Space') { //If the user released the space key
    debounce = true;       //Enable the ability to use space to click
  }
};