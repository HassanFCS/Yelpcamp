if(process.env.NODE_ENV !== "production"){
    require('dotenv').config();
}

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const expressError = require('./utilities/expressError');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('./models/user');
const helmet = require('helmet')

const mongoSanitize = require('express-mongo-sanitize');

const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');
const userRoutes = require('./routes/user');

const MongoDBStore = require("connect-mongo")(session);


const dbURL = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp';

mongoose.connect(dbURL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify:false
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("DB is connected.");
});

const app = express();

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));

app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));
app.use(mongoSanitize({
    replaceWith: '_'
}));

const secret = process.env.SECRET || 'thisshouldbeabettersecret';

const store= new MongoDBStore({
    url: dbURL,
    secret,
    touchAfter: 24 * 3600
});

store.on("error", function(e){
    console.log("Session Store Error ", e);
})

const sessionConfig = {
    //name: ''              //To store session with a name
    store,
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        //secure: true,     //Cookies can only be accessable on secure network.. localhost is not secure.
        expires: Date.now() + (1000*60*60*24*7),
        maxAge: (1000*60*60*24*7)
    }
}
app.use(session(sessionConfig));
app.use(flash())
app.use(helmet({contentSecurityPolicy: false}))

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

app.get('/fakeUser', async(req, res)=> {
    const user = new User({ email: 'hassan@gmail.com',username: 'Hassan'});
    const newUser = await User.register(user, 'goodday');
    res.send(newUser);
})

app.get('/', (req, res) => {
    res.render('home');
})

app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes);
app.use('/', userRoutes); 


app.all('*', (req, res, next) => {
      next(new expressError('Page not found', 404));
})

app.use((err, req, res, next) =>  {
    const {statusCode = 500} = err;
    if(!err.message) err.message = 'Something went wrong';
    res.status(statusCode).render('error', {err});
})

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
})