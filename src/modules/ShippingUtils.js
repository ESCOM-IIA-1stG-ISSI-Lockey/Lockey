const {Client} = require("@googlemaps/google-maps-services-js");

const client = new Client({});

const utils = {
	getDistance: (orgDirLocker, dstDirLocker) => {
		return new Promise((resolve, reject) => {
			client.distancematrix({
				params: {
					origins: [orgDirLocker],
					destinations: [dstDirLocker],
					mode: 'DRIVING',
					units: 'metric',
					// avoid: ['highways', 'tolls'],
					key: 'AIzaSyAEErsjNBLnxa3y-N2LFDpENunDEE8SDAs',
				},
			}).then((response) => {
				if (response.data.status!=='OK')
					throw new Error('Error con la API de Google Maps');
				else 
					resolve(response.data.rows[0].elements);
			}).catch(reject)
		})
	},

	getDistanceKm: (orgDirLocker, dstDirLocker) => {
		return new Promise((resolve, reject) => {
			utils.getDistance(orgDirLocker, dstDirLocker)
				.then((response) => {
					resolve(response[0].distance.value/1000);
				})
				.catch(reject);
		})
	},

	generateTrackingGuide: (orgLockerId, dstLockerid) => {
	console.log(new Date().toISOString().replace(/[-:]/g, ''))
	return new Date().toISOString().replace(/[-:]/g, '').slice(2, 16) 
		+ `${orgLockerId}`.padStart(3, '0') 
		+ `${dstLockerid}`.padStart(3, '0');
	},

	generateQr: () => {
		return Math.floor(Math.random() * 1000000)// Random 6-digit number
				.toString().padStart(6, '0'); 
	}
}

module.exports = utils;

// utils.getDistanceKm('Av. Miguel Othon de Mendizabal Ote. 343, Nueva Industrial Vallejo, Gustavo A. Madero, 07700 Ciudad de Mexico, CDMX','Vasco de Quiroga 3800, Santa Fe, Contadero, Cuajimalpa de Morelos, 05348 Ciudad de Mexico, CDMX')