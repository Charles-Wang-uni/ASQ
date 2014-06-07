var when = require('when')
  , nodefn = require('when/node/function')
  , gen = require('when/generator')
  , Assessment = db.model('Assessment')
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
function enqueue(session, exercise, val){
  if (arguments.length < 3){
    throw new Error('Invalid number of arguments. Function expects\
 "session", "exercise" and "answers" arguments');
  }
  if (val  instanceof Array) {
    return _enqueueAnswers(session, exercise, val)
  } else{
    return enqueueAnswer(session, exercise, val);
  }
}

/**
* Enqueues an single Answer instance for the specified instance
* @param {Session} session
* @param {Answer} answer An Answer instance with the same session property as session._id
* @returns a promise that will fulfill with created Assessments
*/
function enqueueAnswer(session, exercise,  answer){
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
  if( ! (answer instanceof Answer)){
    throw new Error("Invalid argument. Second argument\
 should be a valid Answer instances");
  }

  if( answer.session.toString() !== session._id.toString()){
    throw new Error("Mismatch of properties:\
 answer.session does not match session.id");
  }

  return _enqueueAssessmentJob(session, exercise, answer);
}

/**
* Enqueues an single Answer instance for the specified instance
* @param {Session} session 
* @param {Answer[]} answers An array of Answer objects that have the same session property as session._id
* @returns a promise that will fulfill with the created Assessments
*/
var _enqueueAnswers = gen.lift(function *enqueueAnswersGen(session, exercise, answers) {
  var totalCreatedAssessments = [];
  for (var i=0; i < answers.length; i++) {
    var newAssessments = yield enqueueAnswer(session, exercise, answers[i]);
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
var _enqueueAssessmentJob = gen.lift(function *enqueueAssessmentJobGen(session, exercise, answer) {
  try{
    var criteria = {session: session._id, role: "viewer"}
      , newAssessments = []
      , createdAssessments;

    var whitelistEntries = yield WhitelistEntry.find(criteria).lean().exec();
    
    whitelistEntries.forEach(function (wlEntry){
      // do not create an assignment with the same assessor and assessee
      if( answer.answeree.toString() === wlEntry._id.toString()) return;

      newAssessments.push ({
        session  : session._id,
        exercise : exercise._id,
        answer   : answer._id,
        assessee : answer.answeree,
        assessor : wlEntry._id,
        score    : 0,
        type     : answer.question.assessment[0],
        status  : "pending"
      })        
    });

   createdAssessments = yield nodefn.lift(Assessment.create.bind(Assessment))(newAssessments);
  } catch(err){
    console.log(err.stack)
  }
  return createdAssessments;
});

/**
* Searches for the next assessment job for a given assessor
* @param {WhitelistEntry} assessor A WhitelistEntry object representing the assessor
* @returns {Promise } Promise will fulfill with WhitelistEntry _id of the assessee or null if there's no next job
*/
var getNextAssessmentJob = gen.lift(function *searchAssesseesGen(session , exercise, assessor){  
  try{
    var criteria = {
      exercise : exercise._id,
      assessor : assessor._id,
      assessee : { $ne: assessor._id },
      status: "pending"
    }

    var candidates = yield Assessment
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

    candidates = yield Assessment
      .aggregate([
          {$match: criteria},
          {$group: { _id: "$assessee", total: {$sum: 1}}},
          { $sort: {total: -1}}
        ]).exec();

   if(candidates.length < 1) return null;

    //finally get the assessment job for this candidate
    criteria = {
      session: session._id,
      exercise : exercise._id,
      assessor : assessor._id,
      assessee : candidates[0]._id,
      status: "pending"
    }
   var assessments = yield Assessment.find(criteria).exec();
   return assessments
  }catch(err){
    console.log(err.stack)
  }
});

module.exports = {
  enqueue : enqueue,
  enqueueAnswer : enqueueAnswer,
  getNextAssessmentJob : getNextAssessmentJob
}