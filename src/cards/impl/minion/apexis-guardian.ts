import { ReferenceCard } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { Mutable, pickRandom } from '../../../services/utils';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { magnetizeToTarget } from '../../../simulation/magnetize';
import { TempCardIds } from '../../../temp-card-ids';
import { DeathrattleSpawnCard } from '../../card.interface';

export const ApexisGuardian: DeathrattleSpawnCard = {
	cardIds: [TempCardIds.ApexisGuardian, TempCardIds.ApexisGuardian_G],
	deathrattleSpawn: (minion: BoardEntity, input: DeathrattleTriggeredInput) => {
		const loops = minion.cardId === TempCardIds.ApexisGuardian_G ? 2 : 1;
		const possibleTargets = input.boardWithDeadEntity.filter(
			(e) => e.health > 0 && !e.definitelyDead && e !== minion,
		);
		for (let i = 0; i < possibleTargets.length; i++) {
			const target = pickRandom(possibleTargets);
			if (target) {
				for (let j = 0; j < loops; j++) {
					const cardToMagnetize: Mutable<ReferenceCard> = {
						...input.gameState.allCards.getCard(TempCardIds.GreenVolumizer),
					};
					cardToMagnetize.attack = 0;
					cardToMagnetize.health = 0;
					magnetizeToTarget(
						target,
						minion,
						cardToMagnetize,
						input.boardWithDeadEntity,
						input.boardWithDeadEntityHero,
						input.gameState,
					);
				}
			}
		}
		return [];
	},
};
