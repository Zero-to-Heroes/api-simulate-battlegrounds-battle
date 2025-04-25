import { CardIds } from '@firestone-hs/reference-data';
import { BoardTrinket } from '../../../bgs-player-entity';
import { SoCInput } from '../../../simulation/start-of-combat/start-of-combat-input';
import { addStatsToBoard } from '../../../utils';
import { StartOfCombatCard } from '../../card.interface';

export const VashjirAnemone: StartOfCombatCard = {
	cardIds: [CardIds.VashjirAnemone_BG32_MagicItem_932],
	startOfCombat: (trinket: BoardTrinket, input: SoCInput) => {
		const buff = trinket.scriptDataNum1 || 1;
		addStatsToBoard(trinket, input.playerBoard, input.playerEntity, 0, buff, input.gameState);
		return true;
	},
};
