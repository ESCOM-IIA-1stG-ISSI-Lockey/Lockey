const { check, validationResult } = require('express-validator');

const validateResult = (req, res, next) => {
	try {
		validationResult(req).throw();
		next();
	}
	catch (err) {
		console.log('ERRORS: ' + err.array().length);
		// console.log(err.array());
		res.status(401).json({ 
			response: 'ERROR',
			errors: err.array()
		});
		/**
		 * errors = [{
		 * 		location: string,
		 * 		param: string,
		 * 		value: string,
		 * 		msg: string,
		 * }]
		 */
	}
};

const v = {
	// Nickname
	_nickname: function (param, name) { return check(param)
		.not().isEmpty().withMessage(`${name} es obligatorio`)
		.isLength({ min: 3 }).withMessage(`${name} debe tener al menos 3 caracteres`)
		.isLength({ max: 50 }).withMessage(`${name} debe tener maximo 50 caracteres`)
		.isAlphanumeric().withMessage(`${name} solo puede contener letras y números`)
	},
	// Fullname
	_fullname: function (param, name) { return check(param)
		.not().isEmpty().withMessage(`${name} es obligatorio`)
		.isLength({ min: 6 }).withMessage(`${name} debe tener al menos 6 caracteres, 3 para el nombre y 2 para el apellido incluyendo el espacio`)
		.isLength({ max: 50 }).withMessage(`${name} debe tener maximo 50 caracteres`)
		.matches(/^[a-zA-Zà-ÿÀ-Ÿ ]+$/).withMessage(`${name} solo puede contener letras`)
		// Fistname at least 3 characters
		.matches(/^[a-zA-Zà-ÿÀ-Ÿ]{3,}/).withMessage(`${name} debe tener al menos 3 caracteres`)
		// Lastname at least 2 characters
		.matches(/ ([a-zA-Zà-ÿÀ-Ÿ]{2,} *)+$/).withMessage(`${name} debe tener al menos 3 caracteres`)
		// Full match
		.matches(/^[a-zA-Zà-ÿÀ-Ÿ]{3,} ([a-zA-Zà-ÿÀ-Ÿ]{2,} *)+$/).withMessage(`${name} debe tener al menos 3 caracteres para el nombre y 2 para el apellido`)
	},
	// Phone
	_phone: function (param, name) { return check(param)
		.not().isEmpty().withMessage(`${name} es obligatorio`)
		.isInt().withMessage(`${name} solo puede contener números`)
		.isLength({ min: 10, max: 10 }).withMessage(`${name} debe tener solo 10 caracteres`)
	},
	// Email
	_email: function (param, name) { return check(param)
		.not().isEmpty().withMessage(`${name} es obligatorio`)
		.isEmail().withMessage(`${name} no es valido`)
	},
	// Password
	_password: function (param, name) { return check(param)
		.not().isEmpty().withMessage(`${name} es obligatoria`)
		.isLength({ min: 8 }).withMessage(`${name} debe tener al menos 8 caracteres`)
		.isLength({ max: 16 }).withMessage(`${name} debe tener maximo 16 caracteres`)
		.matches(/\d/).withMessage(`${name} debe tener al menos un número`)
		.matches(/[a-z]/).withMessage(`${name} debe tener al menos una letra minuscula`)
		.matches(/[A-Z]/).withMessage(`${name} debe tener al menos una letra mayuscula`)
		.matches(/[\W_]/).withMessage(`${name} debe tener al menos un caracter especial`)
	},
	// Password confirm
	_passwordConfirm: function (param, name) { return this._password(param, name)
		.if(check('password').exists())
		.custom((value, { req }) => value === req.body.password).withMessage('Las contraseñas no coinciden')
	},
	// Terms and conditions as checkbox boolean
	_termsAndConditions: function (param, name) { return check(param)
		.not().isEmpty().withMessage(`${name} es obligatorio`)
		.equals('true').withMessage(`Debes aceptar ${name}`)
	},
	// Token digit
	_tokenDigit: function (param, name) { return check(param)
		.not().isEmpty().withMessage(`${name} es obligatorio`)
		.isInt().withMessage(`${name} solo puede contener números`)
		.isLength({ min: 1, max: 1 }).withMessage(`${name} debe tener solo 1 caracter`)
	},
	// Tracking number
	_trackingNumber: function (param, name) { return check(param)
		.not().isEmpty().withMessage(`${name} es obligatorio`)
		.isInt().withMessage(`${name} solo puede contener números`)
		.isLength({ min: 18, max: 18 }).withMessage(`${name} debe tener solo 18 caracteres`)
	},
	// Credit card
	_creditCard: function (param, name) { return check(param)
		.not().isEmpty().withMessage(`${name} es obligatorio`)
		.isInt().withMessage(`${name} solo puede contener números`)
		.isLength({ min: 16, max: 16 }).withMessage(`${name} debe tener solo 16 caracteres`)
	},
	// Credit card date format: MM/YY
	_creditCardDate: function (param, name) { return check(param)
		.not().isEmpty().withMessage(`${name} es obligatoria`)
		.isLength({ min: 5, max: 5 }).withMessage(`${name} debe tener solo 5 caracteres`)
		.matches(/^(0[1-9]|1[0-2])\/([0-9]{2})$/).withMessage(`${name} no es valida`)
		.custom((value, { req }) => {
			let date = value.split('/')
			let cardDate = new Date(`20${date[1]}`, date[0])
			let today = new Date()

			// get the last day of the month
			cardDate.setDate(cardDate.getDate() - 1)

			// set the date
			req.body.cardDate = cardDate.toISOString().split('T')[0]
			
			return cardDate > today
		}).withMessage('La fecha de expiración no es valida')
	},
	// Credit card cvv
	_creditCardCvv: function (param, name) { return check(param)
		.not().isEmpty().withMessage(`${name} es obligatorio`)
		.isInt().withMessage(`${name} solo puede contener números`)
		.isLength({ min: 3, max: 3 }).withMessage(`${name} debe tener solo 3 caracteres`)
	},
	// Credit card name
	_creditCardName: function (param, name) { return this._fullname(param, name)},
}


