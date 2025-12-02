import { BoardEntity } from '../../../board-entity';
import { castTavernSpell } from '../../../mechanics/cast-tavern-spell';
import { CardIds } from '../../../services/card-ids';
import { EndOfTurnCard, EndOfTurnInput } from '../../card.interface';

export const TimewarpedShadowdancer: EndOfTurnCard = {
	cardIds: [CardIds.TimewarpedShadowdancer_BG34_Giant_360, CardIds.TimewarpedShadowdancer_BG34_Giant_360_G],
	endOfTurn: (minion: BoardEntity, input: EndOfTurnInput) => {
		const mult = minion.cardId === CardIds.TimewarpedShadowdancer_BG34_Giant_360_G ? 2 : 1;
		for (let i = 0; i < mult; i++) {
			castTavernSpell(CardIds.StaffOfEnrichment_BG28_886, {
				spellCardId: CardIds.StaffOfEnrichment_BG28_886,
				source: input.hero,
				target: null,
				board: input.board,
				hero: input.hero,
				otherBoard: input.otherBoard,
				otherHero: input.otherHero,
				gameState: input.gameState,
			});
		}
	},
};
