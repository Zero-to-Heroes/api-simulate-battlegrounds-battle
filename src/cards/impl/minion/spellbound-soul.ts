import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { OnDespawnInput, OnSpawnInput } from '../../../simulation/add-minion-to-board';
import { OnDespawnedCard, OnSpawnedCard } from '../../card.interface';

export const SpellboundSoul: OnDespawnedCard & OnSpawnedCard = {
	cardIds: [CardIds.SpellboundSoul_BG34_110, CardIds.SpellboundSoul_BG34_110_G],
	onSpawned: (minion: BoardEntity, input: OnSpawnInput) => {
		const mult = minion.cardId === CardIds.SpellboundSoul_BG34_110_G ? 2 : 1;
		const totalSpellsCast = input.hero.globalInfo.SpellsCastThisGame;
		minion.attack += 2 * totalSpellsCast * mult;
		minion.health += 1 * totalSpellsCast * mult;
	},
	onDespawned: (minion: BoardEntity, input: OnDespawnInput) => {
		const mult = minion.cardId === CardIds.SpellboundSoul_BG34_110_G ? 2 : 1;
		const totalSpellsCast = input.hero.globalInfo.SpellsCastThisGame;
		minion.attack = Math.max(0, minion.attack - 2 * totalSpellsCast * mult);
		minion.health = Math.max(1, minion.health - 1 * totalSpellsCast * mult);
	},
};
