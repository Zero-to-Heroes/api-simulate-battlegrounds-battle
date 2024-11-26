import { BoardEntity } from '../../../board-entity';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { spawnEntities } from '../../../simulation/deathrattle-spawns';
import { modifyStats } from '../../../simulation/stats';
import { TempCardIds } from '../../../temp-card-ids';
import { DeathrattleEffectCard, DeathrattleSpawnCard } from '../../card.interface';

export const TurquoiseSkitterer: DeathrattleSpawnCard & DeathrattleEffectCard = {
	deathrattleSpawn: (deadEntity: BoardEntity, input: DeathrattleTriggeredInput): readonly BoardEntity[] => {
		const numberOfSpawns = deadEntity.cardId === TempCardIds.TurquoiseSkitterer_G ? 2 : 1;
		return spawnEntities(
			TempCardIds.BeetleToken,
			numberOfSpawns,
			input.boardWithDeadEntity,
			input.boardWithDeadEntityHero,
			input.otherBoard,
			input.otherBoardHero,
			input.gameState.allCards,
			input.gameState.cardsData,
			input.gameState.sharedState,
			input.gameState.spectator,
			deadEntity.friendly,
			false,
		);
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
