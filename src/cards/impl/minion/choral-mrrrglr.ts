import { CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { SoCInput } from '../../../simulation/start-of-combat/start-of-combat-input';
import { modifyStats } from '../../../simulation/stats';

export const ChoralMrrrglr = {
	startOfCombat: (minion: BoardEntity, input: SoCInput) => {
		const multiplier = minion.cardId === CardIds.ChoralMrrrglr_BG26_354_G ? 2 : 1;
		modifyStats(
			minion,
			multiplier * input.playerEntity.globalInfo?.ChoralAttackBuff,
			multiplier * input.playerEntity.globalInfo?.ChoralHealthBuff,
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
