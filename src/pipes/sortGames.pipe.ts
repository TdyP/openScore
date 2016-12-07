import { Pipe, PipeTransform } from '@angular/core'

/**
 * Pipe used to sort games: favorites first, then sorted by date (most recent first)
 */
@Pipe({
    name: 'sortGames',
    pure: false
})
export class SortGamesPipe implements PipeTransform {

  /**
   *  Sort games by favorite and last modif date
   *
   * @param  {any[]}    items      All games list
   * @return {any}                 Sorted list of games
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
