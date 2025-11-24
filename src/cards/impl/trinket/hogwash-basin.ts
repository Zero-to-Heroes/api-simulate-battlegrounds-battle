import { BoardTrinket } from '../../../bgs-player-entity';
import { CardIds } from '../../../services/card-ids';
import { playBloodGemsOn } from '../../../simulation/blood-gems';
import { SoCInput } from '../../../simulation/start-of-combat/start-of-combat-input';
import { StartOfCombatCard } from '../../card.interface';

export const HogwashBasin: StartOfCombatCard = {
	cardIds: [CardIds.HogwashBasin_BG32_MagicItem_904],
	startOfCombat: (trinket: BoardTrinket, input: SoCInput) => {
		for (const target of input.playerBoard) {
			playBloodGemsOn(
				trinket,
				target,
				3,
				input.playerBoard,
				input.playerEntity,
				input.opponentBoard,
				input.opponentEntity,
				input.gameState,
			);
		}
		return { hasTriggered: true, shouldRecomputeCurrentAttacker: false };
	},
};
