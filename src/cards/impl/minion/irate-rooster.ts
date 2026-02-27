import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { dealDamageToMinion, getNeighbours } from '../../../simulation/attack';
import { SoCInput } from '../../../simulation/start-of-combat/start-of-combat-input';
import { modifyStats } from '../../../simulation/stats';
import { StartOfCombatCard } from '../../card.interface';

export const IrateRooster: StartOfCombatCard = {
	cardIds: [CardIds.IrateRooster_BG29_990, CardIds.IrateRooster_BG29_990_G],
	startOfCombat: (minion: BoardEntity, input: SoCInput) => {
		const loops = minion.cardId === CardIds.IrateRooster_BG29_990_G ? 2 : 1;
		for (let i = 0; i < loops; i++) {
			const neighbours = getNeighbours(input.playerBoard, minion);
			for (const neighbour of neighbours) {
				input.gameState.spectator.registerPowerTarget(
					minion,
					neighbour,
					input.playerBoard,
					input.playerEntity,
					input.opponentEntity,
				);
				dealDamageToMinion(
					neighbour,
					input.playerBoard,
					input.playerEntity,
					minion,
					1,
					input.opponentBoard,
					input.opponentEntity,
					input.gameState,
				);
				modifyStats(neighbour, minion, 4, 0, input.playerBoard, input.playerEntity, input.gameState);
			}
		}
		// If some minions are killed, this can cause the first attacker to change
		// 2026-02-27: https://replays.firestoneapp.com/?reviewId=4ead31ef-debb-465a-bc0b-9e17129990db&turn=13&action=1
		return { hasTriggered: true, shouldRecomputeCurrentAttacker: true };
	},
};
