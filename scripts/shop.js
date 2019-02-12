var shopTransform = 0;

window.addEventListener('load', function() {
  let shop = document.getElementById('shop'); //The shop gui
  let button = document.getElementById('shop-button'); //The tab to pull out the shop

  button.onclick = function() {
    shop.style.transform = `translateX(${shopTransform}%)`;
    shopTransform = shopTransform == 0 ? -100 : 0;
  };
});