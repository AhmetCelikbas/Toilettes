var express = require('express');
var app = express();
var sqlite3 = require('sqlite3').verbose();


var db = new sqlite3.Database('toilets.db');
db.serialize(() => {
	db.run(`CREATE TABLE IF NOT EXISTS toilets(
		id INT PRIMARY KEY AUTO_INCREMENT,
		id_osm BIGINT,
		lat REAL NOT NULL,
		lon REAL NOT NULL,
		picture VARCHAR(15)
	)`);
	db.run(`CREATE TABLE IF NOT EXISTS details(
		id INT PRIMARY KEY AUTO_INCREMENT,
		id_toilet INT,
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

	db.run(`CREATE TABLE IF NOT EXISTS comments(
		id INT PRIMARY KEY AUTO_INCREMENT,
		id_toilet INT,
		comment TEXT
	)`);
});
db.close();


app.get('/api/overpass/:lat/:lon', (req, res) => {
	let params = {lat: req.params.lat, lon: req.params.lon}
	let url = {
		path: 'http://overpass-api.de/api/interpreter?[out:json];(node[amenity=toilets](45.15414,5.677606,45.214077,5.753118););out;'
	};
	let donneesRecues;
	let reqOverpass = http.get(url, (resOverpass) => {
		resOverpass.on('data', (data) => {
			console.log('Reception de données...');
			donneesRecues = data;
		});
		resOverpass.on('end', () => {
			console.log('La requete est terminee.');
			res.render('bonjour.ejs', JSON.parse(donneesRecues));
		});
	});
	reqOverpass.on('error', (e) => {
		console.error(e);
	});
	if (donneesRecues) {
		db.serialize(() => {
			db.get("SELECT * FROM", (err, row) => {
				console.log(row.id);
			});
		});
		db.close();

	}
});

app.use((req, res) => {
	res.setHeader("Content-Type", "text/plain"); 
	res.send('La page demandée n\'existe pas');
});

app.listen(8080);
