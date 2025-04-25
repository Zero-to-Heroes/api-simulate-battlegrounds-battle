import { CardIds, Race } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { BattlecryInput } from '../../../simulation/battlecries';
import { makeMinionGolden } from '../../../simulation/utils/golden';
import { hasCorrectTribe, isGolden } from '../../../utils';
import { BattlecryCard } from '../../card.interface';

export const EliteNavigator: BattlecryCard = {
	cardIds: [CardIds.EliteNavigator_BG32_231, CardIds.EliteNavigator_BG32_231_G],
	battlecry: (minion: BoardEntity, input: BattlecryInput) => {
		const mult = minion.cardId === CardIds.EliteNavigator_BG32_231_G ? 2 : 1;
		for (let i = 0; i < mult; i++) {
			const candidates = input.board
				.filter((e) =>
					hasCorrectTribe(e, input.hero, Race.PIRATE, input.gameState.anomalies, input.gameState.allCards),
				)
				.filter((e) => input.gameState.allCards.getCard(e.cardId).techLevel >= 4)
				.filter((e) => !isGolden(e.cardId, input.gameState.allCards));
			const target = candidates[0];
			if (!!target) {
				makeMinionGolden(
					target,
					minion,
					input.board,
					input.hero,
					input.otherBoard,
					input.otherHero,
					input.gameState,
				);
			}
		}
		return true;
	},
};
