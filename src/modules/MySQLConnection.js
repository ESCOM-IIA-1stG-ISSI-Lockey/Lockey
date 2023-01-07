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
	
	getshippingdetails: (trk_shpg) => {
		return new Promise((resolve, reject) => {
			if (!isConnected)
				throw errorDBConnection;
			con.query('SELECT * FROM ShippingDetail WHERE trk_shpg= ?', [trk_shpg], (err, results) => {
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
	
	getPendingShippings: (id_usr) => {
		return new Promise((resolve, reject) => {
			if (!isConnected)
				throw errorDBConnection;
			con.query('SELECT * FROM ShippingDetail  WHERE id_usr= ? AND (stat_shpg = 6 OR stat_shpg < 5)', [id_usr], (err, results) => {
				if (err) reject(err);
				else resolve(results);
			});
		});
	},
	
	getShippings: (id_usr) => {
		return new Promise((resolve, reject) => {
			if (!isConnected)
				throw errorDBConnection;
			con.query('SELECT * FROM ShippingDetail  WHERE id_usr= ? ', [id_usr], (err, results) => {
				if (err) reject(err);
				else resolve(results);
			});
		});
	},
		
	updateShippingState: (state,tkr) => {
		return new Promise((resolve, reject) => {
			if (!isConnected)
				throw errorDBConnection;
			// get min value of state or 5
			state = Math.min(parseInt(state)+1, 7);
			console.log('TRAKING <%s> NEXT STATE [%s]', tkr, state)
			con.query("UPDATE Shipping SET stat_shpg = ? where trk_shpg = ?", [state,tkr], (err, results) => {
				if (err) reject(err);
				else resolve(results);
			});
		});
	},

	getContactById: (id_cont) => {
		return new Promise((resolve, reject) => {
			if (!isConnected)
				throw errorDBConnection;
			con.query('SELECT * FROM Contact  WHERE id_cont= ? LIMIT 1', [id_cont], (err, results) => {
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
		console.log(tel,"telefono")
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
	getLokerById:(id) =>{ //modifique
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

	getWalletById: (id_wal) => {
		return new Promise((resolve, reject) => {
			if (!isConnected)
				throw errorDBConnection;
			con.query('SELECT * FROM Wallet WHERE id_wal = ? ', [id_wal], (err, results) => {
				if (err) reject(err);
				else resolve(results);
			});
		});
	},

	getSizeById: (id_size) => {
		return new Promise((resolve, reject) => {
			if (!isConnected)
				throw errorDBConnection;
			con.query('SELECT * FROM DoorType WHERE id_drtype = ? ', [id_size], (err, results) => {
				if (err) reject(err);
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


	getPayment:(id_usr,name,number,date) =>{ //modifique
		return new Promise((resolve, reject) => {
			if (!isConnected)
				throw errorDBConnection;
			con.query('SELECT * FROM Wallet WHERE id_usr= ? and nm_wal= ? and num_wal= ? and  date_wal= STR_TO_DATE(?,"%d/%m/%Y")', [id_usr, name, number, date], (err, results) => {
				if (err) reject(err);
				else resolve(results);
			});
		});
	},


	createPayment: (idUser,nick,name,number,date) => { //modifique
		return new Promise((resolve, reject) => {
			if (!isConnected)
				throw errorDBConnection;
			// check if card is already in use			
			db.getPayment(idUser,name,number,date).then((results) => {
				if (results.length > 0) reject('El metodo de pago ya se encuentra registrado');
				else {
					//console.log("FECHA:", date);
					// create new payment
					con.query('INSERT INTO Wallet VALUES (DEFAULT, ?, ?, ?, ?, STR_TO_DATE(?,"%d/%m/%Y"))', [idUser,nick,name,number,date], (err, results) => {
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
			con.query(`SELECT Route.*, RouteDetail.*, Locker.* FROM Route NATURAL JOIN RouteDetail NATURAL JOIN Locker
			WHERE stat_rte=1 AND Route.id_usr=?;`, [idUser], (err, results) => {
				if (err) reject(err);
				else resolve(results);
			});
		});
	},

	getShippingdetailByUserId: (userId, lockerDestino) => {
		return new Promise((resolve, reject) => {
			if (!isConnected)
				throw errorDBConnection;
			con.query('SELECT * FROM Route NATURAL JOIN RouteDetail NATURAL JOIN Locker NATURAL JOIN Door NATURAL JOIN ShippingDoor INNER JOIN ShippingDetail ON ShippingDetail.trk_shpg=ShippingDoor.trk_shpg WHERE stat_rte=1 AND qr_shpgdr IS NOT NULL AND Route.id_usr=? AND Locker.nm_lkr = ? ',[userId, lockerDestino ], (err, results) => {
				if (err) reject(err);
				else resolve(results);
			});
		});
	},
	getShippinguide: (userId, guia) => { //202212150310001002
		return new Promise((resolve, reject) => {
			if (!isConnected)
				throw errorDBConnection;
			con.query('SELECT * FROM Route NATURAL JOIN RouteDetail NATURAL JOIN Locker NATURAL JOIN Door NATURAL JOIN ShippingDoor INNER JOIN ShippingDetail ON ShippingDetail.trk_shpg=ShippingDoor.trk_shpg WHERE stat_rte=1 AND qr_shpgdr IS NOT NULL AND Route.id_usr=? AND ShippingDoor.trk_shpg  = ? ', [userId, guia ], (err, results) => {
				if (err) reject(err);
				else resolve(results);
			});
		});
	},

	createReport:(idUser, idDoor, numGuia, title, details) => {
		return new Promise((resolve, reject) => {
			if (!isConnected)
				throw errorDBConnection;
			con.query('INSERT INTO Report VALUES (DEFAULT, ?, ?, ?, ?, ?)', [idUser, idDoor, numGuia, title, details], (err, results) => {
				if (err) reject(err);
				else resolve(results);
			});
		});
	},

	updateShippingstroute: (stateShipping ,tkr) => {
		return new Promise((resolve, reject) => {
			if (!isConnected)
				throw errorDBConnection;
			stateShipping = Math.min(parseInt(stateShipping)+1, 7);
			console.log("NEXT ESTADO:", stateShipping);
			con.query("UPDATE Shipping SET stat_shpg = ? where trk_shpg = ?", [stateShipping ,tkr], (err, results) => {
				if (err) reject(err);
				else resolve(results);
			});
		});
	},

	//Aqui tenia planeado obtener el numero de guia pero creo que la getShippinguide ya lo hace  
	getShipping: (userId, guia) => { //202212150310001002
		return new Promise((resolve, reject) => {
			if (!isConnected)
				throw errorDBConnection;
			con.query('SELECT * FROM Route NATURAL JOIN RouteDetail NATURAL JOIN Locker NATURAL JOIN Door NATURAL JOIN ShippingDoor INNER JOIN ShippingDetail ON ShippingDetail.trk_shpg=ShippingDoor.trk_shpg WHERE stat_rte=1 AND qr_shpgdr IS NOT NULL AND Route.id_usr=? AND ShippingDoor.trk_shpg  = ? ', [userId, guia ], (err, results) => {
				if (err) reject(err);
				else resolve(results);
			});
		});
	},


	//guardar lso datos del envio
	createShipping: (idUser,time_create,time_fimish, price, wallet, guia, size, sender) => {
		return new Promise((resolve, reject) => {
			if (!isConnected)
				throw errorDBConnection;
			// check if email is already in use			
			db.getEnvio(idUser,guia).then((results) => {
				if (results.length > 0) reject('El envio ya existe');
				else {
					// create new user
					con.query('INSERT INTO Shipping VALUES (DEFAULT, ?, ?, ?, ?, ?, ?)', [idUser, time_create ,time_finish, price, wallet, guia,size ,sender], (err, results) => {
						if (err) reject(err);
						else resolve(results);
					});
				}
			}).catch((err) => {
				reject(err);
			});
		});
	},

	//faltaria llenar la tabla shippingDoor y guardarla
	Shipping: (idUser,IdDoor,numGuia, idCont, wallet, guia, size, sender) => {




	},

};

module.exports = db;