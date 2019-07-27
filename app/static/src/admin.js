import $ from 'jquery';
import popper from 'popper.js';
import bootstrap from 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import handlebars from 'handlebars/dist/cjs/handlebars';
import GameModel from './models/game';
import QuestionModel from './models/question';
import AnswerModel from './models/answer';

let ui = {
    gamesContainer: $('#games'),
    gamesSource: $('#games-template'),
    qaSource: $('#qa-template'),
    games: [],
    name: $('#name'),
    description: $('#description'),
    questions: $('#questions')
};

let templates = {
    games: handlebars.compile(ui.gamesSource.html()),
    qa: handlebars.compile(ui.qaSource.html())
};

const init = () => GameModel.findAll((games) => renderGames(games));

const renderGames = (games) => {
    if (games) {
        games.forEach(game => {
            ui.gamesContainer.append(templates.games({
                id: 'g' + game._id.$oid,
                name: game.name,
                description: game.description
            }));
            let uiGame = $(`#g${game._id.$oid}`);
            games.push(uiGame);
            uiGame.css('cursor', 'pointer');
            uiGame.on('click', () => {
                ui.name.html(game.name);
                ui.description.html(game.description);
                renderQuestions(game);
            });
        });
    }
};

const renderQuestions = (game) => QuestionModel.findByGameId(game._id.$oid, (questions) => {
    ui.questions.empty();
    questions.forEach(question => {
        AnswerModel.getByQuestion(question._id.$oid, (answers) => {
            AnswerModel.findCorrect(question._id.$oid, (correct) => {
                answers.forEach(answer => {
                    if (answer._id.$oid == correct.answer.$oid) {
                        answer.correct = true;
                    }
                });
                ui.questions.append(templates.qa({
                    question: question.question,
                    answers: answers
                }));
            });
        });
    });
});


init();
// document.addEventListener('DOMContentLoaded', function() {
//     $.get("/api/games")
//     .done((games)=>{
//         console.log(games)
//         let games_source   = document.getElementById("games-template").innerHTML;
//         let games_template = handlebars.compile(games_source);
//         games.forEach(game => {
//             $("#games").append(games_template({id:game._id.$oid, name:game.name, description:game.description}))
//             $("#"+game._id.$oid).click(()=>{
//                 $("#name").html(game.name)
//                 $("#description").html(game.description)
//                 $.get("/api/questions", {gameid: game._id.$oid})
//                 .done((questions)=>{
//                     let qa_source   = document.getElementById("qa-template").innerHTML;
//                     let qa_template = handlebars.compile(qa_source);
//                     $("#questions").empty()
//                     questions.forEach(question => {
//                         $("#questions").append(qa_template({question:question.question, answers:question.answers}))
//                     });
//                 })
//             })
//         });


//     })
// })