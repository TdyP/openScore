import { Injectable } from '@angular/core';
import { SqlStorage, Storage} from 'ionic-angular';

@Injectable()
export class DbService {

  public db: Storage;

  constructor() {
    this.db = new Storage(SqlStorage);
  }

  public init() {
    return this.initDbStructure();
  }

  private initDbStructure() {

    //TODO: use prepopulated database instead of queries
    let queries = [
      `CREATE TABLE IF NOT EXISTS games (
        id            INTEGER PRIMARY KEY AUTOINCREMENT,
        name          VARCHAR(255),
        start_date    INT(13),
        modif_date    INT(13),
        score_type    VARCHAR(4),
        score_input   VARCHAR(6),
        goal          INT,
        goal_type     VARCHAR(10),
        rounds_limit  INT,
        rounds_played INT,
        favorite      TINYINT(1) DEFAULT 0
      );`,
      `CREATE TABLE IF NOT EXISTS players (
        id     INTEGER PRIMARY KEY AUTOINCREMENT,
        name   VARCHAR(255) NOT NULL,
        selectable INT(1) DEFAULT 0,
        color  INT(6)
      );`,
      `CREATE TABLE IF NOT EXISTS participate (
        game_id     INT NOT NULL,
        player_id   INT NOT NULL,
        ranking     INT(3),
        FOREIGN KEY(game_id) REFERENCES games(id) ON DELETE CASCADE,
        FOREIGN KEY(player_id) REFERENCES players(id) ON DELETE CASCADE
      );`,
      `CREATE TABLE IF NOT EXISTS rounds (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        game_id     INT NOT NULL,
        player_id   INT NOT NULL,
        score       INT NOT NULL DEFAULT 0,
        created_at  INT(13),
        FOREIGN KEY(game_id) REFERENCES games(id) ON DELETE CASCADE,
        FOREIGN KEY(player_id) REFERENCES players(id) ON DELETE CASCADE
      );`
    ];

    return Promise.all(queries.map(query => this.db.query(query)));
  }

  public query(query: string, params ?: Array<any>) {
    return this.db.query(query, params);
  }
}
