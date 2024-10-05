require("dotenv").config();
const mongodb = require("../data/database");
const ObjectId = require("mongodb").ObjectId;

const dbName = process.env.MONGO_DB_NAME;

const getAll = async (req, res) => {
    // #swagger.tags=['Products']
    // #swagger.summary="All products"
    /**
     * #swagger.description= "Gets all products"
     */
    try {
        const result = await mongodb.getDatabase().db(dbName).collection("products")
            .find().toArray(); // Note: if returned data is a lot of, 
                               // it's better omit .toArray() and use the cursor directly, or implements pagination.
        if(result.length == 0){            
            res.setHeader("Content-Type", "application/json");
            return res.status(404).json({ error: "No products found" });
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
    // #swagger.tags=['Products']
    // #swagger.summary="Gets a product"
    /**
    * #swagger.description= "Gets a single product given the id"
    */
    /**
     * #swagger.parameters['id'] = {
        in: 'path',
        description: 'ID of the product to retrieve',
        required: true,
        type: 'string',
        example: '6500002e6f1a2b6d9c5e790a'
      }
     */

    // id validation
    let productId = req.params.id;
    if (!ObjectId.isValid(productId)) {
        return res.status(400).json({ error: "Invalid ID format" });
    }
    
    productId = new ObjectId(productId);

    try {
        const result = await mongodb.getDatabase().db(dbName).collection("products").findOne({ _id: productId });
        console.log(result);
        if (!result) {
            return res.status(404).json({ error: "Product not found" });
        }

        res.setHeader("Content-Type", "application/json");
        res.status(200).json(result);

    } catch (error) {
        console.error("Database Error getting single product: ", error);
        res.setHeader("Content-Type", "application/json");
        res.status(500).json({ error: "Server Error" });
    }
}

const createProduct = async (req, res) => {
    // #swagger.tags=['Products']
    // #swagger.summary="Creates a product"
    /**
     * #swagger.description= "Creates a new product given the required data. <br>
        Requires the following fields: name, price, description, category_id, stock, discount.
        The field created_at is optional. <br>
        Returns an object containing the id created."
    */

    /**
     #swagger.parameters['body'] = {
        in: 'body',
        '@schema': {
        "required": ["name", "price", "description", "category_id", "stock", "discount"],
        "properties": {
            "name": { 
            "type": "string",
            "example": "Product name" 
            },
            "description": {
            "type": "string",
            "example": "Product description"
            },
            "category_id": {
            "type": "string",
            "description": "The ObjectId of the associated category",
            "example": "6500002e6f1a2b6d9c5e790a" 
            },
            "price": {
            "type": "number",
            "example": 19.99
            },
            "stock": {
            "type": "integer",
            "example": 50
            },
            "discount": {
            "type": "number",
            "example": 10
            },
            "created_at": {
            "type": "string",
            "example": "2024-09-30T12:34:56Z"
            }
        }
        }
    }
    */

    const { name, description, price, stock, category_id, created_at } = req.body;
    // validate category_id: 
    if (!ObjectId.isValid(category_id)) {
        return res.status(400).json({ error: "Invalid category ID format" });
    }

    const categoryId = new ObjectId(category_id);

    const product = {
        name,
        description,
        price,
        stock,
        category_id: categoryId,
        created_at: created_at || new Date().toISOString()
    };


    try {
        const response = await mongodb.getDatabase().db(dbName).collection("products").insertOne(product);
        if (response.acknowledged) {
            res.status(201).json({ _id: response.insertedId });
        }
        else {
            res.status(500).json({ error: "Failed to create the product" });
        }
    } catch (error) {
        console.error("Error creating product: ", error);
        res.status(500).json({ error: error.message || "Some error ocurred while creating the product" });

    }
}

const updateProduct = async (req, res) => {
    // #swagger.tags=['Products']
    // #swagger.summary="Updates a product"
    /**
     * #swagger.description= "Updates the product info given the id. <br>
      Only the given fields will be updated: <br>
      name, price, description, category_id, stock, discount, created_at."
    */

   /**
     #swagger.parameters['body'] = {
        in: 'body',
        '@schema': {
        "properties": {
            "name": { 
            "type": "string",
            "example": "Product name" 
            },
            "description": {
            "type": "string",
            "example": "Product description"
            },
            "category_id": {
            "type": "string",
            "description": "The ObjectId of the associated category",
            "example": "6500002e6f1a2b6d9c5e790a" 
            },
            "price": {
            "type": "number",
            "example": 19.99
            },
            "stock": {
            "type": "integer",
            "example": 50
            },
            "discount": {
            "type": "number",
            "example": 10
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
    let productId = req.params.id;
    if (!ObjectId.isValid(productId)) {
        return res.status(400).json({ error: "Invalid ID format" });
    }
    productId = new ObjectId(productId);


    // creating a valid object with right keys
    const validFieldsToUpdate = ['name', 'price', 'description', 'category_id', 'stock', 'discount', 'created_at'];
    const product = {};
    validFieldsToUpdate.forEach(field => {
        if (req.body[field]) product[field] = req.body[field];
    });


    // validate category_id: 
    if (product.category_id) {
        if (!ObjectId.isValid(product.category_id)) {
            return res.status(400).json({ error: "Invalid category ID format" });
        }
        // validate if category exist:
        const categoryExists = await mongodb.getDatabase().db(dbName).collection("categories")
            .findOne({ _id: new ObjectId(product.category_id) });
        if (!categoryExists) {
            return res.status(404).json({ error: "Category not found" });
        }
        product.category_id = new ObjectId(product.category_id);
    }


    try {
        const response = await mongodb.getDatabase().db(dbName).collection("products")
            .updateOne({ _id: productId }, { $set: product });

        if (response.modifiedCount > 0) {
            res.status(204).send();
        }
        else {
            res.status(404).json({ error: "Product not found or no changes made" });
        }
    } catch (error) {
        console.log("Error updating the product: ", error);
        res.status(500).json({ error: error.message || "Some error ocurred while updating the product" });
    }
}

const deleteProduct = async (req, res) => {
    // #swagger.tags=['Products']
    // #swagger.summary="Deletes a product"
    /**
     * #swagger.description= "Deletes the product info given the id."
    */
    /**
        * #swagger.parameters['id'] = {
           in: 'path',
           description: 'ID of the product to delete', 
           required: true,
           type: 'string',
           example: '6500002e6f1a2b6d9c5e790a'
         }
        */


    // id validation
    let productId = req.params.id;
    if (!ObjectId.isValid(productId)) {
        return res.status(400).json({ error: "Invalid ID format" });
    }
    
    productId = new ObjectId(productId);
    
    try {
        const response = await mongodb.getDatabase().db(dbName).collection("products").deleteOne({_id: productId});
        if(response.deletedCount > 0){
            res.status(204).send();
        }
        else{
            console.log("Error deleting product: ", response.error);
            res.status(500).json({error : "Failed deleting product"});
        }
    } catch (error) {
        console.log("Error executing query to delete product: ", error);
        res.status(500).json({error: error.message || "Some error ocurred while deleting the product"});

    }
}


const getProductsByCategory = async (req, res) => {
    // #swagger.tags=['Products']
    // #swagger.summary="Gets products by category id"
    /**
     * #swagger.description= "Fetches all products that belong to a given category id."
    */

    /**
    #swagger.parameters['category_id'] = {
        in: 'path',
        required: true,
        description: "The ObjectId of the category",
        type: "string",
        example: "6500002e6f1a2b6d9c5e790a"
    }
    */

    const categoryId = req.params.category_id;

    // validate category_id
    if (!ObjectId.isValid(categoryId)) {
        return res.status(400).json({ error: "Invalid category ID format" });
    }

    try {
        const products = await mongodb.getDatabase()
            .db(dbName)
            .collection("products")
            .find({ category_id: new ObjectId(categoryId) })
            .toArray();  

        if (products.length > 0) {
            res.status(200).json(products);
        } else {
            res.status(404).json({ message: "No products found for this category" });
        }
    } catch (error) {
        console.log("Error fetching products by category: ", error);
        res.status(500).json({ error: error.message || "Some error occurred while fetching the products" });
    }
};

module.exports = {
    getAll,
    getSingle,
    createProduct,
    updateProduct,
    deleteProduct,
    getProductsByCategory
}
