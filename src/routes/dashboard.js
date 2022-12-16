var debug = require('debug')('lockey:router:dashboard');
var express = require('express');
var router = express.Router();
var db = require('../modules/MySQLConnection');

router.get('/', async(req, res, next) => {
		if (req.session.user) {
			debug('session.user:', req.session.user);
			let params = {}
			if(req.session.user.type=='DELIVER')
			{
				params.stateRoute = await db.getLockersByUserId(req.session.user.id)
			}else if(req.session.user.type=='CLIENT')
			{
				params.pedingShipings = await db.getShippings(req.session.user.id)
			}
			console.log.params
			res.render('dashboard', {
				 title: 'sendiit - panel', 
				 path: req.path, 
				 user: req.session.user, 
				 ...params
				});
		}
		else {
			res.redirect('/');
			}
});

router.get('/cerrarsesion', (req, res, next) => {
	debug('session.user:', req.session.user);
	if (req.session.user) {
		req.session.destroy();
		res.redirect('/');
	} else {
		res.redirect('/');
	}
});
router.get('/envio');//envios historicos (esto de momento no)

router.get('/envio/detalles/[0-9]{18}', (req,res,next) =>{
	// res.render("shippingdetails") 
	if (req.session.user) {
		let traking=req.path.match(/\d{18}/)[0] 
		console.log (traking)
		db.getshippingdetails(traking).then((results)=>{
			debug('results', results);
			if (results.length) {
				res.render('shippingdetails', { title: 'sendiit - panel', path: req.path, user: req.session.user, shipping:results[0]});
			}
			else {
				res.status(401).json({response:'ERROR', message:'Envío no encontrado'});
			}
		});
	
	} else {
		res.redirect('/');
	}
});

router.get('/envio/crearEnvio', (req,res,next) =>{
	if (req.session.user) {

		res.render('createSummary' , { title: 'sendiit - panel', path: req.path, user: req.session.user });
	} else {
		res.redirect('/');
	}
});


router.post('/envio/crearEnvio', (req,res,next) =>{
	if (req.session.user) {
        if(!req.session.createShipping){
            req.session.createShipping = {}
        }
        let {MapaOrigen} = req.body
        console.log('hola aqui estoy')
        console.log(req.body)
        req.session.createShipping.origin = MapaOrigen
        console.log(req.session.createShipping)
		res.redirect('/panel/envio/crearEnvio');
	} else {
		res.redirect('/');
	}
});

router.get('/envio/crearEnvio/origen', (req,res,next) =>{
	if (req.session.user) {
        db.getlocations().then((results)=>{
			debug('results', results);
			if (results.length) {
                res.render('chooseOrigen' , { title: 'sendiit - panel', path: req.path, user: req.session.user, address:results });
			}
			else {
				res.status(401).json({response:'ERROR', message:'Envío no encontrado'});
			}
		});
	} else {
		res.redirect('/');
	}
});

router.get('/envio/crearEnvio/destino', (req,res,next) =>{
    if (req.session.user) {
        db.getlocations().then((results)=>{
			debug('results', results);
			if (results.length) {
                res.render('chooseDestination' , { title: 'sendiit - panel', path: req.path, user: req.session.user, address:results });
			}
			else {
				res.status(401).json({response:'ERROR', message:'Envío no encontrado'});
			}
		});
	} else {
		res.redirect('/');
	}
});

router.post('/envio/crearEnvio', (req,res,next) =>{
	console.log(req.body)
    let {name, email, tel} = req.body;
    db.createContact(req.session.user.id, name, email, tel).then((results)=>{ //checar
        debug('results', results);
        if (results.affectedRows) {
            res.status(200).json({
                response: "OK",
                message: "Contacto guardado con éxito",
                // redirect: "ViewMaps" //modifiaciones prueba mapas
            })
        }
        else {
            res.status(401).json({
                response: "ERROR",
                message: "problemas en el servidor"
            })
        }
    }).catch((err) => {
        console.log("ERROR", err)
        res.status(402).json({response:'ERROR', message:err});
    });
});

router.post('/envio/crearEnvio/createSender', (req,res,next) =>{
	console.log(req.body)
    let {name, email, tel} = req.body;
    db.createAddresse(req.session.user.id,name, email, tel).then((results)=>{ //checar
        debug('results', results);
        if (results.affectedRows) {
            res.status(200).json({
                response: "OK",
                redirect: "/panel/envio/crearEnvio/createSender/" //modifiaciones
            })
        }
        else {
            res.status(401).json({
                response: "ERROR",
                message: "problemas en el servidor"
            })
        }
    }).catch((err) => {
        console.log("ERROR", err)
        res.status(402).json({response:'ERROR', message:err});
    });
});

router.post('/envio/crearEnvio/payment', (req,res,next) =>{
	console.log(req.body)
    let {nick,name,card,date} = req.body;
	date = "30/"+date
    db.createPayment(req.session.user.id, nick, name, card, date).then((results)=>{
        debug('results', results);
        if (results.affectedRows) {
            res.status(200).json({
                response: "OK",
                message: "Metodo de pago guardado con éxito",
            })
        }
        else {
            res.status(401).json({
                response: "ERROR",
                message: "problemas en el servidor"
            })
        }
    }).catch((err) => {
        console.log("ERROR", err)
        res.status(402).json({response:'ERROR', message:err});
    });
});

router.get('/envio/crearEnvio/createSender', (req,res,next) =>{
    // res.render("createSender") 
    if (req.session.user) {
        res.render('createSender' , { title: 'sendiit - panel', path: req.path, user: req.session.user });
    } else {
        res.redirect('/');
    }
});

router.get('/envio/crearEnvio/createAddresse', (req,res,next) =>{
    // res.render("createAddresse") 
    if (req.session.user) {
        res.render('createAddresse' , { title: 'sendiit - panel', path: req.path, user: req.session.user });
    } else {
        res.redirect('/');
    }
});

router.get('/envio/crearEnvio/createSize', (req,res,next) =>{
    // res.render("createSize") 
    if (req.session.user) {
        res.render('createSize' , { title: 'sendiit - panel', path: req.path, user: req.session.user });
    } else {
        res.redirect('/');
    }
});

router.get('/envio/crearEnvio/payment', (req,res,next) =>{
    if (req.session.user) {
        db.getmetodosDePagos(req.session.user).then((results)=>{
			debug('results', results);
			if (results.length) {
				res.render('payment' , { title: 'sendiit - panel', path: req.path, user: req.session.user, metodosDePagos:results});
			}
			else {
				res.status(401).json({response:'ERROR', message:'Rutas completadas no encontradas'});
			}
		});
        //res.render('payment' , { title: 'sendiit - panel', path: req.path, user: req.session.user, metodosDePagos: metodosDePagos });

    } else {
        res.redirect('/');
    }
});

router.get('/repartidor/lockersnm/[a-z ^A-Z 0-9&,%.]{1,}', (req,res,next) =>{
	if (req.session.user) {
		const regex = /[a-z ^A-Z 0-9&,%.]{1,}/g;
		let traking=req.path.match(regex)[2]

		traking = traking.replace('%20', ' ');
		
		
		db.getshippingdeliver(traking).then((results)=>{
			debug('results', results);
			if (results.length) {
				res.render('lockers' , { title: 'sendiit - panel', path: req.path, user: req.session.user, route:results[0]});
			}
			else {
				res.status(401).json({response:'ERROR', message:'Rutas completadas no encontradas'});
			}
		});
		res.render("lockers")

	} else {
		res.redirect('/');
	}
});


	

module.exports = router;
