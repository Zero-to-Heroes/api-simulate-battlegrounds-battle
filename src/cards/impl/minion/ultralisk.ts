import { CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { SoCInput } from '../../../simulation/start-of-combat/start-of-combat-input';
import { modifyStats } from '../../../simulation/stats';
import { StartOfCombatCard } from '../../card.interface';

export const Ultralisk: StartOfCombatCard = {
	cardIds: [CardIds.KerriganQueenOfBlades_UltraliskToken_BG31_HERO_811t10, CardIds.Ultralisk_BG31_HERO_811t10_G],
	startOfCombat: (minion: BoardEntity, input: SoCInput): boolean => {
		// We add the stats, so mults are -1
		const multiplier = minion.cardId === CardIds.Ultralisk_BG31_HERO_811t10_G ? 2 : 1;
		modifyStats(
			minion,
			minion,
			multiplier * minion.attack,
			multiplier * minion.health,
			input.playerBoard,
			input.playerEntity,
			input.gameState,
		);
		return true;
	},
};
