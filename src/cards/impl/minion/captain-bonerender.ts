import { BoardEntity } from '../../../board-entity';
import { OnOtherSpawnInput, removeAurasFromSelf } from '../../../simulation/add-minion-to-board';
import { spawnEntities } from '../../../simulation/deathrattle-spawns';
import { performEntitySpawns } from '../../../simulation/spawns';
import { TempCardIds } from '../../../temp-card-ids';
import { copyEntity } from '../../../utils';
import { AfterOtherSpawnedCard } from '../../card.interface';

export const CaptainBonerender: AfterOtherSpawnedCard = {
	cardIds: [TempCardIds.CaptainBonerender, TempCardIds.CaptainBonerender_G],
	afterOtherSpawned: (minion: BoardEntity, input: OnOtherSpawnInput) => {
		if (CaptainBonerender.cardIds.includes(input.spawned.cardId as TempCardIds)) {
			return;
		}
		const mult = minion.cardId === TempCardIds.CaptainBonerender ? 1 : 2;
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
				input.gameState.allCards,
				input.gameState.cardsData,
				input.gameState.sharedState,
				input.gameState.spectator,
				input.hero.friendly,
				false,
				false,
				false,
				copy,
			);
			const indexFromRight = input.board.length - input.board.indexOf(minion) - 1;
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
		}
	},
};
