import { BoardTrinket } from '../../../bgs-player-entity';
import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { modifyStats } from '../../../simulation/stats';
import { CastSpellInput, OnTavernSpellCastCard } from '../../card.interface';

export const ChargingCzarina: OnTavernSpellCastCard = {
	cardIds: [CardIds.ChargingCzarina_BG28_741, CardIds.ChargingCzarina_BG28_741_G],
	onTavernSpellCast: (entity: BoardEntity | BoardTrinket, input: CastSpellInput) => {
		const mult = entity.cardId === CardIds.ChargingCzarina_BG28_741_G ? 2 : 1;
		const targets = input.board.filter((e) => e.divineShield);
		for (const target of targets) {
			modifyStats(target, entity, 3 * mult, 0, input.board, input.hero, input.gameState);
		}
	},
};
