import { Pipe, PipeTransform } from '@angular/core'
import { GameService } from '../game.service';

/**
 * Pipe used to filter selectable players list. Already used players are removed from list
 */
@Pipe({
    name: 'sortByScore',
    pure: false
})
export class SortByScorePipe implements PipeTransform {

  constructor(
    private gameService: GameService
  ) {}

  /**
   * @param  {any[]}    items      All players list
   * @param  {number[]} usedIds    Already used IDs
   * @return {any}                 List of available players
   */
  transform(items: any[], score_input: string): any {
    return score_input === 'round' ? items.sort((a, b) => a.rank - b.rank) : items;
  }
}
