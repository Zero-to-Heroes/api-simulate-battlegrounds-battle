import { BoardEntity } from '../../../board-entity';
import { castTavernSpell } from '../../../mechanics/cast-tavern-spell';
import { CardIds } from '../../../services/card-ids';
import { getNeighbours } from '../../../simulation/attack';
import { EndOfTurnCard, EndOfTurnInput } from '../../card.interface';

export const FaunaWhisperer: EndOfTurnCard = {
	cardIds: [CardIds.FaunaWhisperer_BG32_837, CardIds.FaunaWhisperer_BG32_837_G],
	endOfTurn: (minion: BoardEntity, input: EndOfTurnInput) => {
		const targets: readonly BoardEntity[] = getNeighbours(input.board, minion);
		const mult = minion.cardId === CardIds.FaunaWhisperer_BG32_837_G ? 2 : 1;
		for (let i = 0; i < mult; i++) {
			for (const target of targets) {
				castTavernSpell(CardIds.NaturalBlessing_BG28_845, {
					spellCardId: CardIds.NaturalBlessing_BG28_845,
					source: minion,
					target: target,
					board: input.board,
					hero: input.hero,
					otherBoard: input.otherBoard,
					otherHero: input.otherHero,
					gameState: input.gameState,
				});
			}
		}
	},
};
