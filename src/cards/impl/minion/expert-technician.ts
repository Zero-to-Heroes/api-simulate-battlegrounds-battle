import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { doFullAttack } from '../../../simulation/attack';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { DeathrattleSpawnCard } from '../../card.interface';

export const ExpertTechnician: DeathrattleSpawnCard = {
	cardIds: [CardIds.ExpertTechnician_BG33_370, CardIds.ExpertTechnician_BG33_370_G],
	deathrattleSpawn: (minion: BoardEntity, input: DeathrattleTriggeredInput) => {
		const loops = minion.cardId === CardIds.ExpertTechnician_BG33_370_G ? 2 : 1;
		// Only works when it was killed
		if (minion.health > 0 && !minion.definitelyDead) {
			return null;
		}

		for (let i = 0; i < loops; i++) {
			const newAttacker = input.boardWithDeadEntity.filter((e) => e.health > 0 && !e.definitelyDead)[0];
			const newTarget = input.deadEntity.lastAffectedByEntity;
			if (!newAttacker?.attack || !newTarget || newTarget.health <= 0 || newTarget.definitelyDead) {
				continue;
			}

			const previousHasAttacked = minion.hasAttacked;
			const previousWindfury = minion.windfury;
			newAttacker.attackImmediately = true;
			newAttacker.windfury = false;
			doFullAttack(
				newAttacker,
				input.boardWithDeadEntity,
				input.boardWithDeadEntityHero,
				newTarget,
				input.otherBoard,
				input.otherBoardHero,
				input.gameState,
			);
			// simulateAttack(
			// 	input.boardWithDeadEntity,
			// 	input.boardWithDeadEntityHero,
			// 	input.otherBoard,
			// 	input.otherBoardHero,
			// 	input.gameState,
			// );
			newAttacker.hasAttacked = previousHasAttacked;
			newAttacker.attackImmediately = false;
			newAttacker.windfury = previousWindfury;
		}
		return null;
	},
};
