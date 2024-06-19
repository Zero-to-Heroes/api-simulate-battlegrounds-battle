/* eslint-disable @typescript-eslint/no-use-before-define */
import { AllCardsService, CardIds, CardType, Race } from '@firestone-hs/reference-data';
import { BgsPlayerEntity } from '../bgs-player-entity';
import { BoardEntity } from '../board-entity';
import { groupByFunction, pickRandom } from '../services/utils';
import {
	addImpliedMechanics,
	grantRandomStats,
	grantStatsToMinionsOfEachType,
	hasCorrectTribe,
	isFish,
	stringifySimple,
	stringifySimpleCard,
	updateDivineShield,
} from '../utils';
import { addCardsInHand } from './cards-in-hand';
import { onEntityDamaged } from './damage-effects';
import { applyMonstrosity, rememberDeathrattles } from './deathrattle-effects';
import { orchestrateMinionDeathEffects, processDeathrattleForMinion } from './deathrattle-orchestration';
import { spawnEntities } from './deathrattle-spawns';
import { getValidDeathrattles } from './deathrattle-utils';
import { applyFrenzy } from './frenzy';
import { FullGameState } from './internal-game-state';
import { makeMinionsDie } from './minion-death';
import { onMinionKill } from './minion-kill';
import { applyOnAttackBuffs } from './on-attack';
import { applyOnBeingAttackedBuffs } from './on-being-attacked';
import { onQuestProgressUpdated } from './quest';
import { performEntitySpawns } from './spawns';
import { applyAfterStatsUpdate, modifyAttack, modifyHealth, onStatsUpdate } from './stats';
import { handleSummonsWhenSpace } from './summon-when-space';
import { canAttack } from './utils/entity-utils';

// Only use it to simulate actual attack. To simulate damage, or something similar, use bumpInto
export const simulateAttack = (
	attackingBoard: BoardEntity[],
	attackingBoardHero: BgsPlayerEntity,
	defendingBoard: BoardEntity[],
	defendingBoardHero: BgsPlayerEntity,
	gameState: FullGameState,
): void => {
	// console.debug(
	// 	'\nsimulating attack',
	// 	stringifySimple(attackingBoard, gameState.allCards),
	// 	'\n',
	// 	stringifySimple(defendingBoard, gameState.allCards),
	// );
	if (attackingBoard.length === 0 || defendingBoard.length === 0) {
		return;
	}

	const attackingEntity = getAttackingEntity(attackingBoard, gameState.allCards);
	if (attackingEntity) {
		attackingEntity.attacking = true;
		// Get the left entities now, otherwise things might break if the attacker dies and/or other
		// entities pop
		const attackingEntityIndex = attackingBoard.indexOf(attackingEntity);
		const attackingEntitiesToTheLeft = attackingBoard.slice(0, attackingEntityIndex);
		const isAttackingImmediately = attackingEntity.attackImmediately;
		// In case of Broodmother spawn, it spawns where the dead minion was, and has no influence on the
		// attack order
		// Situation this is trying to resolve by putting this right at the top of the loop:
		// - One scallywag attacks into another one, both die
		// - The first one attacks. To its left is a Harmless Bonehead with 1 HP. The scallywag attacks, and both scallys die
		// - The *other* sky pirate attacks first, and kills the bonehead. Two minions are spawned
		// - The first sy pirate attacks
		// - The initial loop is resolved. If this is at the end, the Harmless Bonehead is already dead, and not flagged
		// While having this right away, we immediately flag all minions to the left
		if (!isAttackingImmediately) {
			// Make sure they won't be able to attack until everyone has attacked
			// See http://replays.firestoneapp.com/?reviewId=a1b3066d-e806-44c1-ab4b-7ef9dbf9b5b9&turn=5&action=4
			attackingEntitiesToTheLeft.forEach((entity) => (entity.hasAttacked = 2));
		}

		const numberOfAttacks = attackingEntity.windfury ? 2 : 1;
		for (let i = 0; i < numberOfAttacks; i++) {
			// We refresh the entity in case of windfury
			if (attackingBoard.length === 0 || defendingBoard.length === 0) {
				// We still want to flag the entity as having attacked, so that it doesn't attack again
				// after teammate switch in Duos
				break;
			}
			// Check that didn't die
			if (attackingBoard.find((entity) => entity.entityId === attackingEntity.entityId)) {
				const defendingEntity: BoardEntity = getDefendingEntity(defendingBoard, attackingEntity);
				// Can happen with a single defender that has stealth
				if (defendingEntity) {
					doFullAttack(
						attackingEntity,
						attackingBoard,
						attackingBoardHero,
						defendingEntity,
						defendingBoard,
						defendingBoardHero,
						gameState,
					);
				} else {
					// Solves the edge case of Sky Pirate vs a stealth board
					attackingEntity.attackImmediately = false;
				}
			}
		}
		attackingEntity.attacking = false;
		attackingEntity.hasAttacked = 1;
		// // In case of Broodmother spawn, it spawns where the dead minion was, and has no influence on the
		// // attack order
		// if (!isAttackingImmediately) {
		// 	// Make sure they won't be able to attack until everyone has attacked
		// 	// See http://replays.firestoneapp.com/?reviewId=a1b3066d-e806-44c1-ab4b-7ef9dbf9b5b9&turn=5&action=4
		// 	attackingEntitiesToTheLeft.forEach((entity) => (entity.hasAttacked = 2));
		// }
	}
};

export const doFullAttack = (
	attackingEntity: BoardEntity,
	attackingBoard: BoardEntity[],
	attackingBoardHero: BgsPlayerEntity,
	defendingEntity: BoardEntity,
	defendingBoard: BoardEntity[],
	defendingBoardHero: BgsPlayerEntity,
	gameState: FullGameState,
) => {
	applyOnAttackBuffs(
		attackingEntity,
		attackingBoard,
		attackingBoardHero,
		defendingBoard,
		defendingBoardHero,
		gameState,
	);
	gameState.spectator.registerAttack(
		attackingEntity,
		defendingEntity,
		attackingBoard,
		defendingBoard,
		attackingBoardHero,
		defendingBoardHero,
	);
	applyOnBeingAttackedBuffs(
		attackingEntity,
		attackingBoard,
		attackingBoardHero,
		defendingEntity,
		defendingBoard,
		defendingBoardHero,
		gameState,
	);
	const { damageDoneByAttacker, damageDoneByDefender } = performAttack(
		attackingEntity,
		defendingEntity,
		attackingBoard,
		attackingBoardHero,
		defendingBoard,
		defendingBoardHero,
		gameState,
	);
	applyAfterAttackEffects(
		attackingEntity,
		attackingBoard,
		attackingBoardHero,
		defendingEntity,
		defendingBoardHero,
		damageDoneByAttacker,
		damageDoneByDefender,
		gameState,
	);
	processMinionDeath(attackingBoard, attackingBoardHero, defendingBoard, defendingBoardHero, gameState);
	applyAfterStatsUpdate(gameState);
	attackingEntity.immuneWhenAttackCharges = Math.max(0, attackingEntity.immuneWhenAttackCharges - 1);
	if (
		defendingEntity.health > 0 &&
		!defendingEntity.definitelyDead &&
		(defendingEntity.cardId === CardIds.YoHoOgre_BGS_060 ||
			defendingEntity.cardId === CardIds.YoHoOgre_TB_BaconUps_150)
	) {
		defendingEntity.attackImmediately = true;
		if (defendingEntity.attackImmediately) {
			simulateAttack(defendingBoard, defendingBoardHero, attackingBoard, attackingBoardHero, gameState);
		}
	}
};

