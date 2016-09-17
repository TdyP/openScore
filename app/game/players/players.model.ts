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

  constructor(data ?: any) {
    if (!!data) {
      this.id = data.id;
      this.name = data.name;
      this.color = data.color || this.getRandomColor();
      this.selectable = !!data.selectable;
      this.stats = data.stats || {};
    }
  }

  private getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

}
