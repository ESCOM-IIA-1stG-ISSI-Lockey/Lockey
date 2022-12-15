const labels = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
let labelIndex = -1;

function initMap() {
    const Centro = { lat: 19.3911668 , lng: -99.1466907 };
    const map = new google.maps.Map(document.getElementById("map"), {
      zoom: 11.3,
      center: Centro,
    });
    const tourStops = [
      [{ lat: 19.5059214, lng: -99.1466907 }, "Plaza Torres Lindavista"],
      [{ lat: 19.3611053, lng: -99.2757859}, "Centro Santa Fe"],
      [{ lat: 19.4496778, lng: -99.1538179}, "Plaza Forum"],
      [{ lat: 19.3138125, lng: -99.0784336}, "Plaza Las Antenas"],
    ];

    const infoWindow = new google.maps.InfoWindow();

    tourStops.forEach(([position, title], i) => {
      const marker = new google.maps.Marker({
        position,
        map,
        title: `${i + 1}. ${title}`,
        label: `${i + 1}`,
        optimized: false,
      });
    marker.addListener("click", () => {
      infoWindow.close();
      infoWindow.setContent(marker.getTitle());
      infoWindow.open(marker.getMap(), marker);
     });
    });
    const map1 = new google.maps.Map(document.getElementById("map1"), {
      zoom: 11.3,
      center: Centro,
    });

    google.maps.event.addListener(map1, "click", (event) => {
      addMarker(event.latLng, map1);
    });
  }

  function addMarker(location, map1) {
    new google.maps.Marker({
      position: location,
      //label: labels[labelIndex++ % labels.length],
      map:map1,
    });
  }
  
  
  window.initMap = initMap;
  window.initMap = initMap;