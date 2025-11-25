import { BoardEntity } from '../../../board-entity';
import { castTavernSpell } from '../../../mechanics/cast-tavern-spell';
import { CardIds } from '../../../services/card-ids';
import { TempCardIds } from '../../../temp-card-ids';
import { EndOfTurnCard, EndOfTurnInput } from '../../card.interface';

export const TimewarpedShadowdancer: EndOfTurnCard = {
	cardIds: [TempCardIds.TimewarpedShadowdancer, TempCardIds.TimewarpedShadowdancer_G],
	endOfTurn: (minion: BoardEntity, input: EndOfTurnInput) => {
		const mult = minion.cardId === TempCardIds.TimewarpedShadowdancer_G ? 2 : 1;
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
