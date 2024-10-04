require("dotenv").config();
const mongodb = require("../data/database");
const ObjectId = require("mongodb").ObjectId;

const dbName = process.env.MONGO_DB_NAME;

const getAll = async (req, res) => {
    // #swagger.tags=['Categories']
    // #swagger.summary="All categories"
    /**
     * #swagger.description= "Gets all categories"
     */
    try {
        const result = await mongodb.getDatabase().db(dbName).collection("categories")
            .find().toArray(); // Note: if returned data is a lot of, 
                               // it's better omit .toArray() and use the cursor directly, or implements pagination.
        if(result.length == 0){            
            res.setHeader("Content-Type", "application/json");
            return res.status(404).json({ error: "No categories found" });
        }

        res.setHeader("Content-Type", "application/json");
        return res.status(200).json(result);        
    } catch (error) {
        console.error("Database Error:", error); 
        res.setHeader("Content-Type", "application/json");
        return res.status(500).json({ error: "Internal Server Error" });        
    }
}

const getSingle = async (req, res) => {
    // #swagger.tags=['Categories']
    // #swagger.summary="Gets a category"
    /**
    * #swagger.description= "Gets a single category given the id"
    */
    /**
     * #swagger.parameters['id'] = {
        in: 'path',
        description: 'ID of the category to retrieve',
        required: true,
        type: 'string',
        example: '6500002e6f1a2b6d9c5e790a'
      }
     */

    // id validation
    let categoryId = req.params.id;
    if (!ObjectId.isValid(categoryId)) {
        return res.status(400).json({ error: "Invalid ID format" });
    }
    
    categoryId = new ObjectId(categoryId);

    try {
        const result = await mongodb.getDatabase().db(dbName).collection("categories").findOne({ _id: categoryId });
        console.log(result);
        if (!result) {
            return res.status(404).json({ error: "Category not found" });
        }

        res.setHeader("Content-Type", "application/json");
        res.status(200).json(result);

    } catch (error) {
        console.error("Database Error getting single category: ", error);
        res.setHeader("Content-Type", "application/json");
        res.status(500).json({ error: "Server Error" });
    }
}

const createCategory = async (req, res) => {
    // #swagger.tags=['Categories']
    // #swagger.summary="Creates a category"
    /**
     * #swagger.description= "Creates a new category given the required data.
        Requires the following fields: name, description, and created_at. 
        Returns an object containing the id created."
    */

    /* #swagger.parameters['body'] = {
       in: 'body', 
       '@schema': { 
            "required": ["name", "description", "created_at"], 
           "properties": { 
               "name": { 
                   "type": "string", 
                   "example": "Garden" 
               },
               "description": {
                   "type": "string",
                   "example": "Different supplies"
               },
               "created_at": {
                   "type": "string",
                   "example": "2024-09-30T12:34:56Z"
               }
           } 
       } 
   } 
   */ 
    const { name, description, created_at } = req.body;
    const category = { name, description, created_at };

    try {
        const response = await mongodb.getDatabase().db(dbName).collection("categories").insertOne(category);
        if (response.acknowledged) {
            res.status(201).json({_id: response.insertedId});
        }
        else {
            res.status(500).json({error: "Failed to create the category"});
        }
    } catch (error) {
        console.error("Error creating category: ", error);
        res.status(500).json({error: error.message || "Some error ocurred while creating the category"});

    }
}

const updateCategory = async (req, res) => {
    // #swagger.tags=['Categories']
    // #swagger.summary="Updates a category"
    /**
     * #swagger.description= "Updates the category info given the id. <br>
     Only the given fields will be updated: <br>
      name, description, created_at."
    */

    /**
    * #swagger.parameters['body'] = { 
         in: 'body', 
         '@schema': { 
             "properties": { 
               "name": { 
                   "type": "string", 
                   "example": "Garden" 
               },
               "description": {
                   "type": "string",
                   "example": "Different supplies"
               },
               "created_at": {
                   "type": "string",
                   "example": "2024-09-30T12:34:56Z"
               }
           } 
         } 
     } 
     */ 

    // id validation
    let categoryId = req.params.id;
    if (!ObjectId.isValid(categoryId)) {
        return res.status(400).json({ error: "Invalid ID format" });
    }
    
    categoryId = new ObjectId(categoryId);

    // creating a valid object with right keys
    const category = {};
    if (req.body.name) category.name = req.body.name;
    if (req.body.description) category.description = req.body.description;
    if (req.body.created_at) category.created_at = req.body.created_at;

    try {
        const response = await mongodb.getDatabase().db(dbName).collection("categories")
            .updateOne({ _id: categoryId }, { $set: category });

        if(response.modifiedCount > 0){
            res.status(204).send();
        }
        else{
            res.status(404).json({error: "Category not found or no changes made"});
        }
    } catch (error) {
        console.log("Error updating the category: ", error);
        res.status(500).json({error: error.message || "Some error ocurred while updating the category"});
    }
}

const deleteCategory = async (req, res) => {
    // #swagger.tags=['Categories']
    // #swagger.summary="Deletes a category"
    /**
     * #swagger.description= "Deletes the category info given the id"
    */
    /**
        * #swagger.parameters['id'] = {
           in: 'path',
           description: 'ID of the category to delete', 
           required: true,
           type: 'string',
           example: '6500002e6f1a2b6d9c5e790a'
         }
        */


    // id validation
    let categoryId = req.params.id;
    if (!ObjectId.isValid(categoryId)) {
        return res.status(400).json({ error: "Invalid ID format" });
    }
    
    categoryId = new ObjectId(categoryId);

    // prevents the deletion of category, if there are associated products:
    const productsInCategory = await mongodb.getDatabase().db(dbName).collection("products")
        .find({ category_id: new ObjectId(categoryId) }).count();
    if (productsInCategory > 0) {
        return res.status(400).json({ error: "Cannot delete category with associated products" });
    }

    try {
        const response = await mongodb.getDatabase().db(dbName).collection("categories").deleteOne({_id: categoryId});
        if(response.deletedCount > 0){
            res.status(204).send();
        }
        else{
            console.log("Error deleting category: ", response);
            res.status(500).json({error : "Failed deleting category"});
        }
    } catch (error) {
        console.log("Error executing query to delete category: ", error);
        res.status(500).json({error: error.message || "Some error ocurred while deleting the category"});

    }
}


module.exports = {
    getAll,
    getSingle,
    createCategory,
    updateCategory,
    deleteCategory
}
