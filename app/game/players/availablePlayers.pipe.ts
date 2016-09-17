import {Pipe, PipeTransform} from '@angular/core'

/**
 * Pipe used to filter selectable players list. Already used players are removed from list
 */
@Pipe({
    name: 'availablePlayers'
})
export class AvailablePlayersPipe implements PipeTransform {
  /**
   * @param  {any[]}    items      All players list
   * @param  {number[]} usedIds    Already used IDs
   * @return {any}                 List of available players
   */
  transform(items: any[], usedIds:number[]): any {
    if(items === undefined) {
      return [];
    }
    else {
      return items.filter((item) => !!item.id && usedIds.indexOf(item.id) < 0);
    }
  }
}
