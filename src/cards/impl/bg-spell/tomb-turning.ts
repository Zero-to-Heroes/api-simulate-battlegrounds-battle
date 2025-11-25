import { Race } from '@firestone-hs/reference-data';
import { addCardsInHand } from '../../../simulation/cards-in-hand';
import { TempCardIds } from '../../../temp-card-ids';
import { CastSpellInput, TavernSpellCard } from '../../card.interface';

export const TombTurning: TavernSpellCard = {
	cardIds: [TempCardIds.TombTurning],
	castTavernSpell: (spellCardId: string, input: CastSpellInput) => {
		const cardsToAdd = [input.gameState.cardsData.getRandomMinionForTribe(Race.UNDEAD, input.hero.tavernTier)];
		addCardsInHand(input.hero, input.board, cardsToAdd, input.gameState);
	},
};
