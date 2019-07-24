require(
    ['models/question', 'models/answer','vendor/shuffle-array', 'vendor/handlebars-latest'], 
    function(QuestionModel, AnswerModel,shuffle, Handlebars){

    var settings = {
        current : 0,
        gameUri : window.location.pathname.split("/")[2],
        questions : []
    };

    var ui = {
        container: document.querySelector("#container"),
        next: document.querySelector("#next"),
        completeSrc: document.querySelector("#complete-template"),
        questionSrc: document.querySelector("#question-template"),
        answerSrc: document.querySelector("#answer-template"),
        question: null,
        answers: []
    };

    var templates = {
        complete: Handlebars.compile(ui.completeSrc.innerHTML),
        question: Handlebars.compile(ui.questionSrc.innerHTML),
        answer: Handlebars.compile(ui.answerSrc.innerHTML)
    };


    function init(){
        
        QuestionModel.getByUri(settings.gameUri, function(data){
            settings.questions = data;
            if(settings.questions){
                updateUi(settings.questions.pop());
            }
        });
    }

    function next(){
        ui.next.addEventListener('click', function(){
            //clean up previous question
            ui.question.parentNode.removeChild(ui.question);
            ui.answers.forEach(function(answer){
                answer.parentNode.removeChild(answer);
            });
            ui.answers = [];
            if(settings.questions){
                updateUi(settings.questions.pop());
            }
        });
    }
    
    function updateUi(question){
        var id = question._id.$oid;

        add(templates.question({id: id, question:question.question}), ui.container);
        ui.question = document.querySelector('#q'+question._id.$oid);

        AnswerModel.getByQuestion(id, function(answers){
            if(answers){
                answers.forEach(function(answer){

                    var id = answer._id.$oid;
                    add(templates.answer({id:'a'+id, answer:answer.answer}), ui.container);

                    var uianswer = document.querySelector('#a'+id);
                    console.log(uianswer);
                    ui.answers.push(uianswer);

                    uianswer.addEventListener('click', function(){
                        checkCorrect(question, answer, uianswer);
                        removeOthers(uianswer);
                        next();
                    });

                });
            }
        });
    }

    function removeOthers(uianswer){
        ui.answers.forEach(function(other){
            if(uianswer != other){
                other.classList.add("other");
            }
        });
    }

    function checkCorrect(question, answer, uianswer){
        AnswerModel.checkCorrect(question._id.$oid, answer._id.$oid, function(correct){
            if(correct){
                uianswer.classList.add("correct");
            }else{
                uianswer.classList.add("incorrect");
            }
        });
    }

    function add(child, parent){
        parent.insertAdjacentHTML('beforeend', child);
    }


    init();
    
});