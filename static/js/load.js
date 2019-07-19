document.addEventListener('DOMContentLoaded', function() {
    let i = 0
    $.get("/api/questions", {game:"5d2f454a830943ee227c9975"})
    .done((questions)=>{
        console.log(questions)
        shuffle(questions)
        open_question(questions[i])
        $("#next").click(()=>{
            $("#q"+questions[0]._id.$oid).fadeOut(1000);
            $("#container").fadeOut(1000, () => {
                $("#container").html("");
                $("#container").fadeIn(0);
                open_question(questions[++i])
            })
            $("#next").fadeOut(1000);
        })
    })
}, false);

function open_question(question){
    

    var question_source   = document.getElementById("question-template").innerHTML;
    var question_template = Handlebars.compile(question_source);

    var answer_source = document.getElementById("answer-template").innerHTML;
    var answer_template = Handlebars.compile(answer_source);

    $("#container").append(question_template({id:question._id.$oid, question:question.question}))
    $("#q"+question._id.$oid).fadeIn(1000)
        
    question.answers.forEach(answer => {
        $("#container").append(answer_template({id:answer._id.$oid, answer:answer.answer}))
        $("#"+answer._id.$oid).fadeIn(1000)

        $("#"+answer._id.$oid).click(()=>{
            if(answer.correct){
                $("#"+answer._id.$oid).addClass("correct")
                question.answers.forEach(other => {
                    if(answer._id.$oid != other._id.$oid){
                        $("#"+other._id.$oid).addClass("other")
                    }
                })
            }else{
                $("#"+answer._id.$oid).addClass("incorrect")
                question.answers.forEach(other => {
                    if(answer._id.$oid != other._id.$oid){
                        $("#"+other._id.$oid).addClass("other")
                    }
                })
            }
            $("#next").fadeIn(2000);
        })

    });

}