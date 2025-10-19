import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { OnDespawnInput, OnSpawnInput } from '../../../simulation/add-minion-to-board';
import { RebornEffectInput } from '../../../simulation/reborn';
import { OnDespawnedCard, OnSpawnedCard, RebornSelfEffectCard } from '../../card.interface';

export const Malorne: RebornSelfEffectCard & OnDespawnedCard & OnSpawnedCard = {
	cardIds: [CardIds.Malorne_BG32_HERO_001_Buddy, CardIds.Malorne_BG32_HERO_001_Buddy_G],
	rebornSelfEffect: (minion: BoardEntity, input: RebornEffectInput) => {
		const mult = minion.cardId === CardIds.Malorne_BG32_HERO_001_Buddy_G ? 2 : 1;
		const totalGoldSpent = input.boardWithKilledMinionHero.globalInfo.GoldSpentThisGame;
		const baseBuff = Math.floor(totalGoldSpent / 3);
		minion.attack += baseBuff * mult;
		minion.health += baseBuff * mult;
	},
	onSpawned: (minion: BoardEntity, input: OnSpawnInput) => {
		const mult = minion.cardId === CardIds.Malorne_BG32_HERO_001_Buddy_G ? 2 : 1;
		const totalGoldSpent = input.hero.globalInfo.GoldSpentThisGame;
		const baseBuff = Math.floor(totalGoldSpent / 3);
		minion.attack += baseBuff * mult;
		minion.health += baseBuff * mult;
	},
	onDespawned: (minion: BoardEntity, input: OnDespawnInput) => {
		const mult = minion.cardId === CardIds.Malorne_BG32_HERO_001_Buddy_G ? 2 : 1;
		const totalGoldSpent = input.hero.globalInfo.GoldSpentThisGame;
		const baseBuff = Math.floor(totalGoldSpent / 3);
		minion.attack = Math.max(0, minion.attack - baseBuff * mult);
		minion.health = Math.max(1, minion.health - baseBuff * mult);
	},
};
