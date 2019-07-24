document.addEventListener('DOMContentLoaded', function() {
    var i = 0;

    var complete_source = document.getElementById("complete-template").innerHTML;
    var complete_template = Handlebars.compile(complete_source);

    $.get("/api/questions", {gameuri: window.location.pathname.split("/")[2]})
    .done(function(questions){
        var count = questions.length;
        
        shuffle(questions);
        open_question(questions[i]);
        $("#next").click(function(){
            $("#q"+questions[0]._id.$oid).fadeOut(1000);
            $("#container").fadeOut(1000, function()  {
                $("#container").html("");
                $("#container").fadeIn(1000);
                if(!questions[++i]){
                    $.get("/api/score").done(function(score){
                        $("#container").append(complete_template({score:score}));
                    });
                }else{
                    open_question(questions[i]);
                }
            });
            $("#next").fadeOut(1000);
        });
    });
}, false);

function open_question(question){
    var question_source   = document.getElementById("question-template").innerHTML;
    var question_template = Handlebars.compile(question_source);

    var answer_source = document.getElementById("answer-template").innerHTML;
    var answer_template = Handlebars.compile(answer_source);

    $("#container").append(question_template({id:question._id.$oid, question:question.question}));
    $("#q"+question._id.$oid).fadeIn(500);

    $.get("/api/answers", {questionid: question._id.$oid})
    .done(function(data){
        var answers = [];
        data.forEach(function(datum) {
            answers.push(JSON.parse(datum));

        });
        answers.forEach(function(answer) {
            
            $("#container").append(answer_template({id:answer._id.$oid, answer:answer.answer}));
            $("#"+answer._id.$oid).fadeIn(500);
    
            $("#"+answer._id.$oid).click(function(){
                $.get("/api/corrects", {questionid: question._id.$oid, answerid: answer._id.$oid})
                .done(function(correct){

                    $.get("/api/score").done(function(score){console.log(score);});

                    correct = JSON.parse(correct);
                    
                    if(correct){
                        $("#"+answer._id.$oid).addClass("correct");
                        answers.forEach(function(other) {
                            if(answer._id.$oid != other._id.$oid){
                                $("#"+other._id.$oid).addClass("other");
                            }
                        });
                    }else{
                        $("#"+answer._id.$oid).addClass("incorrect");
                        answers.forEach(function(other) {
                            if(answer._id.$oid != other._id.$oid){
                                $("#"+other._id.$oid).addClass("other");
                            }
                        });
                    }
                    $("#next").fadeIn(2000);
                });
            });
        });
    });
}