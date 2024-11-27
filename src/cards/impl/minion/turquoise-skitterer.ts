import { BoardEntity } from '../../../board-entity';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { simplifiedSpawnEntities } from '../../../simulation/deathrattle-spawns';
import { modifyStats } from '../../../simulation/stats';
import { TempCardIds } from '../../../temp-card-ids';
import { DeathrattleEffectCard, DeathrattleSpawnCard } from '../../card.interface';

export const TurquoiseSkitterer: DeathrattleSpawnCard & DeathrattleEffectCard = {
	cardIds: [TempCardIds.TurquoiseSkitterer, TempCardIds.TurquoiseSkitterer_G],
	deathrattleSpawn: (deadEntity: BoardEntity, input: DeathrattleTriggeredInput): readonly BoardEntity[] => {
		const numberOfSpawns = deadEntity.cardId === TempCardIds.TurquoiseSkitterer_G ? 2 : 1;
		return simplifiedSpawnEntities(TempCardIds.BeetleToken, numberOfSpawns, input);
	},
	deathrattleEffect: (minion: BoardEntity, input: DeathrattleTriggeredInput) => {
		const mult = minion.cardId === TempCardIds.TurquoiseSkitterer_G ? 2 : 1;
		input.boardWithDeadEntityHero.globalInfo.BeetleAttackBuff =
			input.boardWithDeadEntityHero.globalInfo.BeetleAttackBuff + 1 * mult;
		input.boardWithDeadEntityHero.globalInfo.BeetleHealthBuff =
			input.boardWithDeadEntityHero.globalInfo.BeetleHealthBuff + 2 * mult;
		input.boardWithDeadEntity
			.filter((e) => [TempCardIds.BeetleToken, TempCardIds.BeetleToken_G].includes(e.cardId as TempCardIds))
			.forEach((e) => {
				modifyStats(
					e,
					1 * mult,
					2 * mult,
					input.boardWithDeadEntity,
					input.boardWithDeadEntityHero,
					input.gameState,
				);
			});
	},
};
