const debug = require('debug')('lockey:router:dashboard');
const express = require('express');
const router = express.Router();
const Auth = require('../modules/Auth');
const db = require('../modules/MySQLConnection');
const Validator = require('../modules/Validator');


/* 
	req.session.shipping = {
		origin,
		destination,
		size,
		sender,
		receiver,
		wallet
	}
 */
router.route('/')
.get(Auth.onlyClients,
	async (req, res, next) => {
		if (!req.session.shipping)
			req.session.shipping = {}
		let params = {}

		if (req.session.shipping.origin) 
			params.origin = (await db.getLoker(req.session.shipping.origin))[0]
		
		if (req.session.shipping.destination)
			params.destination = (await db.getLoker(req.session.shipping.destination))[0]

		if (req.session.shipping.sender)
			params.sender = (await db.getContactById(req.session.shipping.sender))[0]

		if (req.session.shipping.receiver)
			params.receiver = (await db.getContactById(req.session.shipping.receiver))[0]
		
		res.render('createShipping/create', {
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

		debug('req.body', req.body)
		let { origin, destination, size, sender, receiver } = req.body
			
		// let { NameOrigen, NameDestino } = req.body
		if (origin)
			req.session.shipping.origin = origin
		if (destination)
			req.session.shipping.destination = destination
		if (size)
			req.session.shipping.size = size
		if (sender)
			req.session.shipping.sender = sender
		if (receiver)
			req.session.shipping.receiver = receiver

		if (origin && destination && size && sender && receiver)
			res.json({ response: 'OK', redirect: '/crear-envio/resumen' })
		else
			res.json({ response: 'OK', redirect: '/crear-envio'+req.path })
	});

// Crear envio (remitente, destinatario, pago) y cobro
router.route('/resumen')
.get(Auth.onlyClients,
	async (req, res, next) => {
		let params = {}
		if (req.session.shipping.wallet) 
			params.wallet = (await db.getWallet(req.session.shipping.wallet))[0]
		
		res.render('createShipping/resume', {
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

		debug('req.body', req.body)
		let { wallet, cvv } = req.body

		if (wallet)
			req.session.shipping.wallet = wallet

		if (cvv)
			req.session.shipping.cvv = cvv


		if (wallet && cvv)
			// Realizar cobro y creacion del envio
			res.json({ response: 'OK', message: 'Envio creado' })
		else
			res.json({ response: 'OK', redirect: '/crear-envio'+req.path })
});

// Envio finalizado con exito
router.route('/finalizado')
.get(Auth.onlyClients,
	async (req, res, next) => {
		res.render('createShipping/completed', {
			title: 'sendiit - panel',
			path: req.path,
			user: req.session.user
		});
	});


// Extension view to choose the origin or destination
router.route('/:choose(origen|destino)')
.get(Auth.onlyClients,
	async (req, res, next) => {
		let lockers = await db.getlocations()
		let choose = req.params.choose=='origen'?'origin':'destination'
		res.render('createShipping/choose/location', {
			title: 'sendiit - panel',
			path: req.path,
			user: req.session.user,
			choose: choose,
			addresses: lockers
		});
	});

// Extension view to choose the sender
router.route('/:choose(remitente|destinatario)')
.get(Auth.onlyClients,
	async (req, res, next) => {
		let contacts = await db.getContactsByUserId(req.session.user.id);
		let choose = req.params.choose=='remitente'?'sender':'receiver'
		console.log('contacts', contacts)
		res.render('createShipping/choose/contact', {
			title: 'sendiit - panel',
			path: req.path,
			user: req.session.user,
			choose: choose,
			contacts: contacts
		});
	})
.post(Auth.onlyClients, Validator.contact,	
	async (req, res, next) => {
		let { name, email, phone} = req.body;
		db.createContact(req.session.user.id, name, email, phone).then((results)=>{ 
			//console.log(tel,"telefono")
			debug('results', results);
			if (results.affectedRows) {
				res.status(200).json({
					response: "OK",
					redirect: "remitente" //modifiaciones
				})
			}
			else {
				res.status(401).json({
					response: "ERROR",
					message: "problemas en el servidor"
				})
			}
		}).catch((err) => {
			console.log("ERROR", err)
			res.status(402).json({response:'ERROR', message:err});
		});
	});


//  Agregar metodo de pago
router.route('/tarjeta')
.get(Auth.onlyClients,
	async (req, res, next) => {
		let metodosDePagos = await db.getWalletsByUserId(req.session.user.id);
		res.render('createShipping/choose/wallet', { 
			title: 'sendiit - panel', 
			path: req.path,
			user: req.session.user,
			metodosDePagos: metodosDePagos
		});
	})
.post(Auth.onlyClients, Validator.creditCard,	
	async (req, res, next) => {
		let {nickName, cardName, cardNumber, cardDate} = req.body;
		cardDate = "30/"+cardDate
		db.createPayment(req.session.user.id, nickName, cardName, cardNumber, cardDate).then((results)=>{ 
			//console.log(tel,"telefono")
			debug('results', results);
			if (results.affectedRows) {
				res.status(200).json({
					response: "OK",
					redirect: "tarjeta" //modifiaciones
				})
			}
			else {
				res.status(401).json({
					response: "ERROR",
					message: "problemas en el servidor"
				})
			}
		}).catch((err) => {
			console.log("ERROR", err)
			res.status(402).json({response:'ERROR', message:err});
		});
	});



// router.route('/tarjeta')
// .get(Auth.onlyClients,
// 	async (req, res, next) => {
// 		let metodosDePagos = await db.getWalletsByUserId(req.session.user.id);
// 		res.render('createShipping/choose/selectWallet', { 
// 			title: 'sendiit - panel', 
// 			path: req.path, 
// 			user: req.session.user, 
// 			metodosDePagos: metodosDePagos
// 		});
// 	})



module.exports = router;
