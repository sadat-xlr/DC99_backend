const express = require('express');

const { isAuthenticatedUser, authorizeRoles } = require('../middleware/auth');

const {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductDetails,
  deleteImage,
  loadimage,
  uploadMultipleImages,
} = require('../controllers/productController');

const router = express.Router();

router.route('/products').get(getAllProducts);
// router
//   .route('/admin/product/images/upload')
//  .post(isAuthenticatedUser, authorizeRoles('admin'), uploadFiles);
router
  .route('/admin/product/new')
  .post(isAuthenticatedUser, authorizeRoles('admin'), createProduct);

router
  .route('/admin/product/:id/remove/:imageid')
  .post(isAuthenticatedUser, authorizeRoles('admin'), deleteImage);

router
  .route('/admin/product/:id/uploadimages')
  .post(isAuthenticatedUser, authorizeRoles('admin'), uploadMultipleImages);

router
  .route('/admin/product/:id')
  .put(isAuthenticatedUser, authorizeRoles('admin'), updateProduct)
  .delete(isAuthenticatedUser, authorizeRoles('admin'), deleteProduct);

router.route('/product/:id').get(getProductDetails);
router.route('/images/:id').get(loadimage);
module.exports = router;
