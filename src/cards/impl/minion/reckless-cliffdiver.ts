import { CardIds } from '../../../services/card-ids';
import { BoardEntity } from '../../../board-entity';
import { OnDespawnInput, OnSpawnInput } from '../../../simulation/add-minion-to-board';
import { OnBattlecryTriggeredInput } from '../../../simulation/battlecries';
import { OnBattlecryTriggeredCard, OnDespawnedCard, OnSpawnedCard } from '../../card.interface';

export const RecklessCliffdiver: OnSpawnedCard & OnDespawnedCard & OnBattlecryTriggeredCard = {
	cardIds: [CardIds.RecklessCliffdiver_BG31_142, CardIds.RecklessCliffdiver_BG31_142_G],
	onBattlecryTriggered: (minion: BoardEntity, input: OnBattlecryTriggeredInput) => {
		const mult = minion.cardId === CardIds.RecklessCliffdiver_BG31_142_G ? 2 : 1;
		minion.attack += mult * input.hero.globalInfo.BattlecriesTriggeredThisGame;
	},
	onSpawned: (minion: BoardEntity, input: OnSpawnInput) => {
		const mult = minion.cardId === CardIds.RecklessCliffdiver_BG31_142_G ? 2 : 1;
		minion.attack += mult * input.hero.globalInfo.BattlecriesTriggeredThisGame;
	},
	onDespawned: (minion: BoardEntity, input: OnDespawnInput) => {
		const mult = minion.cardId === CardIds.RecklessCliffdiver_BG31_142_G ? 2 : 1;
		minion.attack = Math.max(0, minion.attack - 2 * mult);
	},
};
