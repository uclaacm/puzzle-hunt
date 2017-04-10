const production = (process.env.NODE_ENV === "production");

if (production) {
	module.exports = {
		port: process.env.PORT,
		host: process.env.HOST,
		facebook: {
			appId: process.env.FACEBOOK_APPID,
			appSecret: process.env.FACEBOOK_APPSECRET,
		},
		db: {
			uri: process.env.DATABASE_URL,
		},
		session: {
			secret: process.env.SESSION_SECRET,
			uri: process.env.REDIS_URL
		},
		contest: {
			start: new Date(process.env.CONTEST_START),
			end: new Date(process.env.CONTEST_END)
		}
	};
} else { 
	module.exports = require('./devconf.js');
}
