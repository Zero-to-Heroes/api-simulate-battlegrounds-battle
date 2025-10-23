import { CardIds } from '../../../services/card-ids';
import { BoardEntity } from '../../../board-entity';
import { SoCInput } from '../../../simulation/start-of-combat/start-of-combat-input';
import { modifyStats, multiplyStats, setEntityStats } from '../../../simulation/stats';
import { StartOfCombatCard } from '../../card.interface';
import { applyAurasToSelf, removeAurasFromSelf } from '../../../simulation/add-minion-to-board';

export const CorruptedMyrmidon: StartOfCombatCard = {
	cardIds: [CardIds.CorruptedMyrmidon_BG23_012, CardIds.CorruptedMyrmidon_BG23_012_G],
	startOfCombat: (minion: BoardEntity, input: SoCInput) => {
		// We add these stats
		const multiplier = minion.cardId === CardIds.CorruptedMyrmidon_BG23_012_G ? 3 : 2;
		multiplyStats(minion, multiplier, input.playerBoard, input.playerEntity, input.gameState);
		return true;
	},
};
