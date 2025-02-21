import { CardIds, Race } from '@firestone-hs/reference-data';
import { BgsPlayerEntity } from '../bgs-player-entity';
import { BoardEntity } from '../board-entity';
import { updateStealth } from '../keywords/stealth';
import { grantStatsToMinionsOfEachType, hasCorrectTribe } from '../utils';
import { playBloodGemsOn } from './blood-gems';
import { addCardsInHand } from './cards-in-hand';
import { processDeathrattleForMinion } from './deathrattle-orchestration';
import { getValidDeathrattles } from './deathrattle-utils';
import { FullGameState } from './internal-game-state';
import { onQuestProgressUpdated } from './quest';
import { modifyStats } from './stats';

export const applyAfterAttackEffects = (
	attackingEntity: BoardEntity,
	attackingBoard: BoardEntity[],
	attackingBoardHero: BgsPlayerEntity,
	defendingEntity: BoardEntity,
	defendingBoardHero: BgsPlayerEntity,
	damageDoneByAttacker: number,
	damageDoneByDefender: number,
	gameState: FullGameState,
): void => {
	// https://replays.firestoneapp.com/?reviewId=9c3ba0f2-d049-4f79-8ec2-7b20ec8d0f68&turn=11&action=5
	// It looks like Stealth is removed only once the damage is dealt?
	updateStealth(attackingEntity, false, attackingBoard, attackingBoardHero, defendingBoardHero, gameState);

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

	if (attackingEntity.cardId === CardIds.Bonker_BG20_104 || attackingEntity.cardId === CardIds.Bonker_BG20_104_G) {
		const quantity = attackingEntity.cardId === CardIds.Bonker_BG20_104_G ? 2 : 1;
		const cards = quantity === 1 ? [CardIds.BloodGem] : [CardIds.BloodGem, CardIds.BloodGem];
		addCardsInHand(attackingBoardHero, attackingBoard, cards, gameState);
	} else if (attackingEntity.cardId === CardIds.Yrel_BG23_350 || attackingEntity.cardId === CardIds.Yrel_BG23_350_G) {
		const modifier = attackingEntity.cardId === CardIds.Yrel_BG23_350_G ? 2 : 1;
		grantStatsToMinionsOfEachType(
			attackingEntity,
			attackingBoard,
			attackingBoardHero,
			modifier * 1,
			modifier * 2,
			gameState,
		);
	} else if (
		attackingEntity.cardId === CardIds.IncorporealCorporal_BG26_RLK_117 ||
		attackingEntity.cardId === CardIds.IncorporealCorporal_BG26_RLK_117_G
	) {
		attackingEntity.definitelyDead = true;
	} else if (
		attackingEntity.cardId === CardIds.MonstrousMacaw_BGS_078 ||
		attackingEntity.cardId === CardIds.MonstrousMacaw_TB_BaconUps_135
	) {
		const loops = attackingEntity.cardId === CardIds.MonstrousMacaw_TB_BaconUps_135 ? 2 : 1;
		const targetBoard = attackingBoard.filter((e) => e.entityId !== attackingEntity.entityId);
		const validDeathrattles = getValidDeathrattles(targetBoard, gameState);
		const leftMost = validDeathrattles[0];
		if (!!leftMost) {
			for (let i = 0; i < loops; i++) {
				gameState.spectator.registerPowerTarget(
					attackingEntity,
					leftMost,
					attackingBoard,
					attackingBoardHero,
					defendingBoardHero,
				);
				const indexFromRight = attackingBoard.length - (attackingBoard.indexOf(leftMost) + 1);
				processDeathrattleForMinion(
					leftMost,
					indexFromRight,
					[leftMost],
					leftMost.friendly ? gameState.gameState.player : gameState.gameState.opponent,
					leftMost.friendly ? gameState.gameState.opponent : gameState.gameState.player,
					gameState,
					false,
				);
			}
		}
	}
	// Putricide-only
	else if (attackingEntity.additionalCards?.includes(CardIds.IncorporealCorporal_BG26_RLK_117)) {
		attackingEntity.definitelyDead = true;
	}

	attackingBoard
		.filter((e) => e.additionalCards?.includes(CardIds.FesterootHulk_BG_GIL_655))
		.forEach((e) => {
			modifyStats(e, 1, 0, attackingBoard, attackingBoardHero, gameState);
		});

	applyOnAttackQuest(attackingEntity, attackingBoard, attackingBoardHero, gameState);
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

	const trinkets = attackingBoardHero.trinkets ?? [];
	for (const trinket of trinkets) {
		switch (trinket.cardId) {
			case CardIds.JarOGems_BG30_MagicItem_546:
				trinket.scriptDataNum1--;
				if (trinket.scriptDataNum1 <= 0) {
					for (const entity of attackingBoard.filter((e) =>
						hasCorrectTribe(e, attackingBoardHero, Race.QUILBOAR, gameState.allCards),
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
