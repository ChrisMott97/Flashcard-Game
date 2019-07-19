$('#name').on('input',function(e){
    if($('#autogen').is(':checked')){
        let input = $('#name')
            .val()
            .replace(/ +/g,'-')
            .replace(/[^a-zA-Z0-9 -]/g, "")
            .replace(/-+/g,'-')
            .toLowerCase()
        $('#uri').val(input)
    }
});
$('#autogen').on('input',function(e){
    if($('#autogen').is(':checked')){
        $('#uri').prop("disabled", true)
        let input = $('#name')
            .val()
            .replace(/ +/g,'-')
            .replace(/[^a-zA-Z0-9 -]/g, "")
            .replace(/-+/g,'-')
            .toLowerCase()
        $('#uri').val(input)
    }else{
        $('#uri').prop("disabled", false)
    }
})

document.addEventListener('DOMContentLoaded', function() {
    var q_source   = document.getElementById("q-template").innerHTML;
    var q_template = Handlebars.compile(q_source);

    var a_source   = document.getElementById("a-template").innerHTML;
    var a_template = Handlebars.compile(a_source);

    let i = 0

    Handlebars.registerPartial("answer", $("#a-template").html())

    $('#questions').append(q_template({answer: a_template()}))

    $(document).on('click','.newanswer',function(e){
        e.preventDefault()
        $(this).parent().after(a_template())
    })

    $(document).on('click','.newquestion',function(e){
        e.preventDefault()
        $(this).parent().after(q_template())
    })
})
