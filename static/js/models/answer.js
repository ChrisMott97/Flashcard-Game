define(['vendor/axios.min'], function(axios){

    function getByQuestion(questionId, callback){
        axios.get('/api/answers', {
            params:{
                questionid: questionId
            }
        }).then(function(res){
            var answers = [];
            res.data.forEach(function(datum) {
                answers.push(JSON.parse(datum));
                });
            callback(answers);
        }).catch(function(e){
            console.log(e);
            callback();
        });
    }

    function checkCorrect(questionId, answerId, callback){
        axios.get('/api/corrects', {
            params:{
                questionid: questionId,
                answerid: answerId
            }
        }).then(function(res){
            callback(res.data);
        }).catch(function(e){
            console.log(e);
            callback();
        });
    }

    return {
        getByQuestion: getByQuestion,
        checkCorrect: checkCorrect
    };

});