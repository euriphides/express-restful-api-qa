'use strict';

var express = require('express');
var router = express.Router();
var Question = require('./models').Question;

router.param("qID", function(req, res, next, id){
  Question.findById(id, function(err, doc) {
    if(err) return next(err);
    if(!doc) {
      err = new Error("Not Found");
      err.status = 404;
      return next(err);
    }
    req.question = doc;
    return next();
  });
});

router.param("aID", function(req, res, next, id){
  req.answer = req.question.answers.id(id);
  if(!req.answer) {
    var err = new Error("Not Found");
    err.status = 404;
    return next(err);
  }
  next();
});

// GET /questions (already specified in app.js)
// Return all the questions collection
router.get('/', function(req, res, next){
  Question.find({})
      .sort({createdAt: -1})
      .exec(function(err, questions){ // -1 means sort in descending order
        if (err) return next(err);
        res.json(questions);
      });
 });

// POST /questions (already specified in app.js)
// Route for creating questions
router.post('/', function(req, res, next){
  var question = new Question(req.body);
  question.save(function(err, question){
    if (err) return next(err);
    res.status(201);
    res.json(question);
  });
});

// GET /questions/:id
// Return for specific questions
router.get('/:qID', function(req, res){
  res.json(req.question);
});

// POST /questions/:id/answers
// Route for creating an answer
router.post('/:qID/answers', function(req, res, next){
  req.question.answers.push(req.body);
  req.question.save(function(err, question){
    if(err) return next(err);
    res.status(201);
    res.json(question);
  });
});

//PUT /questions/:qID/answers/:aID
// Edit a specific answer
router.put('/:qID/answers/:aID', function(req, res) {
  req.answer.update(req.body, function(err, result) {
    if(err) return next(err);
    res.json(result);
  });

});

//DELETE /questions/:qID/answers/:aID
// Delete a specific answer
router.delete('/:qID/answers/:aID', function(req, res) {
  req.answer.remove(function(err){
    req.question.save(function(err, question){
      if(err) return next(err);
      res.json(question);
    });
  });

});

//POST /questions/:qID/answers/:aID/vote-up
//POST /questions/:qID/answers/:aID/down-up
// Vote on a specific answer
router.post('/:qID/answers/:aID/vote-:dir',
  function(req, res, next){
    if(req.params.dir.search(/^(up|down)$/) === -1) { // regular expression - if the directory is not up or down (-1 means "not found").
      var err = new Error("Not Found");
      err.status = 404;
      next(err);
    } else {
      req.vote = req.params.dir;
      next();
    }
  },
  function(req, res, next) {
    req.answer.vote(req.vote, function(err, question){
      if(err) return next (err);
      res.json(question);
    });
});

module.exports = router;