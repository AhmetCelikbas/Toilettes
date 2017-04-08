// IMPORTS
var bodyParser = require('body-parser');
var sqlite3 = require('sqlite3').verbose();
var geocoder = require('geocoder');
var http = require('http');
var jwt = require('jsonwebtoken');
var express = require('express');
var app = express();

/**
 * Allows to access the database and
 * make CRUD operations with ORM sequelize
 */
var models = require('./models');

// Crée un convertisseur de données de formulaire
var formParser = bodyParser.urlencoded({ extended: false });

// Support encoded bodies
app.use(formParser);

/**
 * Get an instance of the express Router
 * and set '/v1/api' as prefix for all routes 
 */
let router = express.Router();
var routerBasePrefix = '/v1/api';
app.use(routerBasePrefix, router);

let secret = 'Bat0193726485Man';

// route middleware to verify a token
app.use((req, res, next) => {
	
	// check header or url parameters or post parameters for token
	let token = req.headers['Authorization'];
	// We want users to be authenticated for post methods only
	if(req.method == "POST") {
		// we don't check for token on auth and signup routes
		if((req.path != routerBasePrefix + "/authenticate" ) || (req.path != routerBasePrefix + "/signup")){
			// decode token if exists
			if (token) {
				// verifies secret and checks exp
				jwt.verify(token, secret, (err, decoded) => {      
					if (err) {
						return res.json({ success: false, message: 'Failed to authenticate token.' });    
					} else {
						// if everything is good, save to request for use in other routes
						req.decoded = decoded;
						next();
					}
				});
			} else {
				// if there is no token
				// return an error
				return res.status(403).send({ 
					success: false, 
					message: 'No token provided.' 
				}); 
			}
		} else {
			next();
		}
	} else {
		next();
	}
});


/**
 * Test route to make sure everything is working (accessed at GET http://localhost:8080/v1/api)
 */
router.get('/', (req, res) => {
	res.setHeader("Content-Type", "application/json")
	res.json({ message: 'Yohoho! Welcome to our api!' });
});

/**
 * Get all routes around the given position
 */
router.route('/toilets')
	// create a toilet (accessed at POST http://localhost:8080/v1/api/toilets)
    .post(formParser, (req, res) => {
		// getting the address from gps location
		geocoder.reverseGeocode( req.body.lat, req.body.lon, ( err, data ) => {	

			models.Toilet.create({
					id_osm: req.body.id_osm,
					lat: req.body.lat,
					lon: req.body.lon,
					picture: req.body.picture
				}).then((toilet) => {
					models.Details.create({
						id_toilet: toilet.id,
						name: req.body.Details.name,
						access: req.body.Details.access,
						exist: req.body.Details.exist,
						rating: req.body.Details.rating,
						fee: req.body.Details.fee,
						male: req.body.Details.male,
						wheelchair: req.body.Details.wheelchair,
						drinking_water: req.body.Details.drinking_water,
						placeType: req.body.Details.placeType,
						address: data.results[0].formatted_address
					}).then((toilet) => {});
					res.end(JSON.stringify(response));
				}).catch((err) => {
					console.log(err);
				});
		}, { sensor: true, language: 'fr' });

		res.end();
    })
	// get all the toilets (accessed at GET http://localhost:8080/v1/api/toilets)
    .get((req, res) => {
		let bb = {
			bl: {
				lat: req.params.southWest.lat,
				lng: req.params.southWest.lng
			},
			tr: {
				lat: req.params.northEast.lat,
				lng: req.params.northEast.lng
			}
		};
		let url = 'http://overpass-api.de/api/interpreter?[out:json];(node[amenity=toilets]('+bb.bl.lat+','+bb.bl.lng+','+bb.tr.lat+','+bb.tr.lng+'););out;';
		let donneesRecues = "";

		let reqOverpass = http.get(url, (resOverpass) => {
			resOverpass.on('data', (data) => {
				console.log('Reception de données...');
				donneesRecues += data;
			});

			resOverpass.on('end', () => {
				console.log('La requete est terminee.');
				let json = JSON.parse(donneesRecues);
				let toilets = Array();

				json.forEach((t, index, array) => {
					models.Toilet.findOne({
						where: {id_osm: id}
					}).then((toilet) =>{
						if (!toilet) {
							models.Toilet.create({
								id_osm: req.body.id_osm,
								lat: req.body.lat,
								lon: req.body.lon,
								picture: null
							}).then((toilet) => {
								models.Details.create({
									id_toilet: null,
									name: null,
									access: null,
									exist: null,
									rating: null,
									fee: null,
									male: null,
									wheelchair: null,
									drinking_water: null,
									placeType: null,
									address: data.results[0].formatted_address
								}).then((toilet) => {});
								res.setHeader('Content-Type', 'text/plain');
								res.end(JSON.stringify(response));
							})
						}
					});
				});

				models.Toilet.findAll({
					include: [{ model: models.Details, as: 'Details'}, { model: models.Comment, as: 'Comment'}]
				}).then(function(data) {
					for (var i=0; i < data.length; i++) {
						/*let toilet = {
							id: data[i].id,
							id_osm: data[i].id_osm,
							lat: data[i].lat,
							lon: data[i].lon,
							picture: data[i].picture,
							details: {
								id: data[i].Details.id,
								name: data[i].Details.name,
								access: data[i].Details.access,
								exist: data[i].Details.exist,
								rating: data[i].Details.rating,
								fee: data[i].Details.fee,
								male: data[i].Details.male,
								wheelchair: data[i].Details.wheelchair,
								drinking_water: data[i].Details.drinking_water,
								placeType: data[i].Details.placeType,
								address: data[i].Details.address
							}
						};
						if (Object.keys(data[i].Comment).length === 0 && obj.constructor === Object) {
							toilet.push({
								comments: {
									id: data[i].Comment.id,
									comment: data[i].Comment.comment
								}
							});
						}
						*/
						let toilet = data;

						if( bb.bl.lat <= toilet.lat && toilet.lat <= bb.tr.lat && bb.bl.lng <= toilet.lng && toilet.lng <= bb.tr.lng ) {
							// Point is in bounding box
							toilets.push(toilet);
						}						
					}
				});
				res.setHeader("Content-Type", "application/json")
				res.json(JSON.parse(toilets));
			});
		});
		reqOverpass.on('error', (e) => {
			console.error(e);
		});
});


