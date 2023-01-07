var elemento   = document.getElementById("origen_pp"); //Se obtiene origen apartir del id que esta en resumen.pug
var elemento2 = document.getElementById("destino_pp"); //Se obtiene destino apartir del id que esta en resumen.pug
var elemento3 = document.getElementById("response");   //Se obtiene el precio apartir del resumen.pug
const pretzio = elemento3.getAttribute("data-mi-variable");
var pretzioInt = parseInt(pretzio);
var orid   = document.getElementById("origen_id");  //Se obtiene id de locker de origen apartir del id que esta en resumen.pug
var destid = document.getElementById("destino_id"); //Se obtiene id de locker de destino apartir del id que esta en resumen.pug
var numberC = document.getElementById("cardN"); //Se obtiene el numero de tarjeta desde resumen.pug


function calculateDistance() {
    const service = new google.maps.DistanceMatrixService();
    const origin = elemento.getAttribute("data-mi-variable"); //se guarda el origen del locker para la estrura request
    const destination = elemento2.getAttribute("data-mi-variable");

    const idOrigen = orid.getAttribute("data-id"); //Se obtiene id_lkr origen
    const idDestino = destid.getAttribute("data-id"); // Destino

    const cardNumber = numberC.getAttribute("data-card").toString(); // Numero de tarjeta como cadena
    
    const request = { // todos los datos que se necesitan para calcular la distancia
        origins: [origin], 
        destinations: [destination],
        travelMode: google.maps.TravelMode.DRIVING,
        unitSystem: google.maps.UnitSystem.METRIC,
        avoidHighways: false, 
        avoidTolls: false,
    };
    
    service.getDistanceMatrix(request).then((response) => { //getDistanceMatrix calcula la distancia con la estructura request
    var distance = response.rows[0].elements[0].distance.value; //aqui entramos al valor de la distancia en metros
    const pre = Math.round(25.6*(distance/27.5)) + pretzioInt
    const precio = "$"+ pre 
    document.getElementById("response").innerText = precio //se imprime en el resumen.pug, en donde esta la etiqueta id="response"
    
    //Generar Guia 4-año,2-mes, 2-dia, 2-hora, 2-minuto, 3-id origen y 3-id destino
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
    //idOrigen = idOrigen.padStart(3,0) //No las detectaba al momento de hacer el padStart
    //idDestino = idDestino.padStart(3,0)
    guia = year+month+day+hour+minute+"00"+idOrigen+"00"+idDestino
    //document.getElementById("guide").innerText = guia //Lo muestra en pantalla solo para pruebas

    //Ocultar tarjeta
    newCard = ""
    for(let i=0; i<cardNumber.length; i++ ){
        if (i<12){  
            newCard += "*" //Cambia digitos por *
        }else{
            newCard += cardNumber[i] // Agrega los ultimos 4 digitos
        }
    }
    console.log(newCard)
    document.getElementById("cardN").innerText = newCard //Lo muestra en metodo de pago

    });
}

