const tps = 50;

var cash = 0;
var clickValue = 1;

var data = {
  updates: []
};

const update = function(event) {
  data.updates.push(event);
};

const cashSource = function(cps) {
  new update(function() {
    cash += cps / tps;
  });
};

window.onload = function() {
  let counter = document.getElementById('counter');
  let button = document.getElementById('button');

  var updateCash = function() {
    counter.innerHTML = `Cash: ${Math.floor(cash)}`;
  };  

  button.onclick = function() {
    updateCash(cash += clickValue);
  };

  setInterval(function() {
    data.updates.forEach(function(update) {
      update();
    });

    updateCash(cash);
  }, 1000 / tps);
};

