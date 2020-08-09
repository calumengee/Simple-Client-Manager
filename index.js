require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const ejs = require('ejs');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');

const app = express();

app.use(express.static( 'public'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cors());
app.use(bodyParser.json());

app.use(session({
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect(process.env.URL_ADMIN_ACCESS, {useNewUrlParser: true});
mongoose.set("useCreateIndex", true);
const adminSchema = new mongoose.Schema({
  _id: Number,
  username: String,
  password: String,
  job: String
});

adminSchema.plugin(passportLocalMongoose);

const Admin = mongoose.model('Admin', adminSchema);

passport.use(Admin.createStrategy());

passport.serializeUser(Admin.serializeUser());
passport.deserializeUser(Admin.deserializeUser());

app.get('/', (req, res) => {
  if (req.isAuthenticated()) {
    res.redirect('/dashboard');
  } else {
    res.render('index');
  }
})

app.post('/', function(req, res) {

  const admin = new Admin({
    username: process.env.SUDO_ADMIN_USERNAME,
    password: req.body.n1 + req.body.n2 + req.body.n3 + req.body.n4
  });

  req.login(admin, function(err){
    if (err) {
      console.log(err);
    } else {
       passport.authenticate('local')(req, res, function(){
         res.redirect('/dashboard');
       })
    }
  })

})

app.get('/dashboard', function(req, res){
  if (req.isAuthenticated()) {
    res.render('dashboard');
  } else {
    res.redirect('/');
  }
})

app.get('/operation', function(req, res) {
  if (req.isAuthenticated()) {
    res.render('operation');
  } else {
    res.redirect('/');
  }
})

//>>>>>>>>>>>>>CREATE NEW LOGIN FOR SUDO Admin -- MOVE INSIDE A 'POST' METHOD

  // Admin.register({username: process.env.SUDO_ADMIN_USERNAME}, password, (err, user) => {
  //   if (err){
  //     console.log(err);
  //   } else {
  //     passport.authenticate('local')(req, res, function() {
  //       res.redirect('/dashboard');
  //     })
  //   }
  // })

  app.get('/eod', function(req, res) {
    req.logout();
    res.redirect('/');
  })

app.listen(3000, () => console.log(`Server running on port 3000`))
