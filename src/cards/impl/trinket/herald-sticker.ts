import { BoardTrinket } from '../../../bgs-player-entity';
import { processDeathrattleForMinion } from '../../../simulation/deathrattle-orchestration';
import { getValidDeathrattles } from '../../../simulation/deathrattle-utils';
import { SoCInput } from '../../../simulation/start-of-combat/start-of-combat-input';
import { TempCardIds } from '../../../temp-card-ids';
import { StartOfCombatCard } from '../../card.interface';

export const HeraldSticker: StartOfCombatCard = {
	cardIds: [TempCardIds.HeraldSticker],
	startOfCombat: (trinket: BoardTrinket, input: SoCInput) => {
		const candidates = getValidDeathrattles(input.playerBoard, input.playerEntity, input.gameState).slice(0, 2);
		for (const entity of candidates) {
			input.gameState.spectator.registerPowerTarget(
				trinket,
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
		return true;
	},
};
