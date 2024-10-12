const express = require("express");
const router = express.Router();

const categoryControllers = require("../controllers/categories.controllers");
const validation = require("../middleware/validate");
const {isAuthenticated} = require("../middleware/authenticate"); 


router.get("/", categoryControllers.getAll);
router.get("/:id", categoryControllers.getSingle);

router.post("/", isAuthenticated,  validation.saveCategory, categoryControllers.createCategory);
router.put("/:id", isAuthenticated, validation.updateCategory, categoryControllers.updateCategory);
router.delete("/:id", isAuthenticated, categoryControllers.deleteCategory);

module.exports = router;
