import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { getNeighbours } from '../../../simulation/attack';
import { SoCInput } from '../../../simulation/start-of-combat/start-of-combat-input';
import { modifyStats } from '../../../simulation/stats';
import { StartOfCombatCard } from '../../card.interface';

export const TimewarpedImmortal: StartOfCombatCard = {
	cardIds: [CardIds.TimewarpedImmortal_BG34_Giant_597, CardIds.TimewarpedImmortal_BG34_Giant_597_G],
	startOfCombat: (minion: BoardEntity, input: SoCInput) => {
		const multiplier = minion.cardId === CardIds.TimewarpedImmortal_BG34_Giant_597_G ? 2 : 1;
		const neighbours = getNeighbours(input.playerBoard, minion);
		const neighboursAttack = neighbours.map((entity) => entity.attack).reduce((a, b) => a + b, 0);
		const neighboursHealth = neighbours.map((entity) => entity.health).reduce((a, b) => a + b, 0);
		modifyStats(
			minion,
			minion,
			multiplier * neighboursAttack,
			multiplier * neighboursHealth,
			input.playerBoard,
			input.playerEntity,
			input.gameState,
		);
		return true;
	},
};
