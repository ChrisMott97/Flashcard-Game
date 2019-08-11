import '../assets/style.scss';
import anime from 'animejs';
import shuffle from 'shuffle-array';
import handlebars from 'handlebars/dist/cjs/handlebars';
import QuestionModel from './models/question';
import AnswerModel from './models/answer';

const settings = {
    current : 0,
    gameUri : window.location.pathname.split("/")[2],
    questions : []
};

// UI Element references
const ui = {
    title: document.querySelector('#gameName'),
    container: document.querySelector("#container"),
    next: document.querySelector("#next"),
    completeSrc: document.querySelector("#complete-template"),
    questionSrc: document.querySelector("#question-template"),
    answerSrc: document.querySelector("#answer-template"),
    question: null,
    answers: [],
    // start: document.querySelector("#start")
};

// Handlebar Templates
const templates = {
    complete: handlebars.compile(ui.completeSrc.innerHTML),
    question: handlebars.compile(ui.questionSrc.innerHTML),
    answer: handlebars.compile(ui.answerSrc.innerHTML)
};

const anims = {
    action: (els, callback=()=>{})=>{
        anime({
            targets: els,
            duration: 500,
            backgroundColor: '#00b4e5',
            easing: 'easeInOutQuad',
            color: [
                {value: '#00b4e5'},
                {value: '#ffffff'}
            ],
            complete: ()=>{
                callback();
            }
        })
    },
    fadeIn: function(els, callback=()=>{}){
        anime({
            targets: els, 
            opacity: 1,
            duration: 500,
            easing: 'easeInOutQuad',
            // delay: anime.stagger(50),
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
    fadeOut: function(els, callback=()=>{}){
        anime({
            targets: els, 
            opacity: 0,
            duration: 500, 
            easing: 'linear',
            // translateX: [0,200],
            display: 'none',
            // delay: anime.stagger(100),
            complete: ()=>{
                setTimeout(()=>{
                    if(Array.isArray(els)){
                        els.forEach(el => {
                            el.style.display = "none";
                        });
                    }else{
                        els.style.display = "none";
                    }
                    callback();
                }, 200)
            }
        });
    },
    expand: function(el){
        anime({
            targets: el,
            easing: 'easeInOutQuad',
            cursor: "none",
            opacity: [
                {
                    value: 0
                },{
                    value: 1,
                    delay: 500
                }
            ]
        });
    },
    scoreUp: function(score){
        anime({
            targets: '.completed',
            innerHTML: {
                value: [0,score],
                round: 1
            },
            easing: 'easeInQuad',
            opacity: 1,
            duration: 2000
        });
    },
    emphasize: function(el){
        anime({
            targets: el,
            duration: 50,
            opacity: 1,
            easing: 'linear'
        });
    },
    deemphasize: function(el){
        anime({
            targets: el,
            duration: 50, 
            opacity: 0.7,
            easing: 'linear'
        });
    },
    correct: function(el){
        anime({
            targets: el,
        })
    }
};

//On startup
const init = () => {
    anims.fadeIn(ui.title);
    document.addEventListener('click', function _click(){
        document.removeEventListener('click', _click)
        anims.fadeOut(ui.title, ()=>{
            QuestionModel.findByUri(settings.gameUri, function(data){
                settings.questions = shuffle(data);
                if(settings.questions){
                    updateUi(settings.questions.pop());
                }
            });
        })
    })
}

function updateUi(question){
    var id = question._id.$oid;

    add(templates.question({id: id, question:question.question}), ui.container);
    ui.question = document.querySelector('#q'+question._id.$oid);
    anims.fadeIn(ui.question);

    AnswerModel.getByQuestion(id, function(answers){
        if(answers){
            answers.forEach(function(answer){

                var id = `a${answer._id.$oid}`;
                add(templates.answer({id:id, answer:answer.answer}), ui.container);

                var i = ui.answers.push(document.querySelector('#'+id))-1;


                ui.answers[i].addEventListener('click', function _onclick(){
                    ui.answers[i].removeEventListener('click', _onclick);
                    ui.answers[i].style.cursor = 'default';

                    anims.action(ui.answers[i], ()=>{
                        anims.expand(ui.answers[i]);
                        anims.fadeIn(ui.next);
                        anims.fadeOut(others(ui.answers[i], _onclick));
                        checkCorrect(question, answer, ui.answers[i]);
                        next(i);
                    });
                });
                ui.answers[i].style.cursor = "pointer";
            });
            anims.fadeIn(ui.answers)
        }
    });
}

function next(i){
    ui.next.style.cursor = 'pointer';
    ui.next.addEventListener('click', function _onclick(){
        ui.next.removeEventListener('click', _onclick);
        anims.fadeOut(ui.answers[i]);
        anims.fadeOut(ui.question, ()=>{
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
    QuestionModel.findScore((data)=>{
        if(data.score){
            add(templates.complete({score: data.score}), ui.container);
        }else{
            add(templates.complete({score: 0}), ui.container);
        }
        if(data.giveToken){
            console.log("You got the token!")
        }else{
            console.log("You DID NOT get the token!")
        }
        anims.scoreUp(data.score);
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
            anims.correct(uianswer);
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