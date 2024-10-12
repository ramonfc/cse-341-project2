const dotenv = require('dotenv');
if (process.env.NODE_ENV === 'production') {
  dotenv.config();
} else {
  dotenv.config({ path: '.env.development' }); 
}

const express = require("express");
const bodyParser = require("body-parser");
const mongodb = require("./data/database");
const app = express();
const passport = require("passport");
const session = require("express-session");
const GitHubStrategy = require("passport-github2").Strategy;
const cors = require("cors");

const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(session({
    secret: "secret",
    resave: false,
    saveUninitialized: true,
}));
app.use(passport.initialize());
app.use(passport.session());
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", 
        "Origin, X-Requested-With, Content-Type, Accept, Z-Key");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    next();
});
app.use(cors({methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"]}));
app.use(cors({origin: "*"}));

app.use("/", require("./routes/index"));

passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: process.env.CALLBACK_URL
},
    function (accessToken, refreshToken, profile, done) {
        console.log("accessToken: ", accessToken);
        // console.log("\nrefreshToken: ", refreshToken); //null
        // console.log("\nprofile: ", profile);
        // console.log("\ndone: ", done);
        return done(null, profile);
    }
));

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

app.get("/", (req, res) => { res.send(req.session.user !== undefined ? `logged in as ${req.session.user.username}` : "logged out") });
app.get("/github/callback", passport.authenticate("github", {
    failureRedirect: "/api-docs", session: false
}),
    (req, res) => {
        req.session.user = req.user;
        res.redirect("/");
    }
);

process.on('uncaughtException', (err, origin) => {
    console.log(process.stderr.fd, `Caught exception: ${err}\n` + `Exception origin: ${origin}`);
  });

mongodb.initDb((err) => {
    if (err) {
        console.log(err);
    }
    else {
        app.listen(port, () => { console.log(`Database is listening and node Running on port: ${port}`) });
    }
})



