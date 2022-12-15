function initMap() {
    const map = new google.maps.Map(document.getElementById("map"), {
      zoom: 12,
      center: { lat:19.3911668 , lng:   -99.1466907 },
    });
    const map1 = new google.maps.Map(document.getElementById("map1"), {
      zoom: 12,
      center: { lat:19.3911668 , lng:   -99.1466907 },
    });

  }
  
  const locations = [
    { lat: 19.5059214, lng: -99.1466907 },
    { lat: 19.3611053, lng: -99.2757859 },
    { lat: 19.4496778, lng: -99.1538179 },
    { lat: 19.3138125, lng: -99.0784336 },
  ];
  
  window.initMap = initMap;
  window.initMap = initMap;