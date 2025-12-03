import { BoardEntity } from '../../../board-entity';
import { castTavernSpell } from '../../../mechanics/cast-tavern-spell';
import { CardIds } from '../../../services/card-ids';
import { addCardsInHand } from '../../../simulation/cards-in-hand';
import { OnAttackInput } from '../../../simulation/on-attack';
import { RallyCard } from '../../card.interface';

export const ProfoundThinker: RallyCard = {
	cardIds: [CardIds.ProfoundThinker_BG34_929, CardIds.ProfoundThinker_BG34_929_G],
	rally: (minion: BoardEntity, input: OnAttackInput) => {
		const mult = minion.cardId === CardIds.ProfoundThinker_BG34_929_G ? 2 : 1;
		for (let i = 0; i < mult; i++) {
			const spell = input.gameState.cardsData.getRandomSpellcraft({
				maxTavernTier: input.attackingHero.tavernTier ?? 3,
			});
			castTavernSpell(spell, {
				spellCardId: spell,
				source: minion,
				target: minion,
				board: input.attackingBoard,
				hero: input.attackingHero,
				otherBoard: input.defendingBoard,
				otherHero: input.defendingHero,
				gameState: input.gameState,
			});
			addCardsInHand(input.attackingHero, input.attackingBoard, [spell], input.gameState);
		}
		return { dmgDoneByAttacker: 0, dmgDoneByDefender: 0 };
	},
};
