	const nodemailer = require("nodemailer");


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
		  user: "lockeysendiit@gmail.com", // generated ethereal user
		  pass: "uryvmcthzjrbeung", // generated ethereal password
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
