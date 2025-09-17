import { CardIds } from '../../../services/card-ids';
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

		// Seems weird, but looking at a real game this feels like this is how it works
		// https://replays.firestoneapp.com/?reviewId=b9eeb0a6-f5f1-424f-ba7a-7941d890f6bd&turn=21&action=1
		let numberOfSpawns = 1;
		for (let i = 0; i < input.board.length; i++) {
			if (
				input.board[i].cardId !== CardIds.CaptainBonerender_BG31_840 &&
				input.board[i].cardId !== CardIds.CaptainBonerender_BG31_840_G
			) {
				continue;
			}
			const newSpawns = input.board[i].cardId === CardIds.CaptainBonerender_BG31_840_G ? 2 : 1;
			const spawnsChain = buildSpawnsChain(newSpawns, input.board.slice(i + 1));
			numberOfSpawns += spawnsChain;
		}
		const numberOfCopies = numberOfSpawns - 1;
		// const numberOfCopies = input.board
		// 	.map((e) =>
		// 		e.cardId === CardIds.CaptainBonerender_BG31_840_G
		// 			? 2
		// 			: e.cardId === CardIds.CaptainBonerender_BG31_840
		// 			? 1
		// 			: 0,
		// 	)
		// 	.reduce((a, b) => a + b, 0);
		// Do it first, so that modifications like "attack immediately" are not reflected in subsequent copies
		const initialCopy = copyEntity(input.spawned);
		// Technically not necessarily correct, but the main issue is with "attack immediately" tokens
		// like Tumbling Assassin, which spawns to the right
		const indexFromRight = input.board.length - input.board.indexOf(input.spawned) - 1;
		for (let i = 0; i < numberOfCopies; i++) {
			// if (input.board.length >= 7) {
			// 	break;
			// }
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

const buildSpawnsChain = (numberOfSpawns: number, board: readonly BoardEntity[]): number => {
	let spawns = numberOfSpawns;
	for (let k = 0; k < numberOfSpawns; k++) {
		for (let i = 0; i < board.length; i++) {
			if (
				board[i].cardId !== CardIds.CaptainBonerender_BG31_840 &&
				board[i].cardId !== CardIds.CaptainBonerender_BG31_840_G
			) {
				continue;
			}
			const newSpawns = board[i].cardId === CardIds.CaptainBonerender_BG31_840_G ? 2 : 1;
			const spawnsChain = buildSpawnsChain(newSpawns, board.slice(i + 1));
			spawns += spawnsChain;
		}
	}
	return spawns;
};
