var clicks = 0;

window.onload = function() {
  let counter = document.getElementById('counter');
  let button = document.getElementById('button');

  var updateCounter = function(clicks) {
    counter.innerHTML = `Clicks: ${clicks}`;
  };  

  button.onclick = function() {
    updateCounter(++clicks);
  };

  updateCounter(0);
};

