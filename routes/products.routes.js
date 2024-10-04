const express = require("express");
const router = express.Router();

const productControllers = require("../controllers/products.controllers");
const validation = require("../middleware/validate");

router.get("/", productControllers.getAll);
router.get("/:id", productControllers.getSingle);

router.post("/", validation.saveProduct, productControllers.createProduct);
router.put("/:id", validation.updateProduct,  productControllers.updateProduct);
router.delete("/:id", productControllers.deleteProduct);
router.get('/category/:category_id', productControllers.getProductsByCategory);

module.exports = router;
