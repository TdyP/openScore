import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { TranslateService } from '@ngx-translate/core';

import { HomePage } from '../pages/home/home';
import { DbService } from '../providers/db.service';

@Component({
  template: `<ion-nav [root]="rootPage"></ion-nav>`
})
export class OpenScore {
  rootPage = HomePage;

  constructor(
    public platform: Platform,
    public dbService: DbService,
    public translate: TranslateService,
    public statusBar: StatusBar
  ) {
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      dbService.init();
      statusBar.styleDefault();
    });

    translate.addLangs(["en", "fr"]);
    translate.setDefaultLang('en');

    let browserLang = translate.getBrowserLang();
    translate.use(browserLang.match(/en|fr/) ? browserLang : 'en');
  }
}
