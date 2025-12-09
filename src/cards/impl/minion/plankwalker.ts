import { BoardTrinket } from '../../../bgs-player-entity';
import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { pickMultipleRandom } from '../../../services/utils';
import { modifyStats } from '../../../simulation/stats';
import { CastSpellInput, OnTavernSpellCastCard } from '../../card.interface';

export const Plankwalker: OnTavernSpellCastCard = {
	cardIds: [CardIds.Plankwalker_BG34_521, CardIds.Plankwalker_BG34_521_G],
	onTavernSpellCast: (entity: BoardEntity | BoardTrinket, input: CastSpellInput) => {
		const mult = entity.cardId === CardIds.Plankwalker_BG34_521_G ? 2 : 1;
		const targets = pickMultipleRandom(input.board, 3);
		for (const target of targets) {
			modifyStats(target, entity, 2 * mult, 2 * mult, input.board, input.hero, input.gameState);
		}
	},
};
