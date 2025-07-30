import { CardIds, Race } from '@firestone-hs/reference-data';
import { BgsPlayerEntity } from '../bgs-player-entity';
import { BoardEntity } from '../board-entity';
import { updateStealth } from '../keywords/stealth';
import { hasCorrectTribe } from '../utils';
import { playBloodGemsOn } from './blood-gems';
import { FullGameState } from './internal-game-state';
import { onQuestProgressUpdated } from './quest';
import { modifyStats } from './stats';

export const applyAfterAttackEffects = (
	attackingEntity: BoardEntity,
	attackingBoard: BoardEntity[],
	attackingBoardHero: BgsPlayerEntity,
	defendingEntity: BoardEntity,
	defendingBoard: BoardEntity[],
	defendingBoardHero: BgsPlayerEntity,
	damageDoneByAttacker: number,
	damageDoneByDefender: number,
	gameState: FullGameState,
): void => {
	// https://replays.firestoneapp.com/?reviewId=9c3ba0f2-d049-4f79-8ec2-7b20ec8d0f68&turn=11&action=5
	// It looks like Stealth is removed only once the damage is dealt?
	updateStealth(attackingEntity, false, attackingBoard, attackingBoardHero, defendingBoardHero, gameState);

	// const onAfterAttackImpl = cardMappings[attackingEntity.cardId];
	// if (hasOnAfterAttack(onAfterAttackImpl)) {
	// 	onAfterAttackImpl.onAnyMinionAfterAttack(attackingEntity, {
	// 		attacker: attackingEntity,
	// 		attackingHero: attackingBoardHero,
	// 		attackingBoard: attackingBoard,
	// 		defendingEntity: defendingEntity,
	// 		defendingBoard: defendingBoard,
	// 		defendingHero: defendingBoardHero,
	// 		gameState,
	// 		playerIsFriendly: attackingBoardHero.friendly,
	// 	});
	// }
	// for (const boardEntity of attackingBoard.filter((e) => e.entityId !== attackingEntity.entityId)) {
	// 	const onAfterAttackImpl = cardMappings[boardEntity.cardId];
	// 	if (hasOnAfterAttack(onAfterAttackImpl)) {
	// 		onAfterAttackImpl.onAnyMinionAfterAttack(boardEntity, {
	// 			attacker: attackingEntity,
	// 			attackingHero: attackingBoardHero,
	// 			attackingBoard: attackingBoard,
	// 			defendingEntity: defendingEntity,
	// 			defendingBoard: defendingBoard,
	// 			defendingHero: defendingBoardHero,
	// 			gameState,
	// 			playerIsFriendly: attackingBoardHero.friendly,
	// 		});
	// 	}
	// }

	if (
		attackingEntity.cardId === CardIds.IncorporealCorporal_BG26_RLK_117 ||
		attackingEntity.cardId === CardIds.IncorporealCorporal_BG26_RLK_117_G
	) {
		attackingEntity.definitelyDead = true;
	}
	// Putricide-only
	else if (attackingEntity.additionalCards?.includes(CardIds.IncorporealCorporal_BG26_RLK_117)) {
		attackingEntity.definitelyDead = true;
	}

	attackingBoard
		.filter((e) => e.additionalCards?.includes(CardIds.FesterootHulk_BG_GIL_655))
		.forEach((e) => {
			modifyStats(e, e, 1, 0, attackingBoard, attackingBoardHero, gameState);
		});

	let secretTriggered = null;
	if (
		(secretTriggered = defendingBoardHero.secrets?.find(
			(secret) => !secret.triggered && secret?.cardId === CardIds.Reckoning_TB_Bacon_Secrets_14,
		)) != null
	) {
		// console.log('triggering secret?', damageDoneByAttacker, stringifySimpleCard(attackingEntity, allCards));
		if (damageDoneByAttacker >= 3 && !(attackingEntity.health <= 0 || attackingEntity.definitelyDead)) {
			secretTriggered.triggered = true;
			attackingEntity.definitelyDead = true;
			gameState.spectator.registerPowerTarget(
				secretTriggered,
				attackingEntity,
				attackingBoard,
				defendingBoardHero,
				attackingBoardHero,
			);
		}
	}

	applyOnAttackQuest(attackingEntity, attackingBoard, attackingBoardHero, gameState);
};

export const applyAfterAttackTrinkets = (
	attackingEntity: BoardEntity,
	attackingBoard: BoardEntity[],
	attackingBoardHero: BgsPlayerEntity,
	defendingEntity: BoardEntity,
	defendingBoard: BoardEntity[],
	defendingBoardHero: BgsPlayerEntity,
	damageDoneByAttacker: number,
	damageDoneByDefender: number,
	gameState: FullGameState,
): void => {
	const trinkets = attackingBoardHero.trinkets ?? [];
	for (const trinket of trinkets) {
		switch (trinket.cardId) {
			case CardIds.JarOGems_BG30_MagicItem_546:
				trinket.scriptDataNum1--;
				if (trinket.scriptDataNum1 <= 0) {
					for (const entity of attackingBoard.filter((e) =>
						hasCorrectTribe(e, attackingBoardHero, Race.QUILBOAR, gameState.anomalies, gameState.allCards),
					)) {
						playBloodGemsOn(trinket, entity, 1, attackingBoard, attackingBoardHero, gameState);
						gameState.spectator.registerPowerTarget(
							trinket,
							entity,
							attackingBoard,
							attackingBoardHero,
							attackingBoardHero,
						);
					}
					trinket.scriptDataNum1 = gameState.cardsData.defaultScriptDataNum(trinket.cardId);
				}
				break;
		}
	}
};

const applyOnAttackQuest = (
	attackingEntity: BoardEntity,
	attackingBoard: BoardEntity[],
	attackingBoardHero: BgsPlayerEntity,
	gameState: FullGameState,
) => {
	const quests = attackingBoardHero.questEntities ?? [];
	for (const quest of quests) {
		switch (quest.CardId) {
			case CardIds.CrackTheCase:
				onQuestProgressUpdated(attackingBoardHero, quest, attackingBoard, gameState);
				break;
		}
	}
};

export interface OnAfterAttackInput {
	attacker: BoardEntity;
	attackingHero: BgsPlayerEntity;
	attackingBoard: BoardEntity[];
	defendingEntity: BoardEntity;
	defendingBoard: BoardEntity[];
	defendingHero: BgsPlayerEntity;
	gameState: FullGameState;
	playerIsFriendly: boolean;
}
