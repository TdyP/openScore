import { Injectable } from '@angular/core';
import { Events } from 'ionic-angular';
import { SQLite } from 'ionic-native';

@Injectable()
export class DbService {

  public db: SQLite;

  constructor(
    db: SQLite,
    public events: Events
  ) {
    this.db = new SQLite();
  }

  public init() {
    this.db.openDatabase({
      name: 'openscore.db',
      location: 'default' // the location field is required
    }).then(() => {
      return this.initDbStructure();
    })
    .then(() => {
      this.events.publish('db:initialized', this.db);
    })
  }

  public initDbStructure() {

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

    return Promise.all(queries.map(query => this.query(query)));
  }

  public query(query: string, params ?: Array<any>) {
    return this.db.executeSql(query, params);
  }
}
