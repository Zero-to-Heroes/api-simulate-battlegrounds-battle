import { BoardTrinket } from '../../../bgs-player-entity';
import { SoCInput } from '../../../simulation/start-of-combat/start-of-combat-input';

export const RebornRites = {
	startOfCombat: (trinket: BoardTrinket, input: SoCInput) => {
		if (input.playerEntity.heroPowerUsed) {
			const targetEntityId = input.playerEntity.heroPowerInfo as number;
			const target = input.playerBoard.find((entity) => entity.entityId === targetEntityId);
			if (!target || target.reborn) {
				return false;
			}

			target.reborn = true;
			input.gameState.spectator.registerPowerTarget(
				input.playerEntity,
				target,
				input.playerBoard,
				input.playerEntity,
				input.opponentEntity,
			);
			return true;
		}
	},
};