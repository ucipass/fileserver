const FILES_URL_PATH       = process.env.FILES_URL_PATH ||  "/files"
const FILES_DIR            = process.env.FILES_DIR  ||  "/files"
const REDIS_URL            = process.env.REDIS_URL || "redis://:foobared@172.18.22.64"  // PLEASE CHANGE THIS!
const SESSION_SECRET       = process.env.SESSION_SECRET || "$uperSecretSessionKey!"  // PLEASE CHANGE THIS!

var express    = require('express')
var path    = require('path')
var serveIndex = require('serve-index')
const log = require("./log.js")("app")
const session = require("express-session")
const passport = require('passport');
let RedisStore = require("connect-redis")(session)

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

function loguser (req, res, next) {
  log.info(`${req.originalUrl} is accessed by ${req.user?.id}`)
  next()
}


app.use( FILES_URL_PATH + "/public" , loguser, express.static(FILES_DIR+ "/public"), serveIndex(FILES_DIR + "/public", {'icons': true}))

app.use( FILES_URL_PATH, passport.checkLogin, loguser , express.static(FILES_DIR), serveIndex(FILES_DIR, {'icons': true}))

module.exports = app;