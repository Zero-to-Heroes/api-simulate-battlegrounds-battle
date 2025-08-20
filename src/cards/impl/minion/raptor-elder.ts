import { CardIds, Race } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { OnDespawnInput, OnOtherSpawnInput, OnSpawnInput } from '../../../simulation/add-minion-to-board';
import { hasCorrectTribe } from '../../../utils';
import { OnDespawnedCard, OnOtherSpawnedCard, OnSpawnedCard } from '../../card.interface';

const attackBuff = 2;
const healthBuff = 2;

export const RaptorElder: OnSpawnedCard & OnOtherSpawnedCard & OnDespawnedCard = {
	cardIds: [CardIds.RaptorElder_BG33_842, CardIds.RaptorElder_BG33_842_G],
	onSpawned: (minion: BoardEntity, input: OnSpawnInput) => {
		const mult = minion.cardId === CardIds.RaptorElder_BG33_842_G ? 2 : 1;
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
		const mult = minion.cardId === CardIds.RaptorElder_BG33_842_G ? 2 : 1;
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
		const mult = minion.cardId === CardIds.RaptorElder_BG33_842_G ? 2 : 1;
		const baseBuff = input.hero.globalInfo.BeastsSummonedThisCombat * mult;
		// First put the minion itself in the aura
		if (
			input.applySelfAuras &&
			hasCorrectTribe(input.spawned, input.hero, Race.BEAST, input.gameState.anomalies, input.gameState.allCards)
		) {
			input.spawned.attack += attackBuff * baseBuff;
			input.spawned.health += healthBuff * baseBuff;
		}

		// Then update the aura
		const allTargets = input.board.filter((e) =>
			hasCorrectTribe(e, input.hero, Race.BEAST, input.gameState.anomalies, input.gameState.allCards),
		);
		for (const target of allTargets) {
			// Only the new spawn should increase the data, as we've already applied the aura before
			target.attack += attackBuff * mult;
			target.health += healthBuff * mult;
		}
	},
};
