/* eslint-disable @typescript-eslint/no-use-before-define */
import { AllCardsService, CardIds, Race } from '@firestone-hs/reference-data';
import { BgsPlayerEntity } from '../bgs-player-entity';
import { BoardEntity } from '../board-entity';
import { CardsData } from '../cards/cards-data';
import { groupByFunction, pickRandom } from '../services/utils';
import { validEnchantments } from '../simulate-bgs-battle';
import {
	addCardsInHand,
	addStatsToBoard,
	afterStatsUpdate,
	grantStatsToMinionsOfEachType,
	hasCorrectTribe,
	hasMechanic,
	isCorrectTribe,
	isFish,
	modifyAttack,
	modifyHealth,
	stringifySimple,
	stringifySimpleCard,
	updateDivineShield,
} from '../utils';
import { addMinionToBoard, addMinionsToBoard } from './add-minion-to-board';
import { applyAvengeEffects } from './avenge';
import {
	applyMinionDeathEffect,
	applyMonstrosity,
	handleDeathrattleEffects,
	rememberDeathrattles,
} from './deathrattle-effects';
import { spawnEntities, spawnEntitiesFromDeathrattle, spawnEntitiesFromEnchantments } from './deathrattle-spawns';
import { applyFrenzy } from './frenzy';
import { removeMinionFromBoard } from './remove-minion-from-board';
import { SharedState } from './shared-state';
import { Spectator } from './spectator/spectator';
import { canAttack } from './utils/entity-utils';

// Only use it to simulate actual attack. To simulate damage, or something similar, use bumpInto
export const simulateAttack = (
	attackingBoard: BoardEntity[],
	attackingBoardHero: BgsPlayerEntity,
	defendingBoard: BoardEntity[],
	defendingBoardHero: BgsPlayerEntity,
	lastAttackerEntityId: number,
	allCards: AllCardsService,
	spawns: CardsData,
	sharedState: SharedState,
	spectator: Spectator,
	forceAttackingEntityIndex?: number,
): number => {
	if (attackingBoard.length === 0 || defendingBoard.length === 0) {
		return;
	}

	const attackingEntity =
		forceAttackingEntityIndex != null
			? attackingBoard[forceAttackingEntityIndex]
			: getAttackingEntity(attackingBoard, lastAttackerEntityId);
	const attackingEntityIndex = attackingBoard.map((e) => e.entityId).indexOf(attackingEntity?.entityId);
	if (attackingEntity) {
		attackingEntity.attacking = true;
		// console.log('attack by', stringifySimpleCard(attackingEntity, allCards), stringifySimple(defendingBoard, allCards));
		const numberOfAttacks = attackingEntity.windfury ? 2 : 1;
		for (let i = 0; i < numberOfAttacks; i++) {
			// We refresh the entity in case of windfury
			if (attackingBoard.length === 0 || defendingBoard.length === 0) {
				return;
			}
			// Check that didn't die
			if (attackingBoard.find((entity) => entity.entityId === attackingEntity.entityId)) {
				applyOnAttackBuffs(attackingEntity, attackingBoard, allCards, spectator);
				const defendingEntity: BoardEntity = getDefendingEntity(defendingBoard, attackingEntity);
				// Can happen with a single defender that has stealth
				if (defendingEntity) {
					// console.log(
					// 	'AATTTTTTTTTTTAAAAAAAAAAAAAAAAAACK by',
					// 	stringifySimpleCard(attackingEntity, allCards),
					// 	stringifySimpleCard(defendingEntity, allCards),
					// 	stringifySimple(attackingBoard, allCards),
					// );
					spectator.registerAttack(attackingEntity, defendingEntity, attackingBoard, defendingBoard);
					applyOnBeingAttackedBuffs(attackingEntity, defendingEntity, defendingBoard, allCards, spectator);
					performAttack(
						attackingEntity,
						defendingEntity,
						attackingBoard,
						attackingBoardHero,
						defendingBoard,
						defendingBoardHero,
						allCards,
						spawns,
						sharedState,
						spectator,
					);
					applyAfterAttackEffects(attackingEntity, attackingBoard, attackingBoardHero, allCards, spectator);
					if (
						defendingEntity.health > 0 &&
						!defendingEntity.definitelyDead &&
						(defendingEntity.cardId === CardIds.YoHoOgre ||
							defendingEntity.cardId === CardIds.YoHoOgreBattlegrounds)
					) {
						defendingEntity.attackImmediately = true;
						if (defendingEntity.attackImmediately) {
							simulateAttack(
								defendingBoard,
								defendingBoardHero,
								attackingBoard,
								attackingBoardHero,
								null,
								allCards,
								spawns,
								sharedState,
								spectator,
							);
						}
					}
					// console.log(
					// 	'after attack by',
					// 	stringifySimpleCard(attackingEntity, allCards),
					// 	stringifySimpleCard(defendingEntity, allCards),
					// );
				} else {
					// Solves the edge case of Sky Pirate vs a stealth board
					attackingEntity.attackImmediately = false;
				}
			}
		}
		attackingEntity.attacking = false;
	}
	// If entities that were before the attacker died, we need to update the attacker index
	return attackingEntityIndex;
};

const applyAfterAttackEffects = (
	attackingEntity: BoardEntity,
	attackingBoard: BoardEntity[],
	attackingBoardHero: BgsPlayerEntity,
	allCards: AllCardsService,
	spectator: Spectator,
): void => {
	if (attackingEntity.cardId === CardIds.Bonker_BG20_104 || attackingEntity.cardId === CardIds.Bonker_BG20_104_G) {
		const quantity = attackingEntity.cardId === CardIds.Bonker_BG20_104_G ? 2 : 1;
		addCardsInHand(attackingBoardHero, quantity, attackingBoard, allCards, spectator, CardIds.BloodGem);
	} else if (attackingEntity.cardId === CardIds.Yrel_BG23_350 || attackingEntity.cardId === CardIds.Yrel_BG23_350_G) {
		const modifier = attackingEntity.cardId === CardIds.Yrel_BG23_350_G ? 2 : 1;
		grantStatsToMinionsOfEachType(attackingEntity, attackingBoard, modifier * 1, modifier * 2, allCards, spectator);
	}
	// Putricide-only
	else if (attackingEntity.additionalCards?.includes(CardIds.IncorporealCorporal_BG26_RLK_117)) {
		attackingEntity.definitelyDead = true;
	}
	attackingBoard
		.filter((e) => e.additionalCards?.includes(CardIds.FesterootHulk_BG_GIL_655))
		.forEach((e) => {
			modifyAttack(e, 1, attackingBoard, allCards);
			afterStatsUpdate(e, attackingBoard, allCards);
		});

	attackingEntity.stealth = false;
};

