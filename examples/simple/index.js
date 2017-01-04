const fs = require('fs');
const path = require('path');

const express = require('express');
const webpack = require('webpack');
const webapckUniversalMiddleware = require('webpack-universal-middleware');

const configs = require('./webpack.config');
const multiCompiler = webpack(configs);

const app = express();

app.use(webapckUniversalMiddleware(multiCompiler));

app.listen(3000);

console.log("Listening on port 3000");