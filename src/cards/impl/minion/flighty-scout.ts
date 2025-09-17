import { CardIds } from '../../../services/card-ids';
import { BoardEntity } from '../../../board-entity';
import { spawnEntities } from '../../../simulation/deathrattle-spawns';
import { performEntitySpawns } from '../../../simulation/spawns';
import { SoCInput } from '../../../simulation/start-of-combat/start-of-combat-input';
import { copyEntity } from '../../../utils';
import { StartOfCombatFromHandCard } from '../../card.interface';

export const FlightyScout: StartOfCombatFromHandCard = {
	cardIds: [CardIds.FlightyScout_BG32_330, CardIds.FlightyScout_BG32_330_G],
	startOfCombatFromHand: true,
	startOfCombat: (minion: BoardEntity, input: SoCInput) => {
		if (!input.playerEntity.hand.includes(minion) || minion.locked) {
			return { hasTriggered: false, shouldRecomputeCurrentAttacker: false };
		}

		const copy = copyEntity(minion);
		if (minion.cardId === CardIds.FlightyScout_BG32_330_G) {
			copy.attack = 2 * copy.attack;
			copy.health = 2 * copy.health;
		}

		const newMinions = spawnEntities(
			copy.cardId,
			1,
			input.playerBoard,
			input.playerEntity,
			input.opponentBoard,
			input.opponentEntity,
			input.gameState,
			input.playerEntity.friendly,
			false,
			false,
			false,
			copy,
		);
		const spawns = performEntitySpawns(
			newMinions,
			input.playerBoard,
			input.playerEntity,
			minion,
			0,
			input.opponentBoard,
			input.opponentEntity,
			input.gameState,
		);

		// This is a bug, it should recompute the first attacker
		return { hasTriggered: true, shouldRecomputeCurrentAttacker: false };
	},
};
