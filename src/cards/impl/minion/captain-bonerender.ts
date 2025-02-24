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
		if (
			CaptainBonerender.cardIds.includes(input.spawned.cardId as CardIds) ||
			CaptainBonerender.cardIds.includes(input.spawned.lastAffectedByEntity?.cardId as CardIds)
		) {
			return;
		}
		const mult = minion.cardId === CardIds.CaptainBonerender_BG31_840 ? 1 : 2;
		for (let i = 0; i < mult; i++) {
			if (input.board.length >= 7) {
				break;
			}
			const copy = copyEntity(input.spawned);
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
			const indexFromRight = input.board.length - input.board.indexOf(input.spawned) + 1;
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
