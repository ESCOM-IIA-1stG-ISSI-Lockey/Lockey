
console.log(addres)
var add =addres.map(e =>e.dir_lkr)
console.log(add)
var geocoder;
var map;
//var address = 'Av. Miguel Othón de Mendizábal Ote. 343, Nueva Industrial Vallejo, Gustavo A. Madero, 07700 Ciudad de México, CDMX' ;
function initMap() {
  var map = new google.maps.Map(document.getElementById('map'), {
    zoom: 11,
    center: {lat:19.440744027382173, lng: -99.12751310305093}
  });
  geocoder = new google.maps.Geocoder();
  for(address of add){
    codeAddress(geocoder, map,address)
  }
  
}

function codeAddress(geocoder, map,address) {
  geocoder.geocode({'address': address}, function(results, status) {
    if (status === 'OK') {
      var marker = new google.maps.Marker({
        map: map,
        position: results[0].geometry.location
      });
    } else {
      alert('Geocode was not successful for the following reason: ' + status);
    }
  });
}
  
  
  window.initMap = initMap;