/**
 * get a specific toilet
 * or update its picture
 */
router.route('/toilet/:id')
	.get((req, res) => {
		let id = req.params.id;
		
		models.Toilet.findOne({
				where:{ id: id}
			}).then((toilet) => {
				
				if (toilet == null) {
					res.json({message: "Toilet not found"});
				}
				res.setHeader("Content-Type", "application/json");
				res.json(JSON.parse(toilet));
			}).catch((err) => { 
				console.log(err);
			});
	})
	.post((req, res) => {
		models.Toilet.update({
			picture: req.body.picture
		}, {
		  where: { id: req.params.id }
		}).then((toilet) => {
			res.end();
		}).catch((err) => {
			console.log(err);
		});
});


/**
 * Get toilet's details
 */
router.post('/toilet/:id/details', formParser, (req, res) => {
	models.Details.update({
			name: req.body.Details.name,
			access: req.body.Details.access,
			exist: req.body.Details.exist,
			rating: req.body.Details.rating,
			fee: req.body.Details.fee,
			male: req.body.Details.male,
			wheelchair: req.body.Details.wheelchair,
			drinking_water: req.body.Details.drinking_water,
			placeType: req.body.Details.placeType
		}, {
		  where: { id_toilet: req.params.id }
		}).catch((err) => {
			console.log(err);
		});
		res.end();
});


/* =======================================================================
 * 							COMMENT SECTION
 * ======================================================================= */
/**
 * Update a comment (= edit) of specific toilet
 */
router.post('/toilet/:id_toilet/comment/:id', formParser, (req, res) => {
	models.Comments.update({
		comment: req.body.comment
	}, {
		where: { id_toilet: req.params.id }
	}).then(() => {
		res.end();
	}).catch((err) => {
		console.log(err);
	});
});


/**
 * Get a comment (= edit) of specific toilet
 */
router.post('/toilet/:id_toilet/comment/:id', formParser, (req, res) => {
	models.Comments.findById(req.params.id).then((comment) => {
		res.setHeader('Content-Type', 'application/json');
		res.json(comment);
	}).catch((err) => {
		console.log(err);
	});
});


/**
 * Add a new comment
 */
router.post('/toilet/:id/comments', formParser, (req, res) => {
	models.Comments.create({
		id_toilet: req.params.id,
		comment: req.body.comment
	}).then(() => {
		res.end();
	}).catch((err) => {
		console.log(err);
	});
});


/**
 * Get all comments of specific toilet
 */
router.get('/toilet/:id/comments', (req, res) => {
	models.Comments.findAll({
		where:{ id_toilet: req.params.id }
	}).then((comments) => {


		res.setHeader('Content-Type', 'application/json');
		res.json(comments);
	}).catch((err) => {
		console.log(err);
	});
});



/* =======================================================================
 * 								USER SECTION
 * ======================================================================= */
/**
 * Register a new user
 */
router.post('/signup', (req, res) => {
	models.User.create({
		name: req.body.name,
		email: req.body.email,
		password: req.body.password,
		picture: req.body.picture,
		createdAt: Date.now,
		updatedAt: null
	}).then((user) => {
		// on create user, create a token
		let token = jwt.sign(user, app.get('superSecret'), {
          expiresInMinutes: 1440 // expires in 24 hours
        });
		// return the information including token as JSON
        res.json({token: token});
	}).catch((err) => {
		console.log(err);
	});
});

/**
 * Identify user with token if login is not empty and correct
 */
router.post('/authenticate', (req, res) => {
	models.User.findOne({
		where:{ email: req.body.email, password: req.body.password }
	}).then((user) => {
		if (!user) {
			res.json({ success: false, message: 'Authentication failed. User not found.' });
		} else if (user.email != req.body.email && user.password != req.body.password) {
			res.json({ success: false, message: 'Authentication failed. Wrong login.' });
		}
		var token = jwt.sign(user, secret, {
          expiresInMinutes: 1440 // expires in 24 hours
        });

        // return the information including token as JSON
        res.json({ token: token });
	}).catch((err) => {
		console.log(err);
	});
});

/**
 * Get a user
 */
router.get('/user/:id', (req, res) => {
	if (req.decoded) {
		models.User.findOne({
			where:{ id: req.decoded.id }
		}).then((user) => {
			if (!user) {
				res.json({ success: false, message: 'Failed to find user' });
			} 
			res.setHeader("Content-Type", "application/json");
			res.json(user);
		}).catch((err) => {
			console.log(err);
		});
	}
});

/**
 * Update user data
 */
router.post('/user/:id', (req, res) => {
	if (req.decoded) {
		models.User.update({
			name: DataTypes.STRING,
			picture: DataTypes.STRING,
			updatedAt: DataTypes.DATE
		}, {
			where: { id: req.decoded.id }
		}).then((user) => {
			res.setHeader("Content-Type", "application/json");
			res.json(user);
		}).catch((err) => {
			console.log(err);
		});
	}
});


app.use((req, res) => {
	res.setHeader("Content-Type", "text/plain");
	res.send('La page demandée n\'existe pas');
});
app.listen(8080);