const Validator = {
	
	// Sign in
	signin: [
		v._email('email', 'El correo'),
		v._password('password', 'La contraseña'),
		validateResult
	],

	// Sign up
	signup: [
		v._fullname('name', 'El nombre'),
		v._phone('tel', 'El teléfono'),
		v._email('email', 'El correo'),
		v._password('password', 'La contraseña'),
		v._passwordConfirm('passwordConfirm', 'La confirmación de la contraseña'),
		v._termsAndConditions('terms', 'Los Términos y Condiciones'),
		validateResult
	],	

	// Token
	token: [
		v._tokenDigit('NUM1', 'El primer dígito'),
		v._tokenDigit('NUM2', 'El segundo dígito'),
		v._tokenDigit('NUM3', 'El tercer dígito'),
		v._tokenDigit('NUM4', 'El cuarto dígito'),
		v._tokenDigit('NUM5', 'El quinto dígito'),
		v._tokenDigit('NUM6', 'El sexto dígito'),
		validateResult
	],

	// Tracking number
	trackingNumber: [
		v._trackingNumber('tracking', 'El número de guia'),
		validateResult
	],


	// Contact (name, email, phone)
	contact: [
		v._nickname('name', 'El nombre'),
		v._email('email', 'El correo'),
		v._phone('phone', 'El teléfono'),
	],

	// Credit card
	creditCard: [
		v._creditCard('cardNumber', 'El número de tarjeta'),
		v._creditCardDate('cardDate', 'La fecha de expiración'),
		v._creditCardCvv('cardCvv', 'El CVV'),
		v._creditCardName('cardName', 'El nombre en la tarjeta'),
		v._nickname('nickName', 'El alias'),
		validateResult
	],

	// Checkout
	checkout: [

	]

}

module.exports = Validator