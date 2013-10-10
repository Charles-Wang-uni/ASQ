module.exports = function () {
	var dust = require("dust");
	// answer.dust
	(function(){dust.register("answer",body_0);function body_0(chk,ctx){return chk.reference(ctx.getPath(false,["question","stem"]),ctx,"h",["s"]).write("<ul class=\"nav nav-tabs\"><li class=\"active\"><a href=\"#answersolutions-").reference(ctx.get("statId"),ctx,"h").write("\"  data-toggle=\"tab\">Correct Answer</a></li><li><a href=\"#rvsw-").reference(ctx.get("statId"),ctx,"h").write("\" data-toggle=\"tab\">Right vs. Wrong</a></li><li><a href=\"#mscstats-").reference(ctx.get("statId"),ctx,"h").write("\" data-toggle=\"tab\">Multiple Choice Statistics</a></li><li><a href=\"#diffAns-").reference(ctx.get("statId"),ctx,"h").write("\" data-toggle=\"tab\">Different answers</a></li></ul><div class=\"tab-content\"><!--  Displays correct solution --><div class=\"tab-pane answersolutions active\" id='answersolutions-").reference(ctx.get("statId"),ctx,"h").write("'>").exists(ctx.getPath(false,["question","correctAnswer"]),ctx,{"else":body_1,"block":body_3},null).write("</div><!-- Displays Pie-Chart Right vs. Wrong --><div class=\"tab-pane\" id=\"rvsw-").reference(ctx.get("statId"),ctx,"h").write("\"><div id=\"rvswChart\" class=\"rvswChart\" style=\"width: 100%; height: 500px;\"></div></div><!-- Display multiple choice stats --><div class=\"tab-pane\" id=\"mscstats-").reference(ctx.get("statId"),ctx,"h").write("\"><div id=\"mscstatChart\" class=\"distinctAnswers\" style=\"height:500px\"></div></div><!-- Display different aswers  --><div class=\"tab-pane\" id=\"diffAns-").reference(ctx.get("statId"),ctx,"h").write("\"><div id=\"diffAnsChart\" class=\"distinctOptions\" style=\"height:500px\"></div></div></div>");}function body_1(chk,ctx){return chk.write("<ol>").section(ctx.getPath(false,["question","questionOptions"]),ctx,{"block":body_2},{"formButtonType":ctx.getPath(false,["question","formButtonType"]),"htmlId":ctx.getPath(false,["question","htmlId"])}).write("</ol>");}function body_2(chk,ctx){return chk.write("<li class=\"").reference(ctx.get("classList"),ctx,"h").write("\" ><label class=\"").reference(ctx.get("formButtonType"),ctx,"h").write("\"><input type=\"").reference(ctx.get("formButtonType"),ctx,"h").write("\" name=\"").reference(ctx.get("htmlId"),ctx,"h").write("\" value=\"").reference(ctx.get("$idx"),ctx,"h").write("\" disabled> ").reference(ctx.get("text"),ctx,"h",["s"]).write("</label></li>\n");}function body_3(chk,ctx){return chk;}return body_0;})();
	 // questionForm-presenter.dust
	(function(){dust.register("questionForm-presenter",body_0);function body_0(chk,ctx){return chk.write("<form action=\"\">").block(ctx.getBlock("questionContent"),ctx,{},null).write("<div class=\"progress\" ><div class=\"bar\" id=\"progessbar\" style=\"width: 0%;\"></div></div><h5 class=\"pull-right progressNum\">Waiting for answers!</h5></form>");}return body_0;})();
	 // questionForm-viewer.dust
	(function(){dust.register("questionForm-viewer",body_0);function body_0(chk,ctx){return chk.write("<form action=\"\">").block(ctx.getBlock("questionContent"),ctx,{},null).write("<input type=\"hidden\" name=\"question-id\" value=").reference(ctx.getPath(false,["question","id"]),ctx,"h").write("><p class=\"text-right\"><button type=\"submit\" class=\"btn btn-success\">Submit</button></p></form>");}return body_0;})();
	 // questionList-presenter.dust
	(function(){dust.register("questionList-presenter",body_0);var blocks={'questionContent':body_1};function body_0(chk,ctx){ctx=ctx.shiftBlocks(blocks);return chk.partial("questionForm-presenter",ctx,null);}function body_1(chk,ctx){ctx=ctx.shiftBlocks(blocks);return chk.write("<ol>").section(ctx.getPath(false,["question","questionOptions"]),ctx,{"block":body_2},{"formButtonType":ctx.getPath(false,["question","formButtonType"]),"htmlId":ctx.getPath(false,["question","htmlId"])}).write("</ol>");}function body_2(chk,ctx){ctx=ctx.shiftBlocks(blocks);return chk.write("<li class=\"").reference(ctx.get("classList"),ctx,"h").write("\" >").reference(ctx.get("text"),ctx,"h",["s"]).write("</li>\n");}return body_0;})();
	 // questionList-stats.dust
	(function(){dust.register("questionList-stats",body_0);function body_0(chk,ctx){return chk.write("<form><ol>").section(ctx.getPath(false,["question","questionOptions"]),ctx,{"block":body_1},{"formButtonType":ctx.getPath(false,["question","formButtonType"]),"htmlId":ctx.getPath(false,["question","htmlId"])}).write("</ol></form>");}function body_1(chk,ctx){return chk.write("<li class=\"").reference(ctx.get("classList"),ctx,"h").write("\" ><label class=\"").reference(ctx.get("formButtonType"),ctx,"h").write("\"><input type=\"").reference(ctx.get("formButtonType"),ctx,"h").write("\" name=\"").reference(ctx.get("htmlId"),ctx,"h").write("\" value=\"").reference(ctx.get("$idx"),ctx,"h").write("\" ").exists(ctx.get("correct"),ctx,{"block":body_2},null).write(" disabled> ").reference(ctx.get("text"),ctx,"h",["s"]).write("</label></li>\n");}function body_2(chk,ctx){return chk.write(" checked ");}return body_0;})();
	 // questionList-viewer.dust
	(function(){dust.register("questionList-viewer",body_0);var blocks={'questionContent':body_1};function body_0(chk,ctx){ctx=ctx.shiftBlocks(blocks);return chk.partial("questionForm-viewer",ctx,null);}function body_1(chk,ctx){ctx=ctx.shiftBlocks(blocks);return chk.write("<ol>").section(ctx.getPath(false,["question","questionOptions"]),ctx,{"block":body_2},{"formButtonType":ctx.getPath(false,["question","formButtonType"]),"htmlId":ctx.getPath(false,["question","htmlId"])}).write("</ol>");}function body_2(chk,ctx){ctx=ctx.shiftBlocks(blocks);return chk.write("<li class=\"").reference(ctx.get("classList"),ctx,"h").write("\" ><label class=\"").reference(ctx.get("formButtonType"),ctx,"h").write("\"><input type=\"").reference(ctx.get("formButtonType"),ctx,"h").write("\" name=\"").reference(ctx.get("htmlId"),ctx,"h").write("\" value=\"").reference(ctx.get("$idx"),ctx,"h").write("\"> ").reference(ctx.get("text"),ctx,"h",["s"]).write("</label></li>\n");}return body_0;})();
	 // questionTextInput.dust
	(function(){dust.register("questionTextInput",body_0);var blocks={'questionContent':body_2};function body_0(chk,ctx){ctx=ctx.shiftBlocks(blocks);return chk.partial(body_1,ctx,null);}function body_1(chk,ctx){ctx=ctx.shiftBlocks(blocks);return chk.write("questionForm-").reference(ctx.get("userType"),ctx,"h");}function body_2(chk,ctx){ctx=ctx.shiftBlocks(blocks);return chk.write("<label class=\"control-label\" for=\"inputText\">Your solution:</label><input type=\"text\" class=\"\" id=\"inputText\" placeholder=\"Your solution\">");}return body_0;})();
	 // stats.dust
	(function(){dust.register("stats",body_0);function body_0(chk,ctx){return chk.reference(ctx.getPath(false,["question","stem"]),ctx,"h",["s"]).write("<ul class=\"nav nav-tabs\"><li class=\"active\"><a href=\"#answersolutions-").reference(ctx.get("statId"),ctx,"h").write("\"  data-toggle=\"tab\">Correct Answer</a></li><!--   <li><a href=\"#rvsw-").reference(ctx.get("statId"),ctx,"h").write("\" data-toggle=\"tab\">Right vs. Wrong</a></li> --><li><a href=\"#mscstats-").reference(ctx.get("statId"),ctx,"h").write("\" data-toggle=\"tab\">Distinct Options</a></li><!--   <li><a href=\"#diffAns-").reference(ctx.get("statId"),ctx,"h").write("\" data-toggle=\"tab\">Different answers</a></li> --></ul><div class=\"tab-content\"><!--  Displays correct solution --><div class=\"tab-pane active\" id='answersolutions-").reference(ctx.get("statId"),ctx,"h").write("'>").exists(ctx.getPath(false,["question","correctAnswer"]),ctx,{"else":body_1,"block":body_2},null).write("</div><!-- Displays Pie-Chart Right vs. Wrong --><!--   <div class=\"tab-pane\" id=\"rvsw-").reference(ctx.get("statId"),ctx,"h").write("\"><div id=\"rvswChart\" class=\"rvswChart\" style=\"width: 100%; height: 500px;\"></div></div> --><!-- Display multiple choice stats --><div class=\"tab-pane\" id=\"mscstats-").reference(ctx.get("statId"),ctx,"h").write("\"><div id=\"mscstatChart\" class=\"distinctAnswers\" style=\"height:500px\"></div></div><!-- Display different aswers  --><!--   <div class=\"tab-pane\" id=\"diffAns-").reference(ctx.get("statId"),ctx,"h").write("\"><div id=\"diffAnsChart\" class=\"distinctOptions\" style=\"height:500px\"></div></div> --></div>");}function body_1(chk,ctx){return chk.partial("questionList-stats",ctx,null);}function body_2(chk,ctx){return chk.write("<p>Solution: ").reference(ctx.getPath(false,["question","correctAnswer"]),ctx,"h").write("</p><br/>");}return body_0;})();
	 // welcomeScreen-presenter.dust
	(function(){dust.register("welcomeScreen-presenter",body_0);function body_0(chk,ctx){return chk.write("<p><strong>Join this presentation:</strong></p><h3 class=\"slideshow-url\">").reference(ctx.get("presenterLiveUrl"),ctx,"h").write("</h3><div class=\"connected-viewers-icons\"></div><p class=\"connected-viewers-number\">Waiting for viewers</p>");}return body_0;})();
	 // welcomeScreen-viewer.dust
	(function(){dust.register("welcomeScreen-viewer",body_0);function body_0(chk,ctx){return chk.write("<h4>Connecting to http://").reference(ctx.get("host"),ctx,"h").write(":").reference(ctx.get("port"),ctx,"h").write("/live/").reference(ctx.get("user"),ctx,"h").write("/</h4>");}return body_0;})();
	// Returning object for nodejs
	return dust;
};