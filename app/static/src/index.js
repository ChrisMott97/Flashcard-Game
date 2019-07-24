import '../assets/style.css';
import anime from 'animejs';
import shuffle from 'shuffle-array';
import handlebars from 'handlebars/dist/cjs/handlebars';
import QuestionModel from './models/question';
import AnswerModel from './models/answer';
// require(
//     ['models/question', 'models/answer','vendor/shuffle-array', 'vendor/handlebars-latest', 'vendor/anime.min'], 
//     function(QuestionModel, AnswerModel,shuffle, Handlebars, anime){

var settings = {
    current : 0,
    gameUri : window.location.pathname.split("/")[2],
    questions : []
};

var ui = {
    title: document.querySelector('#gameName'),
    container: document.querySelector("#container"),
    next: document.querySelector("#next"),
    completeSrc: document.querySelector("#complete-template"),
    questionSrc: document.querySelector("#question-template"),
    answerSrc: document.querySelector("#answer-template"),
    question: null,
    answers: []
};

var templates = {
    complete: handlebars.compile(ui.completeSrc.innerHTML),
    question: handlebars.compile(ui.questionSrc.innerHTML),
    answer: handlebars.compile(ui.answerSrc.innerHTML)
};

var anims = {
    fadeIn: function(els){
        anime({
            targets: els, 
            opacity: 1, 
            easing: 'easeInOutQuad',
            translateX: [-400,0],
            delay: anime.stagger(100)
            // delay: function(el, i, l) {
            //     return i * 500;
            //   },
        });
    },
    fadeOut: function(els){
        anime({
            targets: els, 
            opacity: 0, 
            easing: 'easeInOutQuad',
            translateX: [400],
            // height: 0,
            // padding: 0,
            delay: anime.stagger(100)
            // delay: function(el, i, l) {
            //     return i * 500;
            //   },
        });
    },
    expand: function(el){
        anime({
            targets: el,
            easing: 'easeInOutQuad',
            height: 300,
            delay: 1000,
            translateY: ui.answers.indexOf(el)*-140
        });
    }
};

function getIndex(e){
    id = e._id.$oid;


}

//On startup
function init(){
    anims.fadeIn(ui.title);
    QuestionModel.getByUri(settings.gameUri, function(data){
        settings.questions = shuffle(data);
        if(settings.questions){
            updateUi(settings.questions.pop());
        }
    });
}

function updateUi(question){
    var id = question._id.$oid;

    add(templates.question({id: id, question:question.question}), ui.container);
    ui.question = document.querySelector('#q'+question._id.$oid);
    anims.fadeIn(ui.question);

    AnswerModel.getByQuestion(id, function(answers){
        if(answers){
            answers.forEach(function(answer){

                var id = answer._id.$oid;
                add(templates.answer({id:'a'+id, answer:answer.answer}), ui.container);

                var uianswer = document.querySelector('#a'+id);
                ui.answers.push(uianswer);


                uianswer.addEventListener('click', function(){
                    anims.fadeIn(ui.next);
                    // console.log(ui.answers.indexOf(uianswer));
                    // console.log(answer._id.$oid)
                    // console.log(ui.answers.find(e => 'a'+answer._id.$oid == e.id));
                    anims.expand(uianswer);
                    checkCorrect(question, answer, uianswer);
                    removeOthers(uianswer);
                    next();
                });

            });
            anims.fadeIn([ui.question,ui.answers]);
        }
    });
}

function next(){
    ui.next.addEventListener('click', function(){
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

function removeOthers(uianswer){
    ui.answers.forEach(function(other){
        if(uianswer != other){
            // other.classList.add("other");
            anims.fadeOut(other);
        }
    });
}

function checkCorrect(question, answer, uianswer){
    AnswerModel.checkCorrect(question._id.$oid, answer._id.$oid, function(correct){
        if(correct){
            // uianswer.classList.add("correct");
        }else{
            // uianswer.classList.add("incorrect");
        }
    });
}

function add(child, parent){
    parent.insertAdjacentHTML('beforeend', child);
}

init();

// });