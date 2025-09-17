import { CardIds } from '../../../services/card-ids';
import { BoardTrinket } from '../../../bgs-player-entity';
import { SoCInput } from '../../../simulation/start-of-combat/start-of-combat-input';
import { addStatsToBoard } from '../../../utils';

export const ValorousMedallion = {
	startOfCombat: (trinket: BoardTrinket, input: SoCInput) => {
		const medallionBuff = trinket.cardId === CardIds.ValorousMedallion_BG30_MagicItem_970 ? 2 : 6;
		addStatsToBoard(trinket, input.playerBoard, input.playerEntity, medallionBuff, medallionBuff, input.gameState);
		return true;
	},
};
