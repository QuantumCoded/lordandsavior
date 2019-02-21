//The object for storing all the item display parameters [TO BE IMPLEMENTED]
var items = {
  '': ''
};

//When the window loads
window.addEventListener('load', function() {
  let shop = document.getElementById('shop');              //Get the shop gui
  let template = document.getElementById('tmp-shop_item'); //Get the shop item's template

  //Clone the template and initalize a new item into the shop [TO BE IMPLEMENTED]
  const initItem = function(name, disc, cost, icon) {
    let item = shop.appendChild(template.content.cloneNode(true)); //Clone the template into the shop
  };

  //Loading in and setting up all of the shop items
  const initShop = function() {
    initItem(); //Creating the test item
  };

  //When the mouse enters the shop tab
  shop.onmouseenter = function() {
    shop.style.transform = 'translateX(0px)'; //Expand the shop gui
  };

  //When the mouse leave the shop tab
  shop.onmouseleave = function(e) {
    if (shop.contains(document.elementFromPoint(e.clientX, e.clientY))) //If the mouse is in an object in the shop gui do nothing
      return;

    shop.style.transform = 'translateX(-98.5%)'; //Hide the shop gui
  };

  initShop(); //Initalize the shop
});