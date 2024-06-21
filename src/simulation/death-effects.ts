import { CardIds } from '@firestone-hs/reference-data';
import { BgsPlayerEntity } from '../bgs-player-entity';
import { BoardEntity } from '../board-entity';
import { pickRandomAlive } from '../services/utils';
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
