const mysql = require('mysql2');
const con = mysql.createConnection({
	host:		process.env.MYSQL_HOST,
	port:		process.env.MYSQL_PORT,
	user: 		process.env.MYSQL_USER,
	password:	process.env.MYSQL_PASSWORD,
	database:	process.env.MYSQL_DATABASE,
});
const errorDBConnection = new Error('No se pudo conectar a la base de datos');
var isConnected = false;

con.on('error', function(err) {
	isConnected = false;
	console.error('db error', err);
	if(err.code === 'PROTOCOL_CONNECTION_LOST' || err.code === 'ECONNRESET' || err.code === 'ECONNREFUSED') {
		console.log('Connection to MySQL failed. Retrying in 5 seconds...');
		setTimeout(con.connect(), 5*1000);	// try again in 2 seconds
	}
	else
		throw err;
}).on('connect', function(err) {
	isConnected = true;
	console.info(`Connected to MySQL on ${process.env.MYSQL_HOST}:${process.env.MYSQL_PORT}!`)
});

con.connect();

const db = {
	// Roles
	ROLES: {
		ADMIN: 1,
		DELIVER: 2,
		CLIENT: 3,
	},
	con:con,
	checkCredentials: (email, password) => {
		return new Promise((resolve, reject) => {
			if (!isConnected)
				throw errorDBConnection;
			con.query('SELECT * FROM vUser WHERE em_usr = ? AND pwd_usr = ? LIMIT 1', [email, password], (err, results) => {
				if (err) reject(err);
				else resolve(results);
			});
		});
	},
	// get all users
	getUsers: () => {
		return new Promise((resolve, reject) => {
			if (!isConnected)
				throw errorDBConnection;
			con.query('SELECT * FROM vUser', (err, results) => {
				if (err) reject(err);
				else resolve(results);
			});
		});
	},
	// get user by id
	getUserById: (id) => {
		return new Promise((resolve, reject) => {
			if (!isConnected)
				throw errorDBConnection;
			con.query('SELECT * FROM vUser WHERE id_usr = ? LIMIT 1', [id], (err, results) => {
				if (err) reject(err);
				else resolve(results);
			});
		});
	},
	getUserByEmail: (email) => {
		return new Promise((resolve, reject) => {
			if (!isConnected)
				throw errorDBConnection;
			con.query('SELECT * FROM vUser WHERE em_usr = ? LIMIT 1', [email], (err, results) => {
				if (err) reject(err);
				else resolve(results);
			});
		});
	},
	
	// create new user with validation
	createUser: (name, email, tel, password, token, type) => {
		return new Promise((resolve, reject) => {
			if (!isConnected)
				throw errorDBConnection;
			
			// check if email is already in use
			
			db.getUserByEmail(email).then((results) => {
				if (results.length > 0) reject('Correo ya en uso');
				else {
					// create new user
					con.query('INSERT INTO User VALUES (DEFAULT, DEFAULT, ?, ?, ?, ?, ? , ? )', [name, email, tel, password, type, token], (err, results) => {
						if (err) reject(err);
						else resolve(results);
					});
				}
			}).catch((err) => {
				reject(err);
			});
		});
	},

	verifycode: (email, token) => {
		return new Promise((resolve, reject) => {
			if (!isConnected)
				throw errorDBConnection;
			con.query('SELECT * FROM vUser WHERE em_usr = ? AND tk_usr = ? LIMIT 1', [email,token], (err, results) => {
				if (err) reject(err);
				else if (results.length) {
					con.query('UPDATE User SET tk_usr = NULL WHERE em_usr = ?', [email], (err, results) => {
						if (err) reject(err);
						else resolve(results);
					});
				}
				else 
					reject('Código Inválido');
			});
		});
	},
			
	// Obtener todos los registros de la tabla Shipping
	getShipping: () => {
		return new Promise((resolve, reject) => {
			if (!isConnected)
				throw errorDBConnection;
			con.query('SELECT * FROM Shipping', (err, results) => {
				if (err) reject(err);
				else resolve(results);
			});
		});
	},

	// Obtener registros de shipping por estado del envio
	getShpgByStat: (stat) => {
		return new Promise((resolve, reject) => {
			if (!isConnected)
				throw errorDBConnection;
			con.query('SELECT * FROM Shipping WHERE stat_shpg = ?', [stat], (err, results) => {
				if (err) reject(err);
				else resolve(results);
			});
		});
	},

	getresumshipping: (trk_shpg,edge_shpgdr,stat_shpg) => {
		return new Promise((resolve, reject) => {
			if (!isConnected)
				throw errorDBConnection;
			con.query('SELECT trk_shpg, nm_lkr, date_rte, dtu_shpg FROM Shipping NATURAL JOIN User NATURAL JOIN ShippingDoor NATURAL JOIN Door NATURAL JOIN Locker NATURAL JOIN Route WHERE trk_shpg= ?', [stat], 'AND edge_shpgdr= ?', [stat], 'AND stat_shpg= ?', [stat], (err, results) => {
				if (err) reject(err);
				else resolve(results);
			});
		});
	},

	getshippingdetails: (trk_shpg) => {
		return new Promise((resolve, reject) => {
			if (!isConnected)
				throw errorDBConnection;
			con.query('SELECT * FROM ShippingDetail  WHERE trk_shpg= ?', [trk_shpg], (err, results) => {
				if (err) reject(err);
				else resolve(results);
			});
		});
	},

	getShippingStat: (trk_shpg) => {
		return new Promise((resolve, reject) => {
			con.query('SELECT stat_shpg FROM ShippingDetail WHERE trk_shpg = ?', [stat_shpg], (err,results) => {
				if (err) reject(err);
				else resolve(results);
			});
		});
	},

	getContactsByUserId: (id_usr) => {
		return new Promise((resolve, reject) => {
			if (!isConnected)
				throw errorDBConnection;
			con.query('SELECT * FROM Contact WHERE id_usr= ?', [id_usr], (err, results) => {
				if (err) reject(err);
				else resolve(results);
			});
		});
	},
	
	getShippings: (id_usr) => {
		return new Promise((resolve, reject) => {
			if (!isConnected)
				throw errorDBConnection;
			con.query('SELECT * FROM ShippingDetail  WHERE id_usr= ?', [id_usr], (err, results) => {
				if (err) reject(err);
				else resolve(results);
			});
		});
	},

	getContact:(id_usr,email,tel) =>{
		return new Promise((resolve, reject) => {
			if (!isConnected)
				throw errorDBConnection;
			con.query('SELECT * FROM Contact  WHERE id_usr= ? and em_cont= ? and tel_cont= ?', [id_usr, email, tel], (err, results) => {
				if (err) reject(err);
				else resolve(results);
			});
		});
	},


	createContact: (idUser,name, email, tel) => {
		return new Promise((resolve, reject) => {
			if (!isConnected)
				throw errorDBConnection;
			// check if email is already in use			
			db.getContact(idUser,email,tel).then((results) => {
				if (results.length > 0) reject('El contacto ya ha sido registrado');
				else {
					// create new user
					con.query('INSERT INTO Contact VALUES (DEFAULT, ?, ?, ?, ?)', [idUser, name ,email, tel], (err, results) => {
						if (err) reject(err);
						else resolve(results);
					});
				}
			}).catch((err) => {
				reject(err);
			});
		});
	},

	getAdress:(id_usr,email,tel) =>{ //modifique
		return new Promise((resolve, reject) => {
			if (!isConnected)
				throw errorDBConnection;
			con.query('SELECT * FROM Contact  WHERE id_usr= ? and em_cont= ? and tel_cont= ?', [id_usr, email, tel], (err, results) => {
				if (err) reject(err);
				else resolve(results);
			});
		});
	},

	getlocations:() =>{ //modifique
		return new Promise((resolve, reject) => {
			if (!isConnected)
				throw errorDBConnection;
			con.query('SELECT * FROM Locker', [], (err, results) => {
				if(err)reject(err);
				else resolve(results);
			});
		});
	},
	getloker:(id) =>{ //modifique
		return new Promise((resolve, reject) => {
			if (!isConnected)
				throw errorDBConnection;
			console.log('id es: '+id);
			con.query('SELECT * FROM Locker WHERE id_lkr = ? ', [id], (err, results) => {
				console.log('results: ');
				console.log(results);
				if(err)reject(err);
				else resolve(results);
			});
		});
	},

	createAddresse: (idUser,name, email, tel) => { //modifique
		return new Promise((resolve, reject) => {
			if (!isConnected)
				throw errorDBConnection;
			
			// check if email is already in use
			
			db.getAdress(idUser,email,tel).then((results) => {
				if (results.length > 0) reject('El contacto ya ha sido registrado');
				else {
					// create new user
					con.query('INSERT INTO Contact VALUES (DEFAULT, ?, ?, ?, ?)', [idUser, name ,email, tel], (err, results) => {
						if (err) reject(err);
						else resolve(results);
					});
				}
			}).catch((err) => {
				reject(err);
			});


	
		});
	},


	getPayment:(id_usr,name,card,date) =>{ //modifique
		return new Promise((resolve, reject) => {
			if (!isConnected)
				throw errorDBConnection;
			con.query('SELECT * FROM Wallet  WHERE id_usr= ? and nm_wal= ? and num_wal= ? and  date_wal= STR_TO_DATE(?,"%d/%m/%Y")', [id_usr, name, card, date], (err, results) => {
				if (err) reject(err);
				else resolve(results);
			});
		});
	},


	createPayment: (idUser,nick,name,card,date) => { //modifique
		return new Promise((resolve, reject) => {
			if (!isConnected)
				throw errorDBConnection;
			// check if card is already in use			
			db.getPayment(idUser,name,card,date).then((results) => {
				if (results.length > 0) reject('El metodo de pago ya se encuentra registrado');
				else {
					//console.log("FECHA:", date);
					// create new payment
					con.query('INSERT INTO Wallet VALUES (DEFAULT, ?, ?, ?, ?, STR_TO_DATE(?,"%d/%m/%Y"))', [idUser,nick,name,card,date], (err, results) => {
						if (err) reject(err);
						else resolve(results);
					});
				}
			}).catch((err) => {
				reject(err);
			});
		});
	},

	// Get wallets by id_usr
	getWalletsByUserId:(idUser) =>{ 
		return new Promise((resolve, reject) => {
			if (!isConnected)
				throw errorDBConnection;
			con.query('SELECT * FROM Wallet WHERE id_usr = ?', [idUser], (err, results) => {
				if (err) reject(err);
				else resolve(results);
			});
		});
	},

	// Deliver Methods

	getStateRoute:(idUser) =>{ //
		return new Promise((resolve, reject) => {
			if (!isConnected)
				throw errorDBConnection;
			con.query('SELECT id_rte, date_rte, stat_rte FROM route WHERE id_usr = ?', [idUser], (err, results) => {
				if (err) reject(err);
				else resolve(results);
			});
		});
	},

	getLockersByUserId:(idUser, stat) =>{
		return new Promise((resolve, reject) => {
			if (!isConnected)
				throw errorDBConnection;
			con.query(`SELECT * 
			FROM Route 
			INNER JOIN RouteDetail
			ON Route.id_rte = RouteDetail.id_rte
			INNER JOIN Locker
			ON RouteDetail.id_lkr = Locker.id_lkr
			WHERE id_usr = ? 
			ORDER BY stat_rte, date_rte `, [idUser], (err, results) => {
				if (err) reject(err);
				else resolve(results);
			});
		});
	},


	getShippingdetailByUserId: (userId, lockerDestino) => {
		return new Promise((resolve, reject) => {
			if (!isConnected)
				throw errorDBConnection;
			con.query('SELECT * FROM ShippingDetail WHERE nm_lkrdst = ?', [ lockerDestino], (err, results) => {
				if (err) reject(err);
				else resolve(results);
			});
		});
	},

};

module.exports = db;