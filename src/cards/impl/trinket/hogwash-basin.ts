import { BoardTrinket } from '../../../bgs-player-entity';
import { playBloodGemsOn } from '../../../simulation/blood-gems';
import { SoCInput } from '../../../simulation/start-of-combat/start-of-combat-input';
import { TempCardIds } from '../../../temp-card-ids';
import { StartOfCombatCard } from '../../card.interface';

export const HogwashBasin: StartOfCombatCard = {
	cardIds: [TempCardIds.HogwashBasin],
	startOfCombat: (trinket: BoardTrinket, input: SoCInput) => {
		for (const target of input.playerBoard) {
			playBloodGemsOn(trinket, target, 4, input.playerBoard, input.playerEntity, input.gameState);
		}
		return { hasTriggered: true, shouldRecomputeCurrentAttacker: false };
	},
};
