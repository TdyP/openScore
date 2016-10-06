import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

@Component({
  templateUrl: 'about.html'
})
export class AboutPage {
  players: any;

  constructor(
    public navCtrl: NavController
  ) {}
}
