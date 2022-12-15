function initMap() {
    const TL = { lat: 19.5059214, lng: -99.1466907 };
    const SFe = { lat: 19.3611053, lng: -99.2757859};
    const Fom = { lat: 19.4496778, lng: -99.1538179};
    const Ant = { lat: 19.3138125, lng: -99.0784336};

    const map = new google.maps.Map(document.getElementById("map"), {
      zoom: 11.3,
      center: { lat:19.3911668 , lng:   -99.1466907 },
    });
    const map1 = new google.maps.Map(document.getElementById("map1"), {
      zoom: 11.3,
      center: { lat:19.3911668 , lng:   -99.1466907 },
    });
    new google.maps.Marker({
      position: TL,
      map,
      title: "Plaza Torres Lindavista",
    });
    new google.maps.Marker({
      position: SFe,
      map,
      title: "Centro Santa Fe",
    });
    new google.maps.Marker({
      position: Fom,
      map,
      title: "Plaza Forum",
    });
    new google.maps.Marker({
      position: Ant,
      map,
      title: "Plaza Las Antenas",
    });

  }
  
  const locations = [
    { lat: 19.3138125, lng: -99.0784336 },
  ];

  
  window.initMap = initMap;
  window.initMap = initMap;