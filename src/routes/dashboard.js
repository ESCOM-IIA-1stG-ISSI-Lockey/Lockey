const debug = require('debug')('lockey:router:dashboard');
const express = require('express');
const router = express.Router();
const Auth = require('../modules/Auth');
const db = require('../modules/MySQLConnection');
const Validator = require('../modules/Validator');

router.route('/')
.get(Auth.onlyUsers,
	async (req, res, next) => {
		let params = {}
		switch (req.session.user.type) {
			case 'ADMIN':
				break;
			case 'DELIVERER':
				params.stateRoute = await db.getLockersByUserId(req.session.user.id)
				break;
			case 'CLIENT':
				params.pedingShipings = await db.getShippings(req.session.user.id)
				break;
		}

		res.render('dashboard', {
			title: 'sendiit - panel',
			path: req.path,
			user: req.session.user,
			...params
		});

	});

router.route('/envio');	//envios historicos (esto de momento no)

router.route('/envio/detalles/:tracking([0-9]{18})')
.get(Auth.onlyClients, Validator.trackingNumber,
	async (req, res, next) => {
		console.log(req.params)
		let traking = req.params.tracking,
			shipping = await db.getshippingdetails(traking)

		res.render('shippingdetails', {
			title: 'sendiit - panel',
			path: req.path,
			user: req.session.user,
			shipping: shipping[0]
		});
	});

// Crear envio (tamaño, origen, destino)
router.route('/envio/crearEnvio')
.get(Auth.onlyClients,
	async (req, res, next) => {
		if (!req.session.shipping)
			req.session.shipping = {}
		debug('shipping', req.session.shipping)
		let params = {}

		if (req.session.shipping.origin)
			params.origin = await db.getloker(req.session.shipping.origin)[0]
		
		if (req.session.shipping.destination)
			params.destination = await db.getloker(req.session.shipping.destination)[0]
		
		res.render('createShipping', {
			title: 'sendiit - panel',
			path: req.path,
			user: req.session.user,
			...params
		});		
	})
.post(Auth.onlyClients,
	(req, res, next) => {
		if (!req.session.shipping)
			req.session.shipping = {}

		let { origin, destination, size } = req.body
			
		// let { NameOrigen, NameDestino } = req.body
		if (origin)
			req.session.shipping.origin = origin
		if (destination)
			req.session.shipping.destination = destination
		if (size)
			req.session.shipping.size = size

		debug(req.session.shipping)
		res.redirect(req.path); //FIXME: Checar si se puede hacer un redirect a la misma ruta
	});

// Extension view to choose the origin
router.route('/envio/crearEnvio/origen')
.get(Auth.onlyClients,
	async (req, res, next) => {
		let lockers = await db.getlocations()
		res.render('chooseOrigen', {
			title: 'sendiit - panel',
			path: req.path,
			user: req.session.user,
			address: lockers	//TODO: Change address to addresses
		});
		//REMINDER: Change address to addresses
		//NOTE: asda
		//DEBUG: asdasd
	});

// Extension view to choose the destination
router.route('/envio/crearEnvio/destino')
.get(Auth.onlyClients,
	async (req, res, next) => {
		let lockers = await db.getlocations()
		res.render('chooseDestination', {
			title: 'sendiit - panel',
			path: req.path,
			user: req.session.user,
			address: lockers	//TODO: Change address to addresses
		});
});

// Extension view to choose the sender
router.route('/envio/crearEnvio/sender')	//TODO: Change to /envio/crearEnvio/remitente
.get(Auth.onlyClients,
	async (req, res, next) => {
		let contacts = await db.getContactsByUserId(req.session.user.id);
		console.log('contacts', contacts)
		res.render('createSender', {
			title: 'sendiit - panel',
			path: req.path,
			user: req.session.user,
			contacts: contacts
		});
	});

