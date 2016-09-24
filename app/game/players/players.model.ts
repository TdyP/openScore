import { Injectable } from '@angular/core';

@Injectable()
export class PlayerModel {

  id: number;
  name: string = '';
  color: string;
  selectable: boolean = false;
  score: number = 0;
  tmpScore: number = 0; // Used to delay the score saving
  rank: number = 0;
  stats: any;

  constructor(data ?: any, playerIndex ?: number) {
    if (!!data) {
      this.id = data.id;
      this.name = data.name;
      this.color = data.color || this.getRandomColor(playerIndex);
      this.selectable = !!data.selectable;
      this.rank = data.rank || playerIndex + 1;
      this.stats = data.stats || {};
    }
  }

  /**
   * Generate a random color.
   * If players count is <= 12, we used defined colors.
   * Otherwise, we generate a color depending on the number of players using HSL colors.
   *
   * @param {number} playerIndex    Index of this player among the players list
   * @param {number} playersCount   Total number of players in the game
   */
  private getRandomColor(playerIndex) {
    let color;
    let definedColors = [
      '#FF0000',
      '#0000FF',
      '#00FF00',
      '#ffa500',
      '#ffff00',
      '#000000',
      '#f70cf4',
      '#0df8df',
      '#830482',
      '#00c6ff',
      '#ffc0cb',
      '#8e8e8e'
    ];

    if(playerIndex <= definedColors.length) {
      color = definedColors[playerIndex];
    }
    else {
      // Generate as distincts colors as possible on the whole hue range.
      let H = Math.round(Math.random() * 360);
      let S = Math.round(Math.random() * (100 - 50) + 50);
      let L = Math.round(Math.random() * (90 - 25) + 25);

      color = `hsl(${H},${S}%,${L}%)`;
    }

    return color;
  }

}
