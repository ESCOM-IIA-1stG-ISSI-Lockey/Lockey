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




module.exports = router;
