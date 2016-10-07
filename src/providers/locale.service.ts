import { Injectable } from '@angular/core';

@Injectable()
export class LocaleService {

  public getLocale() {
    return navigator.language;
  }

}
