import { Injectable } from '@angular/core';
import { TranslateService } from "ng2-translate/ng2-translate";

import { PlayerModel } from './player.model';
import { DbService } from '../db.service';

@Injectable()
export class PlayerService {

  constructor(
    private db: DbService,
    private translateService: TranslateService
  ) {}

  public deletePlayer(player: PlayerModel): Promise<any> {
    return new Promise((resolve, reject) => {
      this.db.query('DELETE FROM players WHERE id = ?', [player.id])
        .then(() => this.db.query('DELETE FROM participate WHERE player_id = ?', [player.id]))
        .then(() => this.db.query('DELETE FROM rounds WHERE player_id = ?', [player.id]))
        .then(resolve)
        .catch(reject);
    })
  }

  /**
   * Save Player
   *
   * @param {PlayerModel} player [description]
   * @return {Promise<PlayerModel>}
   */
  public save(player: PlayerModel): Promise<PlayerModel> {
    return new Promise((resolve, reject) => {
      let query;
      let params = [player.name, (player.custom_name ? 1 : 0), player.color];

      if(player.id) {
        query = 'UPDATE players SET name = ?, custom_name = ?, color = ? WHERE id = ?';
        params.push(player.id);
      }
      else {
        query = 'INSERT INTO players (name, custom_name, color) VALUES(?, ?, ?)';
      }

      this.db.query(query, params)
        .then(res => {
          if(!player.id) {
            player.id = res.insertId;
          }

          resolve(player);
        }, reject);
    });
  }

  public getAllPlayers() {
    return new Promise((resolve, reject) => {
      this.db.query(`
        SELECT
          id,
          name,
          custom_name,
          color
        FROM players
        WHERE custom_name = 1
        ORDER BY name ASC;
      `)
      .then(res => {
        let len = res.rows.length;
        let players = [];
        for (let i = 0; i < len; i++)
        {
          players.push(new PlayerModel(res.rows.item(i)));
        }

        resolve(players);
      }, reject)
      .catch(reject);
    });
  }

  public getDefaultName(index: number) {
    return this.translateService.instant('players.default_name', {index});
  }
}
