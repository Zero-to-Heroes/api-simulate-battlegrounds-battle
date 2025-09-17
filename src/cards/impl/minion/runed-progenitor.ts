import { CardIds } from '../../../services/card-ids';
import { BoardEntity } from '../../../board-entity';
import { AvengeInput } from '../../../simulation/avenge';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { simplifiedSpawnEntities } from '../../../simulation/deathrattle-spawns';
import { modifyStats } from '../../../simulation/stats';
import { AvengeCard, DeathrattleSpawnCard } from '../../card.interface';

export const RunedProgenitor: DeathrattleSpawnCard & AvengeCard = {
	cardIds: [CardIds.RunedProgenitor_BG31_808, CardIds.RunedProgenitor_BG31_808_G],
	baseAvengeValue: (cardId: string) => 3,
	deathrattleSpawn: (deadEntity: BoardEntity, input: DeathrattleTriggeredInput): readonly BoardEntity[] => {
		const numberOfSpawns = deadEntity.cardId === CardIds.RunedProgenitor_BG31_808_G ? 2 : 1;
		return simplifiedSpawnEntities(CardIds.BoonOfBeetles_BeetleToken_BG28_603t, numberOfSpawns, input);
	},
	avenge: (minion: BoardEntity, input: AvengeInput) => {
		const mult = minion.cardId === CardIds.RunedProgenitor_BG31_808_G ? 2 : 1;
		input.hero.globalInfo.BeetleAttackBuff = input.hero.globalInfo.BeetleAttackBuff + 2 * mult;
		input.hero.globalInfo.BeetleHealthBuff = input.hero.globalInfo.BeetleHealthBuff + 2 * mult;
		input.board
			.filter((e) =>
				[CardIds.BoonOfBeetles_BeetleToken_BG28_603t, CardIds.Beetle_BG28_603t_G].includes(e.cardId as CardIds),
			)
			.forEach((e) => {
				modifyStats(e, minion, 2 * mult, 2 * mult, input.board, input.hero, input.gameState);
			});
	},
};
