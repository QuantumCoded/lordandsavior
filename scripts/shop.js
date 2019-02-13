window.addEventListener('load', function() {
  let shop = document.getElementById('shop'); //The shop gui

  shop.onmouseenter = function() {
    shop.style.transform = 'translateX(-12px)';
  };

  shop.onmouseleave = function() {
    console.log('left');
    shop.style.transform = 'translateX(-99.5%)';
  };
});