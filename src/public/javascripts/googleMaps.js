const labels = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
let labelIndex = 0;

console.log(addresses)
var add = addresses.map(e =>e.dir_lkr)
var addnm =addresses.map(e =>e.nm_lkr)
console.log(add)
var geocoder;
var map;
//var address = 'Av. Miguel Othón de Mendizábal Ote. 343, Nueva Industrial Vallejo, Gustavo A. Madero, 07700 Ciudad de México, CDMX' ;

function initMap() {


 var map = new google.maps.Map(document.getElementById('map'), {
   zoom: 8,
   center: {lat:19.440744027382173, lng: -99.12751310305093}
 });
 tam =add.length
 geocoder = new google.maps.Geocoder();
 for(var i = 0; i < tam; i++){
   address = add[i]
   namew = addnm[i]
   codeAddress(geocoder, map,address,namew,i)

 }


 marker.addListener("click", () => {
   infoWindow.close();
   infoWindow.setContent(marker.getTitle());
   infoWindow.open(marker.getMap(), marker);
  });
 
}

function codeAddress(geocoder, map,address,namew,i) {
  const infoWindow = new google.maps.InfoWindow();
 geocoder.geocode({'address': address}, function(results, status) {
   if (status === 'OK') {
     const marker = new google.maps.Marker({
       map: map,
       position: results[0].geometry.location,
       title: `${i + 1}.${namew}`,
       label: `${i + 1}`,
       optimized: false,
     });
     marker.addListener("click", () => {
      infoWindow.close();
      infoWindow.setContent(marker.getTitle());
      infoWindow.open(marker.getMap(), marker);
     });
   } else {
     alert('Geocode was not successful for the following reason: ' + status);
   }
 });
}


  
window.initMap = initMap;

