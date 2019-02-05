//Setting up timer and interval for notification text
let blink_interval;
let notif = document.getElementById('notif');
let notif_timeout = setTimeout(function() {
  blink_interval = setInterval(function() {
    notif.style.opacity = '1';
    setTimeout(function() {
      notif.style.opacity = '0';
    }, 500)
  }, 1000);
}, 3000);

document.onmousedown = function(event) {
  //Clearing timer and interval for notification text on first click
  if (notif_timeout)  clearTimeout(notif_timeout);
  if (blink_interval) clearInterval(blink_interval);
  
  if (document.getElementById('notif')) {
    document.body.removeChild(notif);
  }

  //Generating a tomeo
  let obj = document.body.appendChild(document.createElement('div'));
  let _skew = .5 + Math.random() * 1.5;
  let _x = 1 - 2 * Number(Math.random() > .5);
  let _y = 1 - 2 * Number(Math.random() > .5);
  let _r = 0;

  obj.classList.add('spinner');
  obj.style.top  = `${event.clientY - 70}px`;
  obj.style.left = `${event.clientX - 70}px`;

  let img = obj.appendChild(document.createElement('img'));
  let images = ['tomeo.png', 'multimeter.jpg'];

  img.src = 'images/' + images[Math.floor(Math.random() * images.length)];

  //Setting up bumpy physics
  obj.onmouseleave = function() {
    obj.onmousemove = function() {};
  };

  obj.onmouseover = function() {
    obj.onmousemove = function(event) {
      console.log(event.movementX, event.movementY);
      obj.style.top  = `${obj.offsetTop  + event.movementY}px`;
      obj.style.left = `${obj.offsetLeft + event.movementX}px`;
    };
  };

  //Forwarding the onmousedown event to document
  obj.onmousedown = function(event) {
    document.onmousedown(event);
  };

  //Setting up movement/collision detection loop
  setInterval(function() {
    if (obj.offsetTop <= 0) _y = 1;
    if (obj.offsetTop + obj.offsetHeight >= window.innerHeight) _y = -1;
    if (obj.offsetLeft <= 0) _x = 1;
    if (obj.offsetLeft + obj.offsetWidth >= window.innerWidth) _x = -1;

    obj.style.top  = `${obj.offsetTop  + _y * _skew}px`;
    obj.style.left = `${obj.offsetLeft + _x * _skew}px`;

    obj.style.transform = `rotate(${_r}deg)`;
    _r += 1;
  }, 2);
};