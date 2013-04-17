var schemas = require("../models/models.js");
var fs = require("fs");
var moment = require('moment');
var sys = require('sys');
var exec = require('child_process').exec;
var cheerio = require('cheerio');

var queue = [];
var MAX = 2;
// only allow 20 simultaneous exec calls
var count = 0;
// holds how many execs are running
var urls = []// long list of urls
var slides;

// our callback for each exec call
function wget_callback(err, stdout, stderr) {
	count -= 1;

	if (queue.length > 0 && count < MAX) {// get next item in the queue!
		count += 1;
		var url = queue.shift();
		exec("/usr/local/w2png -W 1024 -H 768 -T  --delay=2 -D public/thumbs -o " + slides + "-" + url + " -s 0.3 http://localhost:3000/slidesInFrame/" + slides + "/?url=" + url, wget_callback);
	}
}

/*  --- Edit Slideshow ---*/
function puts(error, stdout, stderr) {
	sys.puts(stdout)
}

function createThumb(slidesID) {
	fs.readFile("./slides/" + slidesID + "/index.html", 'utf-8', function(error, data) {
		var ids = [];
		$ = cheerio.load(data);
		$('.step').each(function() {
			var id = this.attr().id;
			ids.push(id);

		});
		urls = ids;
		slides = slidesID

		exec("/usr/local/w2png -W 1024 -H 768 -T -D public/thumbs -o " + slidesID + " -s 0.3 http://localhost:3000/slidesInFrame/" + slidesID + "/?url=" + ids[0], puts);

		urls.forEach(function(url) {
			if (count < MAX) {// go get the file!
				count += 1;
				exec("/usr/local/w2png -W 1024 -H 768  --delay=2 -T -D public/thumbs -o " + slides + "-" + url + " -s 0.3 http://localhost:3000/slidesInFrame/" + slides + "/?url=" + url, wget_callback);
			} else {// queue it up...
				queue.push(url);
			}
		});
	});
}

exports.editslideshow = function(req, res) {

	var slideshowDB = db.model('Slideshow', schemas.slideshowSchema);
	var questionDB = db.model('Question', schemas.questionSchema);

	slideshowDB.findById(req.query.id, function(err, slideshow) {
		if (err) {
			console.log(err);
		} else {
			/* Load presentation html file */
			var folderHTML = './slides/' + req.query.id + '/index.html';
			fs.readFile(folderHTML, 'utf-8', function(error, data) {
				
				var ids = [];
				$ = cheerio.load(data);
				$('.step').each(function() {
					var id = this.attr().id;
					ids.push(id);

				});

				var questions = [];
				for (var i = 0; i < slideshow.questions.length; i++) {
					questionDB.findById(slideshow.questions[i], function(err, question) {
						if (question) {
							questions.push(question);
						}
						if (questions.length  == slideshow.questions.length) {
							res.render('edit', {
								title : slideshow.title,
								slides : ids,
								slideshow : slideshow,
								questions: questions
							});
						}
					});
				}
			});

		}
	});
}

exports.saveDetails = function(req, res) {
	//console.log("###########wekljfnekrn");
	var slideshowDB = db.model('Slideshow', schemas.slideshowSchema);
	slideshowDB.findByIdAndUpdate(req.query.id, {
		title : req.body.presentationName,
		course : req.body.courseName
	}, function(err, slides) {
		if (err)
			throw err;
		res.redirect('/user/' + req.user.name + '?alert=Slideshow successfully updated &type=succes');
	});
	//res.redirect('/user/' + req.user.name + '?alert=Slideshow successfully updated &type=succes');
}

exports.deleteslideshow = function(req, res) {
	var users = db.model('User', schemas.userSchema);
	var out = users.findById(req.user._id, function(err, user) {
		if (user) {
			for (var i = 0; i < user.slides.length; i++) {
				if (user.slides[i] == req.query.id) {
					user.slides.splice(i, 1);
					user.save();
				}
			}
			var slideshowDB = db.model('Slideshow', schemas.slideshowSchema);
			var questionDB = db.model('Question', schemas.questionSchema);
			slideshowDB.findById(req.query.id, function(err, slideshow) {
				questionDB.remove({
					_id : {
						$in : slideshow.questions
					}
				}, function(err, question) {
					if (err) {
						console.log(err);
					}
				});
				slideshow.remove();
				res.redirect('/user/' + req.user.name);
			});

		}
	});
}
/* --- Edit HTML ---*/
exports.edithtml = function(req, res) {
	//console.log(req.query.id);
	var slideshowDB = db.model('Slideshow', schemas.slideshowSchema);
	slideshowDB.findById(req.query.id, function(err, slideshow) {
		if (err) {
			console.log(err);
		} else {
			var folderHTML = './slides/' + req.query.id + '/index.html';
			fs.readFile(folderHTML, 'utf-8', function(error, data) {
				//console.log(req.query.id + " "+ data);
				res.render('edithtml', {
					username : req.user.name,
					html : data,
					id : req.query.id,
					title : slideshow.title,
					alert : false,
					type : null
				});
			});
		}
	});
}

