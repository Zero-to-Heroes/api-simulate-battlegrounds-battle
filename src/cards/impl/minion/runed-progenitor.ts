import { BoardEntity } from '../../../board-entity';
import { AvengeInput } from '../../../simulation/avenge';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { simplifiedSpawnEntities } from '../../../simulation/deathrattle-spawns';
import { modifyStats } from '../../../simulation/stats';
import { TempCardIds } from '../../../temp-card-ids';
import { AvengeCard, DeathrattleSpawnCard } from '../../card.interface';

export const RunedProgenitor: DeathrattleSpawnCard & AvengeCard = {
	cardIds: [TempCardIds.RunedProgenitor, TempCardIds.RunedProgenitor_G],
	deathrattleSpawn: (deadEntity: BoardEntity, input: DeathrattleTriggeredInput): readonly BoardEntity[] => {
		const numberOfSpawns = deadEntity.cardId === TempCardIds.RunedProgenitor_G ? 2 : 1;
		return simplifiedSpawnEntities(TempCardIds.BeetleToken, numberOfSpawns, input);
	},
	baseAvengeValue: (cardId: string) => 4,
	avenge: (minion: BoardEntity, input: AvengeInput) => {
		const mult = minion.cardId === TempCardIds.RunedProgenitor_G ? 2 : 1;
		input.hero.globalInfo.BeetleAttackBuff = input.hero.globalInfo.BeetleAttackBuff + 2 * mult;
		input.hero.globalInfo.BeetleHealthBuff = input.hero.globalInfo.BeetleHealthBuff + 2 * mult;
		input.board
			.filter((e) => [TempCardIds.BeetleToken, TempCardIds.BeetleToken_G].includes(e.cardId as TempCardIds))
			.forEach((e) => {
				modifyStats(e, 2 * mult, 2 * mult, input.board, input.hero, input.gameState);
			});
	},
};
