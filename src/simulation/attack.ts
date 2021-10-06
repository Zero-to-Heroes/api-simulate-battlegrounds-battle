/* eslint-disable @typescript-eslint/no-use-before-define */
import { AllCardsService, CardIds, Race } from '@firestone-hs/reference-data';
import { BgsPlayerEntity } from '../bgs-player-entity';
import { BoardEntity } from '../board-entity';
import { CardsData } from '../cards/cards-data';
import { pickRandom } from '../services/utils';
import { validEnchantments } from '../simulate-bgs-battle';
import { afterStatsUpdate, hasCorrectTribe, hasMechanic, isCorrectTribe, modifyAttack, modifyHealth } from '../utils';
import { applyAuras, removeAuras } from './auras';
import { addCardsInHand, applyMinionDeathEffect, handleDeathrattleEffects, rememberDeathrattles } from './deathrattle-effects';
import { spawnEntities, spawnEntitiesFromDeathrattle, spawnEntitiesFromEnchantments } from './deathrattle-spawns';
import { applyFrenzy } from './frenzy';
import { SharedState } from './shared-state';
import { handleSpawnEffects } from './spawn-effect';
import { Spectator } from './spectator/spectator';
import { getHeroPowerForHero } from './start-of-combat';

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
	attackingEntityIndex?: number,
): void => {
	if (attackingBoard.length === 0 || defendingBoard.length === 0) {
		return;
	}
	const attackingHeroPowerId = attackingBoardHero.heroPowerId || getHeroPowerForHero(attackingBoardHero.cardId);
	const defendingHeroPowerId = defendingBoardHero.heroPowerId || getHeroPowerForHero(defendingBoardHero.cardId);
	const numberOfDeathwingPresents =
		(attackingHeroPowerId === CardIds.AllWillBurnBattlegrounds ? 1 : 0) +
		(defendingHeroPowerId === CardIds.AllWillBurnBattlegrounds ? 1 : 0);
	applyAuras(attackingBoard, numberOfDeathwingPresents, spawns, allCards);
	applyAuras(defendingBoard, numberOfDeathwingPresents, spawns, allCards);

	const attackingEntity =
		attackingEntityIndex != null ? attackingBoard[attackingEntityIndex] : getAttackingEntity(attackingBoard, lastAttackerEntityId);
	if (attackingEntity) {
		attackingEntity.attacking = true;
		// console.log('attack by', stringifySimpleCard(attackingEntity, allCards), attackingEntity.attacking);
		const numberOfAttacks = attackingEntity.megaWindfury ? 4 : attackingEntity.windfury ? 2 : 1;
		for (let i = 0; i < numberOfAttacks; i++) {
			// We refresh the entity in case of windfury
			if (attackingBoard.length === 0 || defendingBoard.length === 0) {
				return;
			}
			// Check that didn't die
			if (attackingBoard.find((entity) => entity.entityId === attackingEntity.entityId)) {
				applyOnAttackBuffs(attackingEntity, attackingBoard, allCards, spectator);
				const defendingEntity: BoardEntity = getDefendingEntity(defendingBoard, attackingEntity);
				spectator.registerAttack(attackingEntity, defendingEntity, attackingBoard, defendingBoard);
				applyOnBeingAttackedBuffs(defendingEntity, defendingBoard, allCards, spectator);
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
				// FIXME: I don't know the behavior with Windfury. Should the attack be done right away, before
				// the windfury triggers again? The current behavior attacks after the windfury is over
				if (
					defendingEntity.health > 0 &&
					!defendingEntity.definitelyDead &&
					(defendingEntity.cardId === CardIds.YoHoOgre || defendingEntity.cardId === CardIds.YoHoOgreBattlegrounds)
				) {
					defendingEntity.attackImmediately = true;
				}
			}
		}
	}
	removeAuras(attackingBoard, spawns);
	removeAuras(defendingBoard, spawns);
};

const applyAfterAttackEffects = (
	attackingEntity: BoardEntity,
	attackingBoard: BoardEntity[],
	attackingBoardHero: BgsPlayerEntity,
	allCards: AllCardsService,
	spectator: Spectator,
): void => {
	if (attackingEntity.cardId === CardIds.Bonker || attackingEntity.cardId === CardIds.BonkerBattlegrounds) {
		addCardsInHand(attackingBoardHero, 1, attackingBoard, allCards, spectator);
	}
};

