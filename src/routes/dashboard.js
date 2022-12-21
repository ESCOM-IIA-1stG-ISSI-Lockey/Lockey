const debug = require('debug')('lockey:router:dashboard');
const express = require('express');
const router = express.Router();
const Auth = require('../modules/Auth');
const db = require('../modules/MySQLConnection');
const Validator = require('../modules/Validator');
const optionsl = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', dayPeriod: 'short', hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'America/Mexico_City'};
const optionss = { dateStyle: 'short', timeStyle: 'short',timeZone: 'America/Mexico_City'};
const formaterlong = new Intl.DateTimeFormat("es-MX",optionsl);
const formatershort = new Intl.DateTimeFormat("es-MX",optionss);
const mailer = require('../modules/SendGmailV');

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
				params.pedingShipings.map((shipping)=>{
					shipping.dtu_shpg=formatershort.format(shipping.dtu_shpg)
					shipping.dts_shpg=formatershort.format(shipping.dts_shpg)
					shipping.dte_shpg=formatershort.format(shipping.dte_shpg)
				})
				break;
		}

		res.render('dashboard', {
			title: 'sendiit - panel',
			path: req.path,
			user: req.session.user,
			...params
		});

	});


router.route('/repartidor/lockersnm/:lockerid([a-z ^A-Z 0-9&,%.]{1,})')
.get(Auth.onlyDeliverers,
	async (req, res, next) => {
		let traking = req.params.lockerid;


		db.getShippingdetailByUserId(req.session.user.id, traking).then((results) => {
			debug('results', results);
			if (results.length) {
				res.render('lockers', { title: 'sendiit - panel', path: req.path, user: req.session.user ,traking: traking, shippingDetails: results });
			}
			else {
				res.status(401).json({ response: 'ERROR', message: 'Rutas completadas no encontradas' });
			}
		});


});

router.route('/repartidor/guia/:guia([0-9]{18})')
.get(Auth.onlyDeliverers,
	async(req,res,next) => {
		let traking=req.params.guia

		console.log(traking)
		db.getShippinguide(req.session.user.id , traking).then((results)=>{  
			debug('results', results);
			if (results.length) {
				res.render('tracking_guide', { title: 'sendiit - panel',
				path: req.path, traking:traking, user: req.session.user, shippingDetails: results[0]});
			}
			else {
				res.status(401).json({response:'ERROR', message:'Envio no encontrado'});
			}
		});

});

router.route('/repartidor/guia/reportForm')
.get(Auth.onlyDeliverers,
	async(req,res,next) =>{
		if (req.session.user) {
			res.render('reportForm',{ title: 'sendiit - panel', path: req.path, user: req.session.user});
		} else {
			res.redirect('/');
		}
});

router.route('/pc/:tracking([0-9]{18})')
.get(Auth.onlyUsers,
	async(req,res,next) =>{
		let traking = req.params.tracking,
		shipping = await db.getshippingdetails(traking)
		if(shipping.length){
			shipping[0].dtu_shpg=formaterlong.format(shipping[0].dtu_shpg)
			shipping[0].dts_shpg=formaterlong.format(shipping[0].dts_shpg)
			shipping[0].dte_shpg=formaterlong.format(shipping[0].dte_shpg)
		}
		res.render('PRUEBAS_CORREOS',{ 
			title: 'sendiit - panel', 
			path: req.path, 
			user: req.session.user, 
			shipping: shipping[0]});
	});

router.route('/actualizar')
.post(Auth.onlyUsers,
	(req, res, next) => {
		console.log('hola')
		let {name,tkr} = req.body
		let estado = name	
		name = name-1
		const array = [
			{ id: 1, state: "En espera de recolección"},
			{ id: 2, state: "En espera de transportista"},
			{ id: 3, state: "En tránsito"},
			{ id: 4, state: "En espera de recepción"},
			{ id: 5, state: "Completado"},
			{ id: 6, state: "Almacén"},
			{ id: 7, state: "Cancelado"}
		];
		
		//let traking = req.params.tracking	
		const
		html='<p>'+array[name].state+'<p>'
		mailer.sendEmail('dannydvalle99139@gmail.com', html,'Actualización de estado de envío')
		db.UpdateShippings(estado,tkr)
	});

router.route('/repartidor/guia/sendForm')
.get(Auth.onlyDeliverers,
	async(req,res,next) =>{
		if (req.session.user) {
			res.render('sendForm',{ title: 'sendiit - panel', path: req.path, user: req.session.user});
		} else {
			res.redirect('/');
		}
});

router.route('/repartidor/guia/shippingCollected')
.get(Auth.onlyDeliverers,
	async(req,res,next) =>{
		if (req.session.user) {
			res.render('shippingCollected',{ title: 'sendiit - panel', path: req.path, user: req.session.user});
		} else {
			res.redirect('/');
		}
});

router.route('/repartidor/guia/shipmentDelivered')
.get(Auth.onlyDeliverers,
	async(req,res,next) =>{
		if (req.session.user) {
			res.render('shipmentDelivered',{ title: 'sendiit - panel', path: req.path, user: req.session.user});
		} else {
			res.redirect('/');
		}
});





module.exports = router;
