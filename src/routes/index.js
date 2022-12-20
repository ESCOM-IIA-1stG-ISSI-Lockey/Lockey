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
        		subject="Verificación de cuenta"
				html ='<!DOCTYPE html>'+
				'<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office">'+
				'<head>'+
				  '<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="x-apple-disable-message-reformatting">'+
				  '<title></title>'+
				  '<style>'+
					'table, td, div, h1, p {font-family: Arial, sans-serif;}'+
					'@media screen and (max-width: 530px) {'+
					  '.unsub {'+
						'display: block;'+
						'padding: 8px;'+
						'margin-top: 14px;'+
						'border-radius: 6px;'+
						'background-color: #555555;'+
						'text-decoration: none !important;'+
						'font-weight: bold;'+
					  '}'+
					  '.col-lge {'+
						'max-width: 100% !important;'+
					  '}'+
					'}'+
					'@media screen and (min-width: 531px) {'+
					  '.col-sml {'+
						'max-width: 27% !important;'+
					  '}'+
					  '.col-lge {'+
						'max-width: 73% !important;'+
					  '}'+
					'}'+
				  '</style></head>'+
				'<body style="margin:0;padding:0;word-spacing:normal;background-color:#ffffff;">'+
				  '<div role="article" aria-roledescription="email" lang="en" style="text-size-adjust:100%;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;background-color:#ffffff;">'+
					'<table role="presentation" style="width:100%;border:none;border-spacing:0;">'+
						'<tr><td align="center" style="padding:0;">'+
						  '<table role="presentation" style="width:94%;max-width:600px;border:none;border-spacing:0;text-align:left;font-family:Arial,sans-serif;font-size:16px;line-height:22px;color:#363636;">'+
							'<tr><td style="padding:40px 30px 30px 30px;text-align:center;font-size:24px;font-weight:bold;">'+
							'<a href="http://www.sendiit.com/" style="text-decoration:none;"><img src="/public/images/sendiit.svg" width="165" alt="Logo" style="width:165px;max-width:80%;height:auto;border:none;text-decoration:none;color:#ffffff;"></a>'+
							 '</td></tr><tr>'+
							  '<td style="padding:30px;background-color:#ffffff;">'+
								'<h1 style="margin-top:0;margin-bottom:16px;font-size:26px;line-height:32px;font-weight:bold;letter-spacing:-0.02em;">Bienvenido,</h1>'+
								'<p style="margin:0;">Gracias por crear una cuenta en Sendiit, estás a un paso de completa tu registro. Ingresa el siguiente Token de acceso en la aplicación:</p>'+
								'<h1 style="text-align: center;">'+token+'</h1>'+
								'<p style="margin:0; text-align: center; font-size: 12px;">El Token expira en 24 horas.</p>'+
							  '</td></tr><tr>'+
							  '<td style="padding:0;font-size:24px;line-height:28px;font-weight:bold;">'+
								'<img src="verify_account.svg" width="600" alt="" style="width:100%;height:auto;display:block;border:none;text-decoration:none;color:#363636;">'+
							  '</td></tr>'+						
							  '<td style="padding:40px;text-align:center;font-size:12px;background-color:#404040;color:#cccccc;">'+
								'<p style="margin:0 0 8px 0;"><a href="http://www.facebook.com/" style="text-decoration:none;"><img src="https://assets.codepen.io/210284/facebook_1.png" width="40" height="40" alt="f" style="display:inline-block;color:#cccccc;"></a> <a href="http://www.twitter.com/" style="text-decoration:none;"><img src="https://assets.codepen.io/210284/twitter_1.png" width="40" height="40" alt="t" style="display:inline-block;color:#cccccc;"></a></p>'+
								'<p style="margin:0;font-size:14px;line-height:20px;">&reg; Sendiit, Sendiit 2023<br></p>'+
							  '</td></tr></table></td></tr></table></div></body></html>'
				
				// "<b>Tu Codigo de verificacion es :" + token +" </b>"
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
