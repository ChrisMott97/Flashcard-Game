// define(['vendor/axios.min'], function(axios){
import axios from 'axios';

const getByQuestion = (questionId, callback) => axios.get('/api/answers', {
    params: {
        questionid: questionId
    }
}).then((res) => {
    var answers = [];
    res.data.forEach(function (datum) {
        answers.push(JSON.parse(datum));
    });
    callback(answers);
}).catch((e) => {
    console.log(e);
    callback();
});

const checkCorrect = (questionId, answerId, callback) => axios.get('/api/corrects', {
    params: {
        questionid: questionId,
        answerid: answerId
    }
}).then((res) => callback(res.data)).catch((e) => {
    console.log(e);
    callback();
});

const findCorrect = (questionId, callback) => axios.get('/api/corrects', {
    params: {
        questionid: questionId
    }
}).then((res) => {
    callback(res.data);
}).catch((e) => {
    console.log(e);
    callback();
});

export default {
    getByQuestion: getByQuestion,
    checkCorrect: checkCorrect,
    findCorrect: findCorrect
};

// });