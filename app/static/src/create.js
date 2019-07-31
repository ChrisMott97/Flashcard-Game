import $ from 'jquery';
import popper from 'popper.js';
import bootstrap from 'bootstrap';
import 'bootstrap/scss/bootstrap.scss';
import handlebars from 'handlebars/dist/cjs/handlebars';
import GameModel from './models/game';
import QuestionModel from './models/question';
import AnswerModel from './models/answer';

let events = {
    initName: () => {
        $('#gameName').on('input', function (e) {
            if ($('#autogen').is(':checked')) {
                let input = $('#gameName')
                    .val()
                    .replace(/ +/g, '-')
                    .replace(/[^a-zA-Z0-9 -]/g, "")
                    .replace(/-+/g, '-')
                    .toLowerCase();
                $('#uri').val(input);
            }
        });
    },
    initCheck: () => {
        $('#autogen').on('input', function (e) {
            if ($('#autogen').is(':checked')) {
                $('#uri').prop("disabled", true);
                let input = $('#gameName')
                    .val()
                    .replace(/ +/g, '-')
                    .replace(/[^a-zA-Z0-9 -]/g, "")
                    .replace(/-+/g, '-')
                    .toLowerCase();
                $('#uri').val(input);
            } else {
                $('#uri').prop("disabled", false);
            }
        });
    },
    selectAnswer: () => {
        $(document).on('click', '.correctanswer', function (e) {
            let parentThis = $(this);
            $(document).find('.correctanswer').each(function (i, el) {
                if($(el).parent().parent().parent().parent().parent().parent().is(parentThis.parent().parent().parent().parent().parent().parent())){
                    if (!$(el).is(parentThis)) {
                        $(el).removeClass('active');
                        $(el).prop('checked', false);
                    }
                }
            });
        });
    },
    newAnswer: () => {
        $(document).on('click', '.newanswer', function (e) {
            e.preventDefault();
            $(this).parent().after(templates.a());
        });
    },
    newQuestion: () => {
        $(document).on('click', '.newquestion', function (e) {
            e.preventDefault();
            $(this).parent().after(templates.q());
        });
    },
    commit: () => {
        $(document).on('click', '#commit', function (e) {
            e.preventDefault();
            commit();
            // Loading page
        })
    }
};

let templates = {
    q: handlebars.compile($('#q-template').html()),
    a: handlebars.compile($('#a-template').html()),
    games: handlebars.compile($('#games-template').html())
};

function init() {
    events.commit();
    events.initName();
    events.initCheck();
    events.selectAnswer();
    events.newAnswer();
    events.newQuestion();
    handlebars.registerPartial("answer", $('#a-template').html());
    $('#questions').append(templates.q({
        answer: templates.a()
    }));

    GameModel.findAll((games)=>renderGames(games))

}

const renderGames = (games) => {
    if (games) {
        games.forEach(game => {
            $('#games').append(templates.games({
                id: 'g' + game._id.$oid,
                name: game.name,
                description: game.description
            }));
            let uiGame = $(`#g${game._id.$oid}`);
            games.push(uiGame);
            uiGame.css('cursor', 'pointer');
            uiGame.on('click', () => {
                
            });
        });
    }
};

function commit() {
    const data = {
        gameName: $('#gameName').val(),
        gameDesc: $('#gameDesc').val(),
        gameUri: $('#uri').val(),
        questions: [

        ]
    }
    $('.question').each(function(i, el){
        var question = {};
        question.name = $(this).find("#questionName").val();
        question.answers = []
        $(this).find("#answers").find(".answer").each(function(i2, el2){
            var answer = {}
            answer.name = $(this).find('#answerName').val();
            answer.explain = $(this).find('#answerExplain').val();
            if($(this).find('input:checked').val()){
                answer.correct = true
            }else{
                answer.correct = false
            }
            question.answers.push(answer);
        })
        data.questions.push(question);
    })
    GameModel.save(data, (res)=>{
        if(!Array.isArray(res) || !res.length){
            window.location.replace("/admin/create")
        }
    })

}

init();
// $('#name').on('input',function(e){
//     if($('#autogen').is(':checked')){
//         let input = $('#name')
//             .val()
//             .replace(/ +/g,'-')
//             .replace(/[^a-zA-Z0-9 -]/g, "")
//             .replace(/-+/g,'-')
//             .toLowerCase()
//         $('#uri').val(input)
//     }
// });
// $('#autogen').on('input',function(e){
//     if($('#autogen').is(':checked')){
//         $('#uri').prop("disabled", true)
//         let input = $('#name')
//             .val()
//             .replace(/ +/g,'-')
//             .replace(/[^a-zA-Z0-9 -]/g, "")
//             .replace(/-+/g,'-')
//             .toLowerCase()
//         $('#uri').val(input)
//     }else{
//         $('#uri').prop("disabled", false)
//     }
// })

// $(document).on('click', '.correctanswer', function(e){
//     let parent = $(this)
//     $(document).find('.correctanswer').each(function(i, el){
//         console.log(!$(el).is(parent))

//         if(!$(el).is(parent)){
//             $(el).removeClass('active')
//             $(el).prop('checked', false)
//         }
//     })
// })

// document.addEventListener('DOMContentLoaded', function() {
//     var q_source   = document.getElementById("q-template").innerHTML;
//     var q_template = Handlebars.compile(q_source);

//     var a_source   = document.getElementById("a-template").innerHTML;
//     var a_template = Handlebars.compile(a_source);

//     let i = 0

//     Handlebars.registerPartial("answer", $("#a-template").html())

//     $('#questions').append(q_template({answer: a_template()}))

//     $(document).on('click','.newanswer',function(e){
//         e.preventDefault()
//         $(this).parent().after(a_template())
//     })

//     $(document).on('click','.newquestion',function(e){
//         e.preventDefault()
//         $(this).parent().after(q_template())
//     })
// })