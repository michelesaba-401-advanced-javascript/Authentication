"use strict";

module.exports = (err, req, res, next) => {
  console.error("__SERVER_ERROR__", err);
  let error = { error: err.message || err };
  res.statusCode = err.status || 500;
  res.statusMessage = err.statusMessage || "Server Error";
  res.setHeader("Content-Type", "application/json");
  res.write( JSON.stringify(error) );
  res.end();
};
