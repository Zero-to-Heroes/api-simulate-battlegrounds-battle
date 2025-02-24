import { CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { OnOtherSpawnInput, removeAurasFromSelf } from '../../../simulation/add-minion-to-board';
import { spawnEntities } from '../../../simulation/deathrattle-spawns';
import { performEntitySpawns } from '../../../simulation/spawns';
import { copyEntity } from '../../../utils';
import { AfterOtherSpawnedCard } from '../../card.interface';

export const CaptainBonerender: AfterOtherSpawnedCard = {
	cardIds: [CardIds.CaptainBonerender_BG31_840, CardIds.CaptainBonerender_BG31_840_G],
	afterOtherSpawned: (minion: BoardEntity, input: OnOtherSpawnInput) => {
		// Handle all copies in one go
		const isAlreadyHandled = CaptainBonerender.cardIds.includes(
			input.spawned.lastAffectedByEntity?.cardId as CardIds,
		);
		if (CaptainBonerender.cardIds.includes(input.spawned.cardId as CardIds) || isAlreadyHandled) {
			return;
		}
		input.spawned.lastAffectedByEntity = minion;
		const numberOfCopies = input.board
			.map((e) =>
				e.cardId === CardIds.CaptainBonerender_BG31_840_G
					? 2
					: e.cardId === CardIds.CaptainBonerender_BG31_840
					? 1
					: 0,
			)
			.reduce((a, b) => a + b, 0);
		// Do it first, so that modifications like "attack immediately" are not reflected in subsequent copies
		const initialCopy = copyEntity(input.spawned);
		// Technically not necessarily correct, but the main issue is with "attack immediately" tokens
		// like Tumbling Assassin, which spawns to the right
		const indexFromRight = input.board.length - input.board.indexOf(input.spawned) - 1;
		for (let i = 0; i < numberOfCopies; i++) {
			if (input.board.length >= 7) {
				break;
			}
			const copy = copyEntity(initialCopy);
			removeAurasFromSelf(copy, input.board, input.hero, input.gameState);
			const newMinions = spawnEntities(
				copy.cardId,
				1,
				input.board,
				input.hero,
				input.otherBoard,
				input.otherHero,
				input.gameState,
				input.hero.friendly,
				false,
				false,
				false,
				copy,
			);
			newMinions.forEach((spawn) => {
				spawn.lastAffectedByEntity = minion;
			});
			const spawns = performEntitySpawns(
				newMinions,
				input.board,
				input.hero,
				minion,
				indexFromRight,
				input.otherBoard,
				input.otherHero,
				input.gameState,
			);
			spawns.forEach((spawn) => {
				spawn.lastAffectedByEntity = minion;
			});
		}
	},
};
