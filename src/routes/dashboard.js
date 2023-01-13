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
				params.stateRoute = await db.route.getByUserId(req.session.user.id)
				console.log(params.stateRoute)
				break;
			case 'CLIENT':
				params.pedingShipings = await db.shipping.getAllPendingByUserId
				(req.session.user.id)
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


		db.route.getDetails(req.session.user.id, traking).then((results) => {
			debug('results', results);
			if (results.length) {
				res.render('lockers', { title: 'sendiit - panel', path: req.path, user: req.session.user ,traking: traking, shippingDetails: results });
			}
			else {
				res.status(401).json({ response: 'ERROR', message: 'Rutas completadas no encontradas' });
			}
		});


});

/* router.route('/repartidor/guia/:guia([0-9]{18})')
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

}); */

router.route('/repartidor/guia/report/:guia([0-9]{18})')
.get(Auth.onlyDeliverers,
	async(req,res,next) =>{
		let traking=req.params.guia
		if (req.session.user) {
			res.render('reportForm',{ title: 'sendiit - panel', traking:traking ,path: req.path, user: req.session.user});
		} else {
			res.redirect('/');
		}
})
router.route('/repartidor/guia/report')
.post(Auth.onlyDeliverers, Validator.reportForm,	
	async (req, res, next) => {
		let body = req.body;
		console.log(req.body)
		db.report.create(req.session.user.id, body.idDoorReport, body.traking, body.titleReport, body.detailsReport).then((results)=>{ 
			debug('results', results);
			if (results.affectedRows) {
				res.status(200).json({response: 'OK', redirect: '/panel/repartidor/guia/sendForm'})
			}
			else {
				throw new Error('Reporte no generado');
			}
		}).catch((err) => {
			console.log("ERROR", err)
			res.status(400).json({ response: 'ERROR', message: err.message||err });
		});
	});

router.route('/informacion')
.get(Auth.onlyUsers,
	async(req,res,next) =>{
		res.render('infoHow',{ 
			title: 'sendiit - panel', 
			path: req.path, 
			user: req.session.user});
	});


router.route('/historial')
.get(Auth.onlyUsers,
	async(req,res,next) =>{
		res.render('history',{ 
			title: 'sendiit - panel', 
			path: req.path, 
			user: req.session.user,
			pedingShipings: await db.shipping.getAllByUserId(req.session.user.id)});
	});

router.route('/perfil')
.get(Auth.onlyUsers,
	async(req,res,next) =>{
		res.render('account',{ 
			title: 'sendiit - panel', 
			path: req.path, 
			user: req.session.user});
	});


router.route('/pc/:tracking([0-9]{18})')
.get(Auth.onlyUsers,
	async(req,res,next) =>{
		let traking = req.params.tracking,
		shipping = await db.shipping.getByTracking(traking)
		// if(shipping.length){
		// 	shipping[0].dtu_shpg=formaterlong.format(shipping[0].dtu_shpg)
		// 	shipping[0].dts_shpg=formaterlong.format(shipping[0].dts_shpg)
		// 	shipping[0].dte_shpg=formaterlong.format(shipping[0].dte_shpg)
		// }
		res.render('PRUEBAS_CORREOS',{ 
			title: 'sendiit - panel', 
			path: req.path, 
			user: req.session.user, 
			shipping: shipping[0]});
	});

router.route('/actualizar')
.post(Auth.onlyUsers,
	(req, res, next) => {
		let user = req.session.user
		let {name: idState,tkr} = req.body
		console.log(req.body)
		let email2 = 'dannydvalle99139@gmail.com'
		const states = {
			1: {state: 'en espera de recolección, date prisa y lleva el paquete al lugar de origen', route: "https://lh3.google.com/u/2/d/1xu5cgIwQml_y6Lk4QF4CHKfNWdXNda-k=w1920-h973-iv1"},
			2: {state: 'en espera de transportista, te notificaremos cuando tu envío esté en transito', route: "https://lh3.google.com/u/2/d/1SIePJdbDIr4DnjSFWYFW985ObhE58XV3=w2000-h4168-iv1"},
			3: {state: 'en tránsito, pronto estará en el lugar de destino', route: "https://lh3.google.com/u/2/d/1Y5tV5o7NsPokLgqgprFYv4M7iFb0KTT3=w1920-h973-iv1"},
			4: {state: 'en espera de recepción por el destinatario', route: "https://lh3.google.com/u/2/d/1MphskkmSf3g3oYJnuyN8oBhtODwmlLk3=w1920-h973-iv1"},
			5: {state: 'completado, el paquete ha sido recibido por el destinatario con exito', route: "https://lh3.google.com/u/2/d/1vrYgKgWjTmjyZJ3GFuvZxyMZ6eKf76gQ=w1920-h973-iv1"},
			6: {state: 'en almacén, ponte en contacto con soporte para tener más información', route: "https://lh3.google.com/u/2/d/19oEY1IN5m7n1slx_JJNgERTXq3qO9fjE=w1920-h973-iv1"},
			7: {state: 'cancelado,  ponte en contacto con soporte si hay algún problema', route: "https://lh3.google.com/u/2/d/1PY7m26-54ohV11ygRBVQMx8D72LyCQnF=w1920-h973-iv1"},
		} 
		console.log(states[idState])


		db.shipping.getByTracking(tkr)
		mailer.sendEmailStateShipping(res, user.email2, user.name, tkr, states[idState].state, states[idState].route)	//remitente
		if(idState>2)
			mailer.sendEmailStateShipping(res, email2, 'Daniel', tkr, states[idState].state, states[idState].route) //destinatario
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

router.route('/repartidor/guia/:guia([0-9]{18})')
.get(Auth.onlyDeliverers,
	async(req,res,next) =>{
		let guia = req.params.guia,
		shipping = (await db.route.getShipping(guia))[0]
		console.log(guia)
		console.log(shipping)
		if (req.session.user) {
			res.render('tracking_guide',{ title: 'sendiit - panel', path: req.path, user: req.session.user, shipping: shipping});
			// res.render('tracking_guide',{ title: 'sendiit - panel', path: req.path, user: req.session.user, shipping: shipping[0]});
			// res.render('shippingCollected',{ title: 'sendiit - panel', path: req.path, user: req.session.user, shipping: shipping[0]});
		} else {
			res.redirect('/');
		}
		//db.updateShippingstroute(stateShipping ,tkr)
		
}).post(Auth.onlyDeliverers,
	async(req,res,next) => {
		let{name,tkr} =req.body;
		console.log(name ,tkr)
		db.shipping.updateS.then((result) => {
		if (result.affectedRows > 0) {
			console.log('actualizado')
			res.json({
				response: 'OK',
				redirect:'/panel/repartidor/guia/shippingCollected'	
			})
		} else
			throw new Error('No se pudo actualizar')
		
		}).catch((err) => {
			console.log(err)
			res.json({
				response: 'ERROR',
				message: err.message || 'No se pudo actualizar'
			})
		})
	}); 


router.route('/repartidor/guia/shippingCollected')
.get(Auth.onlyDeliverers,
	async(req,res,next) =>{
		if (req.session.user) {
			res.render('shippingCollected', { title: 'sendiit - panel', path: req.path, user: req.session.user});
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
