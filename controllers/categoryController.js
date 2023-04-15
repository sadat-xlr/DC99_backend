const Category = require('../models/categoryModel');
const Product = require('../models/productModel');
const ErrorHandler = require('../utils/errorhandler');
const catchAsyncErrors = require('../middleware/catchAsyncErrors');

//Create new category
exports.newCategory = catchAsyncErrors(async (req, res, next) => {
  const { name, description } = req.body;

  const category = await Category.create({
    name,
    description,
    createdAt: Date.now(),
  });

  res.status(200).json({
    success: true,
    category,
  });
});

//get single order

exports.getSingleOrder = catchAsyncErrors(async (req, res, next) => {
  const order = await Order.findById(req.params.id).populate(
    'user',
    'name email'
  );

  if (!order) {
    next(new ErrorHandler('Order not found with id ', 404));
  }

  res.status(200).json({
    success: true,
    order,
  });
});

//get all orders -- admin

exports.getAllCategories = catchAsyncErrors(async (req, res, next) => {
  const categories = await Category.find();

  res.status(200).json({
    success: true,
    categories,
  });
});

//update Category -- admin

exports.updateCategory = catchAsyncErrors(async (req, res, next) => {
  let category = await Category.findById(req.params.id);

  if (!category) {
    return next(new ErrorHandler('Category Not Found', 404));
  }

  category = await Category.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
    category,
  });
});

//delete category --admin

exports.deleteCategory = catchAsyncErrors(async (req, res, next) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    next(new ErrorHandler('Category not found with id ', 404));
  }
  Product.updateMany(
    { category: category._id },
    { $pull: { category: category._id } },
    (err, result) => {
      if (err) {
        console.error(err);
        return;
      }

      console.log(`${result.nModified} products updated`);
      // Respond with success message
    }
  );
  category.remove();
  res.status(200).json({
    success: true,
  });
});
