import angular from 'angular';
import { get } from 'lodash';

import Emittable from './../util/emittable';

import divisionActions from './../actions/divisions.actions';

export default class DivisionService extends Emittable {
  constructor($q, DivisionHttpService, PhaseService) {
    super();
    this.$q = $q;
    this.DivisionHttpService = DivisionHttpService;
    this.PhaseService = PhaseService;

    this.phases = this.PhaseService.phases;
    this.divisions = [];
    this.newDivision = {
      name: '',
      phaseName: null,
      phaseId: null,
    };

    this.newPools = {};
  }

  getDivisions(tournamentId) {
    return this.$q((resolve, reject) => {
      this.DivisionHttpService.getDivisions(tournamentId)
        .then((foundDivisions) => {
          const formatted = DivisionService.formatDivisions(foundDivisions);
          angular.copy(formatted, this.divisions);
          this.emit(divisionActions.divisionsReceived, { divisions: formatted });
          resolve(formatted);
        })
        .catch(err => reject(err));
    });
  }

  addNewDivision(tournamentId, divisionName, phaseId) {
    return this.$q((resolve, reject) => {
      if (!divisionName) {
        return reject({ reason: 'Name is required. '});
      }
      if (!this.isUniqueNewDivisionNameInPhase(divisionName, phaseId)) {
        reject({ reason: 'This division name is not unique within its phase.' });
      } else {
        this.DivisionHttpService.postDivision(tournamentId, divisionName, phaseId)
          .then((newDivision) => {
            this.addDivisionToArray(newDivision);
            this.emit(divisionActions.divisionsReceived, { divisions: this.divisions });
            resolve(newDivision);
          })
          .catch(err => reject(err));
      }
    });
  }

  addNewPool(tournamentId, phaseId) {
    const poolName = get(this.newPools[phaseId], 'name');
    return this.addNewDivision(tournamentId, poolName, phaseId)
      .then(() => {
        this.newPools[phaseId].name = '';
      })
  }

  editDivision(tournamentId, division) {
    return this.$q((resolve, reject) => {
      if (!this.isUniqueNewDivisionNameInPhase(division.newName, division.phaseId)) {
        reject({ reason: 'This division name is not unique within its phase.' });
      } else {
        this.DivisionHttpService.editDivision(tournamentId, division.id, division.newName)
          .then(({ id, name }) => {
            this.updateDivisionInArray(id, name);
            this.emit(divisionActions.divisionsReceived, { divisions: this.divisions });
            resolve(name);
          })
          .catch(err => reject(err));
      }
    });
  }

  addCurrentNewDivision(tournamentId) {
    return this.$q((resolve, reject) => {
      if (!this.isValidNewDivision()) {
        reject({ reason: `Invalid new division: ${this.newDivision.name}. Provide both a name and a phase.` });
      } else {
        this.addNewDivision(tournamentId, this.newDivision.name, this.newDivision.phaseId)
          .then((addedDivision) => {
            this.resetNewDivision();
            resolve(addedDivision);
          })
          .catch(err => reject(err));
      }
    });
  }

  removeDivision(tournamentId, divisionId) {
    return this.$q((resolve, reject) => {
      this.DivisionHttpService.deleteDivision(tournamentId, divisionId)
        .then((deletedId) => {
          this.removeDivisionFromArray(deletedId);
          resolve(deletedId);
        })
        .catch(err => reject(err));
    })
  }

  addDivisionToArray({ name, id, phase_id: phaseId }) {
    this.divisions.push({
      name,
      newName: name,
      id,
      phaseId,
    });
  }

  removeDivisionFromArray(divisionId) {
    const index = this.divisions.findIndex(d => d.id === divisionId);
    if (index !== -1) {
      this.divisions.splice(index, 1);
    }
  }

  updateDivisionInArray(id, newName) {
    const index = this.divisions.findIndex(d => d.id === id);
    if (index !== -1) {
      this.divisions[index].name = newName;
      this.divisions[index].newName = newName;
    }
  }

  resetNewDivision() {
    this.newDivision.name = '';
  }

  isValidNewDivision() {
    return this.newDivision.name.trim().length > 0
      && this.newDivision.phaseName;
  }

  isUniqueNewDivisionNameInPhase(divisionName, phaseId) {
    const formatted = divisionName ? divisionName.trim().toLowerCase() : null;
    return !this.divisions.some(d =>
      d.phaseId === phaseId && formatted === d.name.toLowerCase().trim());
  }

  static formatDivisions(divisions) {
    return divisions.map(d => ({
      name: d.division_name,
      newName: d.division_name,
      id: d.division_id,
      phaseId: d.phase_id,
    }));
  }

}

DivisionService.$inject = ['$q', 'DivisionHttpService', 'PhaseService'];

