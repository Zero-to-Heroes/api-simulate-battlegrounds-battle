import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { simulateAttack } from '../../../simulation/attack';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { DeathrattleSpawnCard } from '../../card.interface';

export const ExpertTechnician: DeathrattleSpawnCard = {
	cardIds: [CardIds.ExpertTechnician_BG33_370, CardIds.ExpertTechnician_BG33_370_G],
	deathrattleSpawn: (minion: BoardEntity, input: DeathrattleTriggeredInput) => {
		const loops = minion.cardId === CardIds.ExpertTechnician_BG33_370_G ? 2 : 1;
		for (let i = 0; i < loops; i++) {
			const target = input.boardWithDeadEntity.filter((e) => e.health > 0 && !e.definitelyDead)[0];
			if (!target) {
				continue;
			}

			const previousHasAttacked = minion.hasAttacked;
			const previousWindfury = minion.windfury;
			target.attackImmediately = true;
			target.windfury = false;
			simulateAttack(
				input.boardWithDeadEntity,
				input.boardWithDeadEntityHero,
				input.otherBoard,
				input.otherBoardHero,
				input.gameState,
			);
			target.hasAttacked = previousHasAttacked;
			target.attackImmediately = false;
			target.windfury = previousWindfury;
		}
		return null;
	},
};
