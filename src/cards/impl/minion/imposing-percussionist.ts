import { CardIds, Race } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { BattlecryInput } from '../../../simulation/battlecries';
import { addCardsInHand } from '../../../simulation/cards-in-hand';
import { dealDamageToHero } from '../../../simulation/damage-to-hero';
import { BattlecryCard } from '../../card.interface';

export const ImposingPercussionist: BattlecryCard = {
	cardIds: [CardIds.ImposingPercussionist_BG26_525, CardIds.ImposingPercussionist_BG26_525_G],
	battlecry: (minion: BoardEntity, input: BattlecryInput) => {
		const discover = input.gameState.cardsData.getRandomMinionForTribe(Race.DEMON, input.hero.tavernTier);
		addCardsInHand(input.hero, input.board, [discover], input.gameState);
		dealDamageToHero(
			minion,
			input.hero,
			input.board,
			input.gameState.cardsData.getTavernLevel(discover),
			input.gameState,
		);
	},
};
