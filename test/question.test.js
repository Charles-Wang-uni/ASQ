var chai = require('chai')
// , chaiAsPromised = require("chai-as-promised")
, assert = chai.assert
, expect = chai.expect
, mongoose = require("mongoose")
, questionModel = require("../models/question")

// support for promises
// require("mocha-as-promised")();
// chai.use(chaiAsPromised);

var db = mongoose.createConnection('127.0.0.1', 'test-asq');

var Question = db.model("Question")
, QuestionOption = db.model("QuestionOption")



describe('Question model', function() {

  before(function(done){
    Question.remove({},  function(err){
      if (err) throw err;
      done();
    });
  });

  after(function(done){
    Question.remove({},  function(err){
      if (err) throw err;
      done();
    });
  })

  it("should create a new question", function(done){
    var q = new Question({
      htmlId: "q-1",
      stem: "How's the weather today?",
      formButtonType: "checkbox",
      questionOptions:[
        new QuestionOption({text:"Cloudy" , correct:true}),
        new QuestionOption({text:"Sunny" , correct:true}),
        new QuestionOption({text:"Rainy" , correct:true}),
        new QuestionOption({text:"Stormy" , correct:true})
      ]
    });
    
    q.save(function (err, question) {
      if (err) throw(err);
      console.log('saved')

      Question.find({htmlId : "q-1"}, function(err, docs){
        if(err) throw(err);

        done();
      })
    })

  })

  //  describe('.getFirstHtmlFile(path)', function(){
  //   it.skip('should be tested')
  // });

});