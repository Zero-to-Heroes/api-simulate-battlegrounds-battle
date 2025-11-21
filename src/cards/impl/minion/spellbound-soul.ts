import { BoardEntity } from '../../../board-entity';
import { OnDespawnInput, OnSpawnInput } from '../../../simulation/add-minion-to-board';
import { TempCardIds } from '../../../temp-card-ids';
import { OnDespawnedCard, OnSpawnedCard } from '../../card.interface';

export const SpellboundSoul: OnDespawnedCard & OnSpawnedCard = {
	cardIds: [TempCardIds.SpellboundSoul, TempCardIds.SpellboundSoul_G],
	onSpawned: (minion: BoardEntity, input: OnSpawnInput) => {
		const mult = minion.cardId === TempCardIds.SpellboundSoul_G ? 2 : 1;
		const totalSpellsCast = input.hero.globalInfo.SpellsCastThisGame;
		minion.attack += 2 * totalSpellsCast * mult;
		minion.health += 1 * totalSpellsCast * mult;
	},
	onDespawned: (minion: BoardEntity, input: OnDespawnInput) => {
		const mult = minion.cardId === TempCardIds.SpellboundSoul_G ? 2 : 1;
		const totalSpellsCast = input.hero.globalInfo.SpellsCastThisGame;
		minion.attack = Math.max(0, minion.attack - 2 * totalSpellsCast * mult);
		minion.health = Math.max(1, minion.health - 1 * totalSpellsCast * mult);
	},
};
