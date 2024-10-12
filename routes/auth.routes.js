const router = require("express").Router();
const passport = require("passport");

router.get("/login", passport.authenticate("github"), (req, res) => {     
    // #swagger.ignore=true
 });
 
 
 router.get("/logout", function(req, res, next){
      // #swagger.ignore=true
     req.logout(function(err){
         if(err){return next(err);}
         res.redirect("/");
     });
 });

 module.exports = router;