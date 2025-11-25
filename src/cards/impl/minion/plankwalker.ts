import { BoardTrinket } from '../../../bgs-player-entity';
import { BoardEntity } from '../../../board-entity';
import { pickMultipleRandom } from '../../../services/utils';
import { modifyStats } from '../../../simulation/stats';
import { TempCardIds } from '../../../temp-card-ids';
import { CastSpellInput, OnTavernSpellCastCard } from '../../card.interface';

export const Plankwalker: OnTavernSpellCastCard = {
	cardIds: [TempCardIds.Plankwalker, TempCardIds.Plankwalker_G],
	onTavernSpellCast: (entity: BoardEntity | BoardTrinket, input: CastSpellInput) => {
		const mult = entity.cardId === TempCardIds.TimewarpedPrimscale_G ? 2 : 1;
		const targets = pickMultipleRandom(input.board, 3);
		for (const target of targets) {
			modifyStats(target, entity, 2 * mult, 1, input.board, input.hero, input.gameState);
		}
	},
};
