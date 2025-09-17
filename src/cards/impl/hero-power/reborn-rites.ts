import { CardIds } from '../../../services/card-ids';
import { BoardTrinket } from '../../../bgs-player-entity';
import { updateReborn } from '../../../keywords/reborn';
import { SoCInput } from '../../../simulation/start-of-combat/start-of-combat-input';
import { StartOfCombatCard } from '../../card.interface';

export const RebornRites: StartOfCombatCard = {
	// Confirmed to be pre-combat on 2024-03-06
	startOfCombatTiming: 'pre-combat',
	cardIds: [CardIds.RebornRites],
	startOfCombat: (trinket: BoardTrinket, input: SoCInput) => {
		for (const heroPower of input.playerEntity.heroPowers) {
			if (RebornRites.cardIds.includes(heroPower.cardId) && heroPower.used) {
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
