var debug = require('debug')('lockey:router:index');
var express = require('express');
var router = express.Router();
var crypto = require('node:crypto');
var db = require('../modules/MySQLConnection');
var mailer = require('../modules/SendGmailV');

/* GET home page. */
router.get('/', function(req, res, next) {
	if (req.session.user) 
		res.redirect('/panel');
	else 
		res.render('index', { title:'sendiit', path:req.path, user:req.session.user });
});


router.route('/identificacion')
	.post((req, res, next) => {
		debug(req.body);
		let {email, password} = req.body;
		password = crypto.createHash('sha256').update(password).digest('hex');

		db.checkCredentials(email, password).then((results) => {
			debug('results', results);
			if (results.length) {
				if(results[0].act_usr == 'ENABLED'){
					req.session.user = {
						id: results[0].id_usr,
						name: results[0].nm_usr,
						email: results[0].em_usr,
						type: results[0].type_usr,
						isActive: results[0].act_usr
					};
					debug('/identificacion session.user:', req.session.user);
					
					res.status(200).json({
						response: 'OK',
						message: 'Usuario autenticado',
						redirect: '/'
					});
				}
				else{
					req.session.tmpemail = email;
					res.status(200).json({
						response: 'OK',
						message: 'Usuario creado correctamente',
						modal:{
							old:'#signinModal',
							new: '#mailverificationModal',
						},
					
					});
					console.log('fernando')
				}

			} else {
				res.status(401).json({response:'ERROR', message:'Correo o contraseña incorrectos'});
			}
		}).catch((err) => {
			res.status(402).json({response:'ERROR', message:err});
		});
	});

router.route('/registro')
	.post((req, res, next) => {
		let {name, email, tel, password} = req.body;
		password = crypto.createHash('sha256').update(password).digest('hex');
		
		let token = generateToken();
		// Genera token para guardar en Base de datos
		
		db.createUser(name, email, tel, password, token, db.ROLES.CLIENT).then((results) => {
			if (results.affectedRows > 0) {
				db.getUserById(results.insertId).then((results) => {
					
					if (results.length > 0) {

						
						mailer.mailVerification(email, token);

						req.session.tmpemail = email;

						res.status(200).json({
							response: 'OK',
							message: 'Usuario creado correctamente',
							modal:{
								new: '#mailverificationModal',
								old: '#signupModal'
							},
						});
					} else {
						res.status(401).json({response:'ERROR', message:'Usuario no encontrado tras registro'});
					}
				}).catch((err) => {
					debug(err);
					res.status(402).json({response:'ERROR', message:err});
				});
			} else {
				res.status(401).json({response:'ERROR', message:'No se pudo crear el usuario'});
			}
		}).catch((err) => {
			debug(err);
			res.status(402).json({response:'ERROR', message:err});
		});
	});

	function generateToken() {
		let num = 0;
		let random = Math.random();
		random = random * (899999) + 100000;
		random = Math.trunc(random);
		num = random;
		console.log(num);
		
		return num;
	}

	router.route('/verificador')
	.post((req, res, next) => {
		debug(req.body);
		
		let {NUM1, NUM2, NUM3, NUM4,NUM5,NUM6} = req.body;
		const fullnumber = NUM1 + NUM2 + NUM3 + NUM4+ NUM5 + NUM6;
		let VerifyNumber = Number(fullnumber);
		let email = req.session.tmpemail;

		db.verifycode(email, VerifyNumber).then((results) => {
			if (results.length) {
				req.session.user = {
					id: results[0].id_usr,
					name: results[0].nm_usr,
					email: results[0].em_usr,
					type: results[0].type_usr
				};
				
				res.status(200).json({
					response: 'OK',
					message: 'Usuario autenticado',
					redirect: '/'
				});
			} else {
				res.status(401).json({response:'ERROR', message:'Código Inválido'});
			}
		}).catch((err) => {
			debug(err);
			res.status(402).json({response:'ERROR', message:err});
		});


	});



module.exports = router;