const applyAfterAttackEffects = (
	attackingEntity: BoardEntity,
	attackingBoard: BoardEntity[],
	attackingBoardHero: BgsPlayerEntity,
	defendingEntity: BoardEntity,
	defendingBoardHero: BgsPlayerEntity,
	damageDoneByAttacker: number,
	damageDoneByDefender: number,
	gameState: FullGameState,
): void => {
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
	}
	// Putricide-only
	else if (attackingEntity.additionalCards?.includes(CardIds.IncorporealCorporal_BG26_RLK_117)) {
		attackingEntity.definitelyDead = true;
	}
	attackingBoard
		.filter((e) => e.additionalCards?.includes(CardIds.FesterootHulk_BG_GIL_655))
		.forEach((e) => {
			modifyAttack(e, 1, attackingBoard, attackingBoardHero, gameState);
			onStatsUpdate(e, attackingBoard, attackingBoardHero, gameState);
		});

	attackingEntity.stealth = false;
	applyOnAttackQuest(attackingEntity, attackingBoard, attackingBoardHero, gameState);
};

const applyOnAttackQuest = (
	attackingEntity: BoardEntity,
	attackingBoard: BoardEntity[],
	attackingBoardHero: BgsPlayerEntity,
	gameState: FullGameState,
) => {
	const quests = attackingBoardHero.questEntities ?? [];
	if (!quests.length) {
		return;
	}

	for (const quest of quests) {
		switch (quest.CardId) {
			case CardIds.CrackTheCase:
				onQuestProgressUpdated(attackingBoardHero, quest, attackingBoard, gameState);
				break;
		}
	}
};

const performAttack = (
	attackingEntity: BoardEntity,
	defendingEntity: BoardEntity,
	attackingBoard: BoardEntity[],
	attackingBoardHero: BgsPlayerEntity,
	defendingBoard: BoardEntity[],
	defendingBoardHero: BgsPlayerEntity,
	gameState: FullGameState,
): { damageDoneByAttacker: number; damageDoneByDefender: number } => {
	let damageDoneByAttacker = 0;
	let damageDoneByDefender = 0;

	if (hasCorrectTribe(attackingEntity, Race.DRAGON, gameState.allCards)) {
		const prestors = attackingBoard
			.filter((e) => e.entityId !== attackingEntity.entityId)
			.filter(
				(e) =>
					e.cardId === CardIds.PrestorsPyrospawn_BG21_012 ||
					e.cardId === CardIds.PrestorsPyrospawn_BG21_012_G,
			);
		prestors.forEach((prestor) => {
			gameState.spectator.registerPowerTarget(
				prestor,
				defendingEntity,
				defendingBoard,
				attackingBoardHero,
				defendingBoardHero,
			);
			damageDoneByAttacker += dealDamageToMinion(
				defendingEntity,
				defendingBoard,
				defendingBoardHero,
				prestor,
				prestor.cardId === CardIds.PrestorsPyrospawn_BG21_012_G ? 6 : 3,
				attackingBoard,
				attackingBoardHero,
				gameState,
			);
		});
	}
	if (
		attackingEntity.cardId === CardIds.Atramedes_BG23_362 ||
		attackingEntity.cardId === CardIds.Atramedes_BG23_362_G
	) {
		const targets = [defendingEntity, ...getNeighbours(defendingBoard, defendingEntity)];
		const multiplier = attackingEntity.cardId === CardIds.Atramedes_BG23_362_G ? 2 : 1;

		for (let i = 0; i < multiplier; i++) {
			targets.forEach((target) => {
				gameState.spectator.registerPowerTarget(
					attackingEntity,
					target,
					defendingBoard,
					attackingBoardHero,
					defendingBoardHero,
				);
				damageDoneByAttacker += dealDamageToMinion(
					target,
					defendingBoard,
					defendingBoardHero,
					attackingEntity,
					3,
					attackingBoard,
					attackingBoardHero,
					gameState,
				);
			});
		}
	} else if (
		attackingEntity.cardId === CardIds.Niuzao_BG27_822 ||
		attackingEntity.cardId === CardIds.Niuzao_BG27_822_G
	) {
		const multiplier = attackingEntity.cardId === CardIds.Niuzao_BG27_822_G ? 2 : 1;
		for (let i = 0; i < multiplier; i++) {
			const target = pickRandom(defendingBoard.filter((e) => e.entityId != defendingEntity.entityId));
			if (target) {
				gameState.spectator.registerPowerTarget(
					attackingEntity,
					target,
					defendingBoard,
					attackingBoardHero,
					defendingBoardHero,
				);
				damageDoneByAttacker += dealDamageToMinion(
					target,
					defendingBoard,
					defendingBoardHero,
					attackingEntity,
					attackingEntity.attack,
					attackingBoard,
					attackingBoardHero,
					gameState,
				);
			}
		}
	} else if (
		attackingEntity.cardId === CardIds.ObsidianRavager_BG27_017 ||
		attackingEntity.cardId === CardIds.ObsidianRavager_BG27_017_G
	) {
		const neighbours = getNeighbours(defendingBoard, defendingEntity);
		const neighbourTargets =
			attackingEntity.cardId === CardIds.ObsidianRavager_BG27_017_G ? neighbours : [pickRandom(neighbours)];
		const targets = [defendingEntity, ...neighbourTargets];
		targets.forEach((target) => {
			gameState.spectator.registerPowerTarget(
				attackingEntity,
				target,
				defendingBoard,
				attackingBoardHero,
				defendingBoardHero,
			);
			damageDoneByAttacker += dealDamageToMinion(
				target,
				defendingBoard,
				defendingBoardHero,
				attackingEntity,
				attackingEntity.attack,
				attackingBoard,
				attackingBoardHero,
				gameState,
			);
		});
	} else if ([CardIds.BabyKrush_BG22_001, CardIds.BabyKrush_BG22_001_G].includes(attackingEntity.cardId as CardIds)) {
		const spawns = spawnEntities(
			attackingEntity.cardId === CardIds.BabyKrush_BG22_001_G
				? CardIds.BabyKrush_BG22_001_G
				: CardIds.BabyKrush_DevilsaurToken,
			1,
			attackingBoard,
			attackingBoardHero,
			defendingBoard,
			defendingBoardHero,
			gameState.allCards,
			gameState.cardsData,
			gameState.sharedState,
			gameState.spectator,
			true,
			true,
		);
		if (spawns.length > 0) {
			const sourceIndex = attackingBoard.indexOf(attackingEntity);
			const actualSpawns = performEntitySpawns(
				spawns,
				attackingBoard,
				attackingBoardHero,
				attackingEntity,
				sourceIndex,
				defendingBoard,
				defendingBoardHero,
				gameState,
			);
			for (const actualSpawn of actualSpawns) {
				if (defendingEntity.health > 0 && !defendingEntity.definitelyDead) {
					performAttack(
						actualSpawn,
						defendingEntity,
						attackingBoard,
						attackingBoardHero,
						defendingBoard,
						defendingBoardHero,
						gameState,
					);
					// Not sure if we'll need this
					// processMinionDeath(attackingBoard, attackingBoardHero, defendingBoard, defendingBoardHero, gameState);
					// attackingEntity.immuneWhenAttackCharges = Math.max(0, attackingEntity.immuneWhenAttackCharges - 1);
				}
			}
		}
	}

	// For Prestor
	const defenderAliveBeforeAttack = defendingEntity.health > 0 && !defendingEntity.definitelyDead;
	// Because of Bristleback Knight, which changes its divine shield status during bumpEntities
	const attackerHadDivineShield = attackingEntity.divineShield;
	const defenderHadDivineShield = defendingEntity.divineShield;
	// For cleave
	// We do that now so that we don't include entities that spawn on entity damaged
	const defenderNeighbours: readonly BoardEntity[] = getNeighbours(defendingBoard, defendingEntity);
	if (defenderAliveBeforeAttack) {
		if (!attackingEntity.immuneWhenAttackCharges) {
			// TODO: this bumpEntities approach doesn't work well, as it leads to code duplication
			damageDoneByDefender += bumpEntities(
				attackingEntity,
				defendingEntity,
				attackingBoard,
				attackingBoardHero,
				defendingBoard,
				defendingBoardHero,
				gameState,
			);
		}
		damageDoneByAttacker += bumpEntities(
			defendingEntity,
			attackingEntity,
			defendingBoard,
			defendingBoardHero,
			attackingBoard,
			attackingBoardHero,
			gameState,
		);
		if (defendingEntity.attack > 0 && attackerHadDivineShield && !attackingEntity.immuneWhenAttackCharges) {
			updateDivineShield(attackingEntity, attackingBoard, false, gameState.allCards);
		}
		if (attackingEntity.attack > 0 && defenderHadDivineShield) {
			updateDivineShield(defendingEntity, defendingBoard, false, gameState.allCards);
		}
		// Do it after the damage has been done, so that entities that update on DS lose / gain (CyborgDrake) don't
		// cause wrong results to happen
		// This whole logic is a MEEEEESSSSSSSSSSSSSSS
		if (damageDoneByDefender > 0) {
			onEntityDamaged(
				attackingEntity,
				attackingBoard,
				attackingBoardHero,
				defendingBoard,
				defendingBoardHero,
				damageDoneByDefender,
				gameState,
			);
		}
		if (damageDoneByAttacker > 0) {
			onEntityDamaged(
				defendingEntity,
				defendingBoard,
				defendingBoardHero,
				attackingBoard,
				attackingBoardHero,
				damageDoneByAttacker,
				gameState,
			);
		}

		if (defendingEntity.health <= 0 || defendingEntity.definitelyDead) {
			onMinionKill(
				attackingEntity,
				defendingEntity,
				attackingBoard,
				attackingBoardHero,
				defendingBoard,
				defendingBoardHero,
				gameState,
			);
		}
		if (attackingEntity.health <= 0 || attackingEntity.definitelyDead) {
			onMinionKill(
				defendingEntity,
				attackingEntity,
				defendingBoard,
				defendingBoardHero,
				attackingBoard,
				attackingBoardHero,
				gameState,
			);
		}
	}
	// Cleave
	if (attackingEntity.cleave) {
		for (const neighbour of defenderNeighbours) {
			damageDoneByAttacker += bumpEntities(
				neighbour,
				attackingEntity,
				defendingBoard,
				defendingBoardHero,
				attackingBoard,
				attackingBoardHero,
				gameState,
			);
			// Do it after the damage has been done, so that entities that update on DS lose / gain (CyborgDrake) don't
			// cause wrong results to happen
			if (attackingEntity.attack > 0 && neighbour.divineShield) {
				updateDivineShield(neighbour, defendingBoard, false, gameState.allCards);
			}
			if (neighbour.health <= 0 || neighbour.definitelyDead) {
				onMinionKill(
					attackingEntity,
					neighbour,
					attackingBoard,
					attackingBoardHero,
					defendingBoard,
					defendingBoardHero,
					gameState,
				);
			}
		}
	}
	if (
		(defendingEntity.health <= 0 || defendingEntity.definitelyDead) &&
		(attackingEntity.cardId === CardIds.WildfireElemental_BGS_126 ||
			attackingEntity.cardId === CardIds.WildfireElemental_TB_BaconUps_166)
	) {
		const excessDamage = -defendingEntity.health;
		// console.log('neighbours', stringifySimple(neighbours, allCards));
		if (defenderNeighbours.length > 0) {
			if (attackingEntity.cardId === CardIds.WildfireElemental_BGS_126) {
				const randomTarget = defenderNeighbours[Math.floor(Math.random() * defenderNeighbours.length)];
				damageDoneByAttacker += dealDamageToMinion(
					randomTarget,
					defendingBoard,
					defendingBoardHero,
					defendingEntity.lastAffectedByEntity,
					excessDamage,
					attackingBoard,
					attackingBoardHero,
					gameState,
				);
			} else {
				damageDoneByAttacker += defenderNeighbours
					.map((neighbour) =>
						dealDamageToMinion(
							neighbour,
							defendingBoard,
							defendingBoardHero,
							defendingEntity.lastAffectedByEntity,
							excessDamage,
							attackingBoard,
							attackingBoardHero,
							gameState,
						),
					)
					.reduce((a, b) => a + b, 0);
			}
		}
	}

	// After attack hooks
	// Arcane Cannon
	// Monstrous Macaw
	if (
		attackingEntity.cardId === CardIds.MonstrousMacaw_BGS_078 ||
		attackingEntity.cardId === CardIds.MonstrousMacaw_TB_BaconUps_135
	) {
		const loops = attackingEntity.cardId === CardIds.MonstrousMacaw_TB_BaconUps_135 ? 2 : 1;
		const validDeathrattles = getValidDeathrattles(attackingBoard, gameState);
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

	attackingEntity.attackImmediately = false;
	if (attackingEntity.enchantments.some((e) => e.cardId === CardIds.VolatileVenom_VolatileEnchantment)) {
		attackingEntity.definitelyDead = true;
	}
	return { damageDoneByAttacker, damageDoneByDefender };
};

const triggerRandomDeathrattle = (
	sourceEntity: BoardEntity,
	attackingBoard: BoardEntity[],
	attackingBoardHero: BgsPlayerEntity,
	defendingBoard: BoardEntity[],
	defendingBoardHero: BgsPlayerEntity,
	gameState: FullGameState,
	excludeSource = false,
): void => {
	const validDeathrattles = getValidDeathrattles(attackingBoard, gameState).filter(
		(entity) => !excludeSource || entity.entityId !== sourceEntity.entityId,
	);
	if (validDeathrattles.length === 0) {
		return;
	}
	const targetEntity = pickRandom(validDeathrattles);
	if (!targetEntity?.cardId) {
		console.error(
			'missing card id when triggering random deathrattle',
			stringifySimpleCard(targetEntity, gameState.allCards),
			targetEntity,
			validDeathrattles.length,
			stringifySimple(validDeathrattles, gameState.allCards),
			stringifySimple(attackingBoard, gameState.allCards),
			excludeSource,
			stringifySimpleCard(sourceEntity, gameState.allCards),
		);
	}
	gameState.spectator.registerPowerTarget(
		sourceEntity,
		targetEntity,
		attackingBoard,
		attackingBoardHero,
		defendingBoardHero,
	);
	const indexFromRight = attackingBoard.length - (attackingBoard.indexOf(targetEntity) + 1);

	processDeathrattleForMinion(
		targetEntity,
		indexFromRight,
		[targetEntity],
		targetEntity.friendly ? gameState.gameState.player : gameState.gameState.opponent,
		targetEntity.friendly ? gameState.gameState.opponent : gameState.gameState.player,
		gameState,
		false,
	);
	// The reborn minion spawns to the right of the DR spawns
	// buildBoardAfterRebornSpawns(
	// 	attackingBoard,
	// 	attackingBoardHero,
	// 	targetEntity,
	// 	indexFromRight,
	// 	defendingBoard,
	// 	defendingBoardHero,
	// 	allCards,
	// 	spawns,
	// 	sharedState,
	// 	spectator,
	// );
};

const getAttackingEntity = (attackingBoard: BoardEntity[], allCards: AllCardsService): BoardEntity => {
	const debug = attackingBoard.map((e) => ({
		name: allCards.getCard(e.cardId)?.name,
		attacked: e.hasAttacked,
		entityId: e.entityId,
		reborn: e.reborn,
	}));
	let validAttackers = attackingBoard.filter((entity) => canAttack(entity));
	if (validAttackers.length === 0) {
		return null;
	}

	// console.debug(
	// 	'\nvalid attackers',
	// 	stringifySimple(validAttackers, allCards),
	// 	stringifySimple(attackingBoard, allCards),
	// );

	if (validAttackers.some((entity) => entity.attackImmediately)) {
		validAttackers = validAttackers.filter((entity) => entity.attackImmediately);
	} else if (validAttackers.every((e) => e.hasAttacked)) {
		attackingBoard.forEach((e) => (e.hasAttacked = 0));
	} else {
		validAttackers = validAttackers.filter((entity) => !entity.hasAttacked);
	}
	const attacker = validAttackers[0];
	// console.debug('\t attacker', stringifySimpleCard(attacker, allCards));
	return attacker;
};

export const findNearestEnemies = (
	attackingBoard: BoardEntity[],
	entity: BoardEntity,
	entityIndexFromRight: number,
	defendingBoard: BoardEntity[],
	numberOfTargets: number,
	allCards: AllCardsService,
): BoardEntity[] => {
	const result = [];
	if (defendingBoard.length > 0) {
		// console.debug('defending board', numberOfTargets, stringifySimple(defendingBoard, allCards));
		const attackerIndex = attackingBoard.length - entityIndexFromRight - 1;
		const targetIndex = attackerIndex - (attackingBoard.length - defendingBoard.length) / 2;
		// console.debug('indexes', attackerIndex, entityIndexFromRight, targetIndex, attackingBoard.length);

		for (let i = 0; i < numberOfTargets; i++) {
			const possibleTargets = defendingBoard
				.filter((e) => !e.definitelyDead && e.health > 0)
				.filter((e) => !result.includes(e));
			// console.debug('possibleTargets', stringifySimple(possibleTargets, allCards));
			if (!possibleTargets.length) {
				break;
			}

			const targetGroups = groupByFunction((e: BoardEntity) => Math.abs(defendingBoard.indexOf(e) - targetIndex))(
				possibleTargets,
			);
			const distances = Object.keys(targetGroups)
				.map((k) => +k)
				.sort();
			const nearestDistance = distances[0];
			if (nearestDistance != null) {
				// console.debug(
				// 	'targetGroups[nearestDistance]',
				// 	nearestDistance,
				// 	stringifySimple(targetGroups[nearestDistance], allCards),
				// );
				const target = pickRandom(targetGroups[nearestDistance]);
				result.push(target);
			}
			// console.debug('\n');
		}
	}
	return result.filter((e) => !!e);
};

export const getNeighbours = (
	board: BoardEntity[],
	entity: BoardEntity,
	deadEntityIndexFromRight?: number,
): readonly BoardEntity[] => {
	const neighbours = [];
	// When triggering DR with Hawkstrider, the entity is still on the board
	if (deadEntityIndexFromRight != null && !board.includes(entity)) {
		const leftNeighbourIndex = board.length - 1 - deadEntityIndexFromRight;
		const leftNeighbour = board[leftNeighbourIndex];
		if (leftNeighbour) {
			neighbours.push(leftNeighbour);
		}

		// If the deadEntityIndexFromRight === 0 (right-most minion), no neighbour will be found
		const rightNeighbourIndex = board.length - 1 - (deadEntityIndexFromRight - 1);
		const rightNeighbour = board[rightNeighbourIndex];
		if (rightNeighbour) {
			neighbours.push(rightNeighbour);
		}
	} else {
		const index = board.map((e) => e.entityId).indexOf(entity.entityId);
		if (index - 1 >= 0) {
			neighbours.push(board[index - 1]);
		}
		// neighbours.push(entity);
		if (index + 1 < board.length) {
			neighbours.push(board[index + 1]);
		}
	}
	return neighbours;
};

export const getLeftNeighbour = (
	board: BoardEntity[],
	entity: BoardEntity,
	deadEntityIndexFromRight?: number,
): BoardEntity => {
	// When triggering DR with Hawkstrider, the entity is still on the board
	if (deadEntityIndexFromRight != null && !board.includes(entity)) {
		const leftNeighbourIndex = board.length - 1 - deadEntityIndexFromRight;
		const leftNeighbour = board[leftNeighbourIndex];
		if (leftNeighbour) {
			return leftNeighbour;
		}
	} else {
		const index = board.map((e) => e.entityId).indexOf(entity.entityId);
		if (index - 1 >= 0) {
			return board[index - 1];
		}
	}
	return null;
};

export const dealDamageToRandomEnemy = (
	boardToBeDamaged: BoardEntity[],
	boardToBeDamagedHero: BgsPlayerEntity,
	damageSource: BoardEntity,
	damage: number,
	boardWithAttackOrigin: BoardEntity[],
	boardWithAttackOriginHero: BgsPlayerEntity,
	gameState: FullGameState,
): void => {
	if (boardToBeDamaged.length === 0) {
		return;
	}
	const validTargets = boardToBeDamaged.filter((e) => e.health > 0 && !e.definitelyDead);
	const defendingEntity: BoardEntity = pickRandom(validTargets);
	if (defendingEntity) {
		gameState.spectator.registerPowerTarget(
			damageSource,
			defendingEntity,
			boardToBeDamaged,
			boardToBeDamagedHero,
			boardWithAttackOriginHero,
		);
		dealDamageToMinion(
			defendingEntity,
			boardToBeDamaged,
			boardToBeDamagedHero,
			damageSource,
			damage,
			boardWithAttackOrigin,
			boardWithAttackOriginHero,
			gameState,
		);
	}
};

export const dealDamageToMinion = (
	target: BoardEntity,
	board: BoardEntity[],
	hero: BgsPlayerEntity,
	damageSource: BoardEntity,
	damage: number,
	otherBoard: BoardEntity[],
	otherHero: BgsPlayerEntity,
	gameState: FullGameState,
): number => {
	// console.log('dealing damage to', damage, stringifySimpleCard(defendingEntity, allCards));
	if (!target) {
		return 0;
	}

	const isDeadBeforeDamage = target.definitelyDead || target.health <= 0;
	const spawns = [];
	// Why do we use a fakeAttacker? Is that for the "attacking" prop?
	// That prop is only used for Overkill, and even in that case it looks like it would work
	// without it
	const fakeAttacker = {
		...(damageSource || {}),
		entityId: -1,
		attack: damage,
		attacking: true,
	} as BoardEntity;
	const actualDamageDone = bumpEntities(target, fakeAttacker, board, hero, otherBoard, otherHero, gameState);
	// Do it after the damage has been done, so that entities that update on DS lose / gain (CyborgDrake) don't
	// cause wrong results to happen
	if (fakeAttacker.attack > 0 && target.divineShield) {
		updateDivineShield(target, board, false, gameState.allCards);
	}
	if (actualDamageDone > 0) {
		// TODO: handle entities that have been spawned here to adjust the dead entity index from parent stack
		const newSpawns = onEntityDamaged(target, board, hero, otherBoard, otherHero, actualDamageDone, gameState);
	}
	if (!isDeadBeforeDamage && actualDamageDone > 0) {
		target.lastAffectedByEntity = damageSource;

		if (target.health <= 0 || target.definitelyDead) {
			onMinionKill(damageSource, target, otherBoard, otherHero, board, hero, gameState);
		}
	}
	const defendingEntityIndex = board.map((entity) => entity.entityId).indexOf(target.entityId);
	board[defendingEntityIndex] = target;
	return actualDamageDone;
};

export const getDefendingEntity = (
	defendingBoard: BoardEntity[],
	attackingEntity: BoardEntity,
	ignoreTaunts = false,
): BoardEntity => {
	// if (attackingEntity.entityId === 2029) {
	// 	return defendingBoard.find((e) => e.entityId === 1399);
	// }
	// if (attackingEntity.entityId === 2040) {
	// 	return defendingBoard.find((e) => e.entityId === 2042);
	// }

	let possibleDefenders: readonly BoardEntity[];
	if (
		attackingEntity.cardId === CardIds.ZappSlywick_BGS_022 ||
		attackingEntity.cardId === CardIds.ZappSlywick_TB_BaconUps_091
	) {
		const minAttack = Math.min(...defendingBoard.map((entity) => entity.attack));
		possibleDefenders = defendingBoard.filter((entity) => entity.attack === minAttack);
	} else if (
		attackingEntity.cardId === CardIds.WorgenVigilante_BG26_921 ||
		attackingEntity.cardId === CardIds.WorgenVigilante_BG26_921_G
	) {
		possibleDefenders = defendingBoard
			.filter(
				(entity) =>
					entity.health <= attackingEntity.attack || attackingEntity.venomous || attackingEntity.poisonous,
			)
			.filter((e) => !e.divineShield);
		if (!possibleDefenders.length) {
			possibleDefenders = defendingBoard;
		}
	} else {
		possibleDefenders = defendingBoard.filter((e) => !e.stealth);
		if (!ignoreTaunts) {
			const taunts = possibleDefenders.filter((entity) => entity.taunt);
			possibleDefenders = taunts.length > 0 ? taunts : possibleDefenders;
		}
	}

	let chosenDefender = pickRandom(possibleDefenders);
	if (chosenDefender?.taunt) {
		const elistras = defendingBoard.filter(
			(entity) =>
				entity.cardId === CardIds.ElistraTheImmortal_BGS_205 ||
				entity.cardId === CardIds.ElistraTheImmortal_TB_BaconUps_306,
		);
		if (elistras.length > 0) {
			chosenDefender = elistras[Math.floor(Math.random() * elistras.length)];
		}
	}
	return chosenDefender;
};

export const bumpEntities = (
	entity: BoardEntity,
	bumpInto: BoardEntity,
	entityBoard: BoardEntity[],
	entityBoardHero: BgsPlayerEntity,
	otherBoard: BoardEntity[],
	otherHero: BgsPlayerEntity,
	gameState: FullGameState,
	applyVenomous = true,
): number => {
	// No attack has no impact
	if (bumpInto.attack === 0) {
		return 0;
	}

	// Matador effect has priority
	if (
		entity.abiityChargesLeft > 0 &&
		(entity.cardId === CardIds.MadMatador_BG28_404 || entity.cardId === CardIds.MadMatador_BG28_404_G)
	) {
		entity.abiityChargesLeft--;
		const newTarget = pickRandom(otherBoard);
		if (newTarget) {
			gameState.spectator.registerPowerTarget(entity, newTarget, otherBoard, entityBoardHero, otherHero);
			// TODO: here the MadMatador is the source of the damage, not the initial attacker
			// Not sure exactly what the impact would be, as there is no counter
			const newSource = {
				...entity,
				attack: bumpInto.attack,
				attacking: true,
			} as BoardEntity;
			const defenderHadDivineShield = newTarget.divineShield;
			const damageDone = bumpEntities(
				newTarget,
				newSource,
				otherBoard,
				otherHero,
				entityBoard,
				entityBoardHero,
				gameState,
				false,
			);
			if (newSource.attack > 0 && defenderHadDivineShield) {
				updateDivineShield(newTarget, otherBoard, false, gameState.allCards);
			}
			if (damageDone > 0) {
				onEntityDamaged(newTarget, otherBoard, otherHero, entityBoard, entityBoardHero, damageDone, gameState);
			}
			return damageDone;
		}
	}

	if (entity.divineShield) {
		// Handle all the divine shield loss effects here
		for (let i = 0; i < entityBoard.length; i++) {
			if (entityBoard[i].cardId === CardIds.BolvarFireblood_ICC_858) {
				modifyAttack(entityBoard[i], 2, entityBoard, entityBoardHero, gameState);
				onStatsUpdate(entityBoard[i], entityBoard, entityBoardHero, gameState);
				gameState.spectator.registerPowerTarget(
					entityBoard[i],
					entityBoard[i],
					entityBoard,
					entityBoardHero,
					otherHero,
				);
			} else if (entityBoard[i].cardId === CardIds.BolvarFireblood_TB_BaconUps_047) {
				modifyAttack(entityBoard[i], 4, entityBoard, entityBoardHero, gameState);
				onStatsUpdate(entityBoard[i], entityBoard, entityBoardHero, gameState);
				gameState.spectator.registerPowerTarget(
					entityBoard[i],
					entityBoard[i],
					entityBoard,
					entityBoardHero,
					otherHero,
				);
			} else if (entityBoard[i].cardId === CardIds.DrakonidEnforcer_BGS_067) {
				modifyAttack(entityBoard[i], 2, entityBoard, entityBoardHero, gameState);
				modifyHealth(entityBoard[i], 2, entityBoard, entityBoardHero, gameState);
				onStatsUpdate(entityBoard[i], entityBoard, entityBoardHero, gameState);
				gameState.spectator.registerPowerTarget(
					entityBoard[i],
					entityBoard[i],
					entityBoard,
					entityBoardHero,
					otherHero,
				);
			} else if (entityBoard[i].cardId === CardIds.DrakonidEnforcer_TB_BaconUps_117) {
				modifyAttack(entityBoard[i], 4, entityBoard, entityBoardHero, gameState);
				modifyHealth(entityBoard[i], 4, entityBoard, entityBoardHero, gameState);
				onStatsUpdate(entityBoard[i], entityBoard, entityBoardHero, gameState);
				gameState.spectator.registerPowerTarget(
					entityBoard[i],
					entityBoard[i],
					entityBoard,
					entityBoardHero,
					otherHero,
				);
			} else if (
				entityBoard[i].entityId !== entity.entityId &&
				(entityBoard[i].cardId === CardIds.HolyMecherel_BG20_401 ||
					entityBoard[i].cardId === CardIds.HolyMecherel_BG20_401_G)
			) {
				updateDivineShield(entityBoard[i], entityBoard, true, gameState.allCards);
			} else if (entityBoard[i].cardId === CardIds.Gemsplitter_BG21_037) {
				addCardsInHand(entityBoardHero, entityBoard, [CardIds.BloodGem], gameState);
			} else if (entityBoard[i].cardId === CardIds.Gemsplitter_BG21_037_G) {
				addCardsInHand(entityBoardHero, entityBoard, [CardIds.BloodGem, CardIds.BloodGem], gameState);
			} else if (
				entityBoard[i].cardId === CardIds.CogworkCopter_BG24_008 ||
				entityBoard[i].cardId === CardIds.CogworkCopter_BG24_008_G
			) {
				// When it's the opponent, the game state already contains all the buffs
				if (entityBoard[i]?.friendly) {
					const buff = entityBoard[i].cardId === CardIds.CogworkCopter_BG24_008_G ? 2 : 1;
					grantRandomStats(
						entityBoard[i],
						entityBoardHero.hand.filter(
							(e) =>
								gameState.allCards.getCard(e.cardId).type?.toUpperCase() === CardType[CardType.MINION],
						),
						entityBoardHero,
						buff,
						buff,
						null,
						true,
						gameState,
					);
				}
			}

			// So that self-buffs from Bolvar are taken into account
			// if (entityBoard[i].entityId === entity.entityId && entity.divineShield) {
			// 	updateDivineShield(entityBoard[i], entityBoard, false, allCards);
			// }
		}
		const greaseBots = entityBoard.filter((entity) => entity.cardId === CardIds.GreaseBot_BG21_024);
		const greaseBotBattlegrounds = entityBoard.filter((entity) => entity.cardId === CardIds.GreaseBot_BG21_024_G);
		greaseBots.forEach((bot) => {
			modifyAttack(entity, 2, entityBoard, entityBoardHero, gameState);
			modifyHealth(entity, 2, entityBoard, entityBoardHero, gameState);
			gameState.spectator.registerPowerTarget(bot, entity, entityBoard, entityBoardHero, otherHero);
		});
		greaseBotBattlegrounds.forEach((bot) => {
			modifyAttack(entity, 4, entityBoard, entityBoardHero, gameState);
			modifyHealth(entity, 4, entityBoard, entityBoardHero, gameState);
			gameState.spectator.registerPowerTarget(bot, entity, entityBoard, entityBoardHero, otherHero);
		});

		gameState.spectator.registerDamageDealt(bumpInto, entity, 0, entityBoard);
		return 0;
		// return entity;
	}

	const damageDealt = (entity.damageMultiplier || 1) * bumpInto.attack;
	entity.health = entity.health - damageDealt;
	// FIXME: This will likely be incorrect in terms of timings, e.g. if the entity ends up
	// surviving following a buff like Spawn.
	gameState.spectator.registerDamageDealt(bumpInto, entity, damageDealt, entityBoard);

	if (entity.cardId === CardIds.Bubblette_BG_TID_713 && bumpInto.attack === 1) {
		entity.definitelyDead = true;
	} else if (entity.cardId === CardIds.Bubblette_BG_TID_713_G && bumpInto.attack === 2) {
		entity.definitelyDead = true;
	}
	// Do it last, so that other effects are still processed
	if (bumpInto.poisonous) {
		// So that further buffs don't revive it
		// And we don't just set the health to avoid applying overkill effects
		entity.definitelyDead = true;
	}
	if (bumpInto.venomous && applyVenomous) {
		// So that further buffs don't revive it
		// And we don't just set the health to avoid applying overkill effects
		entity.definitelyDead = true;
		bumpInto.venomous = false;
	}
	// Ideally we should do the Reckoning stuff here. However, at this point we only have half the damage
	// information, so it is possible that the entity deals more than 3 (which should trigger Reckoning)
	// but dies during the exchange (and Reckoning doesn't trigger then)

	entity.lastAffectedByEntity = bumpInto;
	if (entity.frenzyChargesLeft > 0 && entity.health > 0 && !entity.definitelyDead) {
		applyFrenzy(entity, entityBoard, entityBoardHero, gameState);
		entity.frenzyChargesLeft--;
	}

	// We spawn them here, because it says "whenever", and so happens right away
	// FIXME: there could be a bug here, if a Cleave attacks several IGB at the same time. The current
	// implementation could spawn minions above the max board size. Fringe case though, so leaving it
	// like this for now
	// const entitySpawns = getWheneverEntitySpawns(
	// 	entity,
	// 	entityBoard,
	// 	entityBoardHero,
	// 	otherBoard,
	// 	otherHero,
	// 	gameState.allCards,
	// 	gameState.cardsData,
	// 	gameState.sharedState,
	// 	gameState.spectator,
	// );
	// if (!!entitySpawns?.length) {
	// 	// Spawn to the right
	// 	const index = entityBoard.map((e) => e.entityId).indexOf(entity.entityId) + 1;
	// 	addMinionsToBoard(entityBoard, entityBoardHero, otherHero, index, entitySpawns, gameState);
	// 	gameState.spectator.registerMinionsSpawn(entity, entityBoard, entitySpawns);
	// }
	return bumpInto.attack;
};

// const getWheneverEntitySpawns = (
// 	entity: BoardEntity,
// 	entityBoard: BoardEntity[],
// 	entityBoardHero: BgsPlayerEntity,
// 	otherBoard: BoardEntity[],
// 	otherHero: BgsPlayerEntity,
// 	allCards: AllCardsService,
// 	cardsData: CardsData,
// 	sharedState: SharedState,
// 	spectator: Spectator,
// ): readonly BoardEntity[] => {
// 	if (entityBoard.length === 7) {
// 		return null;
// 	}

// 	if (entity.cardId === CardIds.ImpGangBoss_BRM_006) {
// 		return spawnEntities(
// 			CardIds.ImpGangBoss_ImpToken_BRM_006t,
// 			1,
// 			entityBoard,
// 			entityBoardHero,
// 			otherBoard,
// 			otherHero,
// 			allCards,
// 			cardsData,
// 			sharedState,
// 			spectator,
// 			entity.friendly,
// 			true,
// 		);
// 	} else if (entity.cardId === CardIds.ImpGangBoss_TB_BaconUps_030) {
// 		return spawnEntities(
// 			CardIds.ImpGangBoss_ImpToken_TB_BaconUps_030t,
// 			1,
// 			entityBoard,
// 			entityBoardHero,
// 			otherBoard,
// 			otherHero,
// 			allCards,
// 			cardsData,
// 			sharedState,
// 			spectator,
// 			entity.friendly,
// 			true,
// 		);
// 	} else if (entity.cardId === CardIds.ImpMama_BGS_044) {
// 		return spawnEntities(
// 			cardsData.impMamaSpawns[Math.floor(Math.random() * cardsData.impMamaSpawns.length)],
// 			1,
// 			entityBoard,
// 			entityBoardHero,
// 			otherBoard,
// 			otherHero,
// 			allCards,
// 			cardsData,
// 			sharedState,
// 			spectator,
// 			entity.friendly,
// 			true,
// 		).map((entity) => ({ ...entity, taunt: true }));
// 	} else if (entity.cardId === CardIds.ImpMama_TB_BaconUps_116) {
// 		return spawnEntities(
// 			cardsData.impMamaSpawns[Math.floor(Math.random() * cardsData.impMamaSpawns.length)],
// 			2,
// 			entityBoard,
// 			entityBoardHero,
// 			otherBoard,
// 			otherHero,
// 			allCards,
// 			cardsData,
// 			sharedState,
// 			spectator,
// 			entity.friendly,
// 			true,
// 		).map((entity) => ({ ...entity, taunt: true }));
// 	} else if (entity.cardId === CardIds.SecurityRover_BOT_218) {
// 		return spawnEntities(
// 			CardIds.SecurityRover_GuardBotToken_BOT_218t,
// 			1,
// 			entityBoard,
// 			entityBoardHero,
// 			otherBoard,
// 			otherHero,
// 			allCards,
// 			cardsData,
// 			sharedState,
// 			spectator,
// 			entity.friendly,
// 			true,
// 		);
// 	} else if (entity.cardId === CardIds.SecurityRover_TB_BaconUps_041) {
// 		return spawnEntities(
// 			CardIds.SecurityRover_GuardBotToken_TB_BaconUps_041t,
// 			1,
// 			entityBoard,
// 			entityBoardHero,
// 			otherBoard,
// 			otherHero,
// 			allCards,
// 			cardsData,
// 			sharedState,
// 			spectator,
// 			entity.friendly,
// 			true,
// 		);
// 	}
// 	return null;
// };

export const processMinionDeath = (
	board1: BoardEntity[],
	board1Hero: BgsPlayerEntity,
	board2: BoardEntity[],
	board2Hero: BgsPlayerEntity,
	gameState: FullGameState,
): void => {
	// const debug = board1.some((e) => e.health <= 0) || board2.some((e) => e.health <= 0);
	// debug && console.debug('\nprocessing minions death');
	// debug && console.debug(stringifySimple(board1, gameState.allCards));
	// debug && console.debug(stringifySimple(board2, gameState.allCards));
	const [deadMinionIndexesFromRights1, deadEntities1] = makeMinionsDie(
		board1,
		board1Hero,
		board2,
		board2Hero,
		gameState,
	);
	const [deadMinionIndexesFromRights2, deadEntities2] = makeMinionsDie(
		board2,
		board2Hero,
		board1,
		board1Hero,
		gameState,
	);
	// debug && console.debug('after processing minions death');
	// debug && console.debug(stringifySimple(board1, gameState.allCards));
	// debug && console.debug(stringifySimple(board2, gameState.allCards));
	// debug && console.debug(deadMinionIndexesFromRights1);
	// debug && console.debug(deadMinionIndexesFromRights2);
	// console.debug('dead entities', stringifySimple(deadEntities1, allCards), stringifySimple(deadEntities2, allCards));
	// No death to process, we can return
	if (deadEntities1.length === 0 && deadEntities2.length === 0) {
		return;
		// return [board1, board2];
	}

	// Remember them right away, so that subsequent deaths do not break the order
	// TODO: move this to the deathrattle-orchestration?
	// If the fish dies (from Scallywag for instance), it doesn't remember the deathrattle
	board1
		.filter((entity) => isFish(entity))
		.forEach((entity) =>
			rememberDeathrattles(entity, deadEntities1, gameState.cardsData, gameState.allCards, gameState.sharedState),
		);
	board2
		.filter((entity) => isFish(entity))
		.forEach((entity) =>
			rememberDeathrattles(entity, deadEntities2, gameState.cardsData, gameState.allCards, gameState.sharedState),
		);

	gameState.spectator.registerDeadEntities(
		deadMinionIndexesFromRights1,
		deadEntities1,
		board1,
		deadMinionIndexesFromRights2,
		deadEntities2,
		board2,
	);
	gameState.sharedState.deaths.push(
		...deadEntities1.map((e) =>
			addImpliedMechanics({ ...e, health: e.maxHealth, definitelyDead: false }, gameState.cardsData),
		),
	);
	gameState.sharedState.deaths.push(
		...deadEntities2.map((e) =>
			addImpliedMechanics({ ...e, health: e.maxHealth, definitelyDead: false }, gameState.cardsData),
		),
	);
	board1Hero.globalInfo.EternalKnightsDeadThisGame =
		board1Hero.globalInfo.EternalKnightsDeadThisGame +
		deadEntities1.filter(
			(e) => e.cardId === CardIds.EternalKnight_BG25_008 || e.cardId === CardIds.EternalKnight_BG25_008_G,
		).length;
	board2Hero.globalInfo.EternalKnightsDeadThisGame =
		board2Hero.globalInfo.EternalKnightsDeadThisGame +
		deadEntities2.filter(
			(e) => e.cardId === CardIds.EternalKnight_BG25_008 || e.cardId === CardIds.EternalKnight_BG25_008_G,
		).length;

	orchestrateMinionDeathEffects({
		gameState: gameState,
		playerDeadEntities: board1Hero.friendly ? deadEntities1 : deadEntities2,
		playerDeadEntityIndexesFromRight: board1Hero.friendly
			? deadMinionIndexesFromRights1
			: deadMinionIndexesFromRights2,
		opponentDeadEntities: board1Hero.friendly ? deadEntities2 : deadEntities1,
		opponentDeadEntityIndexesFromRight: board1Hero.friendly
			? deadMinionIndexesFromRights2
			: deadMinionIndexesFromRights1,
	});

	board1
		.filter(
			(entity) =>
				entity.cardId === CardIds.Monstrosity_BG20_HERO_282_Buddy ||
				entity.cardId === CardIds.Monstrosity_BG20_HERO_282_Buddy_G,
		)
		.forEach((entity) => applyMonstrosity(entity, deadEntities1, board1, board1Hero, gameState));
	board2
		.filter(
			(entity) =>
				entity.cardId === CardIds.Monstrosity_BG20_HERO_282_Buddy ||
				entity.cardId === CardIds.Monstrosity_BG20_HERO_282_Buddy_G,
		)
		.forEach((entity) => applyMonstrosity(entity, deadEntities2, board2, board2Hero, gameState));

	// Make sure we only return when there are no more deaths to process
	// Make sure to do this right before the end of the process
	// FIXME: this will propagate the killer between rounds, which is incorrect. For instance,
	// if a dragon kills a Ghoul, then the Ghoul's deathrattle kills a Kaboom, the killer should
	// now be the ghoul. Then if the Kaboom kills someone, the killer should again change. You could
	// also have multiple killers, which is not taken into account here.
	// The current assumption is that it's a suffienctly fringe case to not matter too much
	processMinionDeath(board1, board1Hero, board2, board2Hero, gameState);

	// Not sure about the timing here, but I have bothered Mitchell quite a lot already recently :)
	handleSummonsWhenSpace(board1, board1Hero, board2, board2Hero, gameState);

	// Apply "after minion death" effects
	handleAfterMinionsDeaths(board1, deadEntities1, board1Hero, board2, deadEntities2, board2Hero, gameState);
};

const handleAfterMinionsDeaths = (
	board1: BoardEntity[],
	deadEntities1: BoardEntity[],
	heroEntity1: BgsPlayerEntity,
	board2: BoardEntity[],
	deadEntities2: BoardEntity[],
	heroEntity2: BgsPlayerEntity,
	gameState: FullGameState,
) => {
	const random = Math.random() > 0.5;
	handleAfterMinionsDeathsForBoard(
		random ? board1 : board2,
		random ? deadEntities1 : deadEntities2,
		random ? heroEntity1 : heroEntity2,
		random ? board2 : board1,
		random ? deadEntities2 : deadEntities1,
		random ? heroEntity2 : heroEntity1,
		gameState,
	);
	handleAfterMinionsDeathsForBoard(
		!random ? board1 : board2,
		!random ? deadEntities1 : deadEntities2,
		!random ? heroEntity1 : heroEntity2,
		!random ? board2 : board1,
		!random ? deadEntities2 : deadEntities1,
		!random ? heroEntity2 : heroEntity1,
		gameState,
	);
};

const handleAfterMinionsDeathsForBoard = (
	friendlyBoard: BoardEntity[],
	friendlyDeadEntities: BoardEntity[],
	friendlyHeroEntity: BgsPlayerEntity,
	otherBoard: BoardEntity[],
	otherDeadEntities: BoardEntity[],
	otherHeroEntity: BgsPlayerEntity,
	gameState: FullGameState,
) => {
	for (const deadEntity of friendlyDeadEntities) {
		const killer = deadEntity.lastAffectedByEntity;
		if (!killer) {
			continue;
		}
		// Killed an enemy minion
		if (killer.friendly !== deadEntity.friendly) {
			if (otherHeroEntity.heroPowerId === CardIds.Rokara_GloryOfCombat) {
				modifyAttack(killer, 1, otherBoard, otherHeroEntity, gameState);
				onStatsUpdate(killer, otherBoard, otherHeroEntity, gameState);
				// Icesnarl the Mighty
				otherBoard
					.filter(
						(e) =>
							e.cardId === CardIds.IcesnarlTheMighty_BG20_HERO_100_Buddy ||
							e.cardId === CardIds.IcesnarlTheMighty_BG20_HERO_100_Buddy_G,
					)
					.forEach((icesnarl) => {
						modifyHealth(
							icesnarl,
							icesnarl.cardId === CardIds.IcesnarlTheMighty_BG20_HERO_100_Buddy_G ? 2 : 1,
							friendlyBoard,
							friendlyHeroEntity,
							gameState,
						);
						onStatsUpdate(icesnarl, friendlyBoard, friendlyHeroEntity, gameState);
					});
			}
		}
	}

	const candidateEntities = [];
	let secretTriggered = null;
	if (
		(secretTriggered = friendlyHeroEntity.secrets?.find(
			(secret) => !secret.triggered && secret?.cardId === CardIds.MagicBlackSoulstone,
		)) != null
	) {
		if (friendlyBoard.length === 0) {
			secretTriggered.triggered = true;
			for (let i = 0; i < 2; i++) {
				const toSummon = pickRandom(gameState.cardsData.demonSpawns);
				candidateEntities.push(
					...spawnEntities(
						toSummon,
						1,
						friendlyBoard,
						friendlyHeroEntity,
						otherBoard,
						otherHeroEntity,
						gameState.allCards,
						gameState.cardsData,
						gameState.sharedState,
						gameState.spectator,
						friendlyHeroEntity.friendly,
						false,
					),
				);
			}
		}
	}
	performEntitySpawns(
		candidateEntities,
		friendlyBoard,
		friendlyHeroEntity,
		secretTriggered,
		0,
		otherBoard,
		otherHeroEntity,
		gameState,
	);
};

// TODO
// const handleDeathrattlesForFirstBoard = (
// 	firstBoard: BoardEntity[],
// 	firstBoardHero: BgsPlayerEntity,
// 	otherBoard: BoardEntity[],
// 	otherBoardHero: BgsPlayerEntity,
// 	deadMinionIndexesFromRight: readonly number[],
// 	deadEntities: readonly BoardEntity[],
// 	gameState: FullGameState,
// ): void => {
// 	// TODO: this can be buggy, in case multiple minions die, both at a 0 or negative final index from left
// 	// In that case, the first minion will spawn at the left, then the next one will spawn again at the left
// 	// thus inverting the expected order
// 	// We still want to process the minions from left to right, but maybe we need to decrease the index from
// 	// the right in case of multiple minions dying and dpawning at the same time
// 	// let boardSizeBeforeDrSpawn = firstBoard.length;
// 	for (let i = 0; i < deadMinionIndexesFromRight.length; i++) {
// 		const entity = deadEntities[i];
// 		const indexFromRight = deadMinionIndexesFromRight[i];
// 		if (entity.health <= 0 || entity.definitelyDead) {
// 			// console.log('\ndead entity', stringifySimpleCard(entity, allCards), indexFromRight);
// 			// console.log(deadMinionIndexesFromRight);
// 			// console.log(stringifySimple(firstBoard, allCards));
// 			// Because we use the index from right, and spawn minions from left to right, we actually
// 			// don't need to update the index after a minion has spawned
// 			const modifiedIndexFromRight = Math.min(firstBoard.length, indexFromRight);
// 			// console.log('spawning at', modifiedIndexFromRight, indexFromRight, totalSpawned, firstBoard.length);
// 			buildBoardAfterDeathrattleSpawns(
// 				firstBoard,
// 				firstBoardHero,
// 				entity,
// 				modifiedIndexFromRight,
// 				otherBoard,
// 				otherBoardHero,
// 				deadEntities,
// 				gameState,
// 			);
// 		} else if (firstBoard.length > 0) {
// 			// const newBoardD = [...firstBoard];
// 			firstBoard.splice(firstBoard.length - indexFromRight, 1, entity);
// 			// firstBoard = newBoardD;
// 		}
// 		// boardSizeBeforeDrSpawn = firstBoard.length;
// 	}
// 	// return [firstBoard, otherBoard];
// };

// const handleRebornForFirstBoard = (
// 	firstBoard: BoardEntity[],
// 	firstBoardHero: BgsPlayerEntity,
// 	otherBoard: BoardEntity[],
// 	otherBoardHero: BgsPlayerEntity,
// 	deadMinionIndexesFromRight: readonly number[],
// 	deadEntities: readonly BoardEntity[],
// 	gameState: FullGameState,
// ): void => {
// 	// console.log('will handle reborn', stringifySimple(firstBoard, allCards), deadMinionIndexesFromRight);
// 	for (let i = deadMinionIndexesFromRight.length - 1; i >= 0; i--) {
// 		const entity = deadEntities[i];
// 		const indexFromRight = deadMinionIndexesFromRight[i];
// 		if (entity.health <= 0 || entity.definitelyDead) {
// 			// console.log('dead entity', stringifySimpleCard(entity, allCards), indexFromRight);
// 			buildBoardAfterRebornSpawns(
// 				firstBoard,
// 				firstBoardHero,
// 				entity,
// 				indexFromRight,
// 				otherBoard,
// 				otherBoardHero,
// 				gameState,
// 			);
// 			// console.log('after rebord', stringifySimple(firstBoard, allCards));
// 		} else if (firstBoard.length > 0) {
// 			// const newBoardD = [...firstBoard];
// 			firstBoard.splice(firstBoard.length - indexFromRight, 1, entity);
// 			// firstBoard = newBoardD;
// 		}
// 	}
// 	// return [firstBoard, otherBoard];
// };

// const handleAfterDeathEffectsForFirstBoard = (
// 	firstBoard: BoardEntity[],
// 	firstBoardHero: BgsPlayerEntity,
// 	otherBoard: BoardEntity[],
// 	otherBoardHero: BgsPlayerEntity,
// 	deadMinionIndexesFromRight: readonly number[],
// 	deadEntities: readonly BoardEntity[],
// 	gameState: FullGameState,
// ): void => {
// 	for (let i = 0; i < deadMinionIndexesFromRight.length; i++) {
// 		const entity = deadEntities[i];
// 		const indexFromRight = deadMinionIndexesFromRight[i];
// 		applyAfterDeathEffects(
// 			entity,
// 			indexFromRight,
// 			firstBoard,
// 			firstBoardHero,
// 			otherBoard,
// 			otherBoardHero,
// 			gameState,
// 		);
// 	}
// };
