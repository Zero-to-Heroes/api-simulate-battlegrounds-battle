import { BoardEntity } from '../../../board-entity';
import { OnDespawnInput, OnSpawnInput } from '../../../simulation/add-minion-to-board';
import { OnBattlecryTriggeredInput } from '../../../simulation/battlecries';
import { TempCardIds } from '../../../temp-card-ids';
import { OnBattlecryTriggeredCard, OnDespawnedCard, OnSpawnedCard } from '../../card.interface';

export const RecklessCliffdiver: OnSpawnedCard & OnDespawnedCard & OnBattlecryTriggeredCard = {
	onBattlecryTriggered: (minion: BoardEntity, input: OnBattlecryTriggeredInput) => {
		const mult = minion.cardId === TempCardIds.RecklessCliffdiver_G ? 2 : 1;
		minion.attack += mult * input.hero.globalInfo.BattlecriesTriggeredThisGame;
	},
	onSpawned: (minion: BoardEntity, input: OnSpawnInput) => {
		const mult = minion.cardId === TempCardIds.RecklessCliffdiver_G ? 2 : 1;
		minion.attack += mult * input.playerEntity.globalInfo.BattlecriesTriggeredThisGame;
	},
	onDespawned: (minion: BoardEntity, input: OnDespawnInput) => {
		const mult = minion.cardId === TempCardIds.RecklessCliffdiver_G ? 2 : 1;
		minion.attack = Math.max(0, minion.attack - 2 * mult);
	},
};
