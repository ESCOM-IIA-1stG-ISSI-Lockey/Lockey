const debug = require('debug')('lockey:router:index');
const express = require('express');
const router = express.Router();
const crypto = require('node:crypto');
const db = require('../modules/MySQLConnection');
const Auth = require('../modules/Auth');
const Validator = require('../modules/Validator');
const mailer = require('../modules/SendGmailV');
const optionsl = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', dayPeriod: 'short', hour: '2-digit', minute: '2-digit', hour12: true,timeZone: 'America/Mexico_City'};
const optionss = { dateStyle: 'short', timeStyle: 'short',timeZone: 'America/Mexico_City'};
const formaterlong = new Intl.DateTimeFormat("es-MX",optionsl);
const formatershort = new Intl.DateTimeFormat("es-MX",optionss);

router.route('/')
.get(Auth.onlyGuests, (req, res, next) => {
	res.render('index', { title: 'sendiit', path: req.path, user: req.session.user });
});

router.route('/identificacion')
.post(Auth.onlyGuests, Validator.signin,
	(req, res, next) => {
		let { email, password } = req.body;
		password = crypto.createHash('sha256').update(password).digest('hex');

		db.user.credential(email, password).then((results) => {
			if (results.length) {
				if (results[0].act_usr == 'ENABLED')
					Auth.createSession(req, res, results[0]);
				else {
					req.session.tmpemail = email;
					res.json({
						response: 'OK',
						modal: {
							old: '#signinModal',
							new: '#mailverificationModal',
						},
					});
				}
			}
			else
				throw new Error('Correo o contraseña incorrectos');

		}).catch((err) => {
			res.status(400).json({ response: 'ERROR', message: err.message||err });
		});
	});

router.route('/registro')
.post(Auth.onlyGuests, Validator.signup,
	(req, res, next) => {
		let { name, email, tel, password } = req.body,
			// token 6-digit number fixed
			token = Math.floor(Math.random() * 1000000)// Random 6-digit number
				.toString().padStart(6, '0'); 

		password = crypto.createHash('sha256').update(password).digest('hex');

		db.user.create(name, email, tel, password, token, db.USER_ROLES.CLIENT).then((results) => {
			if (results.affectedRows > 0)
				return db.user.getById(results.insertId)	
			else throw new Error('No se pudo crear el usuario');
		})
		.then((results) => {
			if (results.length) 
				return mailer.sendEmailVerification(res, email, token)
			else throw new Error('Usuario no encontrado tras registro');		
		})
		.then(() => {
			req.session.tmpemail = email;
			res.json({
				response: 'OK',
				modal: {
					new: '#mailverificationModal',
					old: '#signupModal'
				},
			});
		})
		.catch((err) => {
			debug(err);
			res.status(400).json({ response: 'ERROR', message: err.message||err });
		});
	});

router.route('/test/emailformat')
	.get((req, res, next) => {
		res.render('test/emailformat', { token: '123456' });
	});

router.route('/verificador')
.post(Auth.onlyGuests, Validator.token,
	(req, res, next) => {
		debug(req.body);

		let { NUM1, NUM2, NUM3, NUM4, NUM5, NUM6 } = req.body,
			VerifyNumber = NUM1 + NUM2 + NUM3 + NUM4 + NUM5 + NUM6,
			email = req.session.tmpemail;

		debug(VerifyNumber);

		db.user.verify(email, VerifyNumber).then((results) => {
			console.log(results);
			if (results.changedRows)
				db.user.exists1(email).then((results) => {
					if (results)
						Auth.createSession(req, res, results);
					else
						throw new Error('Usuario no encontrado');
				}).catch((err) => {
					debug(err);
					res.status(400).json({ response: 'ERROR', message: err.message||err });
				});
			else
				throw new Error('Código Inválido');
		})
		.catch((err) => {
			debug(err);
			res.status(400).json({ response: 'ERROR', message: err.message||err });
		});
	});

router.route('/salir')
.get(Auth.onlyUsers,
	(req, res, next) => 
		Auth.deleteSession(req, res)
	);

router.route('/modifyJ')
	.post(Validator.update,
		async (req, res, next) => {
			let { name,tel,emaila} = req.body
			
			db.user.Modify(name,tel,emaila).then((results)=>{ 
				debug('results', results);
				if (results.affectedRows) {
					req.session.user.name=name
					req.session.user.tel=tel
					res.json({
						response: 'OK',
						message: 'Tus datos se modificaron con exito',
						//redirect: '/panel/perfil'
					});
				}
				else {
					throw new Error('Reporte no generado');
				}
			}).catch((err) => {
				console.log("ERROR", err)
				res.status(400).json({ response: 'ERROR', message: err.message||err });
			});
		});
	
	
router.route('/modify')
	.post(Validator.updateC,
		async (req, res, next) => {
			let { password,passwordConfirm,emaila} = req.body
			password = crypto.createHash('sha256').update(password).digest('hex');
			db.user.Modifycontra(password,passwordConfirm,emaila).then((results)=>{ 
				debug('results', results);
				if (results.affectedRows) {
					req.session.user.password=password
					
					res.json({
						response: 'OK',
						message: 'La contraseña se modifico con exito',
						modal: {
							old: '#modifyModal',
							new: 'none',
						},
						//redirect: '/',
					});
				}
				else {
					console.log('ola dsdfsd')
					throw new Error('Reporte no generado');
				}
			}).catch((err) => {
				console.log("ERROR", err)
				res.status(400).json({ response: 'ERROR', message: err.message||err });
			});
			
		
		});
	
router.route('/envio')	//envios historicos (esto de momento no)
.post(Validator.trackingNumber,
		(req, res, next)=>{
		console.log(req.body)
		res.json({
			response: 'OK',
			redirect: '/envio/'+req.body.tracking,
		});
	})

router.route('/envio/:tracking([0-9]{18})')
.get(Validator.trackingNumber,
	async (req, res, next) => {
		console.log(req.params)
		let traking = req.params.tracking,
			shipping = await db.shipping.getByTracking(traking)
			if(shipping.length){
				shipping[0].dtu_shpg=formaterlong.format(shipping[0].dtu_shpg)
				shipping[0].dts_shpg=formaterlong.format(shipping[0].dts_shpg)
				shipping[0].dte_shpg=formaterlong.format(shipping[0].dte_shpg)
			}
					
		res.render('shippingdetails', {
			title: 'sendiit - panel',
			path: req.path,
			user: req.session.user,
			shipping: shipping[0]
		});
	});



module.exports = router;
