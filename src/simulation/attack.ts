/* eslint-disable @typescript-eslint/no-use-before-define */
import { AllCardsService } from '@firestone-hs/reference-data';
import { BgsPlayerEntity } from '../bgs-player-entity';
import { BoardEntity } from '../board-entity';
import { hasOnAfterDeath, hasOnDeath } from '../cards/card.interface';
import { cardMappings } from '../cards/impl/_card-mappings';
import { debugState } from '../debug-state';
import { updateDivineShield } from '../keywords/divine-shield';
import { updateVenomous } from '../keywords/venomous';
import { CardIds } from '../services/card-ids';
import { groupByFunction, pickRandom } from '../services/utils';
import { addImpliedMechanics, isFish } from '../utils';
import { applyAfterAttackEffects, applyAfterAttackTrinkets } from './after-attack';
import { onEntityDamaged } from './damage-effects';
import { rememberDeathrattles } from './deathrattle-effects';
import { orchestrateMinionDeathEffects } from './deathrattle-orchestration';
import { spawnEntities } from './deathrattle-spawns';
import { FullGameState } from './internal-game-state';
import { makeMinionsDie } from './minion-death';
import { onMinionKill } from './minion-kill';
import { applyOnAttackEffects } from './on-attack';
import { applyOnBeingAttackedBuffs } from './on-being-attacked';
import { performEntitySpawns } from './spawns';
import { applyAfterStatsUpdate } from './stats';
import { handleSummonsWhenSpace } from './summon-when-space';
import { canAttack } from './utils/entity-utils';

// Only use it to simulate actual attack. To simulate damage, or something similar, use bumpInto
export const simulateAttack = (
	attackingBoard: BoardEntity[],
	attackingBoardHero: BgsPlayerEntity,
	defendingBoard: BoardEntity[],
	defendingBoardHero: BgsPlayerEntity,
	gameState: FullGameState,
): BoardEntity => {
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
		gameState.sharedState.currentAttackerEntityId = attackingEntity.entityId;
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
		} else {
			// Change it right away so that new spawns don't trigger the "attack immediately" again
			attackingEntity.attackImmediately = false;
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
		gameState.sharedState.currentAttackerEntityId = null;
		attackingEntity.hasAttacked = 1;
	}
	return attackingEntity;
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
	const isAttackingImmediately = attackingEntity.attackImmediately;
	gameState.spectator.registerAttack(
		attackingEntity,
		defendingEntity,
		attackingBoard,
		defendingBoard,
		attackingBoardHero,
		defendingBoardHero,
	);
	// http://replays.firestoneapp.com/?reviewId=50576a9f-2e6a-4600-87ba-6e737ca9853e&turn=21&action=4
	// Looks like onBeingAttacked effects apply before onAttack effects
	applyOnBeingAttackedBuffs(
		attackingEntity,
		attackingBoard,
		attackingBoardHero,
		defendingEntity,
		defendingBoard,
		defendingBoardHero,
		gameState,
	);
	const { damageDoneByAttacker: damageDoneByAttacker1, damageDoneByDefender: damageDoneByDefender1 } =
		applyOnAttackEffects(
			attackingEntity,
			attackingBoard,
			attackingBoardHero,
			defendingEntity,
			defendingBoard,
			defendingBoardHero,
			gameState,
		);
	const { damageDoneByAttacker: damageDoneByAttacker2, damageDoneByDefender: damageDoneByDefender2 } = performAttack(
		attackingEntity,
		defendingEntity,
		attackingBoard,
		attackingBoardHero,
		defendingBoard,
		defendingBoardHero,
		gameState,
	);
	const damageDoneByAttacker = damageDoneByAttacker1 + damageDoneByAttacker2;
	const damageDoneByDefender = damageDoneByDefender1 + damageDoneByDefender2;

	// Process this after the minions die and deathrattles are triggered/spawned
	// https://replays.firestoneapp.com/?reviewId=dd4e9dbe-abca-434a-ab94-04777cbedefe&turn=29&action=3
	// BUT: the attacking entity's afterAttack (like Macaw) needs to be processed
	// To recap:
	// - Jar o'Gems procs after the deathrattles have spawned
	// - When Monstrous Macaw procs a deathrattle, it is still on board, thus limiting the spawn room
	// So not sure what the exact timings are. It could be:
	// 1. Trigger minion's after attack
	// 2. Make minions die
	// 3. Process trinkets after attack
	// I have asked on Discord - for now I will consider a "minion after attack" phase and a "trinket after attack" phase.
	// I'm not sure about the secrets / trinkets, they will need to be adapted
	applyAfterAttackEffects(
		attackingEntity,
		attackingBoard,
		attackingBoardHero,
		defendingEntity,
		defendingBoard,
		defendingBoardHero,
		damageDoneByAttacker,
		damageDoneByDefender,
		gameState,
	);

	processMinionDeath(
		attackingBoard,
		attackingBoardHero,
		defendingBoard,
		defendingBoardHero,
		gameState,
		isAttackingImmediately,
	);

	applyAfterAttackTrinkets(
		attackingEntity,
		attackingBoard,
		attackingBoardHero,
		defendingEntity,
		defendingBoard,
		defendingBoardHero,
		damageDoneByAttacker,
		damageDoneByDefender,
		gameState,
	);
	applyAfterStatsUpdate(gameState);
	attackingEntity.immuneWhenAttackCharges = Math.max(0, (attackingEntity.immuneWhenAttackCharges ?? 0) - 1);
	// if (
	// 	defendingEntity.health > 0 &&
	// 	!defendingEntity.definitelyDead
	// 	&& (defendingEntity.cardId === CardIds.YoHoOgre_BGS_060 ||
	// 		defendingEntity.cardId === CardIds.YoHoOgre_TB_BaconUps_150)
	// ) {
	// 	defendingEntity.attackImmediately = true;
	// 	if (defendingEntity.attackImmediately) {
	// 		simulateAttack(defendingBoard, defendingBoardHero, attackingBoard, attackingBoardHero, gameState);
	// 	}
	// }
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

	// if (hasCorrectTribe(attackingEntity, attackingBoardHero, Race.DRAGON, gameState.anomalies, gameState.allCards)) {
	// 	const prestors = attackingBoard
	// 		.filter((e) => e.entityId !== attackingEntity.entityId)
	// 		.filter(
	// 			(e) =>
	// 				e.cardId === CardIds.PrestorsPyrospawn_BG21_012 ||
	// 				e.cardId === CardIds.PrestorsPyrospawn_BG21_012_G,
	// 		);
	// 	prestors.forEach((prestor) => {
	// 		gameState.spectator.registerPowerTarget(
	// 			prestor,
	// 			defendingEntity,
	// 			defendingBoard,
	// 			attackingBoardHero,
	// 			defendingBoardHero,
	// 		);
	// 		damageDoneByAttacker += dealDamageToMinion(
	// 			defendingEntity,
	// 			defendingBoard,
	// 			defendingBoardHero,
	// 			prestor,
	// 			prestor.cardId === CardIds.PrestorsPyrospawn_BG21_012_G ? 6 : 3,
	// 			attackingBoard,
	// 			attackingBoardHero,
	// 			gameState,
	// 		);
	// 	});
	// }
	// if (
	// 	attackingEntity.cardId === CardIds.Atramedes_BG23_362 ||
	// 	attackingEntity.cardId === CardIds.Atramedes_BG23_362_G
	// ) {
	// 	const targets = [defendingEntity, ...getNeighbours(defendingBoard, defendingEntity)];
	// 	const multiplier = attackingEntity.cardId === CardIds.Atramedes_BG23_362_G ? 2 : 1;

	// 	for (let i = 0; i < multiplier; i++) {
	// 		targets.forEach((target) => {
	// 			gameState.spectator.registerPowerTarget(
	// 				attackingEntity,
	// 				target,
	// 				defendingBoard,
	// 				attackingBoardHero,
	// 				defendingBoardHero,
	// 			);
	// 			damageDoneByAttacker += dealDamageToMinion(
	// 				target,
	// 				defendingBoard,
	// 				defendingBoardHero,
	// 				attackingEntity,
	// 				3,
	// 				attackingBoard,
	// 				attackingBoardHero,
	// 				gameState,
	// 			);
	// 		});
	// 	}
	// } else
	if ([CardIds.BabyKrush_BG22_001, CardIds.BabyKrush_BG22_001_G].includes(attackingEntity.cardId as CardIds)) {
		const spawns = spawnEntities(
			attackingEntity.cardId === CardIds.BabyKrush_BG22_001_G
				? CardIds.BabyKrush_BG22_001_G
				: CardIds.BabyKrush_DevilsaurToken,
			1,
			attackingBoard,
			attackingBoardHero,
			defendingBoard,
			defendingBoardHero,
			gameState,
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
			updateDivineShield(
				attackingEntity,
				attackingBoard,
				attackingBoardHero,
				defendingBoardHero,
				false,
				gameState,
			);
		}
		if (attackingEntity.attack > 0 && defenderHadDivineShield) {
			updateDivineShield(
				defendingEntity,
				defendingBoard,
				defendingBoardHero,
				attackingBoardHero,
				false,
				gameState,
			);
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
				defendingEntity,
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
				attackingEntity,
				damageDoneByAttacker,
				gameState,
			);
		}

		if (defendingEntity.health <= 0 || defendingEntity.definitelyDead) {
			const { dmgDoneByAttacker, dmgDoneByDefender } = onMinionKill(
				attackingEntity,
				true,
				defendingEntity,
				attackingBoard,
				attackingBoardHero,
				defendingBoard,
				defendingBoardHero,
				defenderNeighbours,
				gameState,
			);
			damageDoneByAttacker += dmgDoneByAttacker;
			damageDoneByDefender += dmgDoneByDefender;
		}
		if (attackingEntity.health <= 0 || attackingEntity.definitelyDead) {
			const { dmgDoneByAttacker, dmgDoneByDefender } = onMinionKill(
				defendingEntity,
				false,
				attackingEntity,
				defendingBoard,
				defendingBoardHero,
				attackingBoard,
				attackingBoardHero,
				defenderNeighbours,
				gameState,
			);
			damageDoneByAttacker += dmgDoneByAttacker;
			damageDoneByDefender += dmgDoneByDefender;
		}
	}
	// Cleave
	if (attackingEntity.cleave) {
		for (const neighbour of defenderNeighbours) {
			const thisAttackDamage = bumpEntities(
				neighbour,
				attackingEntity,
				defendingBoard,
				defendingBoardHero,
				attackingBoard,
				attackingBoardHero,
				gameState,
			);
			damageDoneByAttacker += thisAttackDamage;
			// Do it after the damage has been done, so that entities that update on DS lose / gain (CyborgDrake) don't
			// cause wrong results to happen
			if (attackingEntity.attack > 0 && neighbour.divineShield) {
				updateDivineShield(neighbour, defendingBoard, defendingBoardHero, attackingBoardHero, false, gameState);
			}
			if (thisAttackDamage > 0) {
				onEntityDamaged(
					neighbour,
					defendingBoard,
					defendingBoardHero,
					attackingBoard,
					attackingBoardHero,
					attackingEntity,
					thisAttackDamage,
					gameState,
				);
			}
			if (neighbour.health <= 0 || neighbour.definitelyDead) {
				const { dmgDoneByAttacker, dmgDoneByDefender } = onMinionKill(
					attackingEntity,
					true,
					neighbour,
					attackingBoard,
					attackingBoardHero,
					defendingBoard,
					defendingBoardHero,
					defenderNeighbours,
					gameState,
				);
				damageDoneByAttacker += dmgDoneByAttacker;
				damageDoneByDefender += dmgDoneByDefender;
			}
		}
	}

	attackingEntity.attackImmediately = false;
	if (attackingEntity.enchantments.some((e) => e.cardId === CardIds.VolatileVenom_VolatileEnchantment)) {
		attackingEntity.definitelyDead = true;
	}
	return { damageDoneByAttacker, damageDoneByDefender };
};