const performAttack = (
	attackingEntity: BoardEntity,
	defendingEntity: BoardEntity,
	attackingBoard: BoardEntity[],
	attackingBoardHero: BgsPlayerEntity,
	defendingBoard: BoardEntity[],
	defendingBoardHero: BgsPlayerEntity,
	allCards: AllCardsService,
	spawns: CardsData,
	sharedState: SharedState,
	spectator: Spectator,
): void => {
	if (hasCorrectTribe(attackingEntity, Race.DRAGON, allCards)) {
		const prestors = attackingBoard
			.filter((e) => e.entityId !== attackingEntity.entityId)
			.filter((e) => e.cardId === CardIds.PrestorsPyrospawn || e.cardId === CardIds.PrestorsPyrospawnBattlegrounds);
		prestors.forEach((prestor) => {
			spectator.registerPowerTarget(prestor, defendingEntity, defendingBoard);
			dealDamageToEnemy(
				defendingEntity,
				defendingBoard,
				defendingBoardHero,
				prestor,
				prestor.cardId === CardIds.PrestorsPyrospawnBattlegrounds ? 6 : 3,
				attackingBoard,
				attackingBoardHero,
				allCards,
				spawns,
				sharedState,
				spectator,
			);
		});
	}

	// For Prestor
	const defenderAliveBeforeAttack = defendingEntity.health > 0 && !defendingEntity.definitelyDead;
	if (defenderAliveBeforeAttack) {
		bumpEntities(
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
		bumpEntities(
			defendingEntity,
			attackingEntity,
			defendingBoard,
			defendingBoardHero,
			attackingBoard,
			attackingBoardHero,
			allCards,
			spawns,
			sharedState,
			spectator,
		);
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
				spawns,
				sharedState,
				spectator,
			);
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
			spawns,
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
				spawns,
				sharedState,
				spectator,
				true,
			);
		}
	}

	attackingEntity.attackImmediately = false;
	processMinionDeath(attackingBoard, attackingBoardHero, defendingBoard, defendingBoardHero, allCards, spawns, sharedState, spectator);
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
	const targetEntity = validDeathrattles[Math.floor(Math.random() * validDeathrattles.length)];
	spectator.registerPowerTarget(sourceEntity, targetEntity, attackingBoard);
	buildBoardAfterDeathrattleSpawns(
		attackingBoard,
		attackingBoardHero,
		targetEntity,
		-1,
		defendingBoard,
		defendingBoardHero,
		allCards,
		spawns,
		sharedState,
		spectator,
	);
};

