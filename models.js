'use strict'

var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var sortAnswers = function(a, b) {
  // return negative if a should appear before b
  // return 0 if no change
  // return positive is a should be sorted after b
  if(a.votes === b.votes) {
    return b.updatedAt - a.updatedAt;
  }
  return b.votes - a.votes;
}

var AnswerSchema = new Schema({
  text: String,
  createdAt: {type: Date, default: Date.now},
  updatedAt: {type: Date, default: Date.now},
  votes: {type: Number, default: 0}
});

// instance method, using the "method" method - pass in the name of the method, and then the function that is the method.
AnswerSchema.method("update", function(updates, callback) {
  Object.assign( this, updates, {updatedAt: new Date()} );
  this.parent().save(callback);
});

AnswerSchema.method("vote", function(vote, callback){
  if(vote === "up") {
    this.votes++;
  } else {
    this.votes--;
  }
  this.parent().save(callback);
});

var QuestionSchema = new Schema({
  text: String,
  createdAt: {type: Date, default: Date.now},
  answers: [AnswerSchema]
});

QuestionSchema.pre("save", function(next){
  this.answers.sort(sortAnswers);
  next();
});

var Question = mongoose.model("Question", QuestionSchema);

module.exports = Question;