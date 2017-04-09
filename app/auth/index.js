const express = require('express');
const config = require('../config');

let User = require('../db').User;
let router = express.Router();
let passport = require('passport');
let FacebookStrategy = require('passport-facebook').Strategy;

let configureAuth = (server) => {
	passport.use(new FacebookStrategy({
		clientID: config.facebook.appId,
		clientSecret: config.facebook.appSecret,
		callbackURL: config.host + "/auth/facebook/callback",
		profileFields: ["id", "name"],
		enableProof: true
	}, (accessToken, refreshToken, profile, callback) => {
		User.findByProfile(profile.id).then(user => {
			if (user) {
				return user.update({
					accessToken : accessToken,
					profilePicture : 'https://graph.facebook.com/' + profile.id + '/picture?width=250',
					lastLogin : new Date()
				});
			} else {
				return User.create({
					name : profile.name.givenName + ' ' + profile.name.familyName,
					profileId : profile.id,
					profilePicture : 'https://graph.facebook.com/' + profile.id + '/picture?width=250',
					accessToken : accessToken,
				});
			}
		}).then(user => {
			callback(null, user);		
		}).catch(err => {
			callback(err, null);
		});
	}));

	passport.serializeUser((user, done) => {
		done(null, user.id);
	});

	passport.deserializeUser((id, done) => {
		return User.findById(id).then(user => done(null, user)).catch(err => done(err, null));
	});

	server.use(passport.initialize());
	server.use(passport.session());
};

let authenticated = (req, res, next) => {
	if (req.user)
		return next();
	res.redirect('/');
};

router.get('/facebook', passport.authenticate('facebook', { scope: [ ] }));

router.get('/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/' }),
	(req, res) => {
		// success
		console.log("success");
		console.log(req.user);
		res.redirect('/dashboard');
	},
	(err, req, res, next) => {
		console.log(err);
		res.redirect('/');
	}
);

router.get('/logout', (req, res) => {
	req.logout();
	res.redirect('/');
});

module.exports = { router, authenticated, configureAuth };
