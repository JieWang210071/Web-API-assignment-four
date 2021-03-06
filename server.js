// grab the packages we need
const express = require('express');
const _ = require('lodash');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const async = require("async");

const passwordHash = require('password-hash');
const jwt    = require('jsonwebtoken'); // used to create, sign, and verify tokens
const config = require('./config'); // get our config file
const User   = require('./app/models/user'); // get our user mongoose model
const Movie   = require('./app/models/movie'); // get our movie mongoose model
const Review  = require('./app/models/review'); // get our review mongoose model
const morgan = require('morgan');
const path = require('path');
const app = express();


// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'client/build')));

// const dotenv = require('dotenv');

// =======================
// configuration =========
// =======================
const port = process.env.PORT || 8080;
mongoose.connect(config.database);
app.set('superSecret', config.secret);

// Config body-parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(morgan('dev'));

// =======================
// routes ================
// =======================
// basic route

app.post('/signup', (req, res) => {
    // create a sample user
    const newUser = new User({ 
      username: req.body.username, 
      password: passwordHash.generate(req.body.password),
      name: req.body.name 
    });

    User.findOne({
		username: req.body.username
	}, (err, user) => {
        if (err) throw err;
        if (!user) {
            // save the sample user
            newUser.save((err) => {
                if (err) {
                    res.json({ error: err.errors.name.message });
                } else {
                    console.log('User saved successfully');
                    res.json({ success: true });
                }
            });
        } else {
            res.json({error: 'user already exists'});
        }
    });
});

const apiRoutes = express.Router(); 
app.use('/api', apiRoutes);

apiRoutes.post('/signin', (req, res) => {

	// find the user
	User.findOne({
		username: req.body.username
	}, (err, user) => {

		if (err) throw err;

		if (!user) {
			res.json({ success: false, message: 'Authentication failed. User not found.' });
		} else if (user) {

			// check if password matches
			if (!passwordHash.verify(req.body.password, user.password)) {
				res.json({ success: false, message: 'Authentication failed. Wrong password.' });
			} else {

				// if user is found and password is right
				// create a token
				const payload = {
					name: user.name,
					username: user.username
				}
				const token = jwt.sign(payload, app.get('superSecret'), {
					expiresIn: 86400 // expires in 24 hours
				});

				res.json({
					success: true,
					message: 'Enjoy your token!',
					token: token
				});
			}		

		}

	});
});


// ---------------------------------------------------------
// route middleware to authenticate and check token
// ---------------------------------------------------------
apiRoutes.use((req, res, next) => {

	// check header or url parameters or post parameters for token
	var token = req.body.token || req.param('token') || req.headers['x-access-token'];

	// decode token
	if (token) {

		// verifies secret and checks exp
		jwt.verify(token, app.get('superSecret'), (err, decoded) => {			
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
	
});

apiRoutes.get('/users', (req, res) => {
	User.find({}, (err, users) => {
		res.json(users);
	});
});

//save movie
apiRoutes.post('/savemovie', (req, res, next) => {

    // create a sample movie
    const newMovie = new Movie({ 
      title: req.body.title, 
      year: req.body.year,
      genre: req.body.genre,
      actors: req.body.actors 
    });

    newMovie.save((err) => {
        if (err) {
            // res.json({ error: err });
            // throw err;
            res.json({ error: err.message });
            return next(err);
        } else {
            res.json({ message: 'Movie saved successfully' });
        }
    });
});

//save movie review
apiRoutes.post('/savemoviereview', (req, res, next) => {
	const token = req.headers["x-access-token"];
	const decoded = jwt.decode(token);
    // create a sample movie
    const newReview = new Review({ 
      title: req.body.title, 
      quote: req.body.quote,
	  rating: req.body.rating,
	  name: decoded.username
    });
	Movie.findOne({
		title: req.body.title
	}, (err, movie) => {
		if (err) throw err;

		if (!movie) {
			res.json({ success: false, message: 'insert movie review failed. Movie not found.' });
		} else if (movie) {
			newReview.save((err) => {
				if (err) {
					res.json({ error: err.message });
					return next(err);
				} else {
					res.json({ message: 'Movie Review saved successfully' });
				}
			});
		}
	});
});

//delete movie
apiRoutes.delete('/deletemovie', (req, res, next) => {

    // find the movie
    Movie.findOneAndRemove({
		title: req.body.title
	}, (err, movie) => {
		if (err) throw err;

		if (!movie) {
			res.json({ success: false, message: 'delete movie failed. Movie not found.' });
		} else if (movie) {
			res.json({ success: true, message: 'Movie deleted successfully!' });

		}
	});
});

//get movie
apiRoutes.get('/getmovie', (req, res) => {

	let { review, title } = req.query;
	if (review) {
		async.parallel({
			movie: (callback) => {
				Movie.findOne({
					title: req.query.title
				}, (err, movie) => {
					if (err) throw err;
					
					if (!movie) {
						res.json({ success: false, message: 'Movie not found.' });
					} else {
						callback(null,movie);
					}
				});
			},
			reivew: (callback) => {
				Review.find({
					title: req.query.title
				}, (err, review) => {
					if (err) throw err;
			
					if (!review) {
						res.json({ success: false, message: 'Movie Review not found.' });
					} else {
						callback(null,review);
					}
				});
			}
		}, (err, results) => {
			res.json(results);
		});
	} else {
		// find the movie
		Movie.findOne({
			title: req.query.title
		}, (err, movie) => {
			if (err) throw err;
	
			if (!movie) {
				res.json({ success: false, message: 'Movie not found.' });
			} else {
				res.json(movie);
			}
		});
	}
});

//get review for one movie -- testing 
apiRoutes.get('/getMovieReview', (req, res) => {

    // find the Review
    Review.find({
		title: req.query.title
	}, (err, review) => {
		if (err) throw err;

		if (!review) {
			res.json({ success: false, message: 'Movie Review not found.' });
		} else {
			res.json(review);
		}
	});
});

//get all movie
apiRoutes.get('/getallmovie', (req, res) => {

	async.parallel({
		movie: (callback) => {
			 // find all movies
			 Movie.find({}, (err, movies) => {
				if (err) throw err;
				callback(null, JSON.parse(JSON.stringify(movies)));
			});
		},
		review: (callback) => {
			Review.find({}, (err, review) => {
				if (err) throw err;
				callback(null, JSON.parse(JSON.stringify(review)));
			});
		}
	}, (err, results) => {
		let moveList;
		moveList = results.movie.map((movie) => {
			movie.review = results.review.filter(review => review.title === movie.title)
			return movie;
		})
		moveList.sort(function(a, b) { 
			return b.avgRating - a.avgRating;
		})
		
		res.json(moveList);
	});
});

//update movie
apiRoutes.put('/updatemovie', (req, res) => {

    // find and update the movie
    Movie.findOneAndUpdate({
		title: req.query.title
	}, req.body, (err, movie) => {
		if (err) throw err;

		if (!movie) {
			res.json({ success: false, message: 'Movie not found.' });
		} else {
			res.json(movie);
		}
	});
});


app.get('*', (req, res) => {
	res.sendFile(path.join(__dirname+'/client/build/index.html'));
  });


// =======================
// start the server ======
// =======================
app.listen(port);
console.log('Magic happens at http://localhost:' + port);