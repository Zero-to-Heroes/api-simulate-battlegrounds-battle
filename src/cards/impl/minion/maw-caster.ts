import { CardIds, Race } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { pickRandomAlive } from '../../../services/utils';
import { BattlecryInput } from '../../../simulation/battlecries';
import { addCardsInHand } from '../../../simulation/cards-in-hand';
import { hasCorrectTribe } from '../../../utils';
import { BattlecryCard } from '../../card.interface';

export const MawCaster: BattlecryCard = {
	cardIds: [CardIds.MawCaster_BG32_340, CardIds.MawCaster_BG32_340_G],
	battlecry: (minion: BoardEntity, input: BattlecryInput) => {
		const undead = input.board.filter((e) =>
			hasCorrectTribe(e, input.hero, Race.UNDEAD, input.gameState.anomalies, input.gameState.allCards),
		);
		const target = pickRandomAlive(undead);
		if (!target) {
			return;
		}

		target.definitelyDead = true;
		const mult = minion.cardId === CardIds.MawCaster_BG32_340_G ? 2 : 1;
		for (let i = 0; i < mult; i++) {
			const card = input.gameState.cardsData.getRandomMinionForTribe(Race.UNDEAD, input.hero.tavernTier);
			addCardsInHand(input.hero, input.board, [card], input.gameState);
		}
		return true;
	},
};
