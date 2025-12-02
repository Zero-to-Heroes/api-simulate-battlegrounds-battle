import { BoardTrinket } from '../../../bgs-player-entity';
import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { pickMultipleRandom } from '../../../services/utils';
import { playBloodGemsOn } from '../../../simulation/blood-gems';
import { CastSpellInput, OnTavernSpellCastCard } from '../../card.interface';

export const PaintSmudger: OnTavernSpellCastCard = {
	cardIds: [CardIds.PaintSmudger_BG28_584, CardIds.PaintSmudger_BG28_584_G],
	onTavernSpellCast: (entity: BoardEntity | BoardTrinket, input: CastSpellInput) => {
		const mult = entity.cardId === CardIds.PaintSmudger_BG28_584_G ? 2 : 1;
		const targets = pickMultipleRandom(input.board, 3);
		for (const target of targets) {
			playBloodGemsOn(
				entity,
				target,
				1 * mult,
				input.board,
				input.hero,
				input.otherBoard,
				input.otherHero,
				input.gameState,
			);
		}
	},
};
