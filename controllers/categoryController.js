const Category = require('../models/categoryModel');
const Product = require('../models/productModel');
const ErrorHandler = require('../utils/errorhandler');
const catchAsyncErrors = require('../middleware/catchAsyncErrors');

const ApiFeatures = require('../utils/apifeatures');
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

exports.getSingleCategory = catchAsyncErrors(async (req, res, next) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    next(new ErrorHandler('Category not found with id ', 404));
  }

  res.status(200).json({
    success: true,
    data: category,
  });
});

//get all categories -- admin

exports.getAllCategories = catchAsyncErrors(async (req, res, next) => {
  const resultPerPage = 100;

  const categoriesCount = await Category.countDocuments();

  const apiFeature = new ApiFeatures(Category.find(), req.query)
    .search()
    .filter()
    .pagination(resultPerPage);

  const categories = await apiFeature.query;
  console.log('categories sent');
  // const startIndex = (req.query._start || 0) * 1;
  // const endIndex = (req.query._end || startIndex + 9) * 1;
  // const totalCount = products.length;
  // const slicedPosts = products.slice(startIndex, endIndex);
  res.setHeader('Access-Control-Expose-Headers', 'X-Total-Count');
  res.setHeader('X-Total-Count', `1-20/${categoriesCount}`);

  res.status(200).json({
    data: categories,
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
