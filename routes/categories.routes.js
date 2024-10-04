const express = require("express");
const router = express.Router();

const categoryControllers = require("../controllers/categories.controllers");
const validation = require("../middleware/validate");

router.get("/", categoryControllers.getAll);
router.get("/:id", categoryControllers.getSingle);

router.post("/", validation.saveCategory, categoryControllers.createCategory);
router.put("/:id",validation.updateCategory, categoryControllers.updateCategory);
router.delete("/:id", categoryControllers.deleteCategory);

module.exports = router;
