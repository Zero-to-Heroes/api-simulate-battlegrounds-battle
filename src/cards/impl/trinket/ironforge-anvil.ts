import { BoardTrinket } from '../../../bgs-player-entity';
import { SoCInput } from '../../../simulation/start-of-combat/start-of-combat-input';
import { setEntityStats } from '../../../simulation/stats';
import { getEffectiveTribesForEntity } from '../../../utils';

export const IronforgeAnvil = {
	startOfCombat: (trinket: BoardTrinket, input: SoCInput) => {
		if (input.playerBoard.length > 0) {
			const candidates = input.playerBoard.filter((e) => {
				const tribes = getEffectiveTribesForEntity(
					e,
					input.playerEntity,
					input.gameState.anomalies,
					input.gameState.allCards,
				);
				return tribes.length === 0;
			});
			if (candidates.length > 0) {
				candidates.forEach((entity) => {
					setEntityStats(
						entity,
						3 * entity.attack,
						3 * entity.health,
						input.playerBoard,
						input.playerEntity,
						input.gameState,
					);
					input.gameState.spectator.registerPowerTarget(trinket, entity, input.playerBoard, null, null);
				});
				return true;
			}
		}
	},
};
