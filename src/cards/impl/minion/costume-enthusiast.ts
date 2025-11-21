import { BoardEntity } from '../../../board-entity';
import { SoCInput } from '../../../simulation/start-of-combat/start-of-combat-input';
import { modifyStats } from '../../../simulation/stats';
import { TempCardIds } from '../../../temp-card-ids';
import { StartOfCombatCard } from '../../card.interface';

export const CostumeEnthusiast: StartOfCombatCard = {
	cardIds: [TempCardIds.CostumeEnthusiast, TempCardIds.CostumeEnthusiast_G],
	startOfCombatTiming: 'start-of-combat',
	startOfCombat: (minion: BoardEntity, input: SoCInput): boolean => {
		const mult = minion.cardId === TempCardIds.CostumeEnthusiast_G ? 2 : 1;
		const target = input.playerEntity.hand
			.filter((e) => e.attack != null && !!e.cardId)
			.sort((a, b) => b.attack - a.attack)[0];
		if (!!target) {
			modifyStats(
				minion,
				minion,
				target.attack * mult,
				target.health * mult,
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
