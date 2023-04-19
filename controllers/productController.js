const Product = require('../models/productModel');
const ErrorHandler = require('../utils/errorhandler');
const catchAsyncErrors = require('../middleware/catchAsyncErrors');
const ApiFeatures = require('../utils/apifeatures');
const path = require('path');
const Category = require('../models/categoryModel');
const fs = require('fs');
const { MongoClient, ObjectId } = require('mongodb');

const multer = require('multer');
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + '');
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB
    files: 15,
  },
  fileFilter: function (req, file, cb) {
    const fileTypes = /jpeg|jpg|png|gif/; // Set allowed file types
    const extname = fileTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = fileTypes.test(file.mimetype);
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(
        new Error(
          'Invalid file type. Only JPEG, JPG, PNG, and GIF images are allowed.'
        )
      );
    }
  },
});

//Create Product -- Admin
exports.createProduct = catchAsyncErrors(async (req, res, next) => {
  const uploadPromise = new Promise((resolve, reject) => {
    upload.array('images')(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        // A multer error occurred
        reject(
          new Error(
            'File upload failed: ' +
              err.message +
              ' ' +
              (err.field ? err.field : '')
          )
        );
      } else if (err) {
        // An unknown error occurred
        reject(err);
      } else {
        // No error occurred, resolve the Promise with the uploaded files
        resolve(req.files);
      }
    });
  });
  try {
    const files = await uploadPromise;
    const images = files.map((file) => file.filename);
    req.body.user = req.user.id;
    const bodyEntries = Object.entries(req.body);
    const obj = bodyEntries.reduce((acc, [key, value]) => {
      acc[key] = value;
      return acc;
    }, {});

    let productInfo = Object.assign({}, obj, { images: images });
    productInfo.category = Array.from(
      new Set(JSON.parse(productInfo.category))
    );

    let product = await Product.create(productInfo);
    product = await product.populate('category');
    res.status(201).json({
      success: true,
      product,
    });
  } catch (err) {
    next(err);
  }
});

// Get all Products
exports.getAllProducts = catchAsyncErrors(async (req, res) => {
  const resultPerPage = 100;

  const productCount = await Product.countDocuments();

  const apiFeature = new ApiFeatures(
    Product.find().populate({
      path: 'category',
      model: 'Category',
      options: { strictPopulate: false },
    }),
    req.query
  )
    .search()
    .filter()
    .pagination(resultPerPage);

  const products = await apiFeature.query;
  console.log('products sent');
  console.log(req.query);
  console.log(req.params);
  // const startIndex = (req.query._start || 0) * 1;
  // const endIndex = (req.query._end || startIndex + 9) * 1;
  // const totalCount = products.length;
  // const slicedPosts = products.slice(startIndex, endIndex);
  res.setHeader('Access-Control-Expose-Headers', 'Content-Range');
  res.setHeader('Content-Range', `1-20/20`);

  res.status(200).json({ data: Array.from(products), total: productCount });
});

//Update product -- Admin

exports.updateProduct = catchAsyncErrors(async (req, res, next) => {
  let product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorHandler('Product Not Found', 404));
  }

  product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
    product,
  });
});

// Get Product Details

exports.getProductDetails = catchAsyncErrors(async (req, res, next) => {
  const product = await Product.findById(req.params.id).populate('category');

  if (!product) {
    return next(new ErrorHandler('Product Not Found', 404));
  }

  res.status(200).json({
    success: true,
    message: product,
  });
});

//Delete Product

exports.deleteProduct = catchAsyncErrors(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorHandler('Product Not Found', 404));
  }
  product.images.forEach((value) => deleteFile('uploads/' + value));
  await product.remove();

  res.status(200).json({
    success: true,
    message: 'Product deleted successfully',
  });
});
exports.deleteImage = catchAsyncErrors(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorHandler('Product Not Found', 404));
  }

  const objectId = new ObjectId.createFromHexString(req.params.id);

  const newProduct = await Product.updateOne(
    { _id: objectId },
    { $pull: { ['images']: req.params.imageid } }
  );
  deleteFile('uploads/' + req.params.imageid);
  console.log(req.params.id);
  console.log(req.params.imageid);
  res.status(200).json({
    success: true,
    message: 'Image deleted successfully',
  });
});

function deleteFile(filePath) {
  fs.unlink(filePath, (err) => {
    if (err) {
      console.error(err);
      return;
    }

    console.log(`File ${filePath} has been deleted`);
  });
}

//Add Single Image of a Product -- Admin
exports.uploadMultipleImages = catchAsyncErrors(async (req, res, next) => {
  const uploadPromise = new Promise((resolve, reject) => {
    upload.array('images')(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        // A multer error occurred
        reject(
          new Error(
            'File upload failed: ' +
              err.message +
              ' ' +
              (err.field ? err.field : '')
          )
        );
      } else if (err) {
        // An unknown error occurred
        reject(err);
      } else {
        // No error occurred, resolve the Promise with the uploaded files
        resolve(req.files);
      }
    });
  });
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return next(new ErrorHandler('Product Not Found', 404));
    }

    const files = await uploadPromise;

    const images = files.map((file) => file.filename);

    const objectId = new ObjectId.createFromHexString(req.params.id);

    await Product.updateOne(
      { _id: objectId },
      { $push: { images: { $each: images } } }
    );
    res.status(201).json({
      success: true,
      message: 'Added Successfully',
    });
  } catch (err) {
    next(err);
  }
});

exports.loadimage = catchAsyncErrors(async (req, res, next) => {
  res.setHeader('Content-Type', 'image/png');
  res.sendFile(path.resolve('uploads/' + req.params.id));
});
