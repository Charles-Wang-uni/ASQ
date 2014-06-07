var when = require('when')
  , nodefn = require('when/node/function')
  , gen = require('when/generator')
  , Assessment = db.model('Assessment')
  , AssessmentJob = db.model('AssessmentJob')
  , Session = db.model('Session')
  , Exercise = db.model('Exercise')
  , Question = db.model('Question')
  , Answer = db.model('Answer')
  , WhitelistEntry = db.model('WhitelistEntry');


/**
* Enqueues an Answer instance or array of Answer instances for assessment. This function
* assumes that all of the Answer instances should belong to the same session
* (to avoid quering the database for a session). 
* @param {Session} session 
* @param {Answer | Answer[]} val An Answer or an array of Answer instances
* @returns a promise that will fulfill with created Assessments
*/
function enqueue(session, exercise, answers){
  if (arguments.length < 3){
    throw new Error('Invalid number of arguments. Function expects\
 "session", "exercise" and "answers" arguments');
  }
  // make sure arguments are valid 
  // and their relationship is valid
  if( ! (session instanceof Session)){
    throw new Error("Invalid argument. First argument\
 should be a valid Session instance");
  }
  if( ! (exercise instanceof Exercise)){
    throw new Error("Invalid argument. Second argument\
 should be a valid Exercise instance");
  }
  if( ! (answers instanceof Array)){
    throw new Error("Invalid argument. Third argument\
 should be a valid Array instance");
  }

  // return empty array if answers length ==0;
  if( answers.length < 1){
    return when.resolve([]);
  }

  //make sure answers belong to the same session, exercise and
  // share the same answeree and assessment type
  var answeree = answers[0].answeree.toString()
    , type = answers[0].question.assessment[0]
  answers.forEach(function(answer){
    // console.dir(answer)
    if (answer.session.toString() != session._id.toString()){
      throw new Error("Mismatch Error: Property session of Answer " + answer +
       " doesn't match the _id property of Session "+ session);
    }
    if (answer.exercise.toString() !== exercise._id.toString()){
      throw new Error("Mismatch Error: Property exercise of Answer " + answer +
       " doesn't match the _id property of Exercise " + exercise);
    }
    if (answer.answeree.toString() !== answeree){
      throw new Error("Mismatch Error: Property answeree of Answer " + answer +
       " doesn't match the property answeree of first Answer " + answers[0]);
    }
    if ( ! (answer.question instanceof Question)){
      throw new TypeError("Type Error: Property question of Answer " + answer +
       " is not populated with a Question instance");
    }
    if( type !=  answer.question.assessment[0]){
      throw new Error("Mismatch Error: Property assessment[0] of answer.question" +
        answer.question + ' for answer ' + answer)
    }
  })

  return _enqueueAssessmentJob(session, exercise, answers);
}

/**
* Enqueues an single Answer instance for the specified instance
* @param {Session} session 
* @param {Answer[]} answers An array of Answer objects that have the same session property as session._id
* @returns a promise that will fulfill with the created Assessments
*/
var _enqueueAnswers = gen.lift(function *enqueueAnswersGen(session, answers) {
  var totalCreatedAssessments = [];
  for (var i=0; i < answers.length; i++) {
    var newAssessments = yield enqueueAnswer(session, answers[i]);
    //concatenate
    totalCreatedAssessments.push.apply(totalCreatedAssessments, newAssessments);
  };
return totalCreatedAssessments;
});

/**
* Enqueues an single Assessment for the specified session ans answer
* @param {Session} session 
* @param {Answer} val An Answer instance  with the same session property as session._id
* @returns a promise that will fulfill with the created Assessments
*/
var _enqueueAssessmentJob = gen.lift(function *enqueueAssessmentJobGen(session, exercise, answers) {
  try{
    var criteria = {session: session._id, role: "viewer"}
      , answeree = answers[0].answeree
      , answereeStr = answeree.toString()
      , newJobs=[]
      , createdJobs;

    var whitelistEntries = yield WhitelistEntry.find(criteria).lean().exec();
    
    whitelistEntries.forEach(function (wlEntry){
      // do not create an assignment with the same assessor and assessee
      if( answereeStr === wlEntry._id.toString()) return;

      var newAssessments = []
      var type = answers[0].question.assessment[0]
      answers.forEach(function(answer){
        newAssessments.push ({
          session  : session._id,
          exercise : exercise._id,
          answer   : answer._id,
          assessee : answeree,
          assessor : wlEntry._id,
          score    : 0,
          type     : answer.question.assessment[0],
          status  : "pending"
        });   
      });

      newJobs.push ({
        session  : session._id,
        exercise : exercise._id,
        assessments : newAssessments,
        assessee : answeree,
        assessor : wlEntry._id,
        score    : 0,
        type     : type,
        status  : "pending"
      })        
    });

   createdJobs = yield nodefn.lift(AssessmentJob.create.bind(AssessmentJob))(newJobs);
  } catch(err){
    console.log(err.stack)
  }
  return createdJobs;
});

/**
* Searches for the next assessment job for a given assessor
* @param {WhitelistEntry} assessor A WhitelistEntry object representing the assessor
* @returns {Promise } Promise will fulfill with WhitelistEntry _id of the assessee or null if there's no next job
*/
var getNextAssessmentJob = gen.lift(function *searchAssesseesGen(session , exercise, assessor){  
  try{
    // get all candidates for assessment
    var criteria = {
      exercise : exercise._id,
      assessor : assessor._id,
      assessee : { $ne: assessor._id },
      status: "pending"
    }

    var candidates = yield AssessmentJob
      .aggregate([
          { $match: criteria},
          { $group: {_id: "$assessee"}}
        ]).exec();
    
    candidates = candidates.map(function(user){return user._id});

    // find candidate with the most pending assessments
    criteria = {
      exercise : exercise._id,
      assessee : { $in: candidates },
      status: "pending"
    }
    
    candidates = yield AssessmentJob
      .aggregate([
          {$match: criteria},
          {$group: { _id: "$assessee", total: {$sum: 1}}},
          { $sort: {total: -1}}
        ]).exec();

    if(candidates.length < 1) return null;

    //finally get the assessment job for this candidate
    criteria = {
      exercise: exercise._id,
      assessor : assessor._id,
      assessee : candidates[0]._id,
      status: "pending"
    }
   var assessmentJobs = yield AssessmentJob.find(criteria).exec();

   return (assessmentJobs.length > 0)
    ? assessmentJobs[0] : null
  }catch(err){
    console.log(err.stack)
  }
});

module.exports = {
  enqueue : enqueue,
  getNextAssessmentJob : getNextAssessmentJob
}