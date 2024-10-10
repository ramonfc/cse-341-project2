const validator = require('../helpers/validate');

/**
 * Applies the validation rules to the request body.
 * @param {object} rules Contains the object definition of the rules to be applied.
 * The keys are the field names and the values are the validation rules.
 * Example: { name: 'required|string', description: 'required|string' }
 * @returns {function} Middleware function to validate the request body.
 */
const validateRule = (rules) => {
    return (req, res, next) => {
        validator(req.body, rules, {}, (err, status) => {
            if (!status) {
                res.status(412).send({
                    success: false,
                    message: 'Validation failed',
                    data: err
                });
            } else {
                next();
            }
        });
    }
}

// categories validation:

const saveCategory = validateRule({
    name: 'required|string',
    description: 'required|string',
    created_at: 'required|string|regex:/(\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}Z)/' 
  });

const updateCategory = validateRule({
    name: 'string', 
    description: 'string', 
    created_at: 'string|regex:/(\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}Z)/' 
  });



// products validation
const saveProduct = validateRule({
    name: 'required|string',
    description: 'required|string',
    price: 'required|numeric',
    stock: 'required|integer',
    category_id: 'required|string|regex:/^[0-9a-fA-F]{24}$/', 
    created_at: 'required|string|regex:/(\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}Z)/' 
});

const updateProduct = validateRule({
    name: 'string',
    description: 'string',
    price: 'numeric',
    stock: 'integer',
    category_id: 'string|regex:/^[0-9a-fA-F]{24}$/', 
    created_at: 'string|regex:/(\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}Z)/' 
});

module.exports = {
  saveCategory,
  updateCategory,
  saveProduct, 
  updateProduct
};
