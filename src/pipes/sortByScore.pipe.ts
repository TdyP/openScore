import { Pipe, PipeTransform } from '@angular/core'

/**
 * Pipe used to filter selectable players list. Already used players are removed from list
 */
@Pipe({
    name: 'sortByScore',
    pure: false
})
export class SortByScorePipe implements PipeTransform {

  /**
   * @param  {Array}    items      All players list
   * @return {Array}               Sorted players
   */
  transform(items: any[], score_input: string): any {
    if(score_input === 'round') {
      // We duplicate items array because we don't want to sort players in game object,
      // just the players displayed
      let itemsToSort = items.slice(0);
      return itemsToSort.sort((a, b) => a.rank - b.rank)
    }
    else {
      return items;
    }
  }
}
