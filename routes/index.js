const router = require("express").Router();

router.use("/", require("./swagger.routes"));
router.get("/", (req, res)=>{
    // #swagger.tags=['Hello World']
    // #swagger.ignore=true
    res.send("Hello World")
});

router.use("/categories", require("./categories.routes"));
router.use("/products", require("./products.routes"));

module.exports = router;
