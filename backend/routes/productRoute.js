const express = require('express');
const { getAllProducts, createProduct, updateProduct, deleteProduct, getProductDetails } = require('../controllers/productController');
const router = express.Router();
const { isAuthenticate,authorizeRoles } = require('../middlewares/auth')


router.route('/products').get( getAllProducts)
router.route('/product/new').post(isAuthenticate,authorizeRoles('admin'), createProduct)
router.route('/product/:id').put(isAuthenticate, authorizeRoles('admin'),  updateProduct).delete(isAuthenticate, deleteProduct).get(getProductDetails)
// router.route('/product/:id').delete(deleteProduct)
// router.route('/product/:id').get(getProductDetails)




module.exports = router