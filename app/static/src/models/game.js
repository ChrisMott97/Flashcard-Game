import axios from 'axios';

function findAll(callback){
    axios.get('/api/games')
    .then((res)=>{
        callback(res.data);
    }).catch((e)=>{
        console.log(e);
        callback();
    });
}

export default {
    findAll: findAll
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