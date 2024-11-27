import { CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { SoCInput } from '../../../simulation/start-of-combat/start-of-combat-input';
import { modifyStats } from '../../../simulation/stats';
import { StartOfCombatCard } from '../../card.interface';

export const MisfitDragonling: StartOfCombatCard = {
	startOfCombat: (minion: BoardEntity, input: SoCInput) => {
		const multiplier = minion.cardId === CardIds.MisfitDragonling_BG29_814_G ? 2 : 1;
		const tier = input.playerEntity.tavernTier;
		const stats = multiplier * tier;
		modifyStats(minion, stats, stats, input.playerBoard, input.playerEntity, input.gameState);
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
