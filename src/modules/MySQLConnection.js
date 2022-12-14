const mysql = require('mysql2');
const errorDBConnection = new Error('No se pudo conectar a la base de datos');
var con,
	isConnected = false;

function connect(time=5) {
	con = mysql.createConnection({
		host:		process.env.MYSQL_HOST,
		port:		process.env.MYSQL_PORT,
		user: 		process.env.MYSQL_USER,
		password:	process.env.MYSQL_PASSWORD,
		database:	process.env.MYSQL_DATABASE,
	});
	con.connect((err) => {
		isConnected = !err;
		if (err) {
			console.log(`Connection to MySQL failed [${err.code}]. Retrying in ${time} seconds...`);
			setTimeout(() => connect(++time), 5*1000);	// try again in time seconds
		} 
		else console.log(`Connected to MySQL on ${process.env.MYSQL_HOST}:${process.env.MYSQL_PORT}!`);
	});
}

connect();

const db = {
	// Roles
	USER_ROLES: {
		ADMIN: 1,
		DELIVER: 2,
		CLIENT: 3,
	},
	SHIPMENT_STATUS: {
		WAITING_FOR_STORAGE: 1,
		WAITING_FOR_PICKUP: 2,
		DELIVERING: 3,
		WAITING_FOR_DELIVERY: 4,
		COMPLETED: 5,
		IN_STORAGE: 6,
		CANCELED: 7,
	},
	user: {
		exists: (email) => {
			return new Promise((resolve, reject) => {
				con.query('SELECT * FROM users WHERE email=?', [email], (err, results) => {
					if (err) reject(err);
					else resolve(results[0]);
				});
			});
		},
		getById: (id) => {
			return new Promise((resolve, reject) => {
				if (!isConnected)
					throw errorDBConnection;
				con.query('SELECT * FROM vUser WHERE id_usr=? LIMIT 1', [id], (err, results) => {
					if (err) reject(err);
					else resolve(results);
				});
			});
		},
		credential: (email, password) => {
			return new Promise((resolve, reject) => {
				if (!isConnected)
					throw errorDBConnection;
				con.query('SELECT * FROM vUser WHERE em_usr=? AND pwd_usr=? LIMIT 1', [email, password], (err, results) => {
					if (err) reject(err);
					else resolve(results);
				});
			});
		},
		create: (name, email, tel, password, token, type) => {
			return new Promise((resolve, reject) => {
				if (!isConnected)
					throw errorDBConnection;
				
				// check if email is already in use
				
				db.user.exists(email).then((exists) => {
					if (exists) reject('Correo ya en uso');
					else {
						// create new user
						con.query('INSERT INTO User VALUES (DEFAULT, DEFAULT, ?, ?, ?, ?, ? , ? )', [name, email, tel, password, type, token], (err, results) => {
							if (err) reject(err);
							else resolve(results);
						});
					}
				}).catch(reject);
			});
		},
		verify: (email, token) => {
			return new Promise((resolve, reject) => {
				if (!isConnected)
					throw errorDBConnection;
				con.query('SELECT * FROM vUser WHERE em_usr=? AND tk_usr=? LIMIT 1', [email,token], (err, results) => {
					if (err) reject(err);
					else if (results.length) {
						con.query('UPDATE User SET tk_usr = NULL WHERE em_usr=?', [email], (err, results) => {
							if (err) reject(err);
							else resolve(results);
						});
					}
					else 
						reject('C??digo Inv??lido');
				});
			});
		},
	},

	shipping: {
		getByTracking: (tracking) => {
			return new Promise((resolve, reject) => {
				if (!isConnected)
					throw errorDBConnection;
				con.query('SELECT * FROM ShippingDetail WHERE trk_shpg=?', [tracking], (err, results) => {
					if (err) reject(err);
					else resolve(results);
				});
			});
		},
		getAllByUserId: (userId) => {
			return new Promise((resolve, reject) => {
				if (!isConnected)
					throw errorDBConnection;
				con.query('SELECT * FROM ShippingDetail  WHERE id_usr=? ', [userId], (err, results) => {
					if (err) reject(err);
					else resolve(results);
				});
			});
		},
		getAllPendingByUserId: (userId) => {
			return new Promise((resolve, reject) => {
				if (!isConnected)
					throw errorDBConnection;
				con.query('SELECT * FROM ShippingDetail  WHERE id_usr=? AND (stat_shpg = 6 OR stat_shpg < 5)', [userId], (err, results) => {
					if (err) reject(err);
					else resolve(results);
				});
			});
		},
		create: (userId, tracking, typeId, price, walletId, orgDoorId, dstDoorId, orgCntId, dstCntId, qr) => {
			return new Promise((resolve, reject) => {
				if (!isConnected)
					throw errorDBConnection;
				con.query('INSERT INTO Shipping VALUES (?, ?, ?, DEFAULT, DEFAULT, DEFAULT, NULL, ?, ?)', [tracking, userId, typeId, price, walletId], (err, results) => {
					if (err) reject(err);
					else
						con.query('INSERT INTO ShippingDoor VALUES (DEFAULT, ?, ?, ?, 0, ?), (DEFAULT, ?, ?, ?, 1, NULL)', [orgDoorId, tracking, orgCntId, qr, dstDoorId, tracking, dstCntId], (err, results) => {
							if (err) reject(err);
							else resolve(results);
						});
					
				});
			});
		},
		updateState: (tracking, state) => {
			return new Promise((resolve, reject) => {
				if (!isConnected)
					throw errorDBConnection;
				con.query('UPDATE Shipping SET stat_shpg=? WHERE trk_shpg=?', [state, tracking], (err, results) => {
					if (err) reject(err);
					else resolve(results);
				});
			});
		},
		updateStateIncrement: (tracking, state) => {
			state = Math.min(parseInt(state)+1, 7);
			return db.shipping.updateState(tracking, state);
		},
	},

	contact: {
		exists: (userId, email, tel) => {
			return new Promise((resolve, reject) => {
				if (!isConnected)
					throw errorDBConnection;
				con.query('SELECT * FROM Contact WHERE id_usr=? AND em_cont=? AND tel_cont=?', [userId, email, tel], (err, results) => {
					if (err) reject(err);
					else resolve(results[0]);
				});
			});
		},
		getById: (id) => { 
			return new Promise((resolve, reject) => {
				if (!isConnected)
					throw errorDBConnection;
				con.query('SELECT * FROM Contact WHERE id_cont=? LIMIT 1', [id], (err, results) => {
					if (err) reject(err);
					else resolve(results);
				});
			});
		},
		getAllByUserId: (userId) => {
			return new Promise((resolve, reject) => {
				if (!isConnected)
					throw errorDBConnection;
				con.query('SELECT * FROM Contact WHERE id_usr=?', [userId], (err, results) => {
					if (err) reject(err);
					else resolve(results);
				});
			});
		},
		create: (userId, name, email, tel) => {
			return new Promise((resolve, reject) => {
				if (!isConnected)
					throw errorDBConnection;
				db.contact.exists(userId, email, tel).then((result) => {
					if (result) reject('El contacto ya existe');
					else {
						con.query('INSERT INTO Contact VALUES (DEFAULT, ?, ?, ?, ?)', [userId, name, email, tel], (err, results) => {
							if (err) reject(err);
							else resolve(results);
						});
					}
				}).catch(reject);
			});
		}
	},

	wallet: {
		exists: (userId, name, number, date) => {
			return new Promise((resolve, reject) => {
				if (!isConnected)
					throw errorDBConnection;
				con.query('SELECT * FROM Wallet WHERE id_usr=? AND nm_wal=? AND num_wal=? AND exp_wal=?', [userId, name, number, date], (err, results) => {
					if (err) reject(err);
					else resolve(results[0]);
				});
			});
		},
		getById: (id) => { 
			return new Promise((resolve, reject) => {
				if (!isConnected)
					throw errorDBConnection;
				con.query('SELECT * FROM Wallet WHERE id_wal=? LIMIT 1', [id], (err, results) => {
					if (err) reject(err);
					else resolve(results);
				});
			});
		},
		getAllByUserId: (userId) => {
			return new Promise((resolve, reject) => {
				if (!isConnected)
					throw errorDBConnection;
				con.query('SELECT * FROM Wallet WHERE id_usr=?', [userId], (err, results) => {
					if (err) reject(err);
					else resolve(results);
				});
			});
		},
		create: (userId, nick, name, number, date) => {
			return new Promise((resolve, reject) => {
				if (!isConnected)
					throw errorDBConnection;
				db.wallet.exists(userId, name, number, date).then((exists) => {
					if (exists) reject('La tarjeta ya existe');
					else {
						con.query('INSERT INTO Wallet VALUES (DEFAULT, ?, ?, ?, ?, STR_TO_DATE(?,"%d/%m/%Y"))', [userId, nick, name, number, date], (err, results) => {
							if (err) reject(err);
							else resolve(results);
						});
					}
				}).catch(reject);
			});
		},
	},

	report: {
		create: (userId, doorId, tracking, title, description) => {
			return new Promise((resolve, reject) => {
				if (!isConnected)
					throw errorDBConnection;
				con.query('INSERT INTO Report VALUES (DEFAULT, ?, ?, ?, ?, ?)', [userId, doorId, tracking, title, description], (err, results) => {
					if (err) reject(err);
					else resolve(results);
				});
			});
		}
	},

	locker: {
		getById: (id) => {
			return new Promise((resolve, reject) => {
				if (!isConnected)
					throw errorDBConnection;
				con.query('SELECT * FROM Locker WHERE id_lkr=? LIMIT 1', [id], (err, results) => {
					if (err) reject(err);
					else resolve(results);
				});
			});
		},
		getAll: () => {
			return new Promise((resolve, reject) => {
				if (!isConnected)
					throw errorDBConnection;
				con.query('SELECT * FROM Locker', (err, results) => {
					if (err) reject(err);
					else resolve(results);
				});
			});
		},
		getDoorTypeById: (id) => {
			return new Promise((resolve, reject) => {
				if (!isConnected)
					throw errorDBConnection;
				con.query('SELECT * FROM DoorType WHERE id_drtype=? LIMIT 1', [id], (err, results) => {
					if (err) reject(err);
					else resolve(results);
				});
			});
		}
	},

	route: {
		getByUserId: (userId) => {
			return new Promise((resolve, reject) => {
				if (!isConnected)
					throw errorDBConnection;
				con.query('SELECT * FROM Route \
							NATURAL JOIN RouteDetail \
							NATURAL JOIN Locker \
							WHERE stat_rte=1 AND Route.id_usr=?', [userId], (err, results) => {
					if (err) reject(err);
					else resolve(results);
				});
			});
		},
		getDetails: (userId, lockerName) => {
			return new Promise((resolve, reject) => {
				if (!isConnected)
					throw errorDBConnection;
				con.query('SELECT * FROM RouteShipping WHERE id_usr_rte=? AND nm_lkr=?', [userId, lockerName], (err, results) => {
					if (err) reject(err);
					else resolve(results);
				});
			});
		},
		getShipping: (traking) => {
			return new Promise((resolve, reject) => {
				if (!isConnected)
					throw errorDBConnection;
				con.query('SELECT * FROM RouteShipping WHERE trk_shpg=?', [traking], (err, results) => {
					if (err) reject(err);
					else resolve(results);
				});
			});
		}
	},
};

module.exports = db;