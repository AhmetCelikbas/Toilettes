// IMPORTS
var bodyParser = require('body-parser');
var sqlite3 = require('sqlite3').verbose();
var geocoder = require('geocoder');
var http = require('http');
var jwt = require('jsonwebtoken');
var cors = require('cors');
var fs = require("fs");
var express = require('express');
var app = express();
var models = require('./models'); // allows to access the database and make CRUD operations with ORM sequelize

// Crée un convertisseur de données de formulaire
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Support cors
app.use(cors({credentials: true, origin: true}));

/**
 * Get an instance of the express Router
 * and set '/v1/api' as prefix for all routes 
 */
let router = express.Router();
app.use('/v1/api', router);

let secret = 'Bat0193726485Man';

// route middleware to verify a token
router.use((req, res, next) => {
	// check header and decode token if exists else continue
	if (req.headers.authorization) {
		// verifies secret and checks expiration
		jwt.verify(req.headers.authorization, secret, (err, decoded) => {      
			if (err) {
				return res.json({ success: false, message: 'Failed to authenticate token.' });    
			}

			// if everything is good, save to request for use in other routes
			req.decoded = decoded;
			console.log(decoded)
			next();
		});
	} else {
		// if there is no token
		// return an error
		/*return res.status(403).send({ 
			success: false, 
			message: 'No token provided.' 
		});*/
		next();
	}
});


/* ==================================================	 R O U T E S 	================================================== */

/**
 * Test route to make sure everything is working (accessed at GET http://localhost:8080/v1/api)
 */
router.get('/', (req, res) => {
	res.setHeader("Content-Type", "application/json")
	res.json({ message: 'Yohoho! Welcome to our api!' });
});

/**
 * Create a toilet
 */
router.post('/toilets', (req, res) => {
	if (req.decoded) {
		// getting the address from gps location
		geocoder.reverseGeocode( req.body.lat, req.body.lng, ( err, data ) => {	
			models.Toilet.create({
				id_osm: req.body.id_osm,
				id_user: req.decoded.id,
				lat: req.body.lat,
				lng: req.body.lng,
				picture: req.body.picture
			}).then((toilet) => {
				models.Details.create({
					id_toilet: toilet.id,
					name: req.body.Details.name,
					access: req.body.Details.access,
					exist: req.body.Details.exist,
					fee: req.body.Details.fee,
					male: req.body.Details.male,
					wheelchair: req.body.Details.wheelchair,
					drinking_water: req.body.Details.drinking_water,
					placeType: req.body.Details.placeType,
					address: data.results[0].formatted_address
				}).then((toilet) => {});
				res.json({success:true, message: "Toilet added."})
			}).catch((err) => {
				console.log(err);
			});
		}, { sensor: true, language: 'fr' });
	} else {
		res.json({success: false, message: 'Not allowed to post toilets.'});
	}
});

/**
 * Get all routes around the given position
 */
router.get('/toilets/:southWestLat/:southWestLon/:northEastLat/:northEastLon', (req, res) => {
	// get all the toilets (accessed at GET http://localhost:8080/v1/api/toilets)
	let url = 'http://overpass-api.de/api/interpreter?[out:json];(node[amenity=toilets](' + 
		req.params.southWestLat + ',' + 
		req.params.southWestLon + ',' + 
		req.params.northEastLat + ',' + 
		req.params.northEastLon + '););out;';

	let donneesRecues = "";

	let reqOverpass = http.get(url, (resOverpass) => {
		resOverpass.on('data', (data) => {
			console.log('Reception de données...');
			donneesRecues += data;
		});

		resOverpass.on('end', () => {
			console.log('La requete est terminee.');
			let json = JSON.parse(donneesRecues)['elements'];
			
			// add osm nodes in db, (duplicates are ignored through the catch())
			for(let index in json) {
				geocoder.reverseGeocode(json[index].lat, json[index].lon, ( err, data ) => {	
					models.Toilet.create({
						id_osm: json[index]['id'],
						id_user: 1,
						lat: json[index].lat,
						lng: json[index].lon,
						picture: ""
					}).then((toilet) => {
						models.Details.create({
							id_toilet: toilet.id,
							name: "",
							access: false,
							exist: false,
							rating: 0,
							fee: false,
							male: false,
							female: false,
							wheelchair: false,
							drinking_water: false,
							place_type: "",
							address: data.results[0].formatted_address
						}).then((details) => {});
					}).catch(() => {});
				}, { sensor: true, language: 'fr' });				
			}

			// now get toilets from db
			models.Toilet.findAll({
				where: [ "lat >= ? AND lng >= ? AND lat <= ? AND lng <= ?",
					req.params.southWestLat,
					req.params.southWestLon,
					req.params.northEastLat,
					req.params.northEastLon,
				],
				include: [{ model: models.Details, as: 'Details'}, { model: models.Comment, as: 'Comment'}]
			}).then((data) => {
				res.json(data);	
			});
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
		models.Toilet.findOne({
			where:{ id: req.params.id}
		}).then((toilet) => {
			if (!toilet) {
				return res.json({message: "Toilet not found"});
			}

			res.setHeader("Content-Type", "application/json");
			res.json(toilet.dataValues);
		}).catch((err) => { 
			console.log(err);
		});
	})
	.put((req, res) => {
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
		}).then((toilet) => {
			if(req.body.picture != null){
				fs.writeFile(	
					"pictures/toilets/" + req.params.id + "." + req.body.pictureMimeType.split('/')[1], 
					req.body.picture, 'base64', 
					function(err) {
						if(err) {
							console.log(err);
						} 
					}
				);
			}
			return res.json({ success: true, message: 'Toilets edited.' });
		}).catch((err) => {
			console.log(err);
		});
		// res.end();
	});
// end route 'toilet/:id'


/**
 * Get toilet picture
 */
router.get('/toilet/:id/picture', (req, res) => {

	var filePath = 'pictures/toilets/' + req.params.id +'.jpeg';
	if(fs.existsSync(filePath)){
		var imageData = fs.readFileSync(filePath);
		var base64data = new Buffer(imageData).toString('base64');
		res.json({ picture : base64data})
	} else {
		res.json({ picture : null})
	}

});



/* =======================================================================
 * 							COMMENT SECTION
 * ======================================================================= */

/**
 * Get all comments of specific toilet
 */
router.get('/toilet/:id/comments', (req, res) => {
	models.Comment.findAll({
		where:{ id_toilet: req.params.id }
	}).then((comments) => {
		if (!comments) {
			return res.json({ success: false, message: 'Failed to find comments' });
		}
		res.setHeader('Content-Type', 'application/json');
		res.json(comments);
	}).catch((err) => {
		console.log(err);
	});
});


/**
 * Add a new comment
 */
router.post('/toilet/:id/comments', (req, res) => {
	models.Comment.create({
		id_toilet: req.params.id,
		id_user: req.body.id_user,
		comment: req.body.comment,
		rating: req.body.rating
	}).then(() => {
		res.end();
	}).catch((err) => {
		console.log(err);
	});
});


/**
 * Get a comment (= edit) of specific toilet
 */
router.get('/toilet/:id_toilet/comment/:id', (req, res) => {
	models.Comment.findById(req.params.id).then((comment) => {
		res.setHeader('Content-Type', 'application/json');
		res.json(comment);
	}).catch((err) => {
		console.log(err);
	});
});


/**
 * Update a comment (= edit) of specific toilet
 */
router.put('/toilet/:id_toilet/comment/:id', (req, res) => {
	models.Comment.update({
		comment: req.body.comment,
		rating: req.body.rating
	}, {
		where: { id_toilet: req.params.id }
	}).then(() => {
		res.end();
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
	res.setHeader("Content-Type", "application/json");

	models.User.findOne({
		where:{ email: req.body.email }
	}).then((checkEmail) => {
		if (!checkEmail) {
			models.User.create({
				name: req.body.name,
				email: req.body.email,
				password: req.body.password
			}).then((user) => {
				if(req.body.picture != null){
					fs.writeFile(	
						"pictures/users/" + user.id + "." + req.body.pictureMimeType.split('/')[1], 
						req.body.picture, 'base64', 
						function(err) {
							if(err) {
								console.log(err);
							} 
						}
					);
				}

				// on create user, create a token
				let token = jwt.sign({id:user.dataValues.id, email:user.dataValues.email, password:user.dataValues.password}, secret, {
				expiresIn: '24h' // expires in 24 hours
				});
				// returns token as JSON
				res.json({token: token});
			}).catch((err) => {
				console.log(err);
			});
		} else {
			res.json({ success: false, message: 'This email is already used.' });
		}
	}).catch((err) => {
		console.log(err);
	});
});


/**
 * Identify user with token if login is not empty and correct
 */
router.post('/authenticate', (req, res) => {
	res.setHeader("Content-Type", "application/json");

	models.User.findOne({
		where:{ email: req.body.email, password: req.body.password }
	}).then((user) => {
		if (!user) {
			res.json({ success: false, message: 'Authentication failed. User not found.' });
		}
		
		let token = jwt.sign({id:user.dataValues.id, email:user.dataValues.email, password:user.dataValues.password}, secret, {
          expiresIn: '24h' // expires in 24 hours
        });

        // returns token as JSON
        res.json({ token: token });
	}).catch((err) => {
		console.log(err);
	});
});


/**
 * Get or update user account
 */
router.route('/user')
	// get user account
	.get((req, res) => {
		res.setHeader("Content-Type", "application/json");

		if (req.decoded) {
			models.User.findOne({
				where:{ id: req.decoded.id }
			}).then((user) => {
				if (!user) {
					return res.json({ success: false, message: 'Failed to find user' });
				}
				var filePath = 'pictures/users/' + req.decoded.id +'.jpeg';
				if(fs.existsSync(filePath)){
					var imageData = fs.readFileSync(filePath);
					var base64data = new Buffer(imageData).toString('base64');
					user.dataValues.picture = base64data;
					// res.json({ picture : base64data})
				} else {
					user.dataValues.picture = null;
				}
				
				return res.json(user.dataValues);
			}).catch((err) => {
				console.log(err);
			});
		} else {
			res.json({success: false, message: 'Failed to get user account.'});
		}
	})
	// update user data
	.put((req, res) => {
		res.setHeader("Content-Type", "application/json");

		if (req.decoded) {
			models.User.update({
				name: req.body.name,
				password: req.body.password
				//updatedAt: new Date().toLocaleString().replace('à ', '') //new Date().toISOString().split('.')[0].replace('T', " ")
			}, {
				where: { id: req.decoded.id }
			}).then((user) => {
				if (!user) {
					return res.json({ success: false, message: 'Failed to find user' });
				}

				if(req.body.picture != null){
					fs.writeFile(	
						"pictures/users/" + req.decoded.id + "." + req.body.pictureMimeType.split('/')[1], 
						req.body.picture, 'base64', 
						function(err) {
							if(err) {
								console.log(err);
							} 
						}
					);
				}

				res.json(user);
			}).catch((err) => {
				console.log(err);
			});
		} else {
			res.json({success: false, message: 'Failed to update account.'});
		}
	});
// end route 'user'


app.use((req, res) => {
	res.setHeader("Content-Type", "text/plain");
	res.send('La page demandée n\'existe pas');
});
app.listen(8080);
