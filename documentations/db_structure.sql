CREATE TABLE toilets(
  id INT PRIMARY KEY AUTO_INCREMENT,
  id_osm BIGINT,
  lat REAL NOT NULL,
  lon REAL NOT NULL,
  picture VARCHAR(15)
);

CREATE TABLE details(
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
);

CREATE TABLE comments(
  id INT PRIMARY KEY AUTO_INCREMENT,
  id_toilet INT,
  comment TEXT
);
