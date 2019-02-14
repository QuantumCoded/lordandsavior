window.addEventListener('load', function() {
  let shop = document.getElementById('shop'); //The shop gui
  let template = document.getElementById('tmp-shop_item'); //The shop item's template

  //Loading in and setting up all of the shop items
  const initShop = function() {
    shop.appendChild(template.content);
  };

  //Handle the shop expanding when the user hovers over it
  shop.onmouseenter = function() {
    shop.style.transform = 'translateX(-12px)';
  };

  //Hanles the shop retracting when the user leaves it
  shop.onmouseleave = function() {
    console.log('left');
    shop.style.transform = 'translateX(-99.5%)';
  };

  initShop();
});