// TODO: Could it be possible to store the index of the entity that last attacked? Probably not, because minion
// spawns would mess this up? Could we update the indexes as each entity spawns / dies?
const getAttackingEntity = (attackingBoard: BoardEntity[], allCards: AllCardsService): BoardEntity => {
	let validAttackers = attackingBoard.filter((entity) => canAttack(entity));
	if (validAttackers.length === 0) {
		return null;
	}

	if (validAttackers.some((entity) => entity.attackImmediately)) {
		validAttackers = validAttackers.filter((entity) => entity.attackImmediately);
	} else if (validAttackers.every((e) => e.hasAttacked)) {
		attackingBoard.forEach((e) => (e.hasAttacked = 0));
	} else {
		validAttackers = validAttackers.filter((entity) => !entity.hasAttacked);
	}
	const attacker = validAttackers[0];
	const debug = attacker.cardId === CardIds.Onyxia_OnyxianWhelpToken;
	const attackerName = allCards.getCard(attacker.cardId)?.name;
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
	damageSource: BoardEntity | BgsPlayerEntity,
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
		// attacking: true,
	} as BoardEntity;
	const actualDamageDone = bumpEntities(target, fakeAttacker, board, hero, otherBoard, otherHero, gameState);

	// Do it after the damage has been done, so that entities that update on DS lose / gain (CyborgDrake) don't
	// cause wrong results to happen
	// TODO: why isn't it done in bumpEntities?
	// Because of how "bump" works: we do it first for the attacker, then the defender, and we only want to update
	// the divine shield once both bumps are done
	// The problem is with the Frenzy: bumpEntities can trigger the frenzy, and which can act on the divine shield
	if (fakeAttacker.attack > 0 && target.divineShield) {
		updateDivineShield(target, board, hero, otherHero, false, gameState);
	}

	if (actualDamageDone > 0) {
		// TODO: handle entities that have been spawned here to adjust the dead entity index from parent stack
		const newSpawns = onEntityDamaged(
			target,
			board,
			hero,
			otherBoard,
			otherHero,
			damageSource,
			actualDamageDone,
			gameState,
		);
	}
	if (!isDeadBeforeDamage && actualDamageDone > 0 && 'attack' in damageSource && 'health' in damageSource) {
		target.lastAffectedByEntity = damageSource as BoardEntity;

		if (target.health <= 0 || target.definitelyDead) {
			onMinionKill(damageSource as BoardEntity, false, target, otherBoard, otherHero, board, hero, [], gameState);
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
	if (debugState.active) {
		for (const forcedFaceOff of debugState.forcedFaceOff) {
			if (debugState.isCorrectEntity(forcedFaceOff.attacker, attackingEntity)) {
				// if (attackingEntity.entityId === forcedFaceOff.attacker.entityId) {
				const def = defendingBoard.find((e) => debugState.isCorrectEntity(forcedFaceOff.defender, e));
				if (!!def) {
					// Remove the face-off
					debugState.forcedFaceOff = debugState.forcedFaceOff.filter((f) => f != forcedFaceOff);
					return def;
				}
				// }
			}
		}
	}

	let possibleDefenders: readonly BoardEntity[];
	if (
		attackingEntity.cardId === CardIds.ZappSlywick_BGS_022 ||
		attackingEntity.cardId === CardIds.ZappSlywick_TB_BaconUps_091 ||
		attackingEntity.cardId === CardIds.MercilessMammoth_BG33_845 ||
		attackingEntity.cardId === CardIds.MercilessMammoth_BG33_845_G
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

	const chosenDefender = pickRandom(possibleDefenders);
	// if (chosenDefender?.taunt) {
	// 	const elistras = defendingBoard.filter(
	// 		(entity) =>
	// 			entity.cardId === CardIds.ElistraTheImmortal_BGS_205 ||
	// 			entity.cardId === CardIds.ElistraTheImmortal_TB_BaconUps_306,
	// 	);
	// 	if (elistras.length > 0) {
	// 		chosenDefender = elistras[Math.floor(Math.random() * elistras.length)];
	// 	}
	// }
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
	const debug = bumpInto.cardId === 'BG26_888';
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
				// attacking: true,
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
				updateDivineShield(newTarget, otherBoard, otherHero, entityBoardHero, false, gameState);
			}
			if (damageDone > 0) {
				onEntityDamaged(
					newTarget,
					otherBoard,
					otherHero,
					entityBoard,
					entityBoardHero,
					newSource,
					damageDone,
					gameState,
				);
			}
			return damageDone;
		}
	}

	if (entity.divineShield) {
		gameState.spectator.registerDamageDealt(bumpInto, entity, 0, entityBoard);
		return 0;
	}

	const damageDealt = (entity.damageMultiplier || 1) * bumpInto.attack;
	entity.health = entity.health - damageDealt;
	// FIXME: This will likely be incorrect in terms of timings, e.g. if the entity ends up
	// surviving following a buff like Spawn.
	gameState.spectator.registerDamageDealt(bumpInto, entity, damageDealt, entityBoard);

	// if (entity.cardId === CardIds.Bubblette_BG_TID_713 && bumpInto.attack === 1) {
	// 	entity.definitelyDead = true;
	// } else if (entity.cardId === CardIds.Bubblette_BG_TID_713_G && bumpInto.attack === 2) {
	// 	entity.definitelyDead = true;
	// }
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
		updateVenomous(bumpInto, false, otherBoard, otherHero, entityBoardHero, gameState);
	}
	// Ideally we should do the Reckoning stuff here. However, at this point we only have half the damage
	// information, so it is possible that the entity deals more than 3 (which should trigger Reckoning)
	// but dies during the exchange (and Reckoning doesn't trigger then)

	entity.lastAffectedByEntity = bumpInto;
	// if (entity.frenzyChargesLeft > 0 && entity.health > 0 && !entity.definitelyDead) {
	// 	applyFrenzy(entity, entityBoard, entityBoardHero, gameState);
	// 	entity.frenzyChargesLeft--;
	// }

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
	// When we're in an "attack immediately" phase, we wait until we're out of the phase to summon minions
	skipSummonWhenSpace = false,
): void => {
	// const debug = board1.some((e) => e.health <= 0) || board2.some((e) => e.health <= 0);
	// debug && console.debug('\nprocessing minions death');
	// debug && console.debug(stringifySimple(board1, gameState.allCards));
	// debug && console.debug(stringifySimple(board2, gameState.allCards));
	const [deadMinionIndexesFromLeft1, deadMinionIndexesFromRights1, deadEntities1] = makeMinionsDie(
		board1,
		board1Hero,
		board2,
		board2Hero,
		gameState,
	);
	const [deadMinionIndexesFromLeft2, deadMinionIndexesFromRights2, deadEntities2] = makeMinionsDie(
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
	// console.debug(
	// 	'\n\ndeadEntities',
	// 	stringifySimple(deadEntities1, gameState.allCards),
	// 	stringifySimple(deadEntities2, gameState.allCards),
	// );
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
		...deadEntities1.map((e, index) =>
			addImpliedMechanics(
				{
					...e,
					health: e.maxHealth,
					definitelyDead: false,
					indexFromLeftAtTimeOfDeath: deadMinionIndexesFromLeft1[index],
				},
				gameState.cardsData,
			),
		),
	);
	gameState.sharedState.deaths.push(
		...deadEntities2.map((e, index) =>
			addImpliedMechanics(
				{
					...e,
					health: e.maxHealth,
					definitelyDead: false,
					indexFromLeftAtTimeOfDeath: deadMinionIndexesFromLeft2[index],
				},
				gameState.cardsData,
			),
		),
	);

	for (const deadEntity of deadEntities1) {
		const onDeathImpl = cardMappings[deadEntity.cardId];
		if (hasOnDeath(onDeathImpl)) {
			onDeathImpl.onDeath(deadEntity, {
				hero: board1Hero,
				board: board1,
				gameState: gameState,
			});
		}
	}
	for (const deadEntity of deadEntities2) {
		const onDeathImpl = cardMappings[deadEntity.cardId];
		if (hasOnDeath(onDeathImpl)) {
			onDeathImpl.onDeath(deadEntity, {
				hero: board2Hero,
				board: board2,
				gameState: gameState,
			});
		}
	}

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

	// Make sure we only return when there are no more deaths to process
	// Make sure to do this right before the end of the process
	// FIXME: this will propagate the killer between rounds, which is incorrect. For instance,
	// if a dragon kills a Ghoul, then the Ghoul's deathrattle kills a Kaboom, the killer should
	// now be the ghoul. Then if the Kaboom kills someone, the killer should again change. You could
	// also have multiple killers, which is not taken into account here.
	// The current assumption is that it's a suffienctly fringe case to not matter too much
	processMinionDeath(board1, board1Hero, board2, board2Hero, gameState);

	// Not sure about the timing here, but I have bothered Mitchell quite a lot already recently :)
	if (!skipSummonWhenSpace) {
		handleSummonsWhenSpace(board1, board1Hero, board2, board2Hero, gameState);
	}

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
	const candidateEntities = [];

	for (const trinket of friendlyHeroEntity.trinkets ?? []) {
		const onAfterDeathImpl = cardMappings[trinket.cardId];
		if (hasOnAfterDeath(onAfterDeathImpl)) {
			onAfterDeathImpl.onAfterDeath(trinket, {
				hero: friendlyHeroEntity,
				board: friendlyBoard,
				otherHero: otherHeroEntity,
				otherBoard: otherBoard,
				deadEntities: friendlyDeadEntities,
				gameState: gameState,
			});
		}
	}
	for (const entity of friendlyBoard) {
		const onAfterDeathImpl = cardMappings[entity.cardId];
		if (hasOnAfterDeath(onAfterDeathImpl)) {
			onAfterDeathImpl.onAfterDeath(entity, {
				hero: friendlyHeroEntity,
				board: friendlyBoard,
				otherHero: otherHeroEntity,
				otherBoard: otherBoard,
				deadEntities: friendlyDeadEntities,
				gameState: gameState,
			});
		}
	}

	const secretTriggered = null;
	// if (
	// 	(secretTriggered = friendlyHeroEntity.secrets?.find(
	// 		(secret) => !secret.triggered && secret?.cardId === CardIds.MagicBlackSoulstone,
	// 	)) != null
	// ) {
	// 	if (friendlyBoard.length === 0) {
	// 		secretTriggered.triggered = true;
	// 		for (let i = 0; i < 2; i++) {
	// 			const toSummon = pickRandom(gameState.cardsData.demonSpawns);
	// 			candidateEntities.push(
	// 				...spawnEntities(
	// 					toSummon,
	// 					1,
	// 					friendlyBoard,
	// 					friendlyHeroEntity,
	// 					otherBoard,
	// 					otherHeroEntity,
	// 					gameState,
	// 					friendlyHeroEntity.friendly,
	// 					false,
	// 				),
	// 			);
	// 		}
	// 	}
	// }
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

export interface OnDeathInput {
	readonly hero: BgsPlayerEntity;
	readonly board: BoardEntity[];
	readonly gameState: FullGameState;
}
export interface OnAfterDeathInput {
	readonly hero: BgsPlayerEntity;
	readonly board: BoardEntity[];
	readonly otherHero: BgsPlayerEntity;
	readonly otherBoard: BoardEntity[];
	readonly deadEntities: BoardEntity[];
	readonly gameState: FullGameState;
}
export interface OnMinionKilledInput {
	readonly killer: BoardEntity;
	readonly killerIsAttacking: boolean;
	readonly minionKilled: BoardEntity;
	readonly attackingHero: BgsPlayerEntity;
	readonly attackingBoard: BoardEntity[];
	readonly defendingHero: BgsPlayerEntity;
	readonly defendingBoard: BoardEntity[];
	readonly defenderNeighbours: readonly BoardEntity[];
	readonly gameState: FullGameState;
	readonly playerIsFriendly: boolean;
}
