import axios from 'axios';

function getByUri(gameUri, callback){
    axios.get('/api/questions', {
        params:{
            gameuri: gameUri
        }
    }).then(function(res){
        callback(res.data);
    }).catch(function(e){
        console.log(e);
        callback();
    });
}

function getScore(callback){
    axios.get('/api/score')
    .then(function(res){
        callback(res.data);
    })
    .catch(function(e){
        console.log(e);
        callback();
    });
}

export default {
    getByUri: getByUri,
    getScore: getScore
};