const express = require('express');
const session = require('express-session');
const mongostore = require('connect-mongo');
const flash = require('connect-flash'); 
const passport = require('passport');
const { create } = require('express-handlebars');
const csuf = require('csurf');
const mongoSanitize = require('express-mongo-sanitize');
const cors = require('cors');

const User = require('./models/User') ;
const csurf = require('csurf');
const app = express();
require('dotenv').config();
const clientDB = require('./database/db')

const corsOptions = {
  credentials: true,
  origin: process.env.PATHHEROKU || '*',
  methods: ["GET", "POST"],
};
app.use(cors())

app.set("trust proxy", 1);
app.use(
  session({
  secret: process.env.SECRETSESSION,
  resave: false,
  saveUninitialized: false,
  name: 'session-user',
  store: mongostore.create({clientPromise: clientDB,
  dbName: process.env.DBNAME,
}),
  cookie: { secure: process.env.MODO === 'production', maxAge: 30 * 24 * 60 * 60 * 1000},
})
);

app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => done(null, {id: user._id, userName: user.userName })); //req.user
passport.deserializeUser(async (user, done) => {
  //es necesario revisar la base de datos?
  const userDB = await User.findById(user.id)
  return done(null, {id: userDB._id, userName: userDB.userName})
})

const hbs = create({
  extname: ".hbs",
  partialsDir: ["views/components"],
});

app.engine(".hbs", hbs.engine);
app.set("view engine", ".hbs");
app.set("views", "./views")

app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({extended: true}));

app.use(csurf());
app.use(mongoSanitize());



app.use((req,res, next) => {
  res.locals.csrfToken = req.csrfToken();
  res.locals.mensajes = req.flash('mensajes');
  next();
});

app.use("/", require("./routes/home"));
app.use('/auth', require('./routes/auth'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("servidor funcionando 🚀🚀🚀" + PORT));