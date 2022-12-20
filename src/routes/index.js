const debug = require('debug')('lockey:router:index');
const express = require('express');
const router = express.Router();
const crypto = require('node:crypto');
const db = require('../modules/MySQLConnection');
const Auth = require('../modules/Auth');
const Validator = require('../modules/Validator');
const mailer = require('../modules/SendGmailV');

router.route('/')
.get(Auth.onlyGuests, (req, res, next) => {
	res.render('index', { title: 'sendiit', path: req.path, user: req.session.user });
});

router.route('/identificacion')
.post(Auth.onlyGuests, Validator.signin,
	(req, res, next) => {
		let { email, password } = req.body;
		password = crypto.createHash('sha256').update(password).digest('hex');

		db.checkCredentials(email, password).then((results) => {
			if (results.length) {
				if (results[0].act_usr == 'ENABLED')
					Auth.createSession(req, res, results[0]);
				else {
					req.session.tmpemail = email;
					res.json({
						response: 'OK',
						message: 'Usuario creado correctamente',
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

		db.createUser(name, email, tel, password, token, db.ROLES.CLIENT).then((results) => {
			if (results.affectedRows > 0)
				return db.getUserById(results.insertId)	
			else throw new Error('No se pudo crear el usuario');
		})
		.then((results) => {
			if (results.length > 0) {
        subject="Codigo de verificacion"
				html ="<b>Tu Codigo de verificacion es :" + token +" </b>"
				return mailer.mailVerification(email,html,subject);
      }
			else throw new Error('Usuario no encontrado tras registro');		
		})
		.then(() => {
			req.session.tmpemail = email;
			res.json({
				response: 'OK',
				message: 'Usuario creado correctamente',
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

router.route('/verificador')
.post(Auth.onlyGuests, Validator.token,
	(req, res, next) => {
		debug(req.body);

		let { NUM1, NUM2, NUM3, NUM4, NUM5, NUM6 } = req.body,
			VerifyNumber = NUM1 + NUM2 + NUM3 + NUM4 + NUM5 + NUM6,
			email = req.session.tmpemail;

		debug(VerifyNumber);

		db.verifycode(email, VerifyNumber).then((results) => {
			console.log(results);
			if (results.changedRows)
				return db.getUserByEmail(email);
			else
				throw new Error('Código Inválido');
		})
		.then((results) => {
			if (results.length)
				Auth.createSession(req, res, results[0]);
			else
				throw new Error('Usuario no encontrado');
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



module.exports = router;