exports.savehtml = function(req, res) {
	//console.log(req.query.id);
	//console.log(req.body.editorvalue);
	createThumb(req.query.id);

	var slideshowDB = db.model('Slideshow', schemas.slideshowSchema);
	//Update last edit date
	slideshowDB.findByIdAndUpdate(req.query.id, {
		lastEdit : new Date()
	}, function(err, slides) {
		if (err)
			throw err;
	});
	slideshowDB.findById(req.query.id, function(err, slideshow) {
		if (err) {
			console.log(err);
		} else {
			var folderHTML = './slides/' + req.query.id + '/index.html';
			fs.writeFile(folderHTML, req.body.editorvalue, function(err) {
				if (err) {
					console.log(err);
				} else {

					res.render('edithtml', {
						username : req.user.name,
						html : req.body.editorvalue,
						id : req.query.id,
						title : slideshow.title,
						alert : "Your data has been successfully saved.",
						type : "succes"
					});

				}
			});
		}
	});

}
/* --- Edit Style --- */

exports.editstyle = function(req, res) {
	//console.log(req.query.id);
	var slideshowDB = db.model('Slideshow', schemas.slideshowSchema);
	slideshowDB.findById(req.query.id, function(err, slideshow) {
		if (err) {
			console.log(err);
		} else {
			var folderHTML = './slides/' + req.query.id + '/css/style.css';
			fs.readFile(folderHTML, 'utf-8', function(error, data) {
				// console.log(req.query.id + " "+ data);
				res.render('editstyle', {
					username : req.user.name,
					html : data,
					id : req.query.id,
					title : slideshow.title,
					alert : false,
					type : null
				});
			});
		}
	});
}

exports.savestyle = function(req, res) {
	//console.log(req.query.id);
	//console.log(req.body.editorvalue);
	createThumb(req.query.id);
	var slideshowDB = db.model('Slideshow', schemas.slideshowSchema);
	//Update last edit date
	slideshowDB.findByIdAndUpdate(req.query.id, {
		lastEdit : new Date()
	}, function(err, slides) {
		if (err)
			throw err;
	});
	slideshowDB.findById(req.query.id, function(err, slideshow) {
		if (err) {
			console.log(err);
		} else {
			var folderHTML = './slides/' + req.query.id + '/css/style.css';
			fs.writeFile(folderHTML, req.body.editorvalue, function(err) {
				if (err) {
					console.log(err);
				}
				res.render('editstyle', {
					username : req.user.name,
					html : req.body.editorvalue,
					id : req.query.id,
					title : slideshow.title,
					alert : "Your data has been successfully saved.",
					type : "succes"
				});

			});
		}
	});

}
/* --- Edit Questions --- */
exports.editquestions = function(req, res) {
	var users = db.model('User', schemas.userSchema);
	var out = users.findById(req.user._id, function(err, user) {
		if (err) {
			console.log(err);
		} else {
			if (user) {

				var slideshowbelongs = false;
				for (var i = 0; i < user.slides.length; i++) {
					if (user.slides[i] == req.query.id) {
						slideshowbelongs = true;

					}
				}
				if (!slideshowbelongs) {
					res.redirect("/user");
				} else {
					var slideshowDB = db.model('Slideshow', schemas.slideshowSchema);
					slideshowDB.findById(req.query.id, function(err, slideshow) {
						if (err) {
							console.log(err);
						} else {
							if (slideshow) {

								var questions = [];
								var questionDB = db.model('Question', schemas.questionSchema);
								var optionDB = db.model('Option', schemas.optionSchema);
								for (var i = 0; i < slideshow.questions.length; i++) {
									questionDB.findById(slideshow.questions[i], function(err, question) {

										if (question) {

											var newquestionob = new Object({
												_id : question._id,
												questionText : question.questionText,
												questionType : question.questionType,
												afterslide : question.afterslide,
												answeroptions : []
											});

											for (var j = 0; j < question.answeroptions.length; j++) {
												optionDB.findById(question.answeroptions[j], function(err, option) {
													newquestionob.answeroptions.push(option);
													if (newquestionob.answeroptions.length == question.answeroptions.length) {
														questions.push(newquestionob);
														if (questions.length == slideshow.questions.length) {
															console.log("########################2");
															res.render('editQuestions', {
																arrayquestions : questions,
																username : req.user.name,
																title : slideshow.title
															});
														}
													}
												});
											}
											if (question.answeroptions.length == 0) {
												questions.push(newquestionob);
												if (questions.length == slideshow.questions.length) {
													console.log("########################3");
													res.render('editQuestions', {
														arrayquestions : questions,
														username : req.user.name,
														title : slideshow.title
													});
												}
											}
										}

									});
								}
								if (slideshow.questions.length == 0) {
									console.log("########################5");
									res.render('editQuestions', {
										arrayquestions : questions,
										username : req.user.name,
										title : slideshow.title
									});
								}

							} else {
								res.redirect("/user");
							}

						}
					});

				}

			}
		}

	});

}

