import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { BattlecryInput } from '../../../simulation/battlecries';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { simplifiedSpawnEntities } from '../../../simulation/deathrattle-spawns';
import { modifyStats } from '../../../simulation/stats';
import { BattlecryCard, DeathrattleSpawnCard } from '../../card.interface';

export const ForestRover: DeathrattleSpawnCard & BattlecryCard = {
	cardIds: [CardIds.ForestRover_BG31_801, CardIds.ForestRover_BG31_801_G],
	deathrattleSpawn: (deadEntity: BoardEntity, input: DeathrattleTriggeredInput): readonly BoardEntity[] => {
		const numberOfSpawns = deadEntity.cardId === CardIds.ForestRover_BG31_801_G ? 2 : 1;
		return simplifiedSpawnEntities(CardIds.BoonOfBeetles_BeetleToken_BG28_603t, numberOfSpawns, input);
	},
	battlecry: (minion: BoardEntity, input: BattlecryInput) => {
		const mult = minion.cardId === CardIds.ForestRover_BG31_801_G ? 2 : 1;
		input.hero.globalInfo.BeetleAttackBuff = input.hero.globalInfo.BeetleAttackBuff + 2 * mult;
		input.hero.globalInfo.BeetleHealthBuff = input.hero.globalInfo.BeetleHealthBuff + 1 * mult;
		input.board
			.filter((e) =>
				[CardIds.BoonOfBeetles_BeetleToken_BG28_603t, CardIds.Beetle_BG28_603t_G].includes(e.cardId as CardIds),
			)
			.forEach((e) => {
				modifyStats(e, minion, 2 * mult, 1 * mult, input.board, input.hero, input.gameState);
			});
		return true;
	},
};
