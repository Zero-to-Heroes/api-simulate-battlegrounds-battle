import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { OnDespawnInput, OnSpawnInput } from '../../../simulation/add-minion-to-board';
import { OnDespawnedCard, OnSpawnedCard } from '../../card.interface';

export const TimewarpedSwirler: OnSpawnedCard & OnDespawnedCard = {
	cardIds: [CardIds.TimewarpedSwirler_BG34_Giant_686, CardIds.TimewarpedSwirler_BG34_Giant_686_G],
	onSpawned: (minion: BoardEntity, input: OnSpawnInput) => {
		const mult = minion.cardId === CardIds.TimewarpedSwirler_BG34_Giant_686_G ? 2 : 1;
		input.hero.globalInfo.ElementalAttackBuff += 3 * mult;
		input.hero.globalInfo.ElementalHealthBuff += 3 * mult;
		return true;
	},
	onDespawned: (minion: BoardEntity, input: OnDespawnInput) => {
		const mult = minion.cardId === CardIds.TimewarpedSwirler_BG34_Giant_686_G ? 2 : 1;
		input.hero.globalInfo.ElementalAttackBuff -= 3 * mult;
		input.hero.globalInfo.ElementalHealthBuff -= 3 * mult;
		return true;
	},
};
