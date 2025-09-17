import { CardIds } from '../../../services/card-ids';
import { Race } from '@firestone-hs/reference-data';
import { BoardTrinket } from '../../../bgs-player-entity';
import { SoCInput } from '../../../simulation/start-of-combat/start-of-combat-input';
import { addStatsToBoard } from '../../../utils';
import { StartOfCombatCard } from '../../card.interface';

export const VashjirAnemone: StartOfCombatCard = {
	cardIds: [CardIds.VashjirAnemone_BG32_MagicItem_932],
	startOfCombat: (trinket: BoardTrinket, input: SoCInput) => {
		const buff =
			trinket.scriptDataNum2 ?? 1 + Math.floor((input.playerEntity.globalInfo.SpellsCastThisGame ?? 0) / 4);
		addStatsToBoard(trinket, input.playerBoard, input.playerEntity, 0, buff, input.gameState, Race[Race.NAGA]);
		return true;
	},
};
