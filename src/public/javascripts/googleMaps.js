const labels = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
let labelIndex = -1;


var geocoder;
var map;
var address = 'Av. Miguel Othón de Mendizábal Ote. 343, Nueva Industrial Vallejo, Gustavo A. Madero, 07700 Ciudad de México, CDMX';
function initMap() {
  var map = new google.maps.Map(document.getElementById('map'), {
    zoom: 11,
    center: {lat:19.440744027382173, lng: -99.12751310305093}
  });
  geocoder = new google.maps.Geocoder();
  codeAddress(geocoder, map);
}

function codeAddress(geocoder, map) {
  geocoder.geocode({'address': address}, function(results, status) {
    if (status === 'OK') {
      console.log('holaaaa')
      console.log(address);
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
  window.initMap = initMap;