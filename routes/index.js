var express = require('express');
var async = require('async');
var path = require('path');
var fs = require('fs');

var router = express.Router();
var videosdir = path.join(__dirname, '../public/videos');

router.get('/', function(req, res, next) {
  var skip = parseInt(req.query.skip) || 0;

  async.waterfall([
    function readDir (next) {
      fs.readdir(videosdir, next);
    },

    function filter (files, next) {
      next(null, files.filter(function (file) {
        return file.indexOf('.webm') > -1;
      }));
    },

    function orderFiles (files, next) {
      async.sortBy(files, function (file, next) {
        var filepath = path.join(videosdir, file);

        fs.stat(filepath, function (e, stats) {
          next(e, stats && stats.mtime.getTime() * -1);
        });
      }, next);
    },

    function offset (files, next) {
      next(null, files.slice(skip));
    },

    function limit (files, next) {
      next(null, files.slice(0, 10));
    }
  ], function (e, files) {
    if (e) {
      return next(e);
    }

    res.render('index', {
      files: files,
      skip: skip
    });
  });
});

module.exports = router;
