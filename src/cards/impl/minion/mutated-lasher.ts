import { BoardEntity } from '../../../board-entity';
import { OnOtherSpawnInput } from '../../../simulation/add-minion-to-board';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { modifyStats } from '../../../simulation/stats';
import { TempCardIds } from '../../../temp-card-ids';
import { DeathrattleEffectCard, OnOtherSpawnedCard } from '../../card.interface';

export const MutatedLasher: DeathrattleEffectCard & OnOtherSpawnedCard = {
	cardIds: [TempCardIds.MutatedLasher, TempCardIds.MutatedLasher_G],
	deathrattleEffect: (minion: BoardEntity, input: DeathrattleTriggeredInput) => {
		const mult = minion.cardId === TempCardIds.MutatedLasher_G ? 2 : 1;
		input.boardWithDeadEntityHero.globalInfo.MutatedLasherAttackBuff += 2 * mult;
		input.boardWithDeadEntityHero.globalInfo.MutatedLasherHealthBuff += 3 * mult;
		input.boardWithDeadEntity
			.filter((e) => input.gameState.cardsData.getTavernLevel(e.cardId) % 2 === 1)
			.forEach((e) => {
				modifyStats(
					e,
					2 * mult,
					3 * mult,
					input.boardWithDeadEntity,
					input.boardWithDeadEntityHero,
					input.gameState,
				);
				input.gameState.spectator.registerPowerTarget(
					minion,
					e,
					input.boardWithDeadEntity,
					input.boardWithDeadEntityHero,
					input.otherBoardHero,
				);
			});
	},
	onOtherSpawned: (minion: BoardEntity, input: OnOtherSpawnInput) => {
		const mult = minion.cardId === TempCardIds.MutatedLasher_G ? 2 : 1;
		if (input.gameState.cardsData.getTavernLevel(input.spawned.cardId) % 2 === 1) {
			modifyStats(input.spawned, 2 * mult, 3 * mult, input.playerBoard, input.playerEntity, input.gameState);
			input.gameState.spectator.registerPowerTarget(
				minion,
				input.spawned,
				input.playerBoard,
				input.playerEntity,
				null,
			);
		}
	},
};
