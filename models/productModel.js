const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please enter product Name'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Please enter product description'],
  },
  price: {
    type: Number,
    required: [true, 'Please enter product Price'],
    maxlength: [8, 'Price cannot Exceed 8 Characters'],
  },
  ratings: {
    type: Number,
    default: 0,
  },
  images: {},
  category: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
  ],
  stock: {
    type: Number,
    required: [true, 'Please enter product Stock'],
    maxlength: [4, 'Stock cannot exceed 4 characters'],
    default: 1,
  },
  numOfReviews: {
    type: Number,
    default: 0,
  },
  reviews: [
    {
      user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      rating: {
        type: Number,
        required: true,
      },
      comment: {
        type: String,
        required: true,
      },
    },
  ],
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Product', productSchema);
