const { check, validationResult } = require('express-validator');

const validateResult = (req, res, next) => {
	try {
		validationResult(req).throw();
		next();
	}
	catch (err) {
		res.status(422).json({ errors: err.array() });
		/**
		 * Example of err.array() output:
		 * [
		 * 	{
		 * 		value: '123456789',
		 * 		msg: 'El telefono debe tener solo 10 caracteres',
		 * 		param: 'phone',
		 * 		location: 'body'
		 * 	}
		 * ]
		 */
	}
};


const Validator = {
	// Nickname
	_nickname: (param, name) =>  check(param)
		.not().isEmpty().withMessage(`${name} es obligatorio`)
		.isLength({ min: 3 }).withMessage(`${name} debe tener al menos 3 caracteres`)
		.isLength({ max: 50 }).withMessage(`${name} debe tener maximo 50 caracteres`)
		.isAlphanumeric().withMessage(`${name} solo puede contener letras y numeros`),
	// Fullname
	_fullname: (param, name) => check(param)
		.not().isEmpty().withMessage(`${name} es obligatorio`)
		.isLength({ min: 6 }).withMessage(`${name} debe tener al menos 6 caracteres, 3 para el nombre y 2 para el apellido incluyendo el espacio`)
		.isLength({ max: 50 }).withMessage(`${name} debe tener maximo 50 caracteres`)
		.matches(/^[a-zA-Zà-ÿÀ-Ÿ ]+$/).withMessage(`${name} solo puede contener letras`)
		// Fistname at least 3 characters
		.matches(/^[a-zA-Zà-ÿÀ-Ÿ]{3,}/).withMessage(`${name} debe tener al menos 3 caracteres`)
		// Lastname at least 2 characters
		.matches(/ ([a-zA-Zà-ÿÀ-Ÿ]{2,} *)+$/).withMessage(`${name} debe tener al menos 3 caracteres`)
		// Full match
		.matches(/^[a-zA-Zà-ÿÀ-Ÿ]{3,} ([a-zA-Zà-ÿÀ-Ÿ]{2,} *)+$/).withMessage(`${name} debe tener al menos 3 caracteres para el nombre y 2 para el apellido`),
	// Phone
	_phone: (param, name) => check(param)
		.not().isEmpty().withMessage(`${name} es obligatorio`)
		.isInt().withMessage(`${name} solo puede contener numeros`)
		.isLength({ min: 10, max: 10 }).withMessage(`${name} debe tener solo 10 caracteres`),
	// Email
	_email: (param, name) => check(param)
		.not().isEmpty().withMessage(`${name} es obligatorio`)
		.isEmail().withMessage(`${name} no es valido`),
	// Password
	_password: (param, name) => check(param)
		.not().isEmpty().withMessage(`${name} es obligatoria`)
		.isLength({ min: 8 }).withMessage(`${name} debe tener al menos 8 caracteres`)
		.isLength({ max: 16 }).withMessage(`${name} debe tener maximo 16 caracteres`)
		.matches(/\d/).withMessage(`${name} debe tener al menos un numero`)
		.matches(/[a-z]/).withMessage(`${name} debe tener al menos una letra minuscula`)
		.matches(/[A-Z]/).withMessage(`${name} debe tener al menos una letra mayuscula`)
		.matches(/[!@#$%^&*(),.?":{}|<>]/).withMessage(`${name} debe tener al menos un caracter especial`),
	// Password confirm
	_passwordConfirm: (param, name) => _password(param, name)
		.if(check('password').exists())
		.custom((value, { req }) => value !== req.body.password).withMessage('Las contraseñas no coinciden'),
	// Token digit
	_tokenDigit: (param, name) => check(param)
		.not().isEmpty().withMessage(`${name} es obligatorio`)
		.isInt().withMessage(`${name} solo puede contener numeros`)
		.isLength({ min: 1, max: 1 }).withMessage(`${name} debe tener solo 1 caracter`),
	// Credit card
	_creditCard: (param, name) => check(param)
		.not().isEmpty().withMessage(`${name} es obligatorio`)
		.isInt().withMessage(`${name} solo puede contener numeros`)
		.isLength({ min: 16, max: 16 }).withMessage(`${name} debe tener solo 16 caracteres`),
	// Credit card date format: MM/YY
	_creditCardDate: (param, name) => check(param)
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
		}).withMessage('La fecha de expiracion no es valida'),
	// Credit card cvv
	_creditCardCvv: (param, name) => check(param)	
		.not().isEmpty().withMessage(`${name} es obligatorio`)
		.isInt().withMessage(`${name} solo puede contener numeros`)
		.isLength({ min: 3, max: 3 }).withMessage(`${name} debe tener solo 3 caracteres`),
	// Credit card name
	_creditCardName: (param, name) => _fullname(param, name),
	
	// Sign in
	signin: [
		_email('email', 'El correo'),
		_password('password', 'La contraseña'),
	],

	// Sign up
	signup: [
		_fullname('name', 'El nombre'),
		_phone('phone', 'El teléfono'),
		_email('email', 'El correo'),
		_password('password', 'La contraseña'),
		_passwordConfirm('passwordConfirm', 'La confirmación de la contraseña'),
		validateResult
	],	

	// Token
	token: [
		_tokenDigit('NUM1', 'El primer digito'),
		_tokenDigit('NUM2', 'El segundo digito'),
		_tokenDigit('NUM3', 'El tercer digito'),
		_tokenDigit('NUM4', 'El cuarto digito'),
		_tokenDigit('NUM5', 'El quinto digito'),
		_tokenDigit('NUM6', 'El sexto digito'),
		validateResult
	],


	// Contact (name, email, phone)
	contact: [
		_nickname('name', 'El nombre'),
		_email('email', 'El correo'),
		_phone('phone', 'El teléfono'),
		validateResult
	],

	// Credit card
	creditCard: [
		_creditCard('cardNumber', 'El numero de tarjeta'),
		_creditCardDate('cardDate', 'La fecha de expiracion'),
		_creditCardCvv('cardCvv', 'El cvv'),
		_creditCardName('cardName', 'El nombre en la tarjeta'),
		validateResult
	],

	// Checkout
	checkout: [

	]

}

module.exports = Validator