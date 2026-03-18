import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { addStatsToBoard } from '../../../utils';
import { CastSpellInput, OnTavernSpellCastCard } from '../../card.interface';

export const TimewarpedHootail: OnTavernSpellCastCard = {
	cardIds: [CardIds.TimewarpedHooktail_BG34_Giant_015, CardIds.TimewarpedHooktail_BG34_Giant_015_G],
	onTavernSpellCast: (entity: BoardEntity, input: CastSpellInput) => {
		const loops = entity.cardId === CardIds.TimewarpedHooktail_BG34_Giant_015_G ? 2 : 1;
		for (let i = 0; i < loops; i++) {
			addStatsToBoard(entity, input.board, input.hero, 2, 2, input.gameState);
		}
	},
};
