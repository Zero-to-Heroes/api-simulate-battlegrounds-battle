import { Race } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { pickRandom } from '../../../services/utils';
import { BattlecryInput } from '../../../simulation/battlecries';
import { modifyStats } from '../../../simulation/stats';
import { TempCardIds } from '../../../temp-card-ids';
import { hasCorrectTribe } from '../../../utils';
import { BattlecryCard } from '../../card.interface';
import { hasKeyword, validBonusKeywords } from '../../cards-data';

export const FountainChiller: BattlecryCard = {
	cardIds: [TempCardIds.FountainChiller, TempCardIds.FountainChiller_G],
	battlecry: (minion: BoardEntity, input: BattlecryInput) => {
		const mult = minion.cardId === TempCardIds.FountainChiller_G ? 2 : 1;
		let totalKeywords = 0;
		for (const bonusKeyword of validBonusKeywords) {
			if (input.board.some((e) => hasKeyword(e, bonusKeyword))) {
				totalKeywords++;
			}
		}
		const candidates = input.board.filter((e) =>
			hasCorrectTribe(e, input.hero, Race.MURLOC, input.gameState.allCards),
		);
		const target = pickRandom(candidates);
		if (!!target) {
			modifyStats(target, totalKeywords * mult, totalKeywords * mult, input.board, input.hero, input.gameState);
			input.gameState.spectator.registerPowerTarget(minion, target, input.board, input.hero, input.otherHero);
		}
	},
};