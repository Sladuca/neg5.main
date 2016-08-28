import Match from './../../models/sql-models/match';

import {hasToken} from './../../auth/middleware/token';
import {accessToTournament, directorAccessToTournament, adminAccessToTournament} from './../../auth/middleware/tournament-access';

export default (app) => {

    app.route('/api/t/:tid/matches')
        .get(hasToken, accessToTournament, (req, res) => {
            Match.findByTournament(req.params.tid)
                .then(matches => res.json({matches}))
                .catch(error => res.status(500).send(error));
        })
        .post(hasToken, accessToTournament, (req, res) => {
            Match.addToTournament(req.params.tid, req.body.game, req.currentUser)
                .then(result => res.json({result, success: true}))
                .catch(error => res.status(500).send({error, success: false}));  
        })

    app.route('/api/t/:tid/matches/:matchId')
        .get(hasToken, accessToTournament, (req, res) => {
            Match.findById(req.params.tid, req.params.matchId)
                .then(result => res.json({result, success: true}))
                .catch(error => res.status(500).send({error, success: false}));
        })
        .put(hasToken, adminAccessToTournament, (req, res) => {
            Match.addToTournament(req.params.tid, req.body.game, req.currentUser, req.params.matchId)
                .then(result => res.json({result, success: true}))
                .catch(error => res.status(500).send({error, success: false}));  
        })
        .delete(hasToken, adminAccessToTournament, (req, res) => {
            Match.deleteMatch(req.params.tid, req.params.matchId)
                .then(result => res.json({result, success: true}))
                .catch(error => res.status(500).send({error, success: false}));
        })
    
}