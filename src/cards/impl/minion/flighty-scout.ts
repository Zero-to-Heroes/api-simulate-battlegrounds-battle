import { BoardEntity } from '../../../board-entity';
import { spawnEntities } from '../../../simulation/deathrattle-spawns';
import { performEntitySpawns } from '../../../simulation/spawns';
import { SoCInput } from '../../../simulation/start-of-combat/start-of-combat-input';
import { TempCardIds } from '../../../temp-card-ids';
import { copyEntity } from '../../../utils';
import { StartOfCombatFromHandCard } from '../../card.interface';

export const FlightyScout: StartOfCombatFromHandCard = {
	cardIds: [TempCardIds.FlightyScout, TempCardIds.FlightyScout_G],
	startOfCombatFromHand: true,
	startOfCombat: (minion: BoardEntity, input: SoCInput) => {
		if (!input.playerEntity.hand.includes(minion)) {
			return { hasTriggered: false, shouldRecomputeCurrentAttacker: false };
		}

		const copy = copyEntity(minion);
		if (minion.cardId === TempCardIds.FlightyScout_G) {
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

		return { hasTriggered: true, shouldRecomputeCurrentAttacker: false };
	},
};
