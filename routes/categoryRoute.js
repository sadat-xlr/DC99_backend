const express = require('express');
const {
  newCategory,
  getAllCategories,
  updateCategory,
  deleteCategory,
} = require('../controllers/categoryController');

const router = express.Router();
const { isAuthenticatedUser, authorizeRoles } = require('../middleware/auth');

router
  .route('/admin/category/new')
  .post(isAuthenticatedUser, authorizeRoles('admin'), newCategory);
router
  .route('/admin/category/:id')
  .put(isAuthenticatedUser, authorizeRoles('admin'), updateCategory);
router
  .route('/admin/category/remove/:id')
  .delete(isAuthenticatedUser, authorizeRoles('admin'), deleteCategory);
router
  .route('/categories')
  .get(isAuthenticatedUser, authorizeRoles('admin'), getAllCategories);

module.exports = router;
