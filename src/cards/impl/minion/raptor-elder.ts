import { Race } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { OnDespawnInput, OnOtherSpawnInput, OnSpawnInput } from '../../../simulation/add-minion-to-board';
import { TempCardIds } from '../../../temp-card-ids';
import { hasCorrectTribe } from '../../../utils';
import { OnDespawnedCard, OnOtherSpawnedCard, OnSpawnedCard } from '../../card.interface';

const attackBuff = 1;
const healthBuff = 1;

export const RaptorElder: OnSpawnedCard & OnOtherSpawnedCard & OnDespawnedCard = {
	cardIds: [TempCardIds.RaptorElder, TempCardIds.RaptorElder_G],
	onSpawned: (minion: BoardEntity, input: OnSpawnInput) => {
		const mult = minion.cardId === TempCardIds.RaptorElder_G ? 2 : 1;
		const baseBuff = input.hero.globalInfo.BeastsSummonedThisCombat * mult;
		const targets = input.board
			.filter((e) => e !== minion)
			.filter((e) =>
				hasCorrectTribe(e, input.hero, Race.BEAST, input.gameState.anomalies, input.gameState.allCards),
			);
		for (const target of targets) {
			target.attack += attackBuff * baseBuff;
			target.health += healthBuff * baseBuff;
		}
	},
	onDespawned: (minion: BoardEntity, input: OnDespawnInput) => {
		const mult = minion.cardId === TempCardIds.RaptorElder_G ? 2 : 1;
		const baseBuff = input.hero.globalInfo.BeastsSummonedThisCombat * mult;
		const targets = input.board
			.filter((e) => e !== minion)
			.filter((e) =>
				hasCorrectTribe(e, input.hero, Race.BEAST, input.gameState.anomalies, input.gameState.allCards),
			);
		for (const target of targets) {
			target.attack = Math.max(0, target.attack - attackBuff * baseBuff);
			target.health = Math.max(1, target.health - healthBuff * baseBuff);
		}
	},
	onOtherSpawned: (minion: BoardEntity, input: OnOtherSpawnInput) => {
		if (
			!hasCorrectTribe(input.spawned, input.hero, Race.BEAST, input.gameState.anomalies, input.gameState.allCards)
		) {
			return;
		}
		const mult = minion.cardId === TempCardIds.RaptorElder_G ? 2 : 1;
		const baseBuff = input.hero.globalInfo.BeastsSummonedThisCombat * mult;
		input.spawned.attack += attackBuff * baseBuff;
		input.spawned.health += healthBuff * baseBuff;
	},
};
