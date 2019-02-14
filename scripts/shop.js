var items = {
  '': ''
};

window.addEventListener('load', function() {
  let shop = document.getElementById('shop'); //The shop gui
  let template = document.getElementById('tmp-shop_item'); //The shop item's template

  //Clone the template and initalize a new item into the shop
  const initItem = function(name, disc, cost, icon) {
    let item = shop.appendChild(template.content.cloneNode(true));


  };

  //Loading in and setting up all of the shop items
  const initShop = function() {
    initItem('Thing', 'This is just a test item I\'m implementing to see how price scaling works', 100, '/img-tomeo2');
  };

  //Handle the shop expanding when the user hovers over it
  shop.onmouseenter = function() {
    shop.style.transform = 'translateX(0px)';
  };

  //Hanles the shop retracting when the user leaves it
  shop.onmouseleave = function(e) {
    if (shop.contains(document.elementFromPoint(e.clientX, e.clientY)))
      return;

    shop.style.transform = 'translateX(-98.5%)';
  };

  initShop();
});