// IMPORTS
var bodyParser = require('body-parser');
var sqlite3 = require('sqlite3').verbose();
var geocoder = require('geocoder');
var http = require('http');
var cors = require('cors')
var jwt = require('jsonwebtoken');
var fs = require("fs");
var express = require('express');
var app = express();

/**
 * Allows to access the database and
 * make CRUD operations with ORM sequelize
 */
var models = require('./models');

// Crée un convertisseur de données de formulaire
// var formParser = bodyParser.urlencoded({ extended: false });
var formParser = bodyParser.json();

// Support encoded bodies
app.use(formParser);

// Support cors
app.use(cors({credentials: true, origin: true}));
/**
 * Get an instance of the express Router
 * and set '/v1/api' as prefix for all routes 
 */
let router = express.Router();
var routerBasePrefix = '/v1/api';
app.use(routerBasePrefix, router);

let secret = 'Bat0193726485Man';

// route middleware to verify a token
router.use((req, res, next) => {
	// check header or url parameters or post parameters for token
	let token = req.headers['authorization'];
	// We want users to be authenticated for post methods only
	if(req.method == "POST") {
		// we don't check for token on auth and signup routes
		if(req.path != "/authenticate"){
			if(req.path != "/signup"){
				console.log(req.path);
				// decode token if exists
				if (token) {
					// verifies secret and checks exp
					jwt.verify(token, secret, (err, decoded) => {      
						if (err) {
							return res.json({ success: false, message: 'Failed to authenticate token.' });    
						} else {
							// if everything is good, save to request for use in other routes
							req.token = decoded;
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


// create a toilet (accessed at POST http://localhost:8080/v1/api/toilets)
router.post('/toilets', (req, res) => {




		models.Toilet.create({
				id_osm: req.body.id_osm,
				id_user: req.token.id_user,
				lat: req.body.lat,
				lng: req.body.lon,
				picture: null,
				createdAt: Date.now(),
				updatedAt: Date.now()
			}).then((toilet) => {
				models.Details.create({
					id_toilet: toilet.id,
					name: req.body.Details.name,
					access: req.body.Details.access,
					exist: req.body.Details.exist,
					rating: req.body.Details.rating,
					fee: req.body.Details.fee,
					male: req.body.Details.male,
					female: req.body.Details.male,
					wheelchair: req.body.Details.wheelchair,
					drinking_water: req.body.Details.drinking_water,
					placeType: req.body.Details.placeType,
					createdAt: Date.now(),
					updatedAt: Date.now()
				}).then((toilet) => {
					if(req.body.picture != null){
						fs.writeFile(	
							"pictures/toilets/" + toilet.id_toilet + "." + req.body.pictureMimeType.split('/')[1], 
							req.body.picture, 'base64', 
							function(err) {
								if(err) {
									console.log(err);
								} 
							}
						);
					}
					res.json({ success: true, message: 'Toilets added.' });

				});
				
			}).catch((err) => {
				console.log(err);
			});

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
				for(var index in json) {
					models.Toilet.create({
						id_osm: json[index]['id'],
						lat: json[index].lat,
						lng: json[index].lon,
						picture: null,
						createdAt: Date.now(),
						updatedAt: Date.now()
					}).then(
						(toilet) => {
							models.Details.create({
									id_toilet: toilet.id,
									name: null,
									access: false,
									exist: false,
									rating: 0,
									fee: false,
									male: false,
									female: false,
									wheelchair: false,
									drinking_water: false,
									placeType: null,
									address: null,
									createdAt: Date.now(),
									updatedAt: Date.now()
								}).then((details) => {});
						}
					).catch(() => {})
				}

				// now get toilets from db
				models.Toilet.findAll({
					where: [ "lat >= ? AND lng >= ? AND lat <= ? AND lng <= ?",
								req.params.southWestLat,
								req.params.southWestLon,
								req.params.northEastLat,
								req.params.northEastLon,
					],
					include: [{ model: models.Details, as: 'Details'}, { model: models.Comments, as: 'Comments'}]
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




/**
 * update a toilet
 */
router.post('/toilet/:id', formParser, (req, res) => {
	models.Toilet.update({
			id_user: req.token.id_user,
			updatedAt: Date.now()
		}, { where: { id: req.params.id } }).then((toilet) => {
			models.Details.update({
				id_toilet: toilet.id,
				name: req.body.Details.name,
				access: req.body.Details.access,
				exist: req.body.Details.exist,
				rating: req.body.Details.rating,
				fee: req.body.Details.fee,
				male: req.body.Details.male,
				female: req.body.Details.male,
				wheelchair: req.body.Details.wheelchair,
				drinking_water: req.body.Details.drinking_water,
				placeType: req.body.Details.placeType,
				createdAt: Date.now(),
				updatedAt: Date.now()
			}, { where: { id_toilet: req.params.id } }).then((toilet) => {
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
				res.json({ success: true, message: 'Toilets edited.' });
			});
			
		}).catch((err) => {
			console.log(err);
		});
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

	res.setHeader("Content-Type", "application/json");
	models.User.findOne({
		where:{ email: req.body.email }
	}).then((checkEmail) => {
		if (!checkEmail) {
			models.User.create({
				name: req.body.name,
				email: req.body.email,
				password: req.body.password,
				createdAt: Date.now(),
				updatedAt: Date.now()
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
				let token = jwt.sign(
					{
						id_user: user.id,
					}, 
					secret, 
					{
						expiresIn: 2629746 // expires in 24 hours (60sec * 60 Min * 24 hours)
					}
				);

				// return the information including token as JSON
				res.json({ success: true, message: 'Account successfully created.', token: token });
			}).catch((err) => {
				console.log(err);
			});
		} else {
			res.json({ success: false, message: 'This email is already user by an account.' });
		}

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
		console.log(user)
		if (user == null) {
			res.json({ success: false, message: 'Authentication failed. User not found.' });
		} else {
			let token = jwt.sign(
				{
					id_user: user.id,
				}, 
				secret, 
				{
					expiresIn: 2629746 // expires in 24 hours (60sec * 60 Min * 24 hours)
				}
			);
			// return the information including token as JSON
			res.json({ success: true, message: 'Log in successfully.', token: token });
		}
		
	}).catch((err) => {
		console.log(err);
	});
});

/**
 * Get a user
 */
router.get('/user/:id', (req, res) => {
	
	models.User.findOne({
		where:{ id: req.params.id }
	}).then((user) => {
		if (user == null) {
			res.json({ success: false, message: 'Failed to find user' });
		} else {
			res.json(user);
		}
	}).catch((err) => {
		console.log(err);
	});
});

/**
 * Update user data
 */
router.post('/user/:id', (req, res) => {
	models.User.update({
		name: DataTypes.STRING,
		picture: DataTypes.STRING,
		updatedAt: DataTypes.DATE
	}, {
		where: { id: req.params.id }
	}).then((user) => {
		res.json(user);
	}).catch((err) => {
		console.log(err);
	});
});


app.use((req, res) => {
	res.setHeader("Content-Type", "text/plain");
	res.send('La page demandée n\'existe pas');
});
app.listen(8080);
