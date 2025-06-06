import { CardIds, Race } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { pickRandom } from '../../../services/utils';
import { BattlecryInput } from '../../../simulation/battlecries';
import { modifyStats } from '../../../simulation/stats';
import { hasCorrectTribe } from '../../../utils';
import { BattlecryCard } from '../../card.interface';
import { hasKeyword, validBonusKeywords } from '../../cards-data';

export const FountainChiller: BattlecryCard = {
	cardIds: [CardIds.FountainChiller_BG31_145, CardIds.FountainChiller_BG31_145_G],
	battlecry: (minion: BoardEntity, input: BattlecryInput) => {
		const mult = minion.cardId === CardIds.FountainChiller_BG31_145_G ? 2 : 1;
		let totalKeywords = 1; // Base is 1, even without other keywords
		for (const bonusKeyword of validBonusKeywords) {
			if (input.board.some((e) => hasKeyword(e, bonusKeyword))) {
				totalKeywords++;
			}
		}
		const candidates = input.board.filter((e) =>
			hasCorrectTribe(e, input.hero, Race.MURLOC, input.gameState.anomalies, input.gameState.allCards),
		);
		const target = pickRandom(candidates);
		if (!!target) {
			modifyStats(
				target,
				minion,
				2 * totalKeywords * mult,
				totalKeywords * mult,
				input.board,
				input.hero,
				input.gameState,
			);
		}
		return true;
	},
};
