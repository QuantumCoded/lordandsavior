//Predefined variables
const ups = 9;       //Updates Per Second (how fast the counter re-renders)
var debounce = true; //Debounce variable used to prevent DAS autoclick on space

//Templates support check
if (!document.createElement('template').content) {
  alert('Your browser doesn\'t support my trash, sorry');
  location.href = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
  //Rick Roll all the scrubs that use propritary browsers
}

console.log('Cookie:', document.cookie);

const acceptedCookies = ['session', 'username'];
var cookies = {}; //The main cookie object

try {
  let _cookies = document.cookie.replace(/ /g, '').split(';'); //Split up the cookies and format them
  console.log(_cookies);
  _cookies.forEach(function(cookie) {      //Store each of the cookies in the main cookie obect
    let pair = cookie.split('='); //Split the cookie into a pair
    if (pair.length != 2) return;

    if (acceptedCookies.indexOf(pair[0]) == -1) return;
    cookies[pair[0]] = pair[1];   //Store that pair in the cookie object
  });

  console.log(cookies);

  //If the session could not be found reload the session
  if (!cookies.session || !cookies.username) throw 'Bad cookie params'

  //Query the database for the user's session
  new AJAXReq('GET', `type=LOAD_SESSION&session=${escape(cookies.session)}&username=${escape(cookies.username)}`, function(res) {
    console.log(res);
  });
} catch(error) {
  alert(error);
  //alert('There was an error loading session data');
  //location.href = '/';
}

new AJAXReq('GET', `type=LOAD_SESSION&session=${cookies.session}&user=${cookies.user}`, function(_data) {
  try {
    data = JSON.parse(_data);
    ready = true;
  } catch(error) {
    alert(`Error parsing data: ${_data}`);
  }

  console.log(_data);
});

//Influence the cashPerSecond value
const influence = function(value) {
  //data.cashPerSecond += value;
};

//Safely modify the ammount of cash the player has
const modifyCash = function(value) {
  //if (data.cash + value < 0) return false; //Make sure that the modification doesn't make you cash go below 0
  //data.cash += value;
  //return true;
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
      //(data.influences[this.type] || (data.influences[this.type] = [])).push(this);
    }
  }
}

//When the user's leaving the page save the user's data to the browser [TO BE REFACTORED]
window.onbeforeunload = function() {
  //Save the user's data to the database
};

//Wait for the window to load before setting up the code behind page operation
window.addEventListener('load', function() {
  let counter = document.getElementById('counter'); //The counter above the button
  let button = document.getElementById('button');   //The button

  //Refresh the number displayed on the counter
  const updateCash = function() {
    //counter.innerHTML = `Cash: ${Math.floor(data.cash)}`;
  };  

  //When the button is clicked increase the user's cash by the click value
  button.onclick = function() {
   //modifyCash(data.clickValue);
  };

  //Main loop
  setInterval(function() {
    //Wait for the data to get loaded and the client to be ready before running

    //Add the cashPerSecond to the user's cash value
    updateCash();                         //Update the counter number
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