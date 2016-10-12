import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
declare var cordova:any;

@Component({
  selector: 'page-about',
  templateUrl: 'about.html'
})
export class AboutPage {
  players: any;
  appVersion: string;

  constructor(
    public navCtrl: NavController
  ) {
    cordova.getAppVersion.getVersionNumber().then(version => {
      this.appVersion = version;
    });
  }
}
