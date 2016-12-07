import { Injectable } from '@angular/core';
import { Events } from 'ionic-angular';
import { SQLite } from 'ionic-native';
import { ErrorService } from './error.service';
import { TranslateService } from 'ng2-translate/ng2-translate';

@Injectable()
export class DbService {

  public db: SQLite;
  private isReady: boolean = false;
  private currentVersion: number = 2;

  constructor(
    db: SQLite,
    public events: Events,
    private errorServ: ErrorService,
    private translateService: TranslateService
  ) {
    this.db = new SQLite();
  }

  public init() {
    this.db.openDatabase({
      name: 'openscore.db',
      location: 'default' // the location field is required
    })
    .then(() => {
      return this.checkDbVersion();
    })
    .then(() => {
      this.isReady = true;
      this.events.publish('db:ready', this.db);
    })
    .catch(err => this.errorServ.handle(err, this.translateService.instant('errors.db_init')));
  }

  /**
   * Run a query
   * To make sure the app is fully loaded before firing queries,
   * we check if DB is ready: if not we wait for the event before firing queries
   *
   * @param  {string}       query
   * @param  {Array<any>}   params
   * @return {Promise<any>} Resolve when query has been actually fired, might wait for the DB to be ready
   */
  public query(query: string, params ?: Array<any>): Promise<any> {
    var self = this;
    return new Promise((resolve, reject) => {
      // Run the query
      let doQuery = function() {
        self.db.executeSql(query, params)
          .then(resolve);
      }

      if(self.isReady) { // Everything's ready, run query
        doQuery();
      }
      else { // DB not ready, wait for it
        self.events.subscribe('db:ready', doQuery);
      }
    });
  }

  /**
   * Return DB version from DB itself
   *
   * @return {Promise<number>} DB version
   */
  private getDbVersion(): Promise<number> {
    return new Promise((resolve, reject) => {
      this.db.executeSql(`PRAGMA user_version`, [])
        .then((res) => {
          resolve(res.rows.item(0).user_version);
        })
    });
  }

  /**
   * Check if DB upgrade is necessary
   *
   * @return {Promise<any>} Resolve when DB is up-to-date
   */
  private checkDbVersion(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.getDbVersion()
        .then(dbVersion => {
          if(dbVersion < this.currentVersion) { // DB needs to be upgraded
            return this.upgradeDb(dbVersion);
          }
          else { // Everything is up-to-date
            return Promise.resolve();
          }
        })
        .then(resolve)
        .catch(reject);
    });
  }

  /**
   * Call DB upgrade function for given version.
   * When upgrade is done, we call checkDbVersion() in case of several upgrades are necessary
   *
   * @param {number} dbVersion Current DB version
   */
  private upgradeDb(dbVersion: number) {
    return this['upgrade_' + (dbVersion + 1)]()
      .then(() => this.checkDbVersion());
  }

  /**
   * Update DB version in DB itself
   *
   * @param {number} newDbVersion
   */
  private setDbVersion(newDbVersion: number) {
    return this.db.executeSql('PRAGMA user_version = ' + newDbVersion, []);
  }

  /**
   * UPGRADE FUNCTIONS
   */
  /* tslint:disable:no-unused-variable */

  /**
   * First DB structure init
   *
   * @return {Promise<any>}
   */
  private upgrade_1(): Promise<any> {
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
      `CREATE INDEX IF NOT EXISTS games_dates_idx ON games(modif_date, start_date);`,
      `CREATE TABLE IF NOT EXISTS players (
        id     INTEGER PRIMARY KEY AUTOINCREMENT,
        name   VARCHAR(255) NOT NULL,
        selectable INT(1) DEFAULT 0,
        color  INT(6)
      );`,
      `CREATE INDEX IF NOT EXISTS players_name_idx ON players(name);`,
      `CREATE TABLE IF NOT EXISTS participate (
        game_id     INT NOT NULL,
        player_id   INT NOT NULL,
        ranking     INT(3),
        FOREIGN KEY(game_id) REFERENCES games(id) ON DELETE CASCADE,
        FOREIGN KEY(player_id) REFERENCES players(id) ON DELETE CASCADE
      );`,
      `CREATE INDEX IF NOT EXISTS particip_game_player_idx ON participate(game_id, player_id);`,
      `CREATE TABLE IF NOT EXISTS rounds (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        game_id     INT NOT NULL,
        player_id   INT NOT NULL,
        score       INT NOT NULL DEFAULT 0,
        created_at  INT(13),
        FOREIGN KEY(game_id) REFERENCES games(id) ON DELETE CASCADE,
        FOREIGN KEY(player_id) REFERENCES players(id) ON DELETE CASCADE
      );`,
      `CREATE INDEX IF NOT EXISTS rounds_game_idx ON rounds(game_id);`
    ];

    return this.db.sqlBatch(queries)
     .then(() => this.setDbVersion(1));
  }

  /**
   * Rename field "selectable" to "custom_name" in players table
   * @return {Promise<any>}
   */
  private upgrade_2(): Promise<any> {
    return new Promise((resolve, reject) => {
      // Can"t rename a column with SQLite, so let's do this manually
      this.db.executeSql('BEGIN TRANSACTION;', [])
        // Make a copy of existing table
        .then(() => this.db.executeSql('ALTER TABLE players RENAME TO players_old', []))

        // Create new table with newly named field
        .then(() => this.db.executeSql(`
          CREATE TABLE IF NOT EXISTS players (
          id     INTEGER PRIMARY KEY AUTOINCREMENT,
          name   VARCHAR(255) NOT NULL,
          custom_name INT(1) DEFAULT 0,
          color  INT(6)
        );
        `, []))

        // Copy data from old table to new one with new field name
        .then(() => this.db.executeSql(`INSERT INTO players (id, name, custom_name, color)
          SELECT id, name, selectable, color FROM players_old`, []))

        // Delete old table
        .then(() => this.db.executeSql('DROP TABLE players_old',[]))

        // Commit transaction
        .then(() => this.db.executeSql('COMMIT;',[]))

        .then(() => this.setDbVersion(2))
        .then(resolve)
        .catch(reject);
    });
  }
}
