import { Race, ReferenceCard } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { Mutable, pickMultipleRandomDifferent } from '../../../services/utils';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { magnetizeToTarget } from '../../../simulation/magnetize';
import { hasCorrectTribe } from '../../../utils';
import { DeathrattleSpawnCard } from '../../card.interface';

export const ApexisGuardian: DeathrattleSpawnCard = {
	cardIds: [CardIds.ApexisGuardian_BG34_173, CardIds.ApexisGuardian_BG34_173_G],
	deathrattleSpawn: (minion: BoardEntity, input: DeathrattleTriggeredInput) => {
		const loops = minion.cardId === CardIds.ApexisGuardian_BG34_173_G ? 2 : 1;
		const possibleTargets = input.boardWithDeadEntity.filter(
			(e) =>
				e.health > 0 &&
				!e.definitelyDead &&
				e !== minion &&
				hasCorrectTribe(
					e,
					input.boardWithDeadEntityHero,
					Race.MECH,
					input.gameState.anomalies,
					input.gameState.allCards,
				),
		);
		const targets = pickMultipleRandomDifferent(possibleTargets, 3);
		for (const target of targets) {
			for (let j = 0; j < loops; j++) {
				const cardToMagnetize: Mutable<ReferenceCard> = {
					...input.gameState.allCards.getCard(CardIds.AutoAccelerator_GreenVolumizerToken_BG34_170t3),
				};
				cardToMagnetize.attack = 0;
				cardToMagnetize.health = 0;
				input.gameState.spectator.registerPowerTarget(
					minion,
					target,
					input.boardWithDeadEntity,
					input.boardWithDeadEntityHero,
					input.otherBoardHero,
				);
				magnetizeToTarget(
					target,
					minion,
					cardToMagnetize,
					input.boardWithDeadEntity,
					input.boardWithDeadEntityHero,
					input.otherBoard,
					input.otherBoardHero,
					input.gameState,
				);
			}
		}
		return [];
	},
};
