import { CardIds } from '@firestone-hs/reference-data';
import { BgsPlayerEntity } from '../bgs-player-entity';
import { BoardEntity } from '../board-entity';
import { pickRandomAlive } from '../services/utils';
import { addStatsToBoard } from '../utils';
import { spawnEntities } from './deathrattle-spawns';
import { FullGameState } from './internal-game-state';
import { performEntitySpawns } from './spawns';
import { modifyStats } from './stats';

export const applyAfterDeathEffects = (
	deadEntity: BoardEntity,
	deadEntityIndexFromRight: number,
	boardWithDeadEntity: BoardEntity[],
	boardWithDeadEntityHero: BgsPlayerEntity,
	otherBoard: BoardEntity[],
	otherBoardHero: BgsPlayerEntity,
	gameState: FullGameState,
): BoardEntity[] => {
	const allSpawns = [];
	const spawnsFromSecrets = handleSecrets(
		deadEntity,
		deadEntityIndexFromRight,
		boardWithDeadEntity,
		boardWithDeadEntityHero,
		otherBoard,
		otherBoardHero,
		gameState,
	);
	allSpawns.push(...spawnsFromSecrets);
	performEntitySpawns(
		allSpawns,
		boardWithDeadEntity,
		boardWithDeadEntityHero,
		deadEntity,
		deadEntityIndexFromRight,
		otherBoard,
		otherBoardHero,
		gameState,
	);

	// These are apparently processed after Reborn is triggered
	// http://replays.firestoneapp.com/?reviewId=5db9a191-ae9b-43a5-a072-0d460631d7a9&turn=23&action=12
	// UPDATE 2024-06-24: Multiple counterexamples of this, so I'm not sure exactly what is the right approach
	// I'm implementing the one that makes more sense to me; triggering after reborn is just too different
	// from what happens usually
	// However, we want to trigger it after all the spawns have been processed, so more or less an "avenge" timing?
	// Maybe even after that?
	boardWithDeadEntity
		.filter((e) => e.cardId === CardIds.GhoulAcabra_BG29_863 || e.cardId === CardIds.GhoulAcabra_BG29_863_G)
		.forEach((ghoul) => {
			for (let k = 0; k < ghoul.scriptDataNum1 ?? 0; k++) {
				const buff = ghoul.cardId === CardIds.GhoulAcabra_BG29_863_G ? 4 : 2;
				addStatsToBoard(ghoul, boardWithDeadEntity, boardWithDeadEntityHero, buff, buff, gameState);
			}
			ghoul.scriptDataNum1 = 0;
		});

	return allSpawns;
};

const handleSecrets = (
	deadEntity: BoardEntity,
	deadEntityIndexFromRight: number,
	boardWithDeadEntity: BoardEntity[],
	boardWithDeadEntityHero: BgsPlayerEntity,
	otherBoard: BoardEntity[],
	otherBoardHero: BgsPlayerEntity,
	gameState: FullGameState,
): BoardEntity[] => {
	const allSpawns = [];

	for (const secret of (boardWithDeadEntityHero.secrets ?? []).filter((s) => !s.triggered)) {
		switch (secret.cardId) {
			case CardIds.Avenge_TB_Bacon_Secrets_08:
				secret.triggered = true;
				const avengeTarget = pickRandomAlive(boardWithDeadEntity);
				modifyStats(avengeTarget, 3, 2, boardWithDeadEntity, boardWithDeadEntityHero, gameState);
				break;
			case CardIds.Redemption_TB_Bacon_Secrets_10:
				secret.triggered = true;
				const redemptionSpawns = spawnEntities(
					deadEntity.cardId,
					1,
					boardWithDeadEntity,
					boardWithDeadEntityHero,
					otherBoard,
					otherBoardHero,
					gameState.allCards,
					gameState.cardsData,
					gameState.sharedState,
					gameState.spectator,
					deadEntity.friendly,
					false,
					false,
					true,
					// { ...newSpawn } as BoardEntity,
				);
				redemptionSpawns[0].health = 1;
				allSpawns.push(...redemptionSpawns);
				break;
			case CardIds.Effigy_TB_Bacon_Secrets_05:
				secret.triggered = true;
				const minionTier = gameState.cardsData.getTavernLevel(deadEntity.cardId);
				const newMinion = gameState.cardsData.getRandomMinionForTavernTier(minionTier);
				const effigySpawns = spawnEntities(
					newMinion,
					1,
					boardWithDeadEntity,
					boardWithDeadEntityHero,
					otherBoard,
					otherBoardHero,
					gameState.allCards,
					gameState.cardsData,
					gameState.sharedState,
					gameState.spectator,
					deadEntity.friendly,
					false,
					false,
					true,
				);
				allSpawns.push(...effigySpawns);
				break;
		}
	}
	return allSpawns;
};

export const applyOnDeathEffects = (
	deadEntity: BoardEntity,
	deadEntityIndexFromRight: number,
	boardWithDeadEntity: BoardEntity[],
	boardWithDeadEntityHero: BgsPlayerEntity,
	otherBoard: BoardEntity[],
	otherBoardHero: BgsPlayerEntity,
	gameState: FullGameState,
) => {
	// Nothing yet
	return [];
};
