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


router.route('/repartidor/lockersnm/:lockerid([a-z ^A-Z 0-9&,%.]{1,})')
.get(Auth.onlyDeliverers,
	async (req, res, next) => {
		let traking = req.params.lockerid;


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

router.route('/repartidor/guia/:tracking([0-9]{18})')
.get(Auth.onlyDeliverers,
	async(req,res,next) =>{
	// res.render("shippingdetails") 
	db.getshippingdetails(traking).then((results)=>{  
		debug('results', results);
		if (results.length) {
			res.render('tracking_guide', { title: 'sendiit - panel', path: req.path, traking: traking, user: req.session.user, route:results});
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

router.route('/pc')
.get(Auth.onlyUsers,
	async(req,res,next) =>{
		if (req.session.user) {
			res.render('PRUEBAS_CORREOS',{ title: 'sendiit - panel', path: req.path, user: req.session.user});
		} else {
			res.redirect('/');
		}
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
