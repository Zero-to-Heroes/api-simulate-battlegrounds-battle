import { CardIds, Race } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { OnDespawnInput, OnOtherSpawnInput, OnSpawnInput } from '../../../simulation/add-minion-to-board';
import { hasCorrectTribe } from '../../../utils';
import { OnDespawnedCard, OnOtherSpawnedCard, OnSpawnedCard } from '../../card.interface';

const attackBuff = 1;

export const RideOrDie: OnSpawnedCard & OnOtherSpawnedCard & OnDespawnedCard = {
	cardIds: [CardIds.RideOrDie_BG33_115, CardIds.RideOrDie_BG33_115_G],
	onSpawned: (minion: BoardEntity, input: OnSpawnInput) => {
		const mult = minion.cardId === CardIds.RideOrDie_BG33_115_G ? 2 : 1;
		const targets = input.board
			.filter((e) => e !== minion)
			.filter((e) =>
				hasCorrectTribe(e, input.hero, Race.UNDEAD, input.gameState.anomalies, input.gameState.allCards),
			);
		for (const target of targets) {
			target.attack += attackBuff * mult;
		}
	},
	onDespawned: (minion: BoardEntity, input: OnDespawnInput) => {
		const mult = minion.cardId === CardIds.RideOrDie_BG33_115_G ? 2 : 1;
		const targets = input.board
			.filter((e) => e !== minion)
			.filter((e) =>
				hasCorrectTribe(e, input.hero, Race.UNDEAD, input.gameState.anomalies, input.gameState.allCards),
			);
		for (const target of targets) {
			target.attack = Math.max(0, target.attack - attackBuff * mult);
		}
	},
	onOtherSpawned: (minion: BoardEntity, input: OnOtherSpawnInput) => {
		const debug = true;
		if (
			!hasCorrectTribe(
				input.spawned,
				input.hero,
				Race.UNDEAD,
				input.gameState.anomalies,
				input.gameState.allCards,
			)
		) {
			return;
		}
		const mult = minion.cardId === CardIds.RideOrDie_BG33_115_G ? 2 : 1;
		input.spawned.attack += attackBuff * mult;
	},
};
