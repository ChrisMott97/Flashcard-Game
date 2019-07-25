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
    fadeIn: function(els, dur = 1000, callback=()=>{}){
        anime({
            targets: els, 
            opacity: 1,
            duration: dur,
            easing: 'easeInOutQuad',
            translateX: [-400,0],
            delay: anime.stagger(100),
            begin: ()=>{
                if(Array.isArray(els)){
                    els.forEach(el => {
                        el.style.display = "block";
                    });
                }else{
                    els.style.display = "block";
                }
            },complete: ()=>{
                callback();
            }

        });
    },
    fadeOut: function(els, dur = 1000, callback=()=>{}){
        anime({
            targets: els, 
            opacity: 0,
            duration: dur, 
            easing: 'easeInOutQuad',
            translateX: [400],
            display: 'none',
            delay: anime.stagger(100),
            complete: ()=>{
                if(Array.isArray(els)){
                    els.forEach(el => {
                        el.style.display = "none";
                    });
                }else{
                    els.style.display = "none";
                }
                callback();
            }
        });
    },
    expand: function(el){
        anime({
            targets: el,
            easing: 'easeInOutQuad',
            height: {
                value: 300,
                delay: 1000
            },
            cursor: "none",
            // translateY: ui.answers.indexOf(el)*-140
            opacity: [
                {
                    value: 0
                },{
                    value: 1,
                    delay: 800
                }
            ]
        });
    }
};



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

                var id = 'a'+answer._id.$oid;
                add(templates.answer({id:id, answer:answer.answer}), ui.container);

                var i = ui.answers.push(document.querySelector('#'+id))-1;

                ui.answers[i].addEventListener('click', function _onclick(){
                    ui.answers[i].removeEventListener('click', _onclick);
                    ui.answers[i].style.cursor = 'default';

                    anims.fadeIn(ui.next);
                    anims.expand(ui.answers[i]);
                    checkCorrect(question, answer, ui.answers[i]);
                    anims.fadeOut(others(ui.answers[i], _onclick));
                    next(i);
                });
                ui.answers[i].style.cursor = "pointer";
            });
            anims.fadeIn([ui.question].concat(ui.answers));
        }
    });
}

function next(i){
    ui.next.style.cursor = 'pointer';
    ui.next.addEventListener('click', function _onclick(){
        anims.fadeOut(ui.answers[i]);
        anims.fadeOut(ui.question,1000, ()=>{
            ui.next.removeEventListener('click', _onclick);
            anims.fadeOut(ui.next);
            ui.question.parentNode.removeChild(ui.question);
            ui.answers.forEach(function(answer){
                answer.parentNode.removeChild(answer);
            });
            ui.answers = [];
            if(settings.questions != 0){
                updateUi(settings.questions.pop());
            }else{
                finished();
            }
        });
    });
}

function finished(){
    QuestionModel.getScore((score)=>{
        if(score){
            add(templates.complete({score: score}), ui.container);
        }else{
            add(templates.complete({score: 0}), ui.container);
        }
        anims.fadeIn(document.querySelector('.completed'));
    });
    // $.get("/api/score").done(function(score){
    //     $("#container").append(complete_template({score:score}));
    // });
}

function others(uianswer, func){
    var others = [];
    ui.answers.forEach(function(other){
        if(uianswer != other){
            other.removeEventListener('click', func);
            others.push(other);
        }
    });
    return others;
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