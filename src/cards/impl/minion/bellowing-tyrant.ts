import { CardIds, Race } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { OnOtherSpawnInput, OnSpawnInput } from '../../../simulation/add-minion-to-board';
import { modifyStats } from '../../../simulation/stats';
import { hasCorrectTribe } from '../../../utils';
import { OnOtherSpawnedCard, OnSpawnedCard } from '../../card.interface';

export const BellowingTyrant: OnSpawnedCard & OnOtherSpawnedCard = {
	cardIds: [CardIds.BellowingTyrant_BG31_361, CardIds.BellowingTyrant_BG31_361_G],
	onSpawned: (minion: BoardEntity, input: OnSpawnInput) => {
		input.hero.globalInfo.BeastsSummonedThisGame += 1;
		const mult = minion.cardId === CardIds.BellowingTyrant_BG31_361_G ? 2 : 1;
		const statsBonus = mult * input.hero.globalInfo.BeastsSummonedThisGame;
		modifyStats(minion, 3 * statsBonus, 2 * mult, input.board, input.hero, input.gameState);
	},
	onOtherSpawned: (minion: BoardEntity, input: OnOtherSpawnInput) => {
		if (!hasCorrectTribe(input.spawned, input.hero, Race.BEAST, input.gameState.allCards)) {
			return;
		}
		input.hero.globalInfo.BeastsSummonedThisGame += 1;
		const mult = minion.cardId === CardIds.BellowingTyrant_BG31_361_G ? 2 : 1;
		const statsBonus = mult * 1;
		modifyStats(minion, 3 * statsBonus, 2 * mult, input.board, input.hero, input.gameState);
	},
};
