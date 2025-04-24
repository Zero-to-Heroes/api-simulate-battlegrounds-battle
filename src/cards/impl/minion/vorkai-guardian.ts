import { BoardEntity } from '../../../board-entity';
import { updateDivineShield } from '../../../keywords/divine-shield';
import { getNeighbours } from '../../../simulation/attack';
import { SoCInput } from '../../../simulation/start-of-combat/start-of-combat-input';
import { TempCardIds } from '../../../temp-card-ids';
import { StartOfCombatCard } from '../../card.interface';

export const VorkaiGuardian: StartOfCombatCard = {
	cardIds: [TempCardIds.VorkaiGuardian, TempCardIds.VorkaiGuardian_G],
	startOfCombat: (minion: BoardEntity, input: SoCInput) => {
		const minionsWithDivineShield = input.playerBoard.filter((e) => e.divineShield);
		if (minionsWithDivineShield.length > 0) {
			return false;
		}
		const neighbours = getNeighbours(input.playerBoard, minion);
		neighbours.forEach((neighbour) => {
			updateDivineShield(
				neighbour,
				input.playerBoard,
				input.playerEntity,
				input.opponentEntity,
				true,
				input.gameState,
			);
		});
	},
};
