var bodyParser = require('body-parser');
var sqlite3 = require('sqlite3').verbose();
var geocoder = require('geocoder');
var http = require('http');
var jwt = require('jsonwebtoken');
var express = require('express');
var app = express();

// Notre modèle objet géré par l'ORM Sequelize
var models = require('./models');

// Crée un convertisseur de données de formulaire
var formParser = bodyParser.urlencoded({ extended: false });

/**
 * Access to the database and
 * create tables if they don't already exist
 */
/*var db = new sqlite3.Database('./mydb.db');
db.serialize(() => {
	db.run(`CREATE TABLE IF NOT EXISTS toilets(
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		id_osm BIGINT,
		lat REAL NOT NULL,
		lon REAL NOT NULL,
		picture VARCHAR(15)
	)`);
	db.run(`CREATE TABLE IF NOT EXISTS details(
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		id_toilet INTEGER,
		name VARCHAR(40),
		access BOOLEAN,
		exist BOOLEAN,
		rating TINYINT CHECK(rating BETWEEN 0 and 5) DEFAULT 0,
		fee BOOLEAN,
		male BOOLEAN,
		wheelchair BOOLEAN,
		drinking_water BOOLEAN,
		placeType VARCHAR(20) CHECK(rating IN ('restaurant', 'public', 'shoping center', 'gas station', 'bar')),
		address VARCHAR(70)
	)`);

	db.run(`CREATE TABLE IF NOT EXISTS Comments(
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		id_toilet INTEGER,
		comment TEXT
	)`);
});*/


/**
 * Get an instance of the express Router
 * and set '/v1/api' as prefix for all routes 
 */
let router = express.Router();
app.use('/v1/api', router);

/**
 * Test route to make sure everything is working (accessed at GET http://localhost:8080/v1/api)
 */
router.get('/', (req, res) => {
	res.setHeader("Content-Type", "application/json")
	res.json({ message: 'hooray! welcome to our api!' });
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
					res.setHeader('Content-Type', 'text/plain');
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
						address: req.body.Details.address
					});
				});
				res.json(JSON.parse(toilet));
			}).catch((err) => { 
				console.log(err);
			});
		res.json(JSON.parse(donneesRecues));
	})
	.post((req, res) => {
		models.Toilet.update({
			picture: req.body.picture
		}, {
		  where: { id: req.params.id }
		}).then(() => {
			res.setHeader('Content-Type', 'text/plain');
			res.end(JSON.stringify({message: 'The toilet is up-to-date'}));
		}).catch((err) => {
			console.log(err);
		});
});


/**
 * Get toilet's details
 */
router.post('/toilet/:id/details', formParser, (req, res) => {
	models.Toilet.findOne({
		where:{ id: req.params.id}
	}).then(() => {
		models.Toilet.update({
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
		  where: { id: req.params.id }
		})
		res.setHeader('Content-Type', 'text/plain');
		res.end(JSON.stringify({message: 'The details are up-to-date'}));
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
router.get('/signup', (req, res) => {
	
});

/**
 * Identify user
 */
router.get('/login', (req, res) => {
	
});

/**
 * Get a user
 */
router.get('/user/:id', (req, res) => {
	
});

/**
 * Update user data
 */
router.get('/user/:id', (req, res) => {
	
});

	/*db.serialize(function() {
		db.run("CREATE TABLE user (id INT, dt TEXT)");
		
			var stmt = db.prepare("INSERT INTO user VALUES (?,?)");
			for (var i = 0; i < 10; i++) {
				
			var d = new Date();
			var n = d.toLocaleTimeString();
			stmt.run(i, n);
		}  
		stmt.finalize();
		
		db.each("SELECT lat, lon, picture FROM toilets", function(err, row) {
			console.log("User id : "+row.id, row.dt);
		});
	});*/


app.use((req, res) => {
	res.setHeader("Content-Type", "text/plain");
	res.send('La page demandée n\'existe pas');
});
app.listen(8080);
