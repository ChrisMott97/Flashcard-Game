document.addEventListener('DOMContentLoaded', function() {
    $.get("/api/games")
    .done((games)=>{
        console.log(games)
        let games_source   = document.getElementById("games-template").innerHTML;
        let games_template = Handlebars.compile(games_source);
        games.forEach(game => {
            $("#games").append(games_template({id:game._id.$oid, name:game.name, description:game.description}))
            $("#"+game._id.$oid).click(()=>{
                $("#name").html(game.name)
                $("#description").html(game.description)
                $.get("/api/questions", {gameid: game._id.$oid})
                .done((questions)=>{
                    let qa_source   = document.getElementById("qa-template").innerHTML;
                    let qa_template = Handlebars.compile(qa_source);
                    $("#questions").empty()
                    questions.forEach(question => {
                        $("#questions").append(qa_template({question:question.question, answers:question.answers}))
                    });
                })
            })
        });


    })
})