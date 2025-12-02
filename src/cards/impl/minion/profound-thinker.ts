import { BoardEntity } from '../../../board-entity';
import { castTavernSpell } from '../../../mechanics/cast-tavern-spell';
import { CardIds } from '../../../services/card-ids';
import { BattlecryInput } from '../../../simulation/battlecries';
import { addCardsInHand } from '../../../simulation/cards-in-hand';
import { BattlecryCard } from '../../card.interface';

export const ProfoundThinker: BattlecryCard = {
	cardIds: [CardIds.ProfoundThinker_BG34_929, CardIds.ProfoundThinker_BG34_929_G],
	battlecry: (minion: BoardEntity, input: BattlecryInput) => {
		const mult = minion.cardId === CardIds.ProfoundThinker_BG34_929_G ? 2 : 1;
		for (let i = 0; i < mult; i++) {
			const spell = input.gameState.cardsData.getRandomSpellcraft();
			castTavernSpell(spell, {
				spellCardId: spell,
				source: minion,
				target: minion,
				board: input.board,
				hero: input.hero,
				otherBoard: input.otherBoard,
				otherHero: input.otherHero,
				gameState: input.gameState,
			});
			addCardsInHand(input.hero, input.board, [spell], input.gameState);
		}
		return true;
	},
};
