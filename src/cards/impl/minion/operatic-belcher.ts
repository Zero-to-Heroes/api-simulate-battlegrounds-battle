import { CardIds } from '../../../services/card-ids';
import { Race } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { updateVenomous } from '../../../keywords/venomous';
import { pickRandom } from '../../../services/utils';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { hasCorrectTribe } from '../../../utils';
import { DeathrattleSpawnCard } from '../../card.interface';

export const OperaticBelcher: DeathrattleSpawnCard = {
	cardIds: [CardIds.OperaticBelcher_BG26_888, CardIds.OperaticBelcher_BG26_888_G],
	deathrattleSpawn: (minion: BoardEntity, input: DeathrattleTriggeredInput) => {
		const belcherMultiplier = minion.cardId === CardIds.OperaticBelcher_BG26_888_G ? 2 : 1;
		for (let j = 0; j < belcherMultiplier; j++) {
			const possibleBelcherTargets = input.boardWithDeadEntity
				.filter((entity) => !entity.venomous)
				.filter((entity) => !entity.poisonous)
				.filter((entity) => entity.health > 0 && !entity.definitelyDead)
				.filter((entity) =>
					hasCorrectTribe(
						entity,
						input.boardWithDeadEntityHero,
						Race.MURLOC,
						input.gameState.anomalies,
						input.gameState.allCards,
					),
				);
			if (possibleBelcherTargets.length > 0) {
				const chosen = pickRandom(possibleBelcherTargets);
				updateVenomous(
					chosen,
					true,
					input.boardWithDeadEntity,
					input.boardWithDeadEntityHero,
					input.otherBoardHero,
					input.gameState,
				);
				input.gameState.spectator.registerPowerTarget(
					minion,
					chosen,
					input.boardWithDeadEntity,
					input.boardWithDeadEntityHero,
					input.otherBoardHero,
				);
			}
		}
		return [];
	},
};
