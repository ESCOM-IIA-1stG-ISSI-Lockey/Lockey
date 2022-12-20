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
			params.origin = (await db.getloker(req.session.shipping.origin))[0]
		
		if (req.session.shipping.destination)
			params.destination = (await db.getloker(req.session.shipping.destination))[0]
		
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
		let { origin, destination, size } = req.body
			
		// let { NameOrigen, NameDestino } = req.body
		if (origin)
			req.session.shipping.origin = origin
		if (destination)
			req.session.shipping.destination = destination
		if (size)
			req.session.shipping.size = size

		if (origin && destination && size)
			res.json({ response: 'OK', redirect: '/crear-envio/resumen' })
		else
			res.json({ response: 'OK', redirect: '/crear-envio'+req.path })
	});

// Crear envio (remitente, destinatario, pago) y cobro
router.route('/resumen')
.get(Auth.onlyClients,
	async (req, res, next) => {
		let wallet = await db.getWalletsByUserId(req.session.user.id);
		let contacts = await db.getContactsByUserId(req.session.user.id);
		console.log('contacts', contacts)
		res.render('createShipping/resume', {
			title: 'sendiit - panel',
			path: req.path,
			user: req.session.user,
			wallet: wallet,
			contacts: contacts
		});
	})
.post(Auth.onlyClients,
	(req, res, next) => {
		if (!req.session.shipping)
			req.session.shipping = {}

		debug('req.body', req.body)
		let { sender, receiver, wallet } = req.body

		if (sender)
			req.session.shipping.sender = sender
		if (receiver)
			req.session.shipping.receiver = receiver
		if (wallet)
			req.session.shipping.wallet = wallet

		if (sender && receiver && wallet)
			// Realizar cobro y creacion del envio
			res.json({ response: 'OK', message: 'Envio creado' })
		else
			res.json({ response: 'OK', redirect: '/crear-envio'+req.path })
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
router.route('/remitente')	
.get(Auth.onlyClients,
	async (req, res, next) => {
		let contacts = await db.getContactsByUserId(req.session.user.id);
		console.log('contacts', contacts)
		res.render('createShipping/choose/sender', {
			title: 'sendiit - panel',
			path: req.path,
			user: req.session.user,
			contacts: contacts
		});
	});

	router.route('/addSender')
	.get(Auth.onlyClients,
		async (req, res, next) => {
			//-
			//-let choose = req.params.choose=='origen'?'origin':'destination'
			res.render('createShipping/addSender', {
				title: 'sendiit - panel',
				path: req.path,
				user: req.session.user,
				choose: choose,
				addresses: lockers
			});
		});



//  Agregar metodo de pago
router.route('/payment')
.get(Auth.onlyClients,
	async (req, res, next) => {
		let metodosDePagos = await db.getWalletsByUserId(req.session.user.id);
	
		res.render('createShipping/choose/payment', { title: 'sendiit - panel', path: req.path, user: req.session.user, metodosDePagos: metodosDePagos });
	});

	router.route('/addSender')
	.get(Auth.onlyClients,
		async (req, res, next) => {
			let metodosDePagos = await db.getWalletsByUserId(req.session.user.id);
		
			res.render('crear-envio/remitente/addSender', { title: 'sendiit - panel', path: req.path, user: req.session.user, metodosDePagos: metodosDePagos });
		});


module.exports = router;
