import axios from 'axios';

const prefix = '/api/games'

const findAll = (callback) => {
    axios.get(prefix)
    .then((res)=>{
        callback(res.data);
    }).catch((e)=>{
        console.log(e);
        callback();
    });
}

const save = (game, callback) => axios.post(prefix, {game})
.then((res) => {
    callback(res.data)
})


export default {
    findAll: findAll,
    save: save
};

// function getByUri(gameUri, callback){
//     axios.get('/api/questions', {
//         params:{
//             gameuri: gameUri
//         }
//     }).then(function(res){
//         callback(res.data);
//     }).catch(function(e){
//         console.log(e);
//         callback();
//     });
// }

// function getScore(callback){
//     axios.get('/api/score')
//     .then(function(res){
//         callback(res.data);
//     })
//     .catch(function(e){
//         console.log(e);
//         callback();
//     });
// }

// export default {
//     getByUri: getByUri,
//     getScore: getScore
// };