import { CardIds, Race } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { updateDivineShield } from '../../../keywords/divine-shield';
import { pickRandom } from '../../../services/utils';
import { SoCInput } from '../../../simulation/start-of-combat/start-of-combat-input';
import { modifyStats } from '../../../simulation/stats';
import { hasCorrectTribe } from '../../../utils';

export const AmberGuardian = {
	startOfCombat: (minion: BoardEntity, input: SoCInput) => {
		// First try to get a target without divine shield, and if none is available, pick one with divine shield
		const otherDragons = input.playerBoard
			.filter((e) =>
				hasCorrectTribe(
					e,
					input.playerEntity,
					Race.DRAGON,
					input.gameState.anomalies,
					input.gameState.allCards,
				),
			)
			.filter((e) => e.entityId !== minion.entityId);
		const loops = minion.cardId === CardIds.AmberGuardian_BG24_500_G ? 2 : 1;
		const dragonsToConsider = otherDragons;
		for (let i = 0; i < loops; i++) {
			const otherDragon =
				pickRandom(dragonsToConsider.filter((e) => !e.divineShield)) ?? pickRandom(dragonsToConsider);
			if (otherDragon) {
				if (!otherDragon.divineShield) {
					updateDivineShield(
						otherDragon,
						input.playerBoard,
						input.playerEntity,
						input.opponentEntity,
						true,
						input.gameState,
					);
				}
				modifyStats(otherDragon, minion, 2, 2, input.playerBoard, input.playerEntity, input.gameState);
				dragonsToConsider.splice(dragonsToConsider.indexOf(otherDragon), 1);
			}
		}
		return true;
	},
};
