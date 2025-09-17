import { CardIds } from '../../../services/card-ids';
import { BoardEntity } from '../../../board-entity';
import { OnDespawnInput, OnSpawnInput } from '../../../simulation/add-minion-to-board';
import { OnDespawnedCard, OnSpawnedCard } from '../../card.interface';

export const Humongozz: OnSpawnedCard & OnDespawnedCard = {
	cardIds: [CardIds.Humongozz_BG32_341, CardIds.Humongozz_BG32_341_G],
	onSpawned: (minion: BoardEntity, input: OnSpawnInput) => {
		const mult = minion.cardId === CardIds.Humongozz_BG32_341_G ? 2 : 1;
		input.hero.globalInfo.TavernSpellAttackBuff += 1 * mult;
		input.hero.globalInfo.TavernSpellHealthBuff += 2 * mult;
	},
	onDespawned: (minion: BoardEntity, input: OnDespawnInput) => {
		const mult = minion.cardId === CardIds.Humongozz_BG32_341_G ? 2 : 1;
		input.hero.globalInfo.TavernSpellAttackBuff -= 1 * mult;
		input.hero.globalInfo.TavernSpellHealthBuff -= 2 * mult;
	},
};
