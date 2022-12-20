// Using Express-Session withour Passport.js
const Auth = {
	onlyUsers: (req, res, next) => {
		if (!req.session.user) 
			if (req.method == 'GET')
				res.redirect('/');
			else if (req.method == 'POST')
				req.json({
					response: 'ERROR',
					message: 'No tienes los permisos necesarios para realizar esta acción'
				})
		
		next();
	},
	onlyAdmins: (req, res, next) => {
		if (!req.session.user || req.session.user.role != 'ADMIN')
			if (req.method == 'GET')
				res.redirect('/');
			else if (req.method == 'POST')
				req.json({
					response: 'ERROR',
					message: 'No tienes los permisos necesarios para realizar esta acción'
				})
		
		next();
	},
	onlyDeliverers: (req, res, next) => {
		if (!req.session.user || req.session.user.role != 'DELIVERER')
			if (req.method == 'GET')
				res.redirect('/');
			else if (req.method == 'POST')
				req.json({
					response: 'ERROR',
					message: 'No tienes los permisos necesarios para realizar esta acción'
				})
		
		next();
	},
	onlyClients: (req, res, next) => {
		if (!req.session.user || req.session.user.role != 'CLIENT')
			if (req.method == 'GET')
				res.redirect('/');
			else if (req.method == 'POST')
				req.json({
					response: 'ERROR',
					message: 'No tienes los permisos necesarios para realizar esta acción'
				})
				
				next();
			},
	onlyGuests: (req, res, next) => {
		if (req.session.user)
			if (req.method == 'GET')
				res.redirect('/panel');
			else if (req.method == 'POST')
				req.json({
					response: 'ERROR',
					message: 'No tienes los permisos necesarios para realizar esta acción'
				})
				
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

					if (req.method == 'GET')
						res.redirect('/');
					else if (req.method == 'POST')
						req.json({
							response: 'ERROR',
							message: 'No tienes los permisos necesarios para realizar esta acción'
						})
		});
	}
};

module.exports = Auth;