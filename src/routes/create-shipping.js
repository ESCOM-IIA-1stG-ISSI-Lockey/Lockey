const debug = require('debug')('lockey:router:create-shipping');
const express = require('express');
const router = express.Router();
const Auth = require('../modules/Auth');
const db = require('../modules/MySQLConnection');
const Validator = require('../modules/Validator');
const ShippinUtils = require('../modules/ShippingUtils');
const { shipping } = require('../modules/MySQLConnection');
const mailer = require('../modules/SendGmailV');

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

		debug('req.session.shipping', req.session.shipping)
		let params = {}

		if (req.session.shipping.origin) 
			params.origin = (await db.locker.getById(req.session.shipping.origin))[0]
		
		if (req.session.shipping.destination)
			params.destination = (await db.locker.getById(req.session.shipping.destination))[0]

		if (req.session.shipping.sender)
			params.sender = (await db.contact.getById(req.session.shipping.sender))[0]

		if (req.session.shipping.receiver)
			params.receiver = (await db.contact.getById(req.session.shipping.receiver))[0]

		if (req.session.shipping.size)
			params.size = (await db.locker.getDoorTypeById(req.session.shipping.size))[0]
		
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
		let { origin, destination, size, sender, receiver, url } = req.body
		// let { NameOrigen, NameDestino } = req.body

		if (url && (!origin && !destination && !sender && !receiver))
			return res.status(400).json({ 
				response: 'ERROR', 
				message: 'Debes elegir un elemento'
			});
		else if ((origin && origin==req.session.shipping.destination) 
				|| (destination && destination==req.session.shipping.origin))
			return res.status(400).json({ 
				response: 'ERROR', 
				message: 'El destino y el origen deben ser diferentes'
			});
		else if ((sender && sender==req.session.shipping.receiver) 
				|| (receiver && receiver==req.session.shipping.sender))
			return res.status(400).json({ 
				response: 'ERROR', 
				message: 'El destinatario y el remitente deben ser diferentes'
			});

		if (origin) req.session.shipping.origin = origin
		if (destination) req.session.shipping.destination = destination
		if (sender)req.session.shipping.sender = sender
		if (receiver) req.session.shipping.receiver = receiver
		if (size) req.session.shipping.size = size


		if (!url && (!req.session.shipping.origin
			|| !req.session.shipping.destination
			|| !req.session.shipping.size
			|| !req.session.shipping.sender
			|| !req.session.shipping.receiver))
			return res.status(400).json({ 
				response: 'ERROR', 
				message: 'Ingresa todos los datos'
			});
		else if(url)
			return res.json({ 
				response: 'OK', 
				redirect: '/crear-envio' 
			})
		else
			return res.json({ 
				response: 'OK', 
				redirect: '/crear-envio/resumen' 
			})
	});

// Crear envio (remitente, destinatario, pago) y cobro
router.route('/resumen')
.get(Auth.onlyClients,
	async (req, res, next) => {
		/**
		 * sender, receiver, wallet, origin, destination, size
		 */
		let params = {}
		if (req.session.shipping.sender)
			params.sender = (await db.contact.getById(req.session.shipping.sender))[0]
		if (req.session.shipping.receiver)
			params.receiver = (await db.contact.getById(req.session.shipping.receiver))[0]
		if (req.session.shipping.wallet) 
			params.wallet = (await db.wallet.getById(req.session.shipping.wallet))[0]
		if (req.session.shipping.origin)
			params.origin = (await db.locker.getById(req.session.shipping.origin))[0]
		if (req.session.shipping.destination)
			params.destination= (await db.locker.getById(req.session.shipping.destination))[0]
		if (req.session.shipping.size)
			params.size = (await db.locker.getDoorTypeById(req.session.shipping.size))[0]

		params.tracking = await (ShippinUtils.generateTrackingGuide(params.origin.id_lkr, params.destination.id_lkr))
		req.session.shipping.tracking = params.tracking
		
		let distance = await (ShippinUtils.getDistanceKm(params.origin.dir_lkr, params.destination.dir_lkr).catch((err)=> 0))
		params.price = Math.round(25.6*(distance/27.5)) + parseInt(params.size.pr_drtype)
		req.session.shipping.price = params.price
		
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
		let { wallet, url/* , cvv */ } = req.body 

		if (url && (!wallet /* && !cvv */))
			return res.status(400).json({ 
				response: 'ERROR', 
				message: 'Debes elegir un elemento',
			});

		if (wallet) req.session.shipping.wallet = wallet
		// if (cvv) req.session.shipping.cvv = cvv

		if (!url && (!req.session.shipping.wallet
			/* || !req.session.shipping.cvv */))
			return res.status(400).json({ 
				response: 'ERROR', 
				message: 'Ingresa todos los datos'
			});
		else if(url)
			return res.json({ 
				response: 'OK', 
				redirect: '/crear-envio/resumen' 
			})
		else {
			console.log(req.session.shipping)
			req.session.qr = ShippinUtils.generateQr()
			req.session.tracking = req.session.shipping.tracking
			db.shipping.create(
				req.session.user.id,
				req.session.shipping.tracking,
				req.session.shipping.size,
				req.session.shipping.price,
				req.session.shipping.wallet,
				req.session.shipping.origin,
				req.session.shipping.destination,
				req.session.shipping.sender,
				req.session.shipping.receiver, 
				req.session.qr
			).then((result) => {
				if (!result.insertId)
					throw new Error('No se pudo actualizar')
	
				return db.shipping.getByTracking(req.session.shipping.tracking)
			}).then((result) => {
				if (!result.length)
					throw new Error('Error al obtener el envío')
	
				let shipping = result[0]
				console.log(shipping)
				console.log('emails: ', shipping.em_usr, shipping.em_contdst, shipping.em_contorg)
				return mailer.sendEmailStateShipping(res, [shipping.em_usr, shipping.em_usr, shipping.em_contorg], shipping.nm_usr, shipping.trk_shpg, shipping.stat_shpg)
			}).then((result) => {
				console.log('actualizado')
				req.session.shipping = undefined
				res.json({
					response: 'OK',
					redirect: '/crear-envio/finalizado',
				})
			}).catch((err) => {
				debug(err);
				res.status(400).json({ response: 'ERROR', message: err.message||err });
			});
		}
});

// Envio finalizado con exito
router.route('/finalizado')
.get(Auth.onlyClients,
	async (req, res, next) => {
		res.render('createShipping/completed', {
			title: 'sendiit - panel',
			path: req.path,
			user: req.session.user,
			qr: req.session.qr,
			tracking: req.session.tracking,
		});
	});


// Extension view to choose the origin or destination
router.route('/:choose(origen|destino)')
.get(Auth.onlyClients,
	async (req, res, next) => {
		let lockers = await db.locker.getAll()
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
		let contacts = await db.contact.getAllByUserId(req.session.user.id);
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
		db.contact.create(req.session.user.id, name, email, phone).then((results)=>{ 
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
		let metodosDePagos = await db.wallet.getAllByUserId(req.session.user.id);
		res.render('createShipping/choose/wallet', { 
			title: 'sendiit - panel', 
			path: req.path,
			user: req.session.user,
			metodosDePagos: metodosDePagos
		});
	})
.post(Auth.onlyClients, Validator.creditCard,	
	async (req, res, next) => {
		let {nickName, cardName, cardNumber, cardDatee} = req.body;
		console.log(req.body)
		db.wallet.create(req.session.user.id, nickName, cardName, cardNumber, cardDatee).then((results)=>{ 
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

module.exports = router;
