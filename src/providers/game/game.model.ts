import { PlayerModel } from '../player/player.model';

export class GameModel {

  id: number;
  name: string;
  start_date: number = Date.now();
  modif_date: number = Date.now();
  score_type: string = 'asc';
  score_input: string = 'round';
  goal: number = 0;
  goal_type: string = 'none';
  favorite: boolean = false;
  rounds_played: number = 0;
  players_count: number;
  rounds_count: number;
  players: Array<PlayerModel> = [];
  rounds: Array<any> = [];
  createdAt: Date;
  modifAt: Date;
  ended: boolean = false;
  notes: string = '';

  constructor(data ?: any) {

    if (!!data) {
      this.id = data.id;
      this.name = data.name;
      this.start_date = data.start_date || Date.now();
      this.modif_date = data.modif_date;
      this.score_type = data.score_type;
      this.score_input = data.score_input;
      this.goal = data.goal;
      this.goal_type = data.goal_type || 'none';
      this.favorite = !!data.favorite;
      this.rounds_played = data.rounds_played || 0;
      this.players = data.players || [];
      this.players_count = data.players_count || (data.players ? data.players.length : 0);
      this.rounds = data.rounds || [];
      this.ended = data.ended || false;
      this.notes = data.notes || '';
    }
    else {
      this.start_date = Date.now();
      this.modif_date = Date.now();
    }

    this.createdAt = new Date(this.start_date);
    this.modifAt = new Date(this.modif_date);
  }

  /**
   * Add a new player to the game
   *
   * @param {any}    data          Player data
   * @param {number} playersNumber Total number of players in the game. Used for random color generation
   */
  public addPlayer(data ?: any, playersNumber ?: number) {
    data.rank = this.players.length + 1;
    this.players.push(new PlayerModel(data, this.players.length));
  }

  /**
   * Get player data by ID
   *
   * @param {number} playerId
   * @return {PlayerModel}
   */
  public getPlayerById(playerId: number) {
    let player;

    for (let p of this.players) {
      if (p.id === playerId) {
        player = p;
        break;
      }
    }

    return player;
  }

  public getPlayersIds() {
    return this.players.filter(player => !!player.id).map((player) => player.id);
  }

  public endGame() {
    this.ended = true;
  }

  public isEnded() {
    return this.ended;
  }
}
