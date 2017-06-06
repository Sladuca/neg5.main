import angular from 'angular';

export default class ScoresheetService {
  constructor($q, TournamentService, TeamHttpService, PhaseService, MatchService) {
    this.$q = $q;
    this.TournamentService = TournamentService;
    this.PhaseService = PhaseService;
    this.MatchService = MatchService;
    this.TeamHttpService = TeamHttpService;

    this.pointScheme = this.TournamentService.pointScheme;
    this.rules = this.TournamentService.rules;
    this.phases = this.PhaseService.phases;
    this.game = ScoresheetService.newScoresheet();
  }

  loadTeamPlayers(tournamentId, team) {
    return this.$q((resolve, reject) => {
      const { id } = team.teamInfo;
      this.TeamHttpService.getTeamById(tournamentId, id)
        .then(({ players }) => {
          const formatted = players.map((p, index) => ({
            id: p.player_id,
            name: p.player_name,
            active: index < this.rules.maxActive,
            tuh: 0,
          }));
          angular.copy(formatted, team.players);
          resolve(formatted);
        })
        .catch(err => reject(err));
    });
  }

  resetScoresheet() {
    const copy = ScoresheetService.newScoresheet();
    angular.copy(copy, this.game);
  }

  static newScoresheet() {
    return {
      teams: [
        {
          teamInfo: null,
          players: [],
          newPlayer: '',
          overtime: 0,
        },
        {
          teamInfo: null,
          players: [],
          newPlayer: '',
          overtime: 0,
        },
      ],
      cycles: ScoresheetService.initializeCyclesArray(20),
      currentCycle: {
        number: 1,
        answers: [],
        bonuses: [],
      },
      onTossup: true,
      round: 0,
      packet: null,
      notes: null,
      moderator: null,
      phases: [],
      room: null,
    };
  }

  static initializeCyclesArray(n) {
    const arr = [];
    for (let i = 0; i < n; i++) {
      arr.push({
        answers: [],
        bonuses: [],
      });
    }
    return arr;
  }
}

ScoresheetService.$inject = ['$q', 'TournamentService', 'TeamHttpService', 'PhaseService', 'MatchService'];


