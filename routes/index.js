const router = require("express").Router();
const passport = require("passport");


router.use("/", require("./swagger.routes"));

router.use("/", require("./auth.routes"));

// router.get("/", (req, res)=>{
//     // #swagger.tags=['Hello World']
//     // #swagger.ignore=true
//     res.send("Hello World")
// });

router.use("/categories", require("./categories.routes"));
router.use("/products", require("./products.routes"));

module.exports = router;
