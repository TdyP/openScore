import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

import { GameModel } from '../../../../providers/game/game.model';
import { GameService } from '../../../../providers/game/game.service';

@Component({
  selector: 'page-game-chart',
  templateUrl: 'chart.html'
})
export class GameChart {

  game: GameModel;
  chartData: Array<any>;
  chartLabels: Array<any>;
  chartColors: Array<any>;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public gameService: GameService
  ) {
    this.game = this.navParams.get('game');

    this.chartColors = [];
    let dataByPlayer = {};
    let roundsMax = 0;
    for(let player of this.game.players) {
      dataByPlayer['p_' + player.id] = { // We prefix key with 'p_' to prevent object keys from being auto-sorted by v8 engine
        score: 0,
        data: [0],
        label: player.name
      };

      let rgbColor = this.hexToRgb(player.color);

      this.chartColors.push({
        backgroundColor: `rgba(255,255,255,0)`,
        borderColor: `rgba(${rgbColor},1)`,
        pointBackgroundColor: '#fff',
        pointBorderColor: `rgba(${rgbColor},1)`,
        pointHoverBackgroundColor: `rgba(${rgbColor},1)`,
        pointHoverBorderColor: '#fff'
      })
    }

    for(let round of this.game.rounds) {
      if(dataByPlayer['p_' + round.player_id] !== undefined) {
        dataByPlayer['p_' + round.player_id].score += round.score;
        dataByPlayer['p_' + round.player_id].data.push(dataByPlayer['p_' + round.player_id].score);

        roundsMax = Math.max(dataByPlayer['p_' + round.player_id].data.length, roundsMax);
      }
    }

    this.chartData = Object.keys(dataByPlayer).map(key => dataByPlayer[key]);
    this.chartLabels = new Array(roundsMax + 1);
  }

  public chartOptions:any = {
    animation: false,
    responsive: true,
    maintainAspectRatio: false
  };

  public lineChartLegend:boolean = true;
  public lineChartType:string = 'line';

  // events
  public chartClicked(e:any):void {
    console.log(e);
  }

  public chartHovered(e:any):void {
    console.log(e);
  }

  public hexToRgb(hex) {
    hex = hex.replace(/[^0-9A-F]/gi, '');
    var bigint = parseInt(hex, 16);
    var r = (bigint >> 16) & 255;
    var g = (bigint >> 8) & 255;
    var b = bigint & 255;

    return [r, g, b].join();
}
}
