import $ from 'jquery';
import popper from 'popper.js';
import bootstrap from 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
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
            let parent = $(this);
            $(document).find('.correctanswer').each(function (i, el) {
                console.log(!$(el).is(parent));

                if (!$(el).is(parent)) {
                    $(el).removeClass('active');
                    $(el).prop('checked', false);
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
    }
};

let templates = {
    q: handlebars.compile($('#q-template').html()),
    a: handlebars.compile($('#a-template').html())
};

function init() {
    events.initName();
    events.initCheck();
    events.selectAnswer();
    events.newAnswer();
    events.newQuestion();
    handlebars.registerPartial("answer", $('#a-template').html());
    $('#questions').append(templates.q({
        answer: templates.a()
    }));
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