if(process.env.NODE_ENV == "production") {
  module.exports = {
    mongoURL: "mongodb://ds241699.mlab.com:41699/vidjot-dev",
    user: "chiku",
    password: "Chiku@1"
  };
}

else {
  module.exports = {
    mongoURL: "mongodb://localhost/vidjot-dev",
    user: "",
    password: ""
  };
}