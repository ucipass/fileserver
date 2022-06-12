const PORT                 = process.env.PORT ||  80
const PATH                 = process.env.PATH ||  "/files"
const DIR                  = process.env.DIR  ||  "/files"
const LOG_LEVEL            = process.env.LOG_LEVEL || "info"
const REDIS_URL            = process.env.REDIS_URL || "redis://:foobared@172.18.2.64"  // PLEASE CHANGE THIS!
const SESSION_SECRET       = process.env.SESSION_SECRET || "$uperSecretSessionKey!"  // PLEASE CHANGE THIS!

var express    = require('express')
var serveIndex = require('serve-index')
const winston = require("winston")
const session = require("express-session")
const passport = require('passport');
let RedisStore = require("connect-redis")(session)

//LOG
const log = winston.createLogger({
    transports: [new winston.transports.Console()],
    level: LOG_LEVEL
});

// redis@v4
const { createClient } = require("redis")
let redisClient = createClient(
  { 
    legacyMode: true,
    url: REDIS_URL
  }
)
redisClient.connect().catch(console.error)

const app = express()
// SESSION
app.use(
    session({
      store: new RedisStore({ client: redisClient }),
      saveUninitialized: false,
      secret: SESSION_SECRET,
      resave: false,
    })
  )
app.use(express.json());
app.use(express.urlencoded({ extended: false }))
app.use(passport.initialize());
app.use(passport.session());
passport.deserializeUser(function(user, done) {
return done(null, user);    // THIS IS WHERE THE user id is supposed to be checked against an external session db)
})
passport.checkLogin = function(req, res, next) {
	if (req.isAuthenticated()){
		return next();
    }
  if (process.env.NODE_ENV == 'testing'){
    log.warn("AUTH - NOT LOGGED IN IP:",req.clientIp);
  }else{
    log.error("AUTH - NOT LOGGED IN IP:",req.clientIp);
  }
	
	res.status(401).send("unauthorized");
}


app.use( PATH, passport.checkLogin , express.static(DIR), serveIndex(DIR, {'icons': true}))

// Listen
app.listen(PORT)