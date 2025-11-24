import { BoardEntity } from '../../../board-entity';
import { processDeathrattleForMinion } from '../../../simulation/deathrattle-orchestration';
import { getValidDeathrattles } from '../../../simulation/deathrattle-utils';
import { SoCInput } from '../../../simulation/start-of-combat/start-of-combat-input';
import { TempCardIds } from '../../../temp-card-ids';
import { StartOfCombatCard } from '../../card.interface';

export const TimewarpedHawkstrider: StartOfCombatCard = {
	cardIds: [TempCardIds.TimewarpedHawkstrider, TempCardIds.TimewarpedHawkstrider_G],
	startOfCombatTiming: 'start-of-combat',
	startOfCombat: (minion: BoardEntity, input: SoCInput) => {
		const multiplier = minion.cardId === TempCardIds.TimewarpedHawkstrider_G ? 2 : 1;
		const candidates = getValidDeathrattles(input.playerBoard, input.playerEntity, input.gameState);
		for (const entity of candidates) {
			for (let i = 0; i < multiplier; i++) {
				input.gameState.spectator.registerPowerTarget(
					minion,
					entity,
					input.playerBoard,
					input.playerEntity,
					input.opponentEntity,
				);
				const board = entity.friendly
					? input.gameState.gameState.player.board
					: input.gameState.gameState.opponent.board;
				const indexFromRight = board.length - (board.indexOf(entity) + 1);
				processDeathrattleForMinion(
					entity,
					indexFromRight,
					[entity],
					entity.friendly ? input.gameState.gameState.player : input.gameState.gameState.opponent,
					entity.friendly ? input.gameState.gameState.opponent : input.gameState.gameState.player,
					input.gameState,
					false,
				);
			}
		}
		return true;
	},
};
