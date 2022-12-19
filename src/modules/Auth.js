const { con } = require("./MySQLConnection");

// Using Express-Session withour Passport.js
const Auth = {
	onlyUsers: (req, res, next) => {
		if (!req.session.user) 
			return res.redirect('/');
		
		next();
	},
	onlyAdmins: (req, res, next) => {
		if (!req.session.user || req.session.user.role != 'ADMIN')
			return res.redirect('/');
		
		next();
	},
	onlyDeliverers: (req, res, next) => {
		if (!req.session.user || req.session.user.role != 'DELIVERER')
			return res.redirect('/');
		
		next();
	},
	onlyClients: (req, res, next) => {
		if (!req.session.user || req.session.user.role != 'CLIENT')
			return res.redirect('/');
		
		next();
	},
	onlyGuests: (req, res, next) => {
		if (req.session.user)
			return res.redirect('/panel');
		
		next();
	},
	
	createSession: (req, res, newUser) => {
		return req.session.regenerate((err) => {
			if (err)
				throw new Error('No se pudo iniciar sesión')
			
			req.session.user = {
				id: newUser.id_usr,
				name: newUser.nm_usr,
				email: newUser.em_usr,
				type: newUser.type_usr,
				isActive: newUser.act_usr,
			};

			res.json({
				response: 'OK',
				message: 'Usuario creado correctamente',
				redirect: '/',
			});
		});
	},

	deleteSession: (req, res) => {
		req.session.destroy((err) => {
			if (err)
				return res.status(500).send({ error: 'No se pudo cerrar la sesión' });

			res.redirect('/');
		});
	}
};

module.exports = Auth;