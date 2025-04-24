import { BoardTrinket } from '../../../bgs-player-entity';
import { SoCInput } from '../../../simulation/start-of-combat/start-of-combat-input';
import { modifyStats } from '../../../simulation/stats';
import { StartOfCombatCard } from '../../card.interface';

export const AllWillBurn: StartOfCombatCard = {
	startOfCombatTiming: 'pre-combat',
	startOfCombat: (trinket: BoardTrinket, input: SoCInput) => {
		for (const entity of input.playerBoard) {
			modifyStats(entity, trinket, 2, 0, input.playerBoard, input.playerEntity, input.gameState);
		}
		for (const entity of input.opponentBoard) {
			modifyStats(entity, trinket, 2, 0, input.opponentBoard, input.opponentEntity, input.gameState);
		}
		return true;
	},
};
