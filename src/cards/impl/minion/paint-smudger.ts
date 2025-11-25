import { BoardTrinket } from '../../../bgs-player-entity';
import { BoardEntity } from '../../../board-entity';
import { pickMultipleRandom } from '../../../services/utils';
import { playBloodGemsOn } from '../../../simulation/blood-gems';
import { TempCardIds } from '../../../temp-card-ids';
import { CastSpellInput, OnTavernSpellCastCard } from '../../card.interface';

export const PaintSmudger: OnTavernSpellCastCard = {
	cardIds: [TempCardIds.PaintSmudger, TempCardIds.PaintSmudger_G],
	onTavernSpellCast: (entity: BoardEntity | BoardTrinket, input: CastSpellInput) => {
		const mult = entity.cardId === TempCardIds.PaintSmudger_G ? 2 : 1;
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