exports.deletequestion = function(req, res) {
	var users = db.model('User', schemas.userSchema);
	var out = users.findById(req.user._id, function(err, user) {
		if (user) {
			var questionDB = db.model('Question', schemas.questionSchema);
			questionDB.remove({
				_id : req.query.quest
			}, function(err, question) {
				if (err) {
					console.log(err);
				}
			});
			var slideshowDB = db.model('Slideshow', schemas.slideshowSchema);
			slideshowDB.findById(req.query.id, function(err, slideshow) {
				for (var i = 0; i < slideshow.questions.length; i++) {
					if (slideshow.questions[i] == req.query.quest) {
						slideshow.questions.splice(i, 1);
						slideshow.save();

					}
				}

			});
		}
		res.redirect('/user/' + req.user.name + '/edit?id=' + req.query.id);
	});
}

exports.addquestion = function(req, res) {
	var questionDB = db.model('Question', schemas.questionSchema);

	if (req.query.quest) {
		questionDB.findById(req.query.quest, function(err, question) {
			question.questionText = req.body.questionText;
			question.uestionType = req.body.questionType;
			question.afterslide = req.body.afterslide;
			//question.save();
			var optionDB = db.model('Option', schemas.optionSchema);
			question.answeroptions = [];
			for (var i = 0; i < 256; i++) {
				if (req.param('option' + i) !== undefined && req.param('option' + i) !== "") {
					var newOptionDB = new optionDB({
						optionText : req.param('option' + i),
					});
					newOptionDB.correct = req.param('checkbox' + i) ? true : false;
					newOptionDB.save();
					question.answeroptions.push(newOptionDB._id);
					//newQuestion.save();
				}

			}
			question.save();
			console.log("########################1");
			res.redirect('/user/' + req.user.name + '/editquestions?id=' + req.query.id);

		});

	} else {
		var newQuestion = new questionDB({
			questionText : req.body.questionText,
			questionType : req.body.questionType,
			afterslide : req.body.afterslide
		});

		var optionDB = db.model('Option', schemas.optionSchema);
		for (var i = 0; i < 256; i++) {
			if (req.param('option' + i) !== undefined && req.param('option' + i) !== "") {
				var newOptionDB = new optionDB({
					optionText : req.param('option' + i),
				});
				newOptionDB.correct = req.param('checkbox' + i) ? true : false;
				newOptionDB.save()
				newQuestion.answeroptions.push(newOptionDB._id);
				//newQuestion.save();
			}

		}
		newQuestion.save();

		var nquestion = 0;
		var slideshowDB = db.model('Slideshow', schemas.slideshowSchema);
		slideshowDB.findById(req.query.id, function(err, slideshow) {
			if (err) {
				console.log(err);
			} else {
				if (slideshow) {
					nquestion = slideshow.questions.length;
					slideshow.questions.push(newQuestion._id);
					slideshow.save();
				}

			}
		});

		res.redirect('/user/' + req.user.name + '/edit?id=' + req.query.id);
	}

}