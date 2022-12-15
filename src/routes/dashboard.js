var debug = require('debug')('lockey:router:dashboard');
var express = require('express');
var router = express.Router();
var db = require('../modules/MySQLConnection');

router.get('/', (req, res, next) => {
	debug('session.user:', req.session.user);
	if (req.session.user) {
		res.render('dashboard', { title: 'sendiit - panel', path: req.path, user: req.session.user });
	} else {
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
				res.render('shippingdetails' , { title: 'sendiit - panel', path: req.path, user: req.session.user, shipping:results[0]});
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
    // res.render("createSize") 
    if (req.session.user) {
        res.render('payment' , { title: 'sendiit - panel', path: req.path, user: req.session.user });
    } else {
        res.redirect('/');
    }
});

module.exports = router;
