import { CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { SoCInput } from '../../../simulation/start-of-combat/start-of-combat-input';
import { modifyStats } from '../../../simulation/stats';
import { StartOfCombatCard } from '../../card.interface';

export const Ultralisk: StartOfCombatCard = {
	cardIds: [CardIds.KerriganQueenOfBlades_UltraliskToken_BG31_HERO_811t10, CardIds.Ultralisk_BG31_HERO_811t10_G],
	startOfCombat: (minion: BoardEntity, input: SoCInput): boolean => {
		const multiplier = minion.cardId === CardIds.Ultralisk_BG31_HERO_811t10_G ? 3 : 2;
		modifyStats(
			minion,
			multiplier * minion.attack,
			multiplier * minion.health,
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
		return true;
	},
};
