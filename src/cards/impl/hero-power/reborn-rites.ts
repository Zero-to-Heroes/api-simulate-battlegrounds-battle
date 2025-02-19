import { BoardTrinket } from '../../../bgs-player-entity';
import { updateReborn } from '../../../keywords/reborn';
import { SoCInput } from '../../../simulation/start-of-combat/start-of-combat-input';
import { StartOfCombatCard } from '../../card.interface';

export const RebornRites: StartOfCombatCard = {
	startOfCombatTiming: 'pre-combat',
	startOfCombat: (trinket: BoardTrinket, input: SoCInput) => {
		for (const heroPower of input.playerEntity.heroPowers) {
			if (heroPower.used) {
				const targetEntityId = heroPower.info as number;
				const target = input.playerBoard.find((entity) => entity.entityId === targetEntityId);
				if (!target || target.reborn) {
					return false;
				}

				updateReborn(
					target,
					true,
					input.playerBoard,
					input.playerEntity,
					input.opponentEntity,
					input.gameState,
				);
				input.gameState.spectator.registerPowerTarget(
					input.playerEntity,
					target,
					input.playerBoard,
					input.playerEntity,
					input.opponentEntity,
				);
				return true;
			}
		}
	},
};
