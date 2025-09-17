import { CardIds } from '../../../services/card-ids';
import { BoardEntity } from '../../../board-entity';
import { SoCInput } from '../../../simulation/start-of-combat/start-of-combat-input';
import { modifyStats } from '../../../simulation/stats';
import { StartOfCombatCard } from '../../card.interface';

export const MisfitDragonling: StartOfCombatCard = {
	cardIds: [CardIds.MisfitDragonling_BG29_814, CardIds.MisfitDragonling_BG29_814_G],
	startOfCombat: (minion: BoardEntity, input: SoCInput) => {
		const multiplier = minion.cardId === CardIds.MisfitDragonling_BG29_814_G ? 2 : 1;
		const tier = input.playerEntity.tavernTier;
		const stats = multiplier * tier;
		modifyStats(minion, minion, stats, stats, input.playerBoard, input.playerEntity, input.gameState);
		return true;
	},
};
