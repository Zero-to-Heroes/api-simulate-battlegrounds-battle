import { Race } from '@firestone-hs/reference-data';
import { CardIds } from '../../../services/card-ids';
import { addCardsInHand } from '../../../simulation/cards-in-hand';
import { CastSpellInput, TavernSpellCard } from '../../card.interface';

export const TombTurning: TavernSpellCard = {
	cardIds: [CardIds.TombTurning_BG34_888],
	castTavernSpell: (spellCardId: string, input: CastSpellInput) => {
		const cardsToAdd = [input.gameState.cardsData.getRandomMinionForTribe(Race.UNDEAD, input.hero.tavernTier)];
		addCardsInHand(input.hero, input.board, cardsToAdd, input.gameState);
	},
};