// Extension view to choose the receiver
// router.route('/envio/crearEnvio/receiver')	//TODO: Change to /envio/crearEnvio/destinatario
// .get(Auth.onlyClients,
// 	async (req, res, next) => {
// 		let contacts = await db.getContactsByUserId(req.session.user.id);
// 		console.log('contacts', contacts)
// 		res.render('createSender', {
// 			title: 'sendiit - panel',
// 			path: req.path,
// 			user: req.session.user,
// 			contacts: contacts
// 		});
// 	});

// NOTE: PATH IS REPEATED!!!
// router.route('/envio/crearEnvio')
// 	.post((req, res, next) => {
// 		console.log(req.body)
// 		let { name, email, tel } = req.body;
// 		db.createContact(req.session.user.id, name, email, tel).then((results) => { 
// 			debug('results', results);
// 			if (results.affectedRows) {
// 				res.status(200).json({
// 					response: "OK",
// 					message: "Contacto guardado con éxito",
// 					// redirect: "ViewMaps" //modifiaciones prueba mapas
// 				})
// 			}
// 			else {
// 				res.status(401).json({
// 					response: "ERROR",
// 					message: "problemas en el servidor"
// 				})
// 			}
// 		}).catch((err) => {
// 			console.log("ERROR", err)
// 			res.status(402).json({ response: 'ERROR', message: err });
// 		});
// 	});

// Crear envio (remitente, destinatario, pago) y cobro
router.route('/nuevo/resumen')
.get(Auth.onlyClients,
	async (req, res, next) => {
		let wallet = await db.getWalletsByUserId(req.session.user.id);
		let contacts = await db.getContactsByUserId(req.session.user.id);
		console.log('contacts', contacts)
		res.render('createSender', {
			title: 'sendiit - panel',
			path: req.path,
			user: req.session.user,
			wallet: wallet,
			contacts: contacts
		});
	})

// router.post('/envio/crearEnvio/createSender', (req,res,next) =>{
// 	console.log(req.body)
//     let {name, email, tel} = req.body;
//     db.createAddresse(req.session.user.id,name, email, tel).then((results)=>{ //checar
//         debug('results', results);
//         if (results.affectedRows) {
//             res.status(200).json({
//                 response: "OK",
//                 redirect: "/panel/envio/crearEnvio/createSender/" //modifiaciones
//             })
//         }
//         else {
//             res.status(401).json({
//                 response: "ERROR",
//                 message: "problemas en el servidor"
//             })
//         }
//     }).catch((err) => {
//         console.log("ERROR", err)
//         res.status(402).json({response:'ERROR', message:err});
//     });
// });


// //  Agregar destinatario
// router.get('/envio/crearEnvio/createAddresse', (req, res, next) => {
// 	// res.render("createAddresse") 
// 	if (req.session.user) {
// 		res.render('createAddresse', { title: 'sendiit - panel', path: req.path, user: req.session.user });
// 	} else {
// 		res.redirect('/');
// 	}
// });


//  Agregar metodo de pago
router.route('/envio/crearEnvio/payment')
.get(Auth.onlyClients,
	async (req, res, next) => {
	
		db.getmetodosDePagos(req.session.user).then((results) => {
			debug('results', results);
			if (results.length) {
				res.render('payment', { title: 'sendiit - panel', path: req.path, user: req.session.user, metodosDePagos: results });
			}
			else {
				res.status(401).json({ response: 'ERROR', message: 'Rutas completadas no encontradas' });
			}
		});
		//res.render('payment' , { title: 'sendiit - panel', path: req.path, user: req.session.user, metodosDePagos: metodosDePagos });
	});


router.route('/repartidor/lockersnm/:lockerid([a-z ^A-Z 0-9&,%.]{1,})')
.get(Auth.onlyDeliverers,
	async (req, res, next) => {
		let traking = req.params.lockerid;

		traking = traking.replace('%20', ' ');


		db.getShippingdetailByUserId(req.session.user.id, traking).then((results) => {
			debug('results', results);
			if (results.length) {
				res.render('lockers', { title: 'sendiit - panel', path: req.path, traking: traking, shippingDetails: results });
			}
			else {
				res.status(401).json({ response: 'ERROR', message: 'Rutas completadas no encontradas' });
			}
		});


});




module.exports = router;
