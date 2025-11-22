import { BoardEntity } from '../../../board-entity';
import { updateDivineShield } from '../../../keywords/divine-shield';
import { updateTaunt } from '../../../keywords/taunt';
import { updateWindfury } from '../../../keywords/windfury';
import { CardIds } from '../../../services/card-ids';
import { pickRandom } from '../../../services/utils';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { DeathrattleSpawnCard } from '../../card.interface';

export const SpiritOfAir: DeathrattleSpawnCard = {
	cardIds: [CardIds.SpiritOfAir_TB_BaconShop_HERO_76_Buddy, CardIds.SpiritOfAir_TB_BaconShop_HERO_76_Buddy_G],
	deathrattleSpawn: (minion: BoardEntity, input: DeathrattleTriggeredInput) => {
		const mult = minion.cardId === CardIds.SpiritOfAir_TB_BaconShop_HERO_76_Buddy_G ? 2 : 1;
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