const getAttackingEntity = (attackingBoard: BoardEntity[], lastAttackerEntityId: number): BoardEntity => {
	let validAttackers = attackingBoard.filter((entity) => entity.attack > 0).filter((entity) => !entity.cantAttack);
	if (validAttackers.length === 0) {
		return null;
	}

	if (validAttackers.some((entity) => entity.attackImmediately)) {
		validAttackers = validAttackers.filter((entity) => entity.attackImmediately);
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

export const getNeighbours = (board: BoardEntity[], entity: BoardEntity, deadEntityIndex?: number): readonly BoardEntity[] => {
	const neighbours = [];
	if (deadEntityIndex != null) {
		if (deadEntityIndex < board.length - 1) {
			neighbours.push(board[deadEntityIndex]);
		}
		// Could happen if a cleave kills several entities at the same time
		if (deadEntityIndex > 0 && deadEntityIndex <= board.length) {
			neighbours.push(board[deadEntityIndex - 1]);
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
): void => {
	// console.log('dealing damage to', damage, stringifySimpleCard(defendingEntity, allCards));
	if (!defendingEntity) {
		return;
	}

	const fakeAttacker = {
		...(damageSource || {}),
		entityId: -1,
		attack: damage,
		attacking: true,
	} as BoardEntity;
	bumpEntities(
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
	const defendingEntityIndex = defendingBoard.map((entity) => entity.entityId).indexOf(defendingEntity.entityId);
	defendingBoard[defendingEntityIndex] = defendingEntity;
	// processMinionDeath(
	// 	defendingBoard,
	// 	defendingBoardHero,
	// 	boardWithAttackOrigin,
	// 	boardWithAttackOriginHero,
	// 	allCards,
	// 	cardsData,
	// 	sharedState,
	// 	spectator,
	// );
};

export const getDefendingEntity = (defendingBoard: BoardEntity[], attackingEntity: BoardEntity, ignoreTaunts = false): BoardEntity => {
	let possibleDefenders: readonly BoardEntity[];
	if (attackingEntity.cardId === CardIds.ZappSlywick || attackingEntity.cardId === CardIds.ZappSlywickBattlegrounds) {
		const minAttack = Math.min(...defendingBoard.map((entity) => entity.attack));
		possibleDefenders = defendingBoard.filter((entity) => entity.attack === minAttack);
	} else if (!ignoreTaunts) {
		const taunts = defendingBoard.filter((entity) => entity.taunt);
		possibleDefenders = taunts.length > 0 ? taunts : defendingBoard;
	} else {
		possibleDefenders = defendingBoard;
	}
	let chosenDefender = possibleDefenders[Math.floor(Math.random() * possibleDefenders.length)];
	if (chosenDefender.taunt) {
		const elistras = defendingBoard.filter(
			(entity) => entity.cardId === CardIds.ElistraTheImmortal2 || entity.cardId === CardIds.ElistraTheImmortalBattlegrounds,
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
): void => {
	// No attack has no impact
	if (bumpInto.attack === 0) {
		return;
	}

	if (entity.divineShield) {
		// Handle all the divine shield loss effects here
		for (let i = 0; i < entityBoard.length; i++) {
			if (entityBoard[i].cardId === CardIds.BolvarFireblood) {
				modifyAttack(entityBoard[i], 2, entityBoard, allCards);
				afterStatsUpdate(entityBoard[i], entityBoard, allCards);
				spectator.registerPowerTarget(entityBoard[i], entityBoard[i], entityBoard);
			} else if (entityBoard[i].cardId === CardIds.BolvarFirebloodBattlegrounds) {
				modifyAttack(entityBoard[i], 4, entityBoard, allCards);
				afterStatsUpdate(entityBoard[i], entityBoard, allCards);
				spectator.registerPowerTarget(entityBoard[i], entityBoard[i], entityBoard);
			} else if (entityBoard[i].cardId === CardIds.DrakonidEnforcer) {
				modifyAttack(entityBoard[i], 2, entityBoard, allCards);
				modifyHealth(entityBoard[i], 2);
				afterStatsUpdate(entityBoard[i], entityBoard, allCards);
				spectator.registerPowerTarget(entityBoard[i], entityBoard[i], entityBoard);
			} else if (entityBoard[i].cardId === CardIds.DrakonidEnforcerBattlegrounds) {
				modifyAttack(entityBoard[i], 4, entityBoard, allCards);
				modifyHealth(entityBoard[i], 4);
				afterStatsUpdate(entityBoard[i], entityBoard, allCards);
				spectator.registerPowerTarget(entityBoard[i], entityBoard[i], entityBoard);
			} else if (
				entityBoard[i].entityId !== entity.entityId &&
				(entityBoard[i].cardId === CardIds.HolyMecherel || entityBoard[i].cardId === CardIds.HolyMecherelBattlegrounds)
			) {
				entityBoard[i].divineShield = true;
			} else if (entityBoard[i].cardId === CardIds.Gemsplitter) {
				addCardsInHand(entityBoardHero, 1, entityBoard, allCards, spectator);
			} else if (entityBoard[i].cardId === CardIds.GemsplitterBattlegrounds) {
				addCardsInHand(entityBoardHero, 2, entityBoard, allCards, spectator);
			}

			// So that self-buffs from Bolvar are taken into account
			if (entityBoard[i].entityId === entity.entityId) {
				entity.divineShield = false;
			}
		}
		const greaseBots = entityBoard.filter((entity) => entity.cardId === CardIds.GreaseBot);
		const greaseBotBattlegrounds = entityBoard.filter((entity) => entity.cardId === CardIds.GreaseBotBattlegrounds);
		greaseBots.forEach((bot) => {
			modifyAttack(entity, 2, entityBoard, allCards);
			modifyHealth(entity, 1);
			spectator.registerPowerTarget(bot, entity, entityBoard);
		});
		greaseBotBattlegrounds.forEach((bot) => {
			modifyAttack(entity, 4, entityBoard, allCards);
			modifyHealth(entity, 2);
			spectator.registerPowerTarget(bot, entity, entityBoard);
		});
		return;
		// return entity;
	}
	entity.health = entity.health - bumpInto.attack;
	// Do it last, so that other effects are still processed
	if (bumpInto.poisonous) {
		// So that further buffs don't revive it
		// And we don't just set the health to avoid applying overkill effects
		entity.definitelyDead = true;
		// return entity;
	}
	// FIXME: This will likely be incorrect in terms of timings, e.g. if the entity ends up
	// surviving following a buff like Spawn.
	spectator.registerDamageDealt(bumpInto, entity, bumpInto.attack, entityBoard);
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
		entityBoard.splice(index + 1, 0, ...entitySpawns);
		spectator.registerMinionsSpawn(entity, entityBoard, entitySpawns);
		handleSpawnEffects(entityBoard, entitySpawns, allCards, spectator);
	}
	return;
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
	const [deadMinionIndexes1, deadEntities1] = makeMinionsDie(board1, allCards);
	const [deadMinionIndexes2, deadEntities2] = makeMinionsDie(board2, allCards);
	spectator.registerDeadEntities(deadMinionIndexes1, deadEntities1, deadMinionIndexes2, deadEntities2);
	// No death to process, we can return
	if (deadEntities1.length === 0 && deadEntities2.length === 0) {
		return;
		// return [board1, board2];
	}
	sharedState.deaths.push(...deadEntities1);
	sharedState.deaths.push(...deadEntities2);

	if (Math.random() > 0.5) {
		// Now proceed to trigger all deathrattle effects on baord1
		handleDeathsForFirstBoard(
			board1,
			board1Hero,
			board2,
			board2Hero,
			deadMinionIndexes1,
			deadEntities1,
			allCards,
			cardsData,
			sharedState,
			spectator,
		);
		// Now handle the other board's deathrattles
		handleDeathsForFirstBoard(
			board2,
			board2Hero,
			board1,
			board1Hero,
			deadMinionIndexes2,
			deadEntities2,
			allCards,
			cardsData,
			sharedState,
			spectator,
		);
	} else {
		handleDeathsForFirstBoard(
			board2,
			board2Hero,
			board1,
			board1Hero,
			deadMinionIndexes2,
			deadEntities2,
			allCards,
			cardsData,
			sharedState,
			spectator,
		);
		handleDeathsForFirstBoard(
			board1,
			board1Hero,
			board2,
			board2Hero,
			deadMinionIndexes1,
			deadEntities1,
			allCards,
			cardsData,
			sharedState,
			spectator,
		);
	}
	// Make sure we only return when there are no more deaths to process
	// FIXME: this will propagate the killer between rounds, which is incorrect. For instance,
	// if a dragon kills a Ghoul, then the Ghoul's deathrattle kills a Kaboom, the killer should
	// now be the ghoul. Then if the Kaboom kills someone, the killer should again change. You could
	// also have multiple killers, which is not taken into account here.
	// The current assumption is that it's a suffienctly fringe case to not matter too much
	processMinionDeath(board1, board1Hero, board2, board2Hero, allCards, cardsData, sharedState, spectator);

	// If the fish dies (from Scallywag for instance), it doesn't remember the deathrattle
	board1
		.filter(
			(entity) =>
				entity.cardId === CardIds.AvatarOfNzoth_FishOfNzothTokenBattlegrounds || entity.cardId === CardIds.FishOfNzothBattlegrounds,
		)
		.forEach((entity) => rememberDeathrattles(entity, deadEntities1, cardsData));
	board2
		.filter(
			(entity) =>
				entity.cardId === CardIds.AvatarOfNzoth_FishOfNzothTokenBattlegrounds || entity.cardId === CardIds.FishOfNzothBattlegrounds,
		)
		.forEach((entity) => rememberDeathrattles(entity, deadEntities2, cardsData));
};

const handleDeathsForFirstBoard = (
	firstBoard: BoardEntity[],
	firstBoardHero: BgsPlayerEntity,
	otherBoard: BoardEntity[],
	otherBoardHero: BgsPlayerEntity,
	deadMinionIndexes: readonly number[],
	deadEntities: readonly BoardEntity[],
	allCards: AllCardsService,
	cardsData: CardsData,
	sharedState: SharedState,
	spectator: Spectator,
): void => {
	for (let i = 0; i < deadMinionIndexes.length; i++) {
		const entity = deadEntities[i];
		const index = deadMinionIndexes[i];
		if (entity.health <= 0 || entity.definitelyDead) {
			buildBoardAfterDeathrattleSpawns(
				firstBoard,
				firstBoardHero,
				entity,
				index,
				otherBoard,
				otherBoardHero,
				allCards,
				cardsData,
				sharedState,
				spectator,
			);
		} else if (firstBoard.length > 0) {
			// const newBoardD = [...firstBoard];
			firstBoard.splice(index, 1, entity);
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
	if (attacker.cardId === CardIds.GlyphGuardian2) {
		// For now the utility method only works additively, so we hack around it
		modifyAttack(attacker, 2 * attacker.attack - attacker.attack, attackingBoard, allCards);
	}
	if (attacker.cardId === CardIds.GlyphGuardianBattlegrounds) {
		modifyAttack(attacker, 3 * attacker.attack - attacker.attack, attackingBoard, allCards);
	}

	// Ripsnarl Captain
	if (isCorrectTribe(allCards.getCard(attacker.cardId).race, Race.PIRATE)) {
		const ripsnarls = attackingBoard
			.filter((e) => e.cardId === CardIds.RipsnarlCaptain)
			.filter((e) => e.entityId !== attacker.entityId);
		const ripsnarlsTB = attackingBoard
			.filter((entity) => entity.cardId === CardIds.RipsnarlCaptainBattlegrounds)
			.filter((e) => e.entityId !== attacker.entityId);
		ripsnarls.forEach((captain) => {
			modifyAttack(attacker, 2, attackingBoard, allCards);
			modifyHealth(attacker, 2);
			spectator.registerPowerTarget(captain, attacker, attackingBoard);
		});
		ripsnarlsTB.forEach((captain) => {
			modifyAttack(attacker, 4, attackingBoard, allCards);
			modifyHealth(attacker, 4);
			spectator.registerPowerTarget(captain, attacker, attackingBoard);
		});
	}

	// Dread Admiral Eliza
	if (isCorrectTribe(allCards.getCard(attacker.cardId).race, Race.PIRATE)) {
		const elizas = attackingBoard.filter((e) => e.cardId === CardIds.DreadAdmiralEliza);
		const elizasTB = attackingBoard.filter((e) => e.cardId === CardIds.DreadAdmiralElizaBattlegrounds);

		elizas.forEach((eliza) => {
			attackingBoard.forEach((entity) => {
				modifyAttack(entity, 2, attackingBoard, allCards);
				modifyHealth(entity, 1);
				spectator.registerPowerTarget(eliza, entity, attackingBoard);
			});
		});
		elizasTB.forEach((eliza) => {
			attackingBoard.forEach((entity) => {
				modifyAttack(entity, 4, attackingBoard, allCards);
				modifyHealth(entity, 2);
				spectator.registerPowerTarget(eliza, entity, attackingBoard);
			});
		});
	}
};

export const applyOnBeingAttackedBuffs = (
	attackedEntity: BoardEntity,
	defendingBoard: BoardEntity[],
	allCards: AllCardsService,
	spectator: Spectator,
): void => {
	if (attackedEntity.taunt) {
		const champions = defendingBoard.filter((entity) => entity.cardId === CardIds.ChampionOfYshaarj);
		const goldenChampions = defendingBoard.filter((entity) => entity.cardId === CardIds.ChampionOfYshaarjBattlegrounds);
		champions.forEach((entity) => {
			modifyAttack(entity, 1, defendingBoard, allCards);
			modifyHealth(entity, 1);
			spectator.registerPowerTarget(entity, entity, defendingBoard);
		});
		goldenChampions.forEach((entity) => {
			modifyAttack(entity, 2, defendingBoard, allCards);
			modifyHealth(entity, 2);
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
			modifyHealth(entity, 1);
			spectator.registerPowerTarget(attackedEntity, entity, defendingBoard);
		});
	}
	if (attackedEntity.cardId === CardIds.TormentedRitualistBattlegrounds) {
		const neighbours = getNeighbours(defendingBoard, attackedEntity);
		neighbours.forEach((entity) => {
			modifyAttack(entity, 2, defendingBoard, allCards);
			modifyHealth(entity, 2);
			spectator.registerPowerTarget(attackedEntity, entity, defendingBoard);
		});
	}
};

const makeMinionsDie = (board: BoardEntity[], allCards: AllCardsService): [number[], BoardEntity[]] => {
	const deadMinionIndexes: number[] = [];
	const deadEntities: BoardEntity[] = [];
	for (let i = 0; i < board.length; i++) {
		const index = board.map((entity) => entity.entityId).indexOf(board[i].entityId);
		if (board[i].health <= 0 || board[i].definitelyDead) {
			deadMinionIndexes.push(i);
			deadEntities.push(board[i]);
			board.splice(index, 1);
			// We modify the original array, so we need to update teh current index accordingly
			i--;
		}
	}
	return [deadMinionIndexes, deadEntities];
};

const handleKillEffects = (
	boardWithKilledMinion: BoardEntity[],
	killerBoard: BoardEntity[],
	deadEntity: BoardEntity,
	allCards: AllCardsService,
	spectator: Spectator,
): void => {
	if (
		deadEntity.lastAffectedByEntity?.cardId &&
		isCorrectTribe(allCards.getCard(deadEntity.lastAffectedByEntity.cardId).race, Race.DRAGON)
	) {
		for (const entity of killerBoard) {
			if (entity.cardId === CardIds.WaxriderTogwaggle2) {
				modifyAttack(entity, 2, killerBoard, allCards);
				modifyHealth(entity, 2);
				afterStatsUpdate(entity, killerBoard, allCards);
				spectator.registerPowerTarget(entity, entity, killerBoard);
			} else if (entity.cardId === CardIds.WaxriderTogwaggleBattlegrounds) {
				modifyAttack(entity, 4, killerBoard, allCards);
				modifyHealth(entity, 4);
				afterStatsUpdate(entity, killerBoard, allCards);
				spectator.registerPowerTarget(entity, entity, killerBoard);
			}
		}
	}
};

const buildBoardAfterDeathrattleSpawns = (
	boardWithKilledMinion: BoardEntity[],
	boardWithKilledMinionHero: BgsPlayerEntity,
	deadEntity: BoardEntity,
	deadMinionIndex: number,
	opponentBoard: BoardEntity[],
	opponentBoardHero: BgsPlayerEntity,
	allCards: AllCardsService,
	cardsData: CardsData,
	sharedState: SharedState,
	spectator: Spectator,
): void => {
	// console.log('buildBoardAfterDeathrattleSpawns', deadMinionIndex, stringifySimple(boardWithKilledMinion, allCards));
	// TODO: don't apply this for FishOfNZoth
	if (deadMinionIndex >= 0) {
		handleKillEffects(boardWithKilledMinion, opponentBoard, deadEntity, allCards, spectator);
	}

	// But Wildfire Element is applied first, before the DR spawns
	if (deadMinionIndex >= 0) {
		applyMinionDeathEffect(
			deadEntity,
			deadMinionIndex,
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
		deadMinionIndex,
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
				cardId: deathrattle,
				enchantments: [
					{
						cardId: deathrattle,
						originEntityId: deadEntity.entityId,
					},
				],
			};
			buildBoardAfterDeathrattleSpawns(
				boardWithKilledMinion,
				boardWithKilledMinionHero,
				entityToProcess,
				deadMinionIndex,
				opponentBoard,
				opponentBoardHero,
				allCards,
				cardsData,
				sharedState,
				spectator,
			);
		}
	}

	// Reborn happens after deathrattles
	const entitiesFromReborn: readonly BoardEntity[] =
		deadEntity.reborn && deadMinionIndex >= 0
			? spawnEntities(
					deadEntity.cardId,
					1,
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
			  )
			: [];
	performEntitySpawns(
		entitiesFromReborn,
		boardWithKilledMinion,
		boardWithKilledMinionHero,
		deadEntity,
		deadMinionIndex,
		opponentBoard,
		opponentBoardHero,
		allCards,
		cardsData,
		sharedState,
		spectator,
	);
};

const performEntitySpawns = (
	candidateEntities: readonly BoardEntity[],
	boardWithKilledMinion: BoardEntity[],
	boardWithKilledMinionHero: BgsPlayerEntity,
	deadEntity: BoardEntity,
	deadMinionIndex: number,
	opponentBoard: BoardEntity[],
	opponentBoardHero: BgsPlayerEntity,
	allCards: AllCardsService,
	cardsData: CardsData,
	sharedState: SharedState,
	spectator: Spectator,
): void => {
	const aliveEntites = candidateEntities.filter((entity) => entity.health > 0 && !entity.definitelyDead);

	// const roomToSpawn: number = 7 - boardWithKilledMinion.length;
	// const spawnedEntities: readonly BoardEntity[] = aliveEntites.slice(0, roomToSpawn);

	const indexFromRight = boardWithKilledMinion.length - deadMinionIndex;
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
		boardWithKilledMinion.splice(boardWithKilledMinion.length - indexFromRight, 0, newMinion);
		if (newMinion.attackImmediately) {
			// Whenever we are already in a combat phase, we need to first clean up the state
			removeAuras(boardWithKilledMinion, cardsData);
			removeAuras(opponentBoard, cardsData);
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

	// Minion has already been removed from the board in the previous step
	handleSpawnEffects(boardWithKilledMinion, spawnedEntities, allCards, spectator);
	spectator.registerMinionsSpawn(deadEntity, boardWithKilledMinion, spawnedEntities);
};