const performAttack = (
	attackingEntity: BoardEntity,
	defendingEntity: BoardEntity,
	attackingBoard: BoardEntity[],
	attackingBoardHero: BgsPlayerEntity,
	defendingBoard: BoardEntity[],
	defendingBoardHero: BgsPlayerEntity,
	allCards: AllCardsService,
	cardsData: CardsData,
	sharedState: SharedState,
	spectator: Spectator,
): void => {
	if (hasCorrectTribe(attackingEntity, Race.DRAGON, allCards)) {
		const prestors = attackingBoard
			.filter((e) => e.entityId !== attackingEntity.entityId)
			.filter(
				(e) =>
					e.cardId === CardIds.PrestorsPyrospawn_BG21_012 ||
					e.cardId === CardIds.PrestorsPyrospawn_BG21_012_G,
			);
		prestors.forEach((prestor) => {
			spectator.registerPowerTarget(prestor, defendingEntity, defendingBoard);
			dealDamageToEnemy(
				defendingEntity,
				defendingBoard,
				defendingBoardHero,
				prestor,
				prestor.cardId === CardIds.PrestorsPyrospawn_BG21_012_G ? 6 : 3,
				attackingBoard,
				attackingBoardHero,
				allCards,
				cardsData,
				sharedState,
				spectator,
			);
		});
	}
	if (
		attackingEntity.cardId === CardIds.Atramedes_BG23_362 ||
		attackingEntity.cardId === CardIds.AtramedesBattlegrounds
	) {
		const targets = [defendingEntity, ...getNeighbours(defendingBoard, defendingEntity)];
		const multiplier = attackingEntity.cardId === CardIds.AtramedesBattlegrounds ? 2 : 1;

		for (let i = 0; i < multiplier; i++) {
			targets.forEach((target) => {
				spectator.registerPowerTarget(attackingEntity, target, defendingBoard);
				dealDamageToEnemy(
					target,
					defendingBoard,
					defendingBoardHero,
					attackingEntity,
					3,
					attackingBoard,
					attackingBoardHero,
					allCards,
					cardsData,
					sharedState,
					spectator,
				);
			});
		}
	}

	if ([CardIds.BabyKrush_BG22_001, CardIds.BabyKrush_BG22_001_G].includes(attackingEntity.cardId as CardIds)) {
		const spawns = spawnEntities(
			attackingEntity.cardId === CardIds.BabyKrush_BG22_001_G
				? CardIds.DevilsaurBattlegrounds
				: CardIds.BabyKrush_DevilsaurToken,
			1,
			attackingBoard,
			attackingBoardHero,
			defendingBoard,
			defendingBoardHero,
			allCards,
			cardsData,
			sharedState,
			spectator,
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
				allCards,
				cardsData,
				sharedState,
				spectator,
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
						allCards,
						cardsData,
						sharedState,
						spectator,
					);
				}
			}
		}
	}

	// For Prestor
	const defenderAliveBeforeAttack = defendingEntity.health > 0 && !defendingEntity.definitelyDead;
	if (defenderAliveBeforeAttack) {
		if (!attackingEntity.immuneWhenAttackCharges || attackingEntity.immuneWhenAttackCharges <= 0) {
			bumpEntities(
				attackingEntity,
				defendingEntity,
				attackingBoard,
				attackingBoardHero,
				defendingBoard,
				defendingBoardHero,
				allCards,
				cardsData,
				sharedState,
				spectator,
			);
		}
		bumpEntities(
			defendingEntity,
			attackingEntity,
			defendingBoard,
			defendingBoardHero,
			attackingBoard,
			attackingBoardHero,
			allCards,
			cardsData,
			sharedState,
			spectator,
		);
		// Do it after the damage has been done, so that entities that update on DS lose / gain (CyborgDrake) don't
		// cause wrong results to happen
		if (defendingEntity.attack > 0 && attackingEntity.divineShield) {
			updateDivineShield(attackingEntity, attackingBoard, false, allCards);
		}
		if (attackingEntity.attack > 0 && defendingEntity.divineShield) {
			updateDivineShield(defendingEntity, defendingBoard, false, allCards);
		}
	}
	// Cleave
	if (attackingEntity.cleave) {
		const defenderNeighbours: readonly BoardEntity[] = getNeighbours(defendingBoard, defendingEntity);
		for (const neighbour of defenderNeighbours) {
			bumpEntities(
				neighbour,
				attackingEntity,
				defendingBoard,
				defendingBoardHero,
				attackingBoard,
				attackingBoardHero,
				allCards,
				cardsData,
				sharedState,
				spectator,
			);
			// Do it after the damage has been done, so that entities that update on DS lose / gain (CyborgDrake) don't
			// cause wrong results to happen
			if (attackingEntity.attack > 0 && neighbour.divineShield) {
				updateDivineShield(neighbour, defendingBoard, false, allCards);
			}
		}
	}
	if (
		(defendingEntity.health <= 0 || defendingEntity.definitelyDead) &&
		(attackingEntity.cardId === CardIds.WildfireElemental ||
			attackingEntity.cardId === CardIds.WildfireElementalBattlegrounds)
	) {
		const excessDamage = -defendingEntity.health;
		const neighbours = getNeighbours(defendingBoard, defendingEntity);
		// console.log('neighbours', stringifySimple(neighbours, allCards));
		if (neighbours.length > 0) {
			if (attackingEntity.cardId === CardIds.WildfireElemental) {
				const randomTarget = neighbours[Math.floor(Math.random() * neighbours.length)];
				dealDamageToEnemy(
					randomTarget,
					defendingBoard,
					defendingBoardHero,
					defendingEntity.lastAffectedByEntity,
					excessDamage,
					attackingBoard,
					attackingBoardHero,
					allCards,
					cardsData,
					sharedState,
					spectator,
				);
			} else {
				neighbours.forEach((neighbour) =>
					dealDamageToEnemy(
						neighbour,
						defendingBoard,
						defendingBoardHero,
						defendingEntity.lastAffectedByEntity,
						excessDamage,
						attackingBoard,
						attackingBoardHero,
						allCards,
						cardsData,
						sharedState,
						spectator,
					),
				);
			}
		}
	}

	// After attack hooks
	// Arcane Cannon
	// Monstrous Macaw
	if (attackingEntity.cardId === CardIds.MonstrousMacaw) {
		triggerRandomDeathrattle(
			attackingEntity,
			attackingBoard,
			attackingBoardHero,
			defendingBoard,
			defendingBoardHero,
			allCards,
			cardsData,
			sharedState,
			spectator,
			true,
		);
	} else if (attackingEntity.cardId === CardIds.MonstrousMacawBattlegrounds) {
		for (let i = 0; i < 2; i++) {
			triggerRandomDeathrattle(
				attackingEntity,
				attackingBoard,
				attackingBoardHero,
				defendingBoard,
				defendingBoardHero,
				allCards,
				cardsData,
				sharedState,
				spectator,
				true,
			);
		}
	}

	attackingEntity.attackImmediately = false;
	if (attackingEntity.enchantments.some((e) => e.cardId === CardIds.VolatileVenom_VolatileEnchantment)) {
		attackingEntity.definitelyDead = true;
	}
	processMinionDeath(
		attackingBoard,
		attackingBoardHero,
		defendingBoard,
		defendingBoardHero,
		allCards,
		cardsData,
		sharedState,
		spectator,
	);
	attackingEntity.immuneWhenAttackCharges = Math.max(0, attackingEntity.immuneWhenAttackCharges - 1);
};

