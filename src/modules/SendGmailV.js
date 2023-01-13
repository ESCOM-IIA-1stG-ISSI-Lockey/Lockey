const nodemailer = require("nodemailer");

const states = {
	1: {state: 'en espera de recolección, date prisa y lleva el paquete al lugar de origen', route: "https://lh3.google.com/u/2/d/1xu5cgIwQml_y6Lk4QF4CHKfNWdXNda-k=w1920-h973-iv1"},
	2: {state: 'en espera de transportista, te notificaremos cuando tu envío esté en transito', route: "https://lh3.google.com/u/2/d/1SIePJdbDIr4DnjSFWYFW985ObhE58XV3=w2000-h4168-iv1"},
	3: {state: 'en tránsito, pronto estará en el lugar de destino', route: "https://lh3.google.com/u/2/d/1Y5tV5o7NsPokLgqgprFYv4M7iFb0KTT3=w1920-h973-iv1"},
	4: {state: 'en espera de recepción por el destinatario', route: "https://lh3.google.com/u/2/d/1MphskkmSf3g3oYJnuyN8oBhtODwmlLk3=w1920-h973-iv1"},
	5: {state: 'completado, el paquete ha sido recibido por el destinatario con exito', route: "https://lh3.google.com/u/2/d/1vrYgKgWjTmjyZJ3GFuvZxyMZ6eKf76gQ=w1920-h973-iv1"},
	6: {state: 'en almacén, ponte en contacto con soporte para tener más información', route: "https://lh3.google.com/u/2/d/19oEY1IN5m7n1slx_JJNgERTXq3qO9fjE=w1920-h973-iv1"},
	7: {state: 'cancelado,  ponte en contacto con soporte si hay algún problema', route: "https://lh3.google.com/u/2/d/1PY7m26-54ohV11ygRBVQMx8D72LyCQnF=w1920-h973-iv1"},
}

const val = {
	sendEmailVerification: async (res, email, token) => { return new Promise((resolve, reject) => {
		res.render('modal/verify_email', { token:token }, function(err, html) {
			if (err)
				reject('Problemas al renderizar el correo');
			else
				val.sendEmail(email, html, 'Verificación de Cuenta')
				.then((info) => resolve(info) )
				.catch((err) => reject(err) );
		});
	})},

	sendEmailStateShipping: async (res, emails, user, num_g, idState) => { return new Promise((resolve, reject) => {
		console.log('idState: ', idState);
		let state = states[idState].state, 
			route = states[idState].route;
		console.log('state: ', state);
		res.render('modal/shipping_state_email', { user:user, num_g:num_g, state:state, img_state:route}, async function(err, html) {
			if (err)
				reject('Problemas al renderizar el correo');
			else {
				// for each unique emails
				let ok = true;
				emails = emails.filter((email, index, self) => self.indexOf(email) === index);
				for (let idx in emails) {
					console.log('email: ', emails[idx]);
					await val.sendEmail(emails[idx], html, 'Estado actual del envío')
						.catch((err) => {
							console.error(err);
							reject(err)
							ok = false;
						});
					if (!ok) break;
				}
				if (ok)
					resolve('Emails enviados');
				else
					reject('Problemas al enviar los emails');
			}
		});
	})},

	// async..await is not allowed in global scope, must use a wrapper
	sendEmail: (email, html,subject) => { return new Promise(async (resolve, reject) => {

	  // Generate test SMTP service account from ethereal.email
	  // Only needed if you don't have a real mail account for testing
	  let testAccount = await nodemailer.createTestAccount();
	
	  // create reusable transporter object using the default SMTP transport
	  let transporter = nodemailer.createTransport({
		host: "smtp.gmail.com",
		port: 587,
		secure:false, // true for 465, false for other ports
		auth: {
		  user: "lockey1sendiit@gmail.com", // generated ethereal user
		  pass: "ywikhsrarbyjqfzf", // generated ethereal password
		},
	  });
	
	  // send mail with defined transport object
	  let info = await transporter.sendMail({
		from: "Sendiit-Envios", // sender address
		to: email, // list of receivers
		subject: subject, // Subject line
		text: '' , // plain text body
		html:html});
	
	  console.log("Message sent: %S", info.messageId);
	  resolve(info.messageId);
	})},
};

	module.exports = val;
