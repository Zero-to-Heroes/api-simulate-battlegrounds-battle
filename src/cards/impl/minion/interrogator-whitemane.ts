import { CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { pickRandom } from '../../../services/utils';
import { Spectator } from '../../../simulation/spectator/spectator';
import { SoCInput } from '../../../simulation/start-of-combat/start-of-combat-input';

export const InterrogatorWhitemane = {
	startOfCombat: (minion: BoardEntity, input: SoCInput) => {
		if (input.opponentBoard.length > 0) {
			const validTargets = input.opponentBoard.filter(
				(e) => input.gameState.cardsData.getTavernLevel(e.cardId) >= 5,
			);
			const numberOfPicks = minion.cardId === CardIds.InterrogatorWhitemane_BG24_704_G ? 2 : 1;
			for (let i = 0; i < numberOfPicks; i++) {
				const target = pickRandom(validTargets);
				if (!!target) {
					castImpure(target, minion, input.playerBoard, input.gameState.spectator);
					const targetIndex = validTargets.findIndex((e) => e.entityId === target.entityId);
					validTargets.splice(targetIndex, 1);
				}
			}
		}
		return true;
	},
};

const castImpure = (entity: BoardEntity, source: BoardEntity, board: BoardEntity[], spectator: Spectator) => {
	if (!entity) {
		return;
	}
	const multiplier = source.cardId === CardIds.InterrogatorWhitemane_BG24_704_G ? 3 : 2;
	entity.taunt = true;
	entity.damageMultiplier = entity.damageMultiplier ?? 1;
	entity.damageMultiplier *= multiplier;
	spectator.registerPowerTarget(source, entity, board, null, null);
};