const triggerRandomDeathrattle = (
	sourceEntity: BoardEntity,
	attackingBoard: BoardEntity[],
	attackingBoardHero: BgsPlayerEntity,
	defendingBoard: BoardEntity[],
	defendingBoardHero: BgsPlayerEntity,
	allCards: AllCardsService,
	spawns: CardsData,
	sharedState: SharedState,
	spectator: Spectator,
	excludeSource = false,
): void => {
	const validDeathrattles = attackingBoard
		.filter((entity) => !excludeSource || entity.entityId !== sourceEntity.entityId)
		.filter((entity) => {
			if (hasMechanic(allCards.getCard(entity.cardId), 'DEATHRATTLE')) {
				return true;
			}
			if (entity.rememberedDeathrattles?.length) {
				return true;
			}
			if (
				entity.enchantments &&
				entity.enchantments
					.map((enchantment) => enchantment.cardId)
					.some((enchantmentId) => validEnchantments.includes(enchantmentId as CardIds))
			) {
				return true;
			}
			return false;
		});
	if (validDeathrattles.length === 0) {
		return;
	}
	const targetEntity = pickRandom(validDeathrattles);
	if (!targetEntity?.cardId) {
		console.error(
			'missing card id when triggering random deathrattle',
			stringifySimpleCard(targetEntity, allCards),
			targetEntity,
			validDeathrattles.length,
			stringifySimple(validDeathrattles, allCards),
			stringifySimple(attackingBoard, allCards),
			excludeSource,
			stringifySimpleCard(sourceEntity, allCards),
		);
	}
	spectator.registerPowerTarget(sourceEntity, targetEntity, attackingBoard);
	const indexFromRight = attackingBoard.length - (attackingBoard.indexOf(targetEntity) + 1);
	buildBoardAfterDeathrattleSpawns(
		attackingBoard,
		attackingBoardHero,
		targetEntity,
		indexFromRight,
		defendingBoard,
		defendingBoardHero,
		[],
		allCards,
		spawns,
		sharedState,
		spectator,
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

const getAttackingEntity = (attackingBoard: BoardEntity[], lastAttackerIndex: number): BoardEntity => {
	let validAttackers = attackingBoard.filter((entity) => canAttack(entity));
	if (validAttackers.length === 0) {
		return null;
	}

	if (validAttackers.some((entity) => entity.attackImmediately)) {
		validAttackers = validAttackers.filter((entity) => entity.attackImmediately);
	}

	// Once an entity has attacked, no entity to the left of it can attack until all entities
	// on the board have attacked
	// Once the last attacker index is the last entity on the board, we cycle back to the start
	if (lastAttackerIndex != null && lastAttackerIndex < validAttackers.length - 1) {
		// This doesn't work if any entity that appears before the attacked index died in-between
		const candidates = validAttackers.slice(lastAttackerIndex);
		if (candidates.length > 0) {
			validAttackers = candidates;
		}
	}

	let attackingEntity = validAttackers[0];
	let minNumberOfAttacks: number = attackingEntity.attacksPerformed || 0;
	for (const entity of validAttackers) {
		if ((entity.attacksPerformed || 0) < minNumberOfAttacks) {
			attackingEntity = entity;
			minNumberOfAttacks = entity.attacksPerformed;
		}
	}

	if (!attackingEntity.attackImmediately) {
		attackingEntity.attacksPerformed = (attackingEntity.attacksPerformed || 0) + 1;
	}
	return attackingEntity;
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
	if (deadEntityIndexFromRight != null) {
		// If the deadEntityIndexFromRight === 0 (right-most minion), no neighbour will be found
		const rightNeighbourIndex = board.length - 1 - (deadEntityIndexFromRight - 1);
		const rightNeighbour = board[rightNeighbourIndex];
		if (rightNeighbour) {
			neighbours.push(rightNeighbour);
		}

		const leftNeighbourIndex = board.length - 1 - deadEntityIndexFromRight;
		const leftNeighbour = board[leftNeighbourIndex];
		if (leftNeighbour) {
			neighbours.push(leftNeighbour);
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

export const dealDamageToRandomEnemy = (
	boardToBeDamaged: BoardEntity[],
	boardToBeDamagedHero: BgsPlayerEntity,
	damageSource: BoardEntity,
	damage: number,
	boardWithAttackOrigin: BoardEntity[],
	boardWithAttackOriginHero: BgsPlayerEntity,
	allCards: AllCardsService,
	cardsData: CardsData,
	sharedState: SharedState,
	spectator: Spectator,
): void => {
	if (boardToBeDamaged.length === 0) {
		return;
	}
	const validTargets = boardToBeDamaged.filter((e) => e.health > 0 && !e.definitelyDead);
	const defendingEntity: BoardEntity = pickRandom(validTargets);
	if (defendingEntity) {
		spectator.registerPowerTarget(damageSource, defendingEntity, boardToBeDamaged);
		dealDamageToEnemy(
			defendingEntity,
			boardToBeDamaged,
			boardToBeDamagedHero,
			damageSource,
			damage,
			boardWithAttackOrigin,
			boardWithAttackOriginHero,
			allCards,
			cardsData,
			sharedState,
			spectator,
		);
	}
};

export const dealDamageToEnemy = (
	defendingEntity: BoardEntity,
	defendingBoard: BoardEntity[],
	defendingBoardHero: BgsPlayerEntity,
	damageSource: BoardEntity,
	damage: number,
	boardWithAttackOrigin: BoardEntity[],
	boardWithAttackOriginHero: BgsPlayerEntity,
	allCards: AllCardsService,
	cardsData: CardsData,
	sharedState: SharedState,
	spectator: Spectator,
): number => {
	// console.log('dealing damage to', damage, stringifySimpleCard(defendingEntity, allCards));
	if (!defendingEntity) {
		return 0;
	}

	const isDeadBeforeDamage = defendingEntity.definitelyDead || defendingEntity.health <= 0;
	// Why do we use a fakeAttacker? Is that for the "attacking" prop?
	// That prop is only used for Overkill, and even in that case it looks like it would work
	// without it
	const fakeAttacker = {
		...(damageSource || {}),
		entityId: -1,
		attack: damage,
		attacking: true,
	} as BoardEntity;
	const actualDamageDone = bumpEntities(
		defendingEntity,
		fakeAttacker,
		defendingBoard,
		defendingBoardHero,
		boardWithAttackOrigin,
		boardWithAttackOriginHero,
		allCards,
		cardsData,
		sharedState,
		spectator,
	);
	// Do it after the damage has been done, so that entities that update on DS lose / gain (CyborgDrake) don't
	// cause wrong results to happen
	if (fakeAttacker.attack > 0 && defendingEntity.divineShield) {
		updateDivineShield(defendingEntity, defendingBoard, false, allCards);
	}
	if (!isDeadBeforeDamage && actualDamageDone > 0) {
		defendingEntity.lastAffectedByEntity = damageSource;
	}
	const defendingEntityIndex = defendingBoard.map((entity) => entity.entityId).indexOf(defendingEntity.entityId);
	defendingBoard[defendingEntityIndex] = defendingEntity;
	return actualDamageDone;
};

export const getDefendingEntity = (
	defendingBoard: BoardEntity[],
	attackingEntity: BoardEntity,
	ignoreTaunts = false,
): BoardEntity => {
	let possibleDefenders: readonly BoardEntity[];
	if (attackingEntity.cardId === CardIds.ZappSlywick || attackingEntity.cardId === CardIds.ZappSlywickBattlegrounds) {
		const minAttack = Math.min(...defendingBoard.map((entity) => entity.attack));
		possibleDefenders = defendingBoard.filter((entity) => entity.attack === minAttack);
	} else {
		possibleDefenders = defendingBoard.filter((e) => !e.stealth);
		if (!ignoreTaunts) {
			const taunts = possibleDefenders.filter((entity) => entity.taunt);
			possibleDefenders = taunts.length > 0 ? taunts : possibleDefenders;
		}
	}
	let chosenDefender = possibleDefenders[Math.floor(Math.random() * possibleDefenders.length)];
	if (chosenDefender?.taunt) {
		const elistras = defendingBoard.filter(
			(entity) =>
				entity.cardId === CardIds.ElistraTheImmortal_BGS_205 ||
				entity.cardId === CardIds.ElistraTheImmortalBattlegrounds,
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
	allCards: AllCardsService,
	cardsData: CardsData,
	sharedState: SharedState,
	spectator: Spectator,
): number => {
	// No attack has no impact
	if (bumpInto.attack === 0) {
		return 0;
	}

	if (entity.divineShield) {
		// Handle all the divine shield loss effects here
		for (let i = 0; i < entityBoard.length; i++) {
			if (entityBoard[i].cardId === CardIds.BolvarFireblood_ICC_858) {
				modifyAttack(entityBoard[i], 2, entityBoard, allCards);
				afterStatsUpdate(entityBoard[i], entityBoard, allCards);
				spectator.registerPowerTarget(entityBoard[i], entityBoard[i], entityBoard);
			} else if (entityBoard[i].cardId === CardIds.BolvarFirebloodBattlegrounds) {
				modifyAttack(entityBoard[i], 4, entityBoard, allCards);
				afterStatsUpdate(entityBoard[i], entityBoard, allCards);
				spectator.registerPowerTarget(entityBoard[i], entityBoard[i], entityBoard);
			} else if (entityBoard[i].cardId === CardIds.DrakonidEnforcer) {
				modifyAttack(entityBoard[i], 2, entityBoard, allCards);
				modifyHealth(entityBoard[i], 2, entityBoard, allCards);
				afterStatsUpdate(entityBoard[i], entityBoard, allCards);
				spectator.registerPowerTarget(entityBoard[i], entityBoard[i], entityBoard);
			} else if (entityBoard[i].cardId === CardIds.DrakonidEnforcerBattlegrounds) {
				modifyAttack(entityBoard[i], 4, entityBoard, allCards);
				modifyHealth(entityBoard[i], 4, entityBoard, allCards);
				afterStatsUpdate(entityBoard[i], entityBoard, allCards);
				spectator.registerPowerTarget(entityBoard[i], entityBoard[i], entityBoard);
			} else if (
				entityBoard[i].entityId !== entity.entityId &&
				(entityBoard[i].cardId === CardIds.HolyMecherel ||
					entityBoard[i].cardId === CardIds.HolyMecherelBattlegrounds)
			) {
				updateDivineShield(entityBoard[i], entityBoard, true, allCards);
			} else if (entityBoard[i].cardId === CardIds.Gemsplitter_BG21_037) {
				addCardsInHand(entityBoardHero, 1, entityBoard, allCards, spectator, CardIds.BloodGem);
			} else if (entityBoard[i].cardId === CardIds.Gemsplitter_BG21_037_G) {
				addCardsInHand(entityBoardHero, 2, entityBoard, allCards, spectator, CardIds.BloodGem);
			}

			// So that self-buffs from Bolvar are taken into account
			// if (entityBoard[i].entityId === entity.entityId && entity.divineShield) {
			// 	updateDivineShield(entityBoard[i], entityBoard, false, allCards);
			// }
		}
		const greaseBots = entityBoard.filter((entity) => entity.cardId === CardIds.GreaseBot);
		const greaseBotBattlegrounds = entityBoard.filter((entity) => entity.cardId === CardIds.GreaseBotBattlegrounds);
		greaseBots.forEach((bot) => {
			modifyAttack(entity, 2, entityBoard, allCards);
			modifyHealth(entity, 1, entityBoard, allCards);
			spectator.registerPowerTarget(bot, entity, entityBoard);
		});
		greaseBotBattlegrounds.forEach((bot) => {
			modifyAttack(entity, 4, entityBoard, allCards);
			modifyHealth(entity, 2, entityBoard, allCards);
			spectator.registerPowerTarget(bot, entity, entityBoard);
		});

		spectator.registerDamageDealt(bumpInto, entity, 0, entityBoard);
		return 0;
		// return entity;
	}
	entity.health = entity.health - (entity.damageMultiplier || 1) * bumpInto.attack;

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
	if (bumpInto.venomous) {
		// So that further buffs don't revive it
		// And we don't just set the health to avoid applying overkill effects
		entity.definitelyDead = true;
		bumpInto.venomous = false;
	}
	// FIXME: This will likely be incorrect in terms of timings, e.g. if the entity ends up
	// surviving following a buff like Spawn.
	spectator.registerDamageDealt(bumpInto, entity, (entity.damageMultiplier || 1) * bumpInto.attack, entityBoard);
	entity.lastAffectedByEntity = bumpInto;
	if (!entity.frenzyApplied && entity.health > 0 && !entity.definitelyDead) {
		applyFrenzy(entity, entityBoard, entityBoardHero, allCards, cardsData, sharedState, spectator);
		entity.frenzyApplied = true;
	}

	// We spawn them here, because it says "whenever", and so happens right away
	// FIXME: there could be a bug here, if a Cleave attacks several IGB at the same time. The current
	// implementation could spawn minions above the max board size. Fringe case though, so leaving it
	// like this for now
	const entitySpawns = getWheneverEntitySpawns(
		entity,
		entityBoard,
		entityBoardHero,
		otherBoard,
		otherHero,
		allCards,
		cardsData,
		sharedState,
		spectator,
	);
	if (!!entitySpawns?.length) {
		const index = entityBoard.map((e) => e.entityId).indexOf(entity.entityId);
		addMinionsToBoard(
			entityBoard,
			entityBoardHero,
			otherHero,
			index,
			entitySpawns,
			allCards,
			spectator,
			sharedState,
		);
		spectator.registerMinionsSpawn(entity, entityBoard, entitySpawns);
	}
	return bumpInto.attack;
};

const getWheneverEntitySpawns = (
	entity: BoardEntity,
	entityBoard: BoardEntity[],
	entityBoardHero: BgsPlayerEntity,
	otherBoard: BoardEntity[],
	otherHero: BgsPlayerEntity,
	allCards: AllCardsService,
	cardsData: CardsData,
	sharedState: SharedState,
	spectator: Spectator,
): readonly BoardEntity[] => {
	if (entityBoard.length === 7) {
		return null;
	}

	if (entity.cardId === CardIds.ImpGangBoss) {
		return spawnEntities(
			CardIds.ImpGangBoss_ImpToken,
			1,
			entityBoard,
			entityBoardHero,
			otherBoard,
			otherHero,
			allCards,
			cardsData,
			sharedState,
			spectator,
			entity.friendly,
			true,
		);
	} else if (entity.cardId === CardIds.ImpGangBossBattlegrounds) {
		return spawnEntities(
			CardIds.ImpGangBoss_ImpTokenBattlegrounds,
			1,
			entityBoard,
			entityBoardHero,
			otherBoard,
			otherHero,
			allCards,
			cardsData,
			sharedState,
			spectator,
			entity.friendly,
			true,
		);
	} else if (entity.cardId === CardIds.ImpMama) {
		return spawnEntities(
			cardsData.impMamaSpawns[Math.floor(Math.random() * cardsData.impMamaSpawns.length)],
			1,
			entityBoard,
			entityBoardHero,
			otherBoard,
			otherHero,
			allCards,
			cardsData,
			sharedState,
			spectator,
			entity.friendly,
			true,
		).map((entity) => ({ ...entity, taunt: true }));
	} else if (entity.cardId === CardIds.ImpMamaBattlegrounds) {
		return spawnEntities(
			cardsData.impMamaSpawns[Math.floor(Math.random() * cardsData.impMamaSpawns.length)],
			2,
			entityBoard,
			entityBoardHero,
			otherBoard,
			otherHero,
			allCards,
			cardsData,
			sharedState,
			spectator,
			entity.friendly,
			true,
		).map((entity) => ({ ...entity, taunt: true }));
	} else if (entity.cardId === CardIds.SecurityRover) {
		return spawnEntities(
			CardIds.SecurityRover_GuardBotToken,
			1,
			entityBoard,
			entityBoardHero,
			otherBoard,
			otherHero,
			allCards,
			cardsData,
			sharedState,
			spectator,
			entity.friendly,
			true,
		);
	} else if (entity.cardId === CardIds.SecurityRoverBattlegrounds) {
		return spawnEntities(
			CardIds.SecurityRover_GuardBotTokenBattlegrounds,
			1,
			entityBoard,
			entityBoardHero,
			otherBoard,
			otherHero,
			allCards,
			cardsData,
			sharedState,
			spectator,
			entity.friendly,
			true,
		);
	}
	return null;
};

export const processMinionDeath = (
	board1: BoardEntity[],
	board1Hero: BgsPlayerEntity,
	board2: BoardEntity[],
	board2Hero: BgsPlayerEntity,
	allCards: AllCardsService,
	cardsData: CardsData,
	sharedState: SharedState,
	spectator: Spectator,
): void => {
	// console.debug('processing minions death', stringifySimple(board1, allCards), stringifySimple(board2, allCards));
	const [deadMinionIndexesFromRights1, deadEntities1] = makeMinionsDie(board1, allCards, spectator);
	const [deadMinionIndexesFromRights2, deadEntities2] = makeMinionsDie(board2, allCards, spectator);
	spectator.registerDeadEntities(
		deadMinionIndexesFromRights1,
		deadEntities1,
		board1,
		deadMinionIndexesFromRights2,
		deadEntities2,
		board2,
	);
	// No death to process, we can return
	if (deadEntities1.length === 0 && deadEntities2.length === 0) {
		return;
		// return [board1, board2];
	}

	sharedState.deaths.push(...deadEntities1);
	sharedState.deaths.push(...deadEntities2);
	board1Hero.globalInfo.EternalKnightsDeadThisGame =
		board1Hero.globalInfo.EternalKnightsDeadThisGame +
		deadEntities1.filter(
			(e) => e.cardId === CardIds.EternalKnight || e.cardId === CardIds.EternalKnightBattlegrounds,
		).length;
	board2Hero.globalInfo.EternalKnightsDeadThisGame =
		board2Hero.globalInfo.EternalKnightsDeadThisGame +
		deadEntities2.filter(
			(e) => e.cardId === CardIds.EternalKnight || e.cardId === CardIds.EternalKnightBattlegrounds,
		).length;

	// First process all DRs, then process the reborn
	if (Math.random() > 0.5) {
		// Now proceed to trigger all deathrattle effects on baord1
		handleDeathrattlesForFirstBoard(
			board1,
			board1Hero,
			board2,
			board2Hero,
			deadMinionIndexesFromRights1,
			deadEntities1,
			allCards,
			cardsData,
			sharedState,
			spectator,
		);
		// Now handle the other board's deathrattles
		handleDeathrattlesForFirstBoard(
			board2,
			board2Hero,
			board1,
			board1Hero,
			deadMinionIndexesFromRights2,
			deadEntities2,
			allCards,
			cardsData,
			sharedState,
			spectator,
		);
	} else {
		handleDeathrattlesForFirstBoard(
			board2,
			board2Hero,
			board1,
			board1Hero,
			deadMinionIndexesFromRights2,
			deadEntities2,
			allCards,
			cardsData,
			sharedState,
			spectator,
		);
		handleDeathrattlesForFirstBoard(
			board1,
			board1Hero,
			board2,
			board2Hero,
			deadMinionIndexesFromRights1,
			deadEntities1,
			allCards,
			cardsData,
			sharedState,
			spectator,
		);
	}

	// Now the reborn
	if (Math.random() > 0.5) {
		// Now proceed to trigger all deathrattle effects on baord1
		handleRebornForFirstBoard(
			board1,
			board1Hero,
			board2,
			board2Hero,
			deadMinionIndexesFromRights1,
			deadEntities1,
			allCards,
			cardsData,
			sharedState,
			spectator,
		);
		// Now handle the other board's deathrattles
		handleRebornForFirstBoard(
			board2,
			board2Hero,
			board1,
			board1Hero,
			deadMinionIndexesFromRights2,
			deadEntities2,
			allCards,
			cardsData,
			sharedState,
			spectator,
		);
	} else {
		handleRebornForFirstBoard(
			board2,
			board2Hero,
			board1,
			board1Hero,
			deadMinionIndexesFromRights2,
			deadEntities2,
			allCards,
			cardsData,
			sharedState,
			spectator,
		);
		handleRebornForFirstBoard(
			board1,
			board1Hero,
			board2,
			board2Hero,
			deadMinionIndexesFromRights1,
			deadEntities1,
			allCards,
			cardsData,
			sharedState,
			spectator,
		);
	}

	// If the fish dies (from Scallywag for instance), it doesn't remember the deathrattle
	board1
		.filter((entity) => isFish(entity))
		.forEach((entity) => rememberDeathrattles(entity, deadEntities1, cardsData, allCards, sharedState));
	board2
		.filter((entity) => isFish(entity))
		.forEach((entity) => rememberDeathrattles(entity, deadEntities2, cardsData, allCards, sharedState));

	board1
		.filter((entity) => entity.cardId === CardIds.Monstrosity || entity.cardId === CardIds.MonstrosityBattlegrounds)
		.forEach((entity) => applyMonstrosity(entity, deadEntities1, board1, allCards));
	board2
		.filter((entity) => entity.cardId === CardIds.Monstrosity || entity.cardId === CardIds.MonstrosityBattlegrounds)
		.forEach((entity) => applyMonstrosity(entity, deadEntities2, board2, allCards));

	// Make sure we only return when there are no more deaths to process
	// Make sure to do this right before the end of the process
	// FIXME: this will propagate the killer between rounds, which is incorrect. For instance,
	// if a dragon kills a Ghoul, then the Ghoul's deathrattle kills a Kaboom, the killer should
	// now be the ghoul. Then if the Kaboom kills someone, the killer should again change. You could
	// also have multiple killers, which is not taken into account here.
	// The current assumption is that it's a suffienctly fringe case to not matter too much
	processMinionDeath(board1, board1Hero, board2, board2Hero, allCards, cardsData, sharedState, spectator);

	// Apply "after minion death" effects
	handleAfterMinionsDeaths(
		board1,
		deadEntities1,
		board1Hero,
		board2,
		deadEntities2,
		board2Hero,
		allCards,
		cardsData,
		sharedState,
		spectator,
	);
};

const handleAfterMinionsDeaths = (
	board1: BoardEntity[],
	deadEntities1: BoardEntity[],
	heroEntity1: BgsPlayerEntity,
	board2: BoardEntity[],
	deadEntities2: BoardEntity[],
	heroEntity2: BgsPlayerEntity,
	allCards: AllCardsService,
	cardsData: CardsData,
	sharedState: SharedState,
	spectator: Spectator,
) => {
	const random = Math.random() > 0.5;
	handleAfterMinionsDeathsForBoard(
		random ? board1 : board2,
		random ? deadEntities1 : deadEntities2,
		random ? heroEntity1 : heroEntity2,
		random ? board2 : board1,
		random ? deadEntities2 : deadEntities1,
		random ? heroEntity2 : heroEntity1,
		allCards,
		cardsData,
		sharedState,
		spectator,
	);
	handleAfterMinionsDeathsForBoard(
		!random ? board1 : board2,
		!random ? deadEntities1 : deadEntities2,
		!random ? heroEntity1 : heroEntity2,
		!random ? board2 : board1,
		!random ? deadEntities2 : deadEntities1,
		!random ? heroEntity2 : heroEntity1,
		allCards,
		cardsData,
		sharedState,
		spectator,
	);
};

const handleAfterMinionsDeathsForBoard = (
	friendlyBoard: BoardEntity[],
	friendlyDeadEntities: BoardEntity[],
	friendlyHeroEntity: BgsPlayerEntity,
	otherBoard: BoardEntity[],
	otherDeadEntities: BoardEntity[],
	otherHeroEntity: BgsPlayerEntity,
	allCards: AllCardsService,
	cardsData: CardsData,
	sharedState: SharedState,
	spectator: Spectator,
) => {
	for (const deadEntity of friendlyDeadEntities) {
		const killer = deadEntity.lastAffectedByEntity;
		if (!killer) {
			continue;
		}
		// Killed an enemy minion
		if (killer.friendly !== deadEntity.friendly) {
			if (otherHeroEntity.heroPowerId === CardIds.Rokara_GloryOfCombat) {
				modifyAttack(killer, 1, otherBoard, allCards);
				afterStatsUpdate(killer, otherBoard, allCards);
				// Icesnarl the Mighty
				otherBoard
					.filter(
						(e) =>
							e.cardId === CardIds.IcesnarlTheMighty ||
							e.cardId === CardIds.IcesnarlTheMightyBattlegrounds,
					)
					.forEach((icesnarl) => {
						modifyHealth(
							icesnarl,
							icesnarl.cardId === CardIds.IcesnarlTheMightyBattlegrounds ? 2 : 1,
							friendlyBoard,
							allCards,
						);
						afterStatsUpdate(icesnarl, friendlyBoard, allCards);
					});
			}
		}
	}
};

const handleDeathrattlesForFirstBoard = (
	firstBoard: BoardEntity[],
	firstBoardHero: BgsPlayerEntity,
	otherBoard: BoardEntity[],
	otherBoardHero: BgsPlayerEntity,
	deadMinionIndexesFromRight: readonly number[],
	deadEntities: readonly BoardEntity[],
	allCards: AllCardsService,
	cardsData: CardsData,
	sharedState: SharedState,
	spectator: Spectator,
): void => {
	for (let i = 0; i < deadMinionIndexesFromRight.length; i++) {
		const entity = deadEntities[i];
		const indexFromRight = deadMinionIndexesFromRight[i];
		if (entity.health <= 0 || entity.definitelyDead) {
			buildBoardAfterDeathrattleSpawns(
				firstBoard,
				firstBoardHero,
				entity,
				indexFromRight,
				otherBoard,
				otherBoardHero,
				deadEntities,
				allCards,
				cardsData,
				sharedState,
				spectator,
			);
		} else if (firstBoard.length > 0) {
			// const newBoardD = [...firstBoard];
			firstBoard.splice(firstBoard.length - indexFromRight, 1, entity);
			// firstBoard = newBoardD;
		}
	}
	// return [firstBoard, otherBoard];
};

const handleRebornForFirstBoard = (
	firstBoard: BoardEntity[],
	firstBoardHero: BgsPlayerEntity,
	otherBoard: BoardEntity[],
	otherBoardHero: BgsPlayerEntity,
	deadMinionIndexesFromRight: readonly number[],
	deadEntities: readonly BoardEntity[],
	allCards: AllCardsService,
	cardsData: CardsData,
	sharedState: SharedState,
	spectator: Spectator,
): void => {
	// console.log('will handle reborn', stringifySimple(firstBoard, allCards), deadMinionIndexesFromRight);
	for (let i = deadMinionIndexesFromRight.length - 1; i >= 0; i--) {
		const entity = deadEntities[i];
		const indexFromRight = deadMinionIndexesFromRight[i];
		if (entity.health <= 0 || entity.definitelyDead) {
			if (!entity?.cardId) {
				console.error(
					'missing card id for entity that died',
					stringifySimpleCard(entity, allCards),
					entity,
					indexFromRight,
					deadMinionIndexesFromRight,
					stringifySimple(firstBoard, allCards),
				);
			}
			// console.log('dead entity', stringifySimpleCard(entity, allCards), indexFromRight);
			buildBoardAfterRebornSpawns(
				firstBoard,
				firstBoardHero,
				entity,
				indexFromRight,
				otherBoard,
				otherBoardHero,
				allCards,
				cardsData,
				sharedState,
				spectator,
			);
			// console.log('after rebord', stringifySimple(firstBoard, allCards));
		} else if (firstBoard.length > 0) {
			// const newBoardD = [...firstBoard];
			firstBoard.splice(firstBoard.length - indexFromRight, 1, entity);
			// firstBoard = newBoardD;
		}
	}
	// return [firstBoard, otherBoard];
};

export const applyOnAttackBuffs = (
	attacker: BoardEntity,
	attackingBoard: BoardEntity[],
	allCards: AllCardsService,
	spectator: Spectator,
): void => {
	if (attacker.cardId === CardIds.GlyphGuardian_BGS_045) {
		// For now the utility method only works additively, so we hack around it
		modifyAttack(attacker, 2 * attacker.attack - attacker.attack, attackingBoard, allCards);
	}
	if (attacker.cardId === CardIds.GlyphGuardianBattlegrounds) {
		modifyAttack(attacker, 3 * attacker.attack - attacker.attack, attackingBoard, allCards);
	}

	// Ripsnarl Captain
	if (isCorrectTribe(allCards.getCard(attacker.cardId).races, Race.PIRATE)) {
		const ripsnarls = attackingBoard.filter((e) => e.cardId === CardIds.RipsnarlCaptain);
		const ripsnarlsTB = attackingBoard.filter((entity) => entity.cardId === CardIds.RipsnarlCaptainBattlegrounds);
		ripsnarls.forEach((captain) => {
			modifyAttack(attacker, 3, attackingBoard, allCards);
			spectator.registerPowerTarget(captain, attacker, attackingBoard);
		});
		ripsnarlsTB.forEach((captain) => {
			modifyAttack(attacker, 6, attackingBoard, allCards);
			spectator.registerPowerTarget(captain, attacker, attackingBoard);
		});
	}

	// Dread Admiral Eliza
	if (isCorrectTribe(allCards.getCard(attacker.cardId).races, Race.PIRATE)) {
		const elizas = attackingBoard.filter((e) => e.cardId === CardIds.DreadAdmiralEliza);
		const elizasTB = attackingBoard.filter((e) => e.cardId === CardIds.DreadAdmiralElizaBattlegrounds);

		elizas.forEach((eliza) => {
			attackingBoard.forEach((entity) => {
				modifyAttack(entity, 2, attackingBoard, allCards);
				modifyHealth(entity, 1, attackingBoard, allCards);
				spectator.registerPowerTarget(eliza, entity, attackingBoard);
			});
		});
		elizasTB.forEach((eliza) => {
			attackingBoard.forEach((entity) => {
				modifyAttack(entity, 4, attackingBoard, allCards);
				modifyHealth(entity, 2, attackingBoard, allCards);
				spectator.registerPowerTarget(eliza, entity, attackingBoard);
			});
		});
	}
	if (attacker.cardId === CardIds.VanessaVancleef || attacker.cardId === CardIds.VanessaVancleefBattlegrounds) {
		attackingBoard
			.filter((e) => isCorrectTribe(allCards.getCard(e.cardId).races, Race.PIRATE))
			.forEach((e) => {
				modifyAttack(
					e,
					attacker.cardId === CardIds.VanessaVancleefBattlegrounds ? 4 : 2,
					attackingBoard,
					allCards,
				);
				modifyHealth(
					e,
					attacker.cardId === CardIds.VanessaVancleefBattlegrounds ? 4 : 2,
					attackingBoard,
					allCards,
				);
				spectator.registerPowerTarget(attacker, e, attackingBoard);
			});
	}
};

export const applyOnBeingAttackedBuffs = (
	attackerEntity: BoardEntity,
	attackedEntity: BoardEntity,
	defendingBoard: BoardEntity[],
	allCards: AllCardsService,
	spectator: Spectator,
): void => {
	if (attackedEntity.taunt) {
		const champions = defendingBoard.filter((entity) => entity.cardId === CardIds.ChampionOfYshaarj);
		const goldenChampions = defendingBoard.filter(
			(entity) => entity.cardId === CardIds.ChampionOfYshaarjBattlegrounds,
		);
		champions.forEach((entity) => {
			modifyAttack(entity, 1, defendingBoard, allCards);
			modifyHealth(entity, 1, defendingBoard, allCards);
			spectator.registerPowerTarget(entity, entity, defendingBoard);
		});
		goldenChampions.forEach((entity) => {
			modifyAttack(entity, 2, defendingBoard, allCards);
			modifyHealth(entity, 2, defendingBoard, allCards);
			spectator.registerPowerTarget(entity, entity, defendingBoard);
		});

		const arms = defendingBoard.filter((entity) => entity.cardId === CardIds.ArmOfTheEmpire);
		const goldenArms = defendingBoard.filter((entity) => entity.cardId === CardIds.ArmOfTheEmpireBattlegrounds);
		arms.forEach((arm) => {
			modifyAttack(attackedEntity, 2, defendingBoard, allCards);
			spectator.registerPowerTarget(arm, attackedEntity, defendingBoard);
		});
		goldenArms.forEach((arm) => {
			modifyAttack(attackedEntity, 4, defendingBoard, allCards);
			spectator.registerPowerTarget(arm, attackedEntity, defendingBoard);
		});
	}
	if (attackedEntity.cardId === CardIds.TormentedRitualist) {
		const neighbours = getNeighbours(defendingBoard, attackedEntity);
		neighbours.forEach((entity) => {
			modifyAttack(entity, 1, defendingBoard, allCards);
			modifyHealth(entity, 1, defendingBoard, allCards);
			spectator.registerPowerTarget(attackedEntity, entity, defendingBoard);
		});
	}
	if (attackedEntity.cardId === CardIds.TormentedRitualistBattlegrounds) {
		const neighbours = getNeighbours(defendingBoard, attackedEntity);
		neighbours.forEach((entity) => {
			modifyAttack(entity, 2, defendingBoard, allCards);
			modifyHealth(entity, 2, defendingBoard, allCards);
			spectator.registerPowerTarget(attackedEntity, entity, defendingBoard);
		});
	}
	if (attackedEntity.cardId === CardIds.DozyWhelp || attackedEntity.cardId === CardIds.DozyWhelpBattlegrounds) {
		modifyAttack(
			attackedEntity,
			attackedEntity.cardId === CardIds.DozyWhelpBattlegrounds ? 2 : 1,
			defendingBoard,
			allCards,
		);
		spectator.registerPowerTarget(attackedEntity, attackedEntity, defendingBoard);
	}
	if (
		attackerEntity.cardId === CardIds.SindoreiStraightShot ||
		attackerEntity.cardId === CardIds.SindoreiStraightShotBattlegrounds
	) {
		attackedEntity.taunt = false;
		attackedEntity.reborn = false;
	}
};

const makeMinionsDie = (
	board: BoardEntity[],
	allCards: AllCardsService,
	spectator: Spectator,
): [number[], BoardEntity[]] => {
	// Because entities spawn to the left, so the right index is unchanged
	const deadMinionIndexesFromRight: number[] = [];
	const deadEntities: BoardEntity[] = [];
	for (let i = 0; i < board.length; i++) {
		if (board[i].health <= 0 || board[i].definitelyDead) {
			deadMinionIndexesFromRight.push(board.length - (i + 1));
			deadEntities.push(board[i]);
			removeMinionFromBoard(board, i, allCards, spectator);
			// We modify the original array, so we need to update teh current index accordingly
			i--;
		}
	}
	// Treat all dead entities as a single block
	const blockIndexesFromRight = [...deadMinionIndexesFromRight];
	for (let i = deadMinionIndexesFromRight.length - 1; i >= 0; i--) {
		if (i === deadMinionIndexesFromRight.length - 1) {
			continue;
		}
		if (Math.abs(deadMinionIndexesFromRight[i] - deadMinionIndexesFromRight[i + 1]) <= 1) {
			blockIndexesFromRight[i] = blockIndexesFromRight[i + 1];
		} else {
			// blockIndexesFromRight[i] = blockIndexesFromRight[i];
		}
	}
	return [blockIndexesFromRight, deadEntities];
};

// const handleKillEffects = (
// 	boardWithKilledMinion: BoardEntity[],
// 	killerBoard: BoardEntity[],
// 	deadEntity: BoardEntity,
// 	allCards: AllCardsService,
// 	spectator: Spectator,
// ): void => {
// 	if (
// 		deadEntity.lastAffectedByEntity?.cardId &&
// 		isCorrectTribe(allCards.getCard(deadEntity.lastAffectedByEntity.cardId).race, Race.DRAGON)
// 	) {
// 		for (const entity of killerBoard) {
// 			if (entity.cardId === CardIds.WaxriderTogwaggle2) {
// 				modifyAttack(entity, 2, killerBoard, allCards);
// 				modifyHealth(entity, 2, killerBoard, allCards);
// 				afterStatsUpdate(entity, killerBoard, allCards);
// 				spectator.registerPowerTarget(entity, entity, killerBoard);
// 			} else if (entity.cardId === CardIds.WaxriderTogwaggleBattlegrounds) {
// 				modifyAttack(entity, 4, killerBoard, allCards);
// 				modifyHealth(entity, 4, killerBoard, allCards);
// 				afterStatsUpdate(entity, killerBoard, allCards);
// 				spectator.registerPowerTarget(entity, entity, killerBoard);
// 			}
// 		}
// 	}
// };

const buildBoardAfterDeathrattleSpawns = (
	boardWithKilledMinion: BoardEntity[],
	boardWithKilledMinionHero: BgsPlayerEntity,
	deadEntity: BoardEntity,
	deadMinionIndexFromRight2: number,
	opponentBoard: BoardEntity[],
	opponentBoardHero: BgsPlayerEntity,
	entitiesDeadThisAttack: readonly BoardEntity[],
	allCards: AllCardsService,
	cardsData: CardsData,
	sharedState: SharedState,
	spectator: Spectator,
): void => {
	// TODO: don't apply this for FishOfNZoth
	// if (deadMinionIndex >= 0) {
	// 	handleKillEffects(boardWithKilledMinion, opponentBoard, deadEntity, allCards, spectator);
	// }

	// But Wildfire Element is applied first, before the DR spawns
	if (deadMinionIndexFromRight2 >= 0) {
		applyMinionDeathEffect(
			deadEntity,
			deadMinionIndexFromRight2,
			boardWithKilledMinion,
			boardWithKilledMinionHero,
			opponentBoard,
			opponentBoardHero,
			allCards,
			cardsData,
			sharedState,
			spectator,
		);
	}
	const entitiesFromNativeDeathrattle: readonly BoardEntity[] = spawnEntitiesFromDeathrattle(
		deadEntity,
		boardWithKilledMinion,
		boardWithKilledMinionHero,
		opponentBoard,
		opponentBoardHero,
		entitiesDeadThisAttack,
		allCards,
		cardsData,
		sharedState,
		spectator,
	);

	const entitiesFromEnchantments: readonly BoardEntity[] = spawnEntitiesFromEnchantments(
		deadEntity,
		boardWithKilledMinion,
		boardWithKilledMinionHero,
		opponentBoard,
		opponentBoardHero,
		allCards,
		cardsData,
		sharedState,
		spectator,
	);

	const candidateEntities: readonly BoardEntity[] = [...entitiesFromNativeDeathrattle, ...entitiesFromEnchantments];
	performEntitySpawns(
		candidateEntities,
		boardWithKilledMinion,
		boardWithKilledMinionHero,
		deadEntity,
		deadMinionIndexFromRight2,
		opponentBoard,
		opponentBoardHero,
		allCards,
		cardsData,
		sharedState,
		spectator,
	);

	// In case of leapfrogger, we want to first spawn the minions, then apply the frog effect
	handleDeathrattleEffects(
		boardWithKilledMinion,
		boardWithKilledMinionHero,
		deadEntity,
		deadMinionIndexFromRight2,
		opponentBoard,
		opponentBoardHero,
		allCards,
		cardsData,
		sharedState,
		spectator,
	);

	// eslint-disable-next-line prettier/prettier
	if (deadEntity.rememberedDeathrattles?.length) {
		for (const deathrattle of deadEntity.rememberedDeathrattles) {
			const entityToProcess: BoardEntity = {
				...deadEntity,
				rememberedDeathrattles: undefined,
				cardId: deathrattle.cardId,
				enchantments: [
					{
						cardId: deathrattle.cardId,
						originEntityId: deadEntity.entityId,
						repeats: deathrattle.repeats ?? 1,
						timing: deathrattle.timing,
					},
				],
			};
			buildBoardAfterDeathrattleSpawns(
				boardWithKilledMinion,
				boardWithKilledMinionHero,
				entityToProcess,
				deadMinionIndexFromRight2,
				opponentBoard,
				opponentBoardHero,
				entitiesDeadThisAttack,
				allCards,
				cardsData,
				sharedState,
				spectator,
			);
		}
	}

	// TODO: check if Avenge effects should proc after deathrattles instead
	// They most certainly do, since the rat pack + avenge beast buffer works
	applyAvengeEffects(
		deadEntity,
		deadMinionIndexFromRight2,
		boardWithKilledMinion,
		boardWithKilledMinionHero,
		opponentBoard,
		opponentBoardHero,
		allCards,
		cardsData,
		sharedState,
		spectator,
	);
};

const buildBoardAfterRebornSpawns = (
	boardWithKilledMinion: BoardEntity[],
	boardWithKilledMinionHero: BgsPlayerEntity,
	deadEntity: BoardEntity,
	deadMinionIndexFromRight: number,
	opponentBoard: BoardEntity[],
	opponentBoardHero: BgsPlayerEntity,
	allCards: AllCardsService,
	cardsData: CardsData,
	sharedState: SharedState,
	spectator: Spectator,
): void => {
	const numberOfReborns = 1;
	// Reborn happens after deathrattles
	if (!deadEntity.cardId) {
		console.error('missing card id for dead entity', stringifySimpleCard(deadEntity, allCards), deadEntity);
	}
	let entityToSpawn: BoardEntity = null;
	// TODO: test
	if (deadEntity.cardId === CardIds.SinrunnerBlanchy || deadEntity.cardId === CardIds.SinrunnerBlanchyBattlegrounds) {
		entityToSpawn = {
			...deadEntity,
			health: deadEntity.maxHealth,
			divineShield: deadEntity.hadDivineShield,
			reborn: false,
		};
	}
	const entitiesFromReborn: readonly BoardEntity[] =
		deadEntity.reborn && deadMinionIndexFromRight >= 0
			? spawnEntities(
					deadEntity.cardId,
					numberOfReborns,
					boardWithKilledMinion,
					boardWithKilledMinionHero,
					opponentBoard,
					opponentBoardHero,
					allCards,
					cardsData,
					sharedState,
					spectator,
					deadEntity.friendly,
					false,
					true,
					true,
					entityToSpawn,
					deadEntity,
			  )
			: [];
	const entitiesThatWereReborn = performEntitySpawns(
		entitiesFromReborn,
		boardWithKilledMinion,
		boardWithKilledMinionHero,
		deadEntity,
		deadMinionIndexFromRight,
		opponentBoard,
		opponentBoardHero,
		allCards,
		cardsData,
		sharedState,
		spectator,
	);

	const arfus = boardWithKilledMinion
		.filter((e) => e.cardId === CardIds.ArfusBattlegrounds_TB_BaconShop_HERO_22_Buddy)
		.map((e) => e.attack)
		.reduce((a, b) => a + b, 0);
	const goldenArfus = boardWithKilledMinion
		.filter((e) => e.cardId === CardIds.ArfusBattlegrounds_TB_BaconShop_HERO_22_Buddy_G)
		.map((e) => 2 * e.attack)
		.reduce((a, b) => a + b, 0);
	if (arfus + goldenArfus > 0) {
		entitiesThatWereReborn.forEach((e) => {
			modifyAttack(e, arfus + goldenArfus, boardWithKilledMinion, allCards);
			afterStatsUpdate(e, boardWithKilledMinion, allCards);
		});
	}

	const numberOfTriggersForDeathwhisper = Math.min(entitiesFromReborn.length, 1);
	for (let i = 0; i < numberOfTriggersForDeathwhisper; i++) {
		boardWithKilledMinion
			.filter(
				(e) => e.cardId === CardIds.SisterDeathwhisper || e.cardId === CardIds.SisterDeathwhisperBattlegrounds,
			)
			.forEach((e) => {
				const multiplier = e.cardId === CardIds.SisterDeathwhisperBattlegrounds ? 2 : 1;
				addStatsToBoard(
					e,
					boardWithKilledMinion,
					multiplier * 1,
					multiplier * 2,
					allCards,
					spectator,
					Race[Race.UNDEAD],
				);
			});
		boardWithKilledMinion
			.filter((e) => e.cardId === CardIds.JellyBelly || e.cardId === CardIds.JellyBellyBattlegrounds)
			.forEach((e) => {
				const multiplier = e.cardId === CardIds.JellyBellyBattlegrounds ? 2 : 1;
				modifyAttack(e, multiplier * 3, boardWithKilledMinion, allCards);
				modifyHealth(e, multiplier * 3, boardWithKilledMinion, allCards);
				afterStatsUpdate(e, boardWithKilledMinion, allCards);
				spectator.registerPowerTarget(e, e, boardWithKilledMinion);
			});
	}
};

export const performEntitySpawns = (
	candidateEntities: readonly BoardEntity[],
	boardWithKilledMinion: BoardEntity[],
	boardWithKilledMinionHero: BgsPlayerEntity,
	spawnSourceEntity: BoardEntity | BgsPlayerEntity,
	spawnSourceEntityIndexFromRight: number,
	opponentBoard: BoardEntity[],
	opponentBoardHero: BgsPlayerEntity,
	allCards: AllCardsService,
	cardsData: CardsData,
	sharedState: SharedState,
	spectator: Spectator,
): readonly BoardEntity[] => {
	const aliveEntites = candidateEntities.filter((entity) => entity.health > 0 && !entity.definitelyDead);
	const spawnedEntities = [];
	for (const newMinion of aliveEntites) {
		// All entities have been spawned
		if (boardWithKilledMinion.length >= 7) {
			break;
		}
		// Avoid minions spawning backwards (we don't have this issue if we add all elements at
		// the same time, but here we want to be able to attack after each spawn, which in turn
		// means that the minion can die before the other one spawns)
		// In boardWithKilledMinion, the dead minion has already been removed
		const indexToSpawnAt = boardWithKilledMinion.length - spawnSourceEntityIndexFromRight;
		addMinionToBoard(
			boardWithKilledMinion,
			boardWithKilledMinionHero,
			opponentBoardHero,
			indexToSpawnAt,
			newMinion,
			allCards,
			spectator,
			sharedState,
		);
		if (newMinion.attackImmediately) {
			// Whenever we are already in a combat phase, we need to first clean up the state
			simulateAttack(
				boardWithKilledMinion,
				boardWithKilledMinionHero,
				opponentBoard,
				opponentBoardHero,
				null,
				allCards,
				cardsData,
				sharedState,
				spectator,
			);
		}
		if (newMinion.health > 0 && !newMinion.definitelyDead) {
			spawnedEntities.push(newMinion);
		}
	}

	spectator.registerMinionsSpawn(spawnSourceEntity, boardWithKilledMinion, spawnedEntities);
	return spawnedEntities;
};
