import { Pipe, PipeTransform } from '@angular/core'

/**
 * Pipe used to filter selectable players list. Already used players are removed from list
 */
@Pipe({
    name: 'sortGames',
    pure: false
})
export class SortGamesPipe implements PipeTransform {

  /**
   * @param  {any[]}    items      All players list
   * @param  {number[]} usedIds    Already used IDs
   * @return {any}                 List of available players
   */
  transform(items: any[]): any {
    if(items === undefined) {
      return items;
    }
    else {
      return items.sort((a,b) => {
        if(a.favorite !== b.favorite) {
          return a.favorite ? -1 : 1;
        }
        else {
          return b.modif_date - a.modif_date;
        }
      });
    }
  }
}
