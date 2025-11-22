import { BoardEntity } from '../../../board-entity';
import { updateDivineShield } from '../../../keywords/divine-shield';
import { updateTaunt } from '../../../keywords/taunt';
import { updateWindfury } from '../../../keywords/windfury';
import { pickRandom } from '../../../services/utils';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { TempCardIds } from '../../../temp-card-ids';
import { DeathrattleSpawnCard } from '../../card.interface';

export const TimewarpedSpiritOfAir: DeathrattleSpawnCard = {
	cardIds: [TempCardIds.TimewarpedSpiritOfAir, TempCardIds.TimewarpedSpiritOfAir_G],
	deathrattleSpawn: (minion: BoardEntity, input: DeathrattleTriggeredInput) => {
		const mult = minion.cardId === TempCardIds.TimewarpedSpiritOfAir_G ? 2 : 1;
		for (let j = 0; j < mult; j++) {
			let validTargets = input.boardWithDeadEntity.filter((entity) => !entity.divineShield);
			if (!validTargets?.length) {
				validTargets = input.boardWithDeadEntity.filter((entity) => !entity.taunt);
				if (!validTargets?.length) {
					validTargets = input.boardWithDeadEntity.filter((entity) => !entity.windfury);
				}
			}
			const target = pickRandom(validTargets);
			if (target) {
				if (!target.divineShield) {
					updateDivineShield(
						target,
						input.boardWithDeadEntity,
						input.boardWithDeadEntityHero,
						input.otherBoardHero,
						true,
						input.gameState,
					);
				}
				updateTaunt(
					target,
					true,
					input.boardWithDeadEntity,
					input.boardWithDeadEntityHero,
					input.otherBoardHero,
					input.gameState,
				);
				updateWindfury(
					target,
					true,
					input.boardWithDeadEntity,
					input.boardWithDeadEntityHero,
					input.otherBoardHero,
					input.gameState,
				);
				input.gameState.spectator.registerPowerTarget(
					minion,
					target,
					input.boardWithDeadEntity,
					input.boardWithDeadEntityHero,
					input.otherBoardHero,
				);
			}
		}
		return [];
	},
};
