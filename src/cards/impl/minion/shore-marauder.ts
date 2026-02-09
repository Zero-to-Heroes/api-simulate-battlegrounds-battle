import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { OnDespawnInput, OnSpawnInput } from '../../../simulation/add-minion-to-board';
import { OnDespawnedCard, OnSpawnedCard } from '../../card.interface';

export const ShoreMarauder: OnSpawnedCard & OnDespawnedCard = {
	cardIds: [CardIds.ShoreMarauder_BG34_502, CardIds.ShoreMarauder_BG34_502_G],
	onSpawned: (minion: BoardEntity, input: OnSpawnInput) => {
		const mult = minion.cardId === CardIds.ShoreMarauder_BG34_502_G ? 2 : 1;
		input.hero.globalInfo.ElementalAttackBuff += 1 * mult;
		input.hero.globalInfo.ElementalHealthBuff += 1 * mult;
		input.hero.globalInfo.PirateAttackBuff += 1 * mult;
		input.hero.globalInfo.PirateHealthBuff += 1 * mult;
		return true;
	},
	onDespawned: (minion: BoardEntity, input: OnDespawnInput) => {
		const mult = minion.cardId === CardIds.ShoreMarauder_BG34_502_G ? 2 : 1;
		input.hero.globalInfo.ElementalAttackBuff -= 1 * mult;
		input.hero.globalInfo.ElementalHealthBuff -= 1 * mult;
		input.hero.globalInfo.PirateAttackBuff -= 1 * mult;
		input.hero.globalInfo.PirateHealthBuff -= 1 * mult;
		return true;
	},
};
