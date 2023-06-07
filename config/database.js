const mongoose = require('mongoose');

const connectDatabase = () => {
  console.log(process.env.DB_URI_DC99);
  mongoose
    .connect("mongodb://127.0.0.1:27017/dc99", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then((data) => {
      console.log(`Mongodb connected with server: ${data.connection.host}`);
    });
};

module.exports = connectDatabase;
