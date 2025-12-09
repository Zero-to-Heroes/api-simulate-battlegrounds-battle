import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { SoCInput } from '../../../simulation/start-of-combat/start-of-combat-input';
import { modifyStats } from '../../../simulation/stats';
import { StartOfCombatCard } from '../../card.interface';

export const CostumeEnthusiast: StartOfCombatCard = {
	cardIds: [CardIds.CostumeEnthusiast_BG34_142, CardIds.CostumeEnthusiast_BG34_142_G],
	startOfCombatTiming: 'start-of-combat',
	startOfCombat: (minion: BoardEntity, input: SoCInput): boolean => {
		const mult = minion.cardId === CardIds.CostumeEnthusiast_BG34_142_G ? 2 : 1;
		const target = input.playerEntity.hand
			.filter((e) => e.attack != null && !!e.cardId)
			.sort((a, b) => b.attack - a.attack)[0];
		if (!!target) {
			modifyStats(
				minion,
				minion,
				target.attack * mult,
				0,
				input.playerBoard,
				input.playerEntity,
				input.gameState,
			);
			input.gameState.spectator.registerPowerTarget(
				minion,
				minion,
				input.playerBoard,
				input.playerEntity,
				input.opponentEntity,
			);
		}

		return true;
	},
};
