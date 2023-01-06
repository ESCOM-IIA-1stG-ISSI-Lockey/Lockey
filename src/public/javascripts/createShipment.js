var elemento   = document.getElementById("origen_pp");
var elemento2 = document.getElementById("destino_pp");
var elemento3 = document.getElementById("response");
const pretzio = elemento3.getAttribute("data-mi-variable");
var pretzioInt = parseInt(pretzio);

function calculateDistance() {
    const service = new google.maps.DistanceMatrixService();
    const origin = elemento.getAttribute("data-mi-variable");
    const destination = elemento2.getAttribute("data-mi-variable");
    const request = {
        origins: [origin],
        destinations: [destination],
        travelMode: google.maps.TravelMode.DRIVING,
        unitSystem: google.maps.UnitSystem.METRIC,
        avoidHighways: false, 
        avoidTolls: false,
    };
    
    // put request on page
    //-document.getElementById("request").innerText = JSON.stringify(
        //-request,
        //-null,
        //-2
    //-);
    // get distance matrix response
    service.getDistanceMatrix(request).then((response) => {
    var distance = response.rows[0].elements[0].distance.value;
    const pre = Math.round(25.6*(distance/27.5)) + pretzioInt
    var precio = "$"+ pre 
    document.getElementById("response").innerText = precio
    });
}

function createGuide(){
    idOrigen = origin.id_lkr
    idDestino = destination.id_lkr

    let year = new Date().getFullYear().toString();
    //console.log(year)
    let month = new Date().getMonth().toString();
    month = parseInt(month)
    month += 1
    month = String(month)
    month = month.padStart(2,0);
    //console.log(month)
    let day = new Date().getDate().toString();
    day = day.padStart(2,0)
    //console.log(day)
    let hour = new Date().getHours().toString();
    hour = hour.padStart(2,0)
    //console.log(hour)
    let minute = new Date().getMinutes().toString();
    minute = minute.padStart(2,0)
    //console.log(minute)
    idOrigen =idOrigen.padStart(3,0)
    idDestino =idDestino.padStart(3,0)

    var guia = year+month+day+hour+minute+idOrigen+idDestino
    console.log(guia)
}