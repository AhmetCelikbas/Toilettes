var sqlite3 = require('sqlite3').verbose();

var db = new sqlite3.Database('toilets.db');
  db.serialize(() => {
  	db.run(`CREATE TABLE IF NOT EXISTS Toilets(
		id INTEGER PRIMARY KEY AUTOINCREMENT,
  		id_osm BIGINT,
		id_user INTEGER,
  		lat REAL NOT NULL,
  		lng REAL NOT NULL,
		createdAt DATE NOT NULL,
		updatedAt DATE NOT NULL
  	)`);
  	db.run(`CREATE TABLE IF NOT EXISTS Details(
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		id_toilet INTEGER,
  		name VARCHAR(40),
  		access BOOLEAN,
  		exist BOOLEAN,
 		fee BOOLEAN,
 		male BOOLEAN,
 		wheelchair BOOLEAN,
 		drinking_water BOOLEAN,
 		place_type VARCHAR(20) CHECK(place_type IN ('restaurant', 'public', 'shoping center', 'gas station', 'bar')),
 		address VARCHAR(70),
		createdAt DATE NOT NULL,
		updatedAt DATE NOT NULL
  	)`);
  
  	db.run(`CREATE TABLE IF NOT EXISTS Comments(
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		id_toilet INTEGER,
		id_user INTEGER,
  		comment TEXT,
		rating TINYINT CHECK(rating BETWEEN 0 and 5) DEFAULT 0,
		createdAt DATE NOT NULL,
		updatedAt DATE NOT NULL
  	)`);

	db.run(`CREATE TABLE IF NOT EXISTS Users(
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		name STRING,
		email STRING,
		password STRING,
		createdAt DATE NOT NULL,
		updatedAt DATE NOT NULL
  	)`);

	db.run(`INSERT INTO Users VALUES (NULL, 'admin', 'admin@toilettes.com', 'azerty', DATETIME('now'), DATETIME('now', 'localtime'))`);
  });
  db.close();
