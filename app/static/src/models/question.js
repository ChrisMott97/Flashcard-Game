import axios from 'axios';

const findByUri = (gameUri, callback) => axios.get('/api/questions', {
        params: {
            gameuri: gameUri
        }
    }).then((res) => {
        callback(res.data);
    }).catch((e) => {
        console.log(e);
        callback();
    });

const findByGameId = (gameId, callback) => axios.get('/api/questions', {
        params: {
            gameid: gameId
        }
    }).then((res) => {
        callback(res.data);
    }).catch((e) => {
        console.log(e);
        callback();
    });

const findScore = (callback) => axios.get('/api/score')
    .then((res) => {
        callback(res.data);
    })
    .catch((e) => {
        console.log(e);
        callback();
    });

export default {
    findByUri: findByUri,
    findScore: findScore,
    findByGameId: findByGameId
};