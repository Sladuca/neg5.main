'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _shortid = require('shortid');

var _shortid2 = _interopRequireDefault(_shortid);

var _db = require('../database/db');

var _sql = require('../database/sql');

var _sql2 = _interopRequireDefault(_sql);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var tournament = _sql2.default.tournament;

exports.default = {

    saveTournament: function saveTournament(tournamentInfo) {

        return new Promise(function (resolve, reject) {
            var name = tournamentInfo.name;
            var _tournamentInfo$date = tournamentInfo.date;
            var date = _tournamentInfo$date === undefined ? new Date() : _tournamentInfo$date;
            var _tournamentInfo$quest = tournamentInfo.questionSet;
            var questionSet = _tournamentInfo$quest === undefined ? '' : _tournamentInfo$quest;
            var _tournamentInfo$comme = tournamentInfo.comments;
            var comments = _tournamentInfo$comme === undefined ? '' : _tournamentInfo$comme;
            var _tournamentInfo$locat = tournamentInfo.location;
            var location = _tournamentInfo$locat === undefined ? '' : _tournamentInfo$locat;
            var _tournamentInfo$tossu = tournamentInfo.tossupScheme;
            var tossupScheme = _tournamentInfo$tossu === undefined ? [] : _tournamentInfo$tossu;


            var tournamentId = _shortid2.default.generate();

            var tournamentParams = [tournamentId, name, date, questionSet, comments, location, 'mbhuiyan'];

            var _buildTournamentPoint = buildTournamentPointSchemeInsertQuery(tossupScheme, tournamentId);

            var tournamentIds = _buildTournamentPoint.tournamentIds;
            var values = _buildTournamentPoint.values;
            var types = _buildTournamentPoint.types;


            tournamentParams.push(tournamentIds, values, types);
            console.log(tournamentParams);

            (0, _db.query)(tournament.add, tournamentParams, _db.queryTypeMap.many).then(function (result) {
                return resolve(result);
            }).catch(function (error) {
                return reject(error);
            });
        });
    },

    findTournamentsByUser: function findTournamentsByUser(username) {

        return new Promise(function (resolve, reject) {

            var params = [username];

            (0, _db.query)(tournament.findByUser, params, _db.queryTypeMap.any).then(function (tournaments) {
                return resolve(tournaments);
            }).catch(function (error) {
                console.log(error);
                reject(error);
            });
        });
    },

    findTournamentById: function findTournamentById(id) {

        return new Promise(function (resolve, reject) {
            var params = [id];

            (0, _db.query)(tournament.findById, params, _db.queryTypeMap.one).then(function (tournament) {
                return resolve(tournament);
            }).catch(function (error) {
                console.log(error);
                reject(error);
            });
        });
    },

    updateTournament: function updateTournament(id, newInfo) {
        return new Promise(function (resolve, reject) {
            var name = newInfo.name;
            var _newInfo$location = newInfo.location;
            var location = _newInfo$location === undefined ? null : _newInfo$location;
            var _newInfo$date = newInfo.date;
            var date = _newInfo$date === undefined ? null : _newInfo$date;
            var _newInfo$questionSet = newInfo.questionSet;
            var questionSet = _newInfo$questionSet === undefined ? null : _newInfo$questionSet;
            var _newInfo$comments = newInfo.comments;
            var comments = _newInfo$comments === undefined ? null : _newInfo$comments;
            var _newInfo$hidden = newInfo.hidden;
            var hidden = _newInfo$hidden === undefined ? false : _newInfo$hidden;

            var params = [id, name, location, date, questionSet, comments, hidden];

            (0, _db.query)(tournament.update, params, _db.queryTypeMap.one).then(function (updatedInfo) {
                return resolve(updatedInfo);
            }).catch(function (error) {
                console.log(error);
                reject(error);
            });
        });
    }

};


function buildTournamentPointSchemeInsertQuery(rows, tournamentId) {

    var tournamentIds = rows.map(function (row) {
        return tournamentId;
    });
    var values = rows.map(function (row) {
        return row.value;
    });
    var types = rows.map(function (row) {
        return row.type;
    });

    return {
        tournamentIds: tournamentIds,
        values: values,
        types: types
    };
}