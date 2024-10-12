const express = require("express");
const router = express.Router();

const productControllers = require("../controllers/products.controllers");
const validation = require("../middleware/validate");
const {isAuthenticated} = require("../middleware/authenticate"); 

router.get("/", productControllers.getAll);
router.get("/:id", productControllers.getSingle);

router.post("/", isAuthenticated, validation.saveProduct, productControllers.createProduct);
router.put("/:id", isAuthenticated, validation.updateProduct,  productControllers.updateProduct);
router.delete("/:id", isAuthenticated, productControllers.deleteProduct);
router.get('/category/:category_id', productControllers.getProductsByCategory);

module.exports = router;
