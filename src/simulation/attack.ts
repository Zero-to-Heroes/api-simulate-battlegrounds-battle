/* eslint-disable @typescript-eslint/no-use-before-define */
import { AllCardsService, CardIds, Race } from '@firestone-hs/reference-data';
import { BgsPlayerEntity } from '../bgs-player-entity';
import { BoardEntity } from '../board-entity';
import { CardsData } from '../cards/cards-data';
import { validEnchantments } from '../simulate-bgs-battle';
import { hasMechanic, isCorrectTribe, stringifySimple, stringifySimpleCard } from '../utils';
import { applyAuras, removeAuras } from './auras';
import { handleDeathrattleEffects, rememberDeathrattles } from './deathrattle-effects';
import { spawnEntities, spawnEntitiesFromDeathrattle, spawnEntitiesFromEnchantments } from './deathrattle-spawns';
import { applyGlobalModifiers, removeGlobalModifiers } from './global-modifiers';
import { SharedState } from './shared-state';
import { handleSpawnEffects } from './spawn-effect';
import { Spectator } from './spectator/spectator';
import { getHeroPowerForHero } from './start-of-combat';

export const simulateAttack = (
	attackingBoard: BoardEntity[],
	attackingHero: BgsPlayerEntity,
	defendingBoard: BoardEntity[],
	defendingHero: BgsPlayerEntity,
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
	// console.log('opponent board before global modifiers', stringifySimple(defendingBoard));
	applyGlobalModifiers(attackingBoard, defendingBoard, spawns, allCards);
	// console.log('opponent board after global modifiers', stringifySimple(defendingBoard));
	const attackingHeroPowerId = attackingHero.heroPowerId || getHeroPowerForHero(attackingHero.cardId);
	const defendingHeroPowerId = defendingHero.heroPowerId || getHeroPowerForHero(defendingHero.cardId);
	const numberOfDeathwingPresents =
		(attackingHeroPowerId === CardIds.NonCollectible.Neutral.AllWillBurnTavernBrawl ? 1 : 0) +
		(defendingHeroPowerId === CardIds.NonCollectible.Neutral.AllWillBurnTavernBrawl ? 1 : 0);
	// console.log('defendingBoard before auras', stringifySimple(defendingBoard), numberOfDeathwingPresents);
	applyAuras(attackingBoard, numberOfDeathwingPresents, spawns, allCards);
	applyAuras(defendingBoard, numberOfDeathwingPresents, spawns, allCards);
	// console.log('boards after auras\n', stringifySimple(attackingBoard), '\n', stringifySimple(defendingBoard));

	// console.log('picking attacking entity', attackingEntityIndex, stringifySimple(attackingBoard));
	const attackingEntity =
		attackingEntityIndex != null
			? attackingBoard[attackingEntityIndex]
			: getAttackingEntity(attackingBoard, lastAttackerEntityId);
	// console.log('attackingEntity\n', stringifySimpleCard(attackingEntity));
	if (attackingEntity) {
		const numberOfAttacks = attackingEntity.megaWindfury ? 4 : attackingEntity.windfury ? 2 : 1;
		for (let i = 0; i < numberOfAttacks; i++) {
			// We refresh the entity in case of windfury
			if (attackingBoard.length === 0 || defendingBoard.length === 0) {
				return;
			}
			// Check that didn't die
			if (attackingBoard.find(entity => entity.entityId === attackingEntity.entityId)) {
				applyOnAttackBuffs(attackingEntity, attackingBoard, allCards);
				const defendingEntity: BoardEntity = getDefendingEntity(defendingBoard, attackingEntity);
				if (sharedState.debug) {
					console.log(
						'battling between',
						stringifySimpleCard(attackingEntity),
						stringifySimpleCard(defendingEntity),
					);
				}
				applyOnBeingAttackedBuffs(defendingEntity, defendingBoard, allCards);

				spectator.registerAttack(attackingEntity, defendingEntity, attackingBoard, defendingBoard);
				performAttack(
					attackingEntity,
					defendingEntity,
					attackingBoard,
					defendingBoard,
					allCards,
					spawns,
					sharedState,
					spectator,
				);
				// FIXME: I don't know the behavior with Windfury. Should the attack be done right away, before
				// the windfury triggers again? The current behavior attacks after the windfury is over
				if (defendingEntity.health > 0 && defendingEntity.cardId === CardIds.NonCollectible.Neutral.YoHoOgre) {
					// console.log('yoho ogre attacking immediately', defendingEntity);
					defendingEntity.attackImmediately = true;
				}
			}
		}
	}
	// console.log(
	// 	'boards before removing auras\n',
	// 	stringifySimple(attackingBoard),
	// 	'\n',
	// 	stringifySimple(defendingBoard),
	// );
	removeAuras(attackingBoard, spawns);
	removeAuras(defendingBoard, spawns);
	removeGlobalModifiers(attackingBoard, defendingBoard, allCards);
	// console.log(
	// 	'boards after removing auras\n',
	// 	stringifySimple(attackingBoard),
	// 	'\n',
	// 	stringifySimple(defendingBoard),
	// );
	// console.log('after simulateAttack', spectator['actionsForCurrentBattle']);
};

const performAttack = (
	attackingEntity: BoardEntity,
	defendingEntity: BoardEntity,
	attackingBoard: BoardEntity[],
	defendingBoard: BoardEntity[],
	allCards: AllCardsService,
	spawns: CardsData,
	sharedState: SharedState,
	spectator: Spectator,
): void => {
	bumpEntities(attackingEntity, defendingEntity, attackingBoard, allCards, spawns, sharedState, spectator);
	bumpEntities(defendingEntity, attackingEntity, defendingBoard, allCards, spawns, sharedState, spectator);
	if (sharedState.debug) {
		console.log('after damage', stringifySimpleCard(attackingEntity), stringifySimpleCard(defendingEntity));
	}
	// Cleave
	if (attackingEntity.cleave) {
		const defenderNeighbours: readonly BoardEntity[] = getNeighbours(defendingBoard, defendingEntity);
		for (const neighbour of defenderNeighbours) {
			bumpEntities(neighbour, attackingEntity, defendingBoard, allCards, spawns, sharedState, spectator);
		}
	}
	// After attack hooks
	// Arcane Cannon
	// const attackerNeighbours: readonly BoardEntity[] = getNeighbours(attackingBoard, attackingEntity);
	// const cannonNeighbours = attackerNeighbours.filter(
	// 	entity => CardIds.NonCollectible.Neutral.ArcaneCannon === entity.cardId,
	// );
	if (sharedState.debug) {
		// console.log('heighbours', stringifySimple(attackerNeighbours), stringifySimple(cannonNeighbours));
	}
	// if (cannonNeighbours.length > 0) {
	// 	if (sharedState.debug) {
	// 		console.log('dealing arcane cannon damage', stringifySimple(cannonNeighbours));
	// 	}
	// 	cannonNeighbours.forEach(cannon =>
	// 		dealDamageToRandomEnemy(
	// 			defendingBoard,
	// 			cannon,
	// 			2,
	// 			attackingBoard,
	// 			allCards,
	// 			spawns,
	// 			sharedState,
	// 			spectator,
	// 		),
	// 	);
	// }
	// const cannonNeighboursTB = attackerNeighbours.filter(
	// 	entity => CardIds.NonCollectible.Neutral.ArcaneCannonTavernBrawl === entity.cardId,
	// );
	// if (cannonNeighboursTB.length > 0) {
	// 	if (sharedState.debug) {
	// 		console.log('dealing golden arcane cannon damage', stringifySimple(cannonNeighboursTB));
	// 	}
	// 	cannonNeighboursTB.forEach(cannon => {
	// 		dealDamageToRandomEnemy(
	// 			defendingBoard,
	// 			cannon,
	// 			2,
	// 			attackingBoard,
	// 			allCards,
	// 			spawns,
	// 			sharedState,
	// 			spectator,
	// 		);
	// 		dealDamageToRandomEnemy(
	// 			defendingBoard,
	// 			cannon,
	// 			2,
	// 			attackingBoard,
	// 			allCards,
	// 			spawns,
	// 			sharedState,
	// 			spectator,
	// 		);
	// 	});
	// }
	// Monstrous Macaw
	if (attackingEntity.cardId === CardIds.NonCollectible.Neutral.MonstrousMacaw) {
		triggerRandomDeathrattle(attackingBoard, defendingBoard, allCards, spawns, sharedState, spectator);
	} else if (attackingEntity.cardId === CardIds.NonCollectible.Neutral.MonstrousMacawTavernBrawl) {
		triggerRandomDeathrattle(attackingBoard, defendingBoard, allCards, spawns, sharedState, spectator);
		triggerRandomDeathrattle(attackingBoard, defendingBoard, allCards, spawns, sharedState, spectator);
	}

	attackingEntity.attackImmediately = false;

	// Approximate the play order
	// updatedDefenders.sort((a, b) => a.entityId - b.entityId);
	processMinionDeath(attackingBoard, defendingBoard, allCards, spawns, sharedState, spectator);
};

const triggerRandomDeathrattle = (
	attackingBoard: BoardEntity[],
	defendingBoard: BoardEntity[],
	allCards: AllCardsService,
	spawns: CardsData,
	sharedState: SharedState,
	spectator: Spectator,
): void => {
	const validDeathrattles = attackingBoard.filter(
		entity =>
			hasMechanic(allCards.getCard(entity.cardId), 'DEATHRATTLE') ||
			(entity.enchantments &&
				entity.enchantments
					.map(enchantment => enchantment.cardId)
					.some(enchantmentId => validEnchantments.includes(enchantmentId))),
	);
	if (sharedState.debug) {
		console.log('triggering random deathrattle\n', stringifySimple(validDeathrattles));
	}
	if (validDeathrattles.length === 0) {
		return;
	}
	const targetEntity = validDeathrattles[Math.floor(Math.random() * validDeathrattles.length)];
	buildBoardAfterDeathrattleSpawns(
		attackingBoard,
		targetEntity,
		-1,
		defendingBoard,
		allCards,
		spawns,
		sharedState,
		spectator,
	);
};

const getAttackingEntity = (attackingBoard: BoardEntity[], lastAttackerEntityId: number): BoardEntity => {
	let validAttackers = attackingBoard.filter(entity => entity.attack > 0).filter(entity => !entity.cantAttack);
	if (validAttackers.length === 0) {
		return null;
	}

	if (validAttackers.some(entity => entity.attackImmediately)) {
		validAttackers = validAttackers.filter(entity => entity.attackImmediately);
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
	attackingEntity.attacking = true;
	return attackingEntity;
};

export const getNeighbours = (
	board: BoardEntity[],
	entity: BoardEntity,
	deadEntityIndex?: number,
): readonly BoardEntity[] => {
	const neighbours = [];
	if (deadEntityIndex != null) {
		if (deadEntityIndex < board.length - 1) {
			neighbours.push(board[deadEntityIndex]);
		}
		// Could happen if a cleave kills several entities at the same time
		if (deadEntityIndex > 0 && deadEntityIndex < board.length) {
			neighbours.push(board[deadEntityIndex - 1]);
		}
	} else {
		const index = board.map(e => e.entityId).indexOf(entity.entityId);
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
	damageSource: BoardEntity,
	damage: number,
	boardWithAttackOrigin: BoardEntity[],
	allCards: AllCardsService,
	cardsData: CardsData,
	sharedState: SharedState,
	spectator: Spectator,
): void => {
	if (boardToBeDamaged.length === 0) {
		return;
		// return [defendingBoard, boardWithAttackOrigin];
	}
	const defendingEntity: BoardEntity = getDefendingEntity(boardToBeDamaged, damageSource, true);
	spectator.registerPowerTarget(damageSource, defendingEntity, boardToBeDamaged);
	dealDamageToEnemy(
		defendingEntity,
		boardToBeDamaged,
		damageSource,
		damage,
		boardWithAttackOrigin,
		allCards,
		cardsData,
		sharedState,
		spectator,
	);
};

export const dealDamageToEnemy = (
	defendingEntity: BoardEntity,
	defendingBoard: BoardEntity[],
	damageSource: BoardEntity,
	damage: number,
	boardWithAttackOrigin: BoardEntity[],
	allCards: AllCardsService,
	cardsData: CardsData,
	sharedState: SharedState,
	spectator: Spectator,
): void => {
	const fakeAttacker = {
		...(damageSource || {}),
		entityId: -1,
		attack: damage,
		attacking: true,
	} as BoardEntity;
	bumpEntities(defendingEntity, fakeAttacker, defendingBoard, allCards, cardsData, sharedState, spectator);
	const defendingEntityIndex = defendingBoard.map(entity => entity.entityId).indexOf(defendingEntity.entityId);
	defendingBoard[defendingEntityIndex] = defendingEntity;
	processMinionDeath(defendingBoard, boardWithAttackOrigin, allCards, cardsData, sharedState, spectator);
};

export const getDefendingEntity = (
	defendingBoard: BoardEntity[],
	attackingEntity: BoardEntity,
	ignoreTaunts = false,
): BoardEntity => {
	let possibleDefenders: readonly BoardEntity[];
	if (
		attackingEntity.cardId === CardIds.NonCollectible.Neutral.ZappSlywick ||
		attackingEntity.cardId === CardIds.NonCollectible.Neutral.ZappSlywickTavernBrawl
	) {
		const minAttack = Math.min(...defendingBoard.map(entity => entity.attack));
		possibleDefenders = defendingBoard.filter(entity => entity.attack === minAttack);
	} else if (!ignoreTaunts) {
		const taunts = defendingBoard.filter(entity => entity.taunt);
		possibleDefenders = taunts.length > 0 ? taunts : defendingBoard;
	} else {
		possibleDefenders = defendingBoard;
	}
	let chosenDefender = possibleDefenders[Math.floor(Math.random() * possibleDefenders.length)];
	if (chosenDefender.taunt) {
		const elistras = defendingBoard.filter(
			entity =>
				entity.cardId === CardIds.NonCollectible.Neutral.ElistraTheImmortalBATTLEGROUNDS ||
				entity.cardId === CardIds.NonCollectible.Neutral.ElistraTheImmortalTavernBrawl,
		);
		if (elistras.length > 0) {
			chosenDefender = elistras[0];
		}
	}
	return chosenDefender;
};

export const bumpEntities = (
	entity: BoardEntity,
	bumpInto: BoardEntity,
	entityBoard: BoardEntity[],
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
			if (entityBoard[i].cardId === CardIds.Collectible.Paladin.BolvarFireblood) {
				entityBoard[i].attack = entityBoard[i].attack + 2;
			} else if (entityBoard[i].cardId === CardIds.NonCollectible.Paladin.BolvarFirebloodTavernBrawl) {
				entityBoard[i].attack = entityBoard[i].attack + 4;
			} else if (entityBoard[i].cardId === CardIds.NonCollectible.Neutral.DrakonidEnforcer) {
				entityBoard[i].attack = entityBoard[i].attack + 2;
				entityBoard[i].health = entityBoard[i].health + 2;
			} else if (entityBoard[i].cardId === CardIds.NonCollectible.Neutral.DrakonidEnforcerTavernBrawl) {
				entityBoard[i].attack = entityBoard[i].attack + 4;
				entityBoard[i].health = entityBoard[i].health + 4;
			}
			// So that self-buffs from Bolvar are taken into account
			if (entityBoard[i].entityId === entity.entityId) {
				entity.divineShield = false;
			}
		}
		return;
		// return entity;
	}
	entity.health = entity.health - bumpInto.attack;
	// Do it last, so that other effects are still processed
	if (bumpInto.poisonous) {
		entity.health = 0;
		// return entity;
	}
	spectator.registerDamageDealt(bumpInto, entity, bumpInto.attack, entityBoard);
	entity.lastAffectedByEntity = bumpInto;

	// FIXME: there could be a bug here, if a Cleave attacks several IGB at the same time. The current
	// implementation could spawn minions above the max board size. Fringe case though, so leaving it
	// like this for now
	if (entity.cardId === CardIds.Collectible.Warlock.ImpGangBoss && entityBoard.length < 7) {
		const index = entityBoard.map(e => e.entityId).indexOf(entity.entityId);
		const newEntities = spawnEntities(
			CardIds.NonCollectible.Warlock.ImpGangBoss_ImpToken,
			1,
			entityBoard,
			allCards,
			sharedState,
			entity.friendly,
			true,
		);
		entityBoard.splice(index, 0, ...newEntities);
		spectator.registerMinionsSpawn(entityBoard, newEntities);
	} else if (entity.cardId === CardIds.NonCollectible.Warlock.ImpGangBossTavernBrawl && entityBoard.length < 7) {
		const index = entityBoard.map(e => e.entityId).indexOf(entity.entityId);
		const newEntities = spawnEntities(
			CardIds.NonCollectible.Warlock.ImpGangBoss_ImpTokenTavernBrawl,
			1,
			entityBoard,
			allCards,
			sharedState,
			entity.friendly,
			true,
		);
		entityBoard.splice(index, 0, ...newEntities);
		spectator.registerMinionsSpawn(entityBoard, newEntities);
	} else if (entity.cardId === CardIds.NonCollectible.Warlock.ImpMama && entityBoard.length < 7) {
		const newEntities = spawnEntities(
			cardsData.impMamaSpawns[Math.floor(Math.random() * cardsData.impMamaSpawns.length)],
			1,
			entityBoard,
			allCards,
			sharedState,
			entity.friendly,
			true,
		).map(entity => ({ ...entity, taunt: true }));
		const index = entityBoard.map(e => e.entityId).indexOf(entity.entityId);
		entityBoard.splice(index, 0, ...newEntities);
		spectator.registerMinionsSpawn(entityBoard, newEntities);
	} else if (entity.cardId === CardIds.NonCollectible.Warlock.ImpMamaTavernBrawl && entityBoard.length < 7) {
		const newEntities = spawnEntities(
			cardsData.impMamaSpawns[Math.floor(Math.random() * cardsData.impMamaSpawns.length)],
			2,
			entityBoard,
			allCards,
			sharedState,
			entity.friendly,
			true,
		).map(entity => ({ ...entity, taunt: true }));
		const index = entityBoard.map(e => e.entityId).indexOf(entity.entityId);
		entityBoard.splice(index, 0, ...newEntities);
		spectator.registerMinionsSpawn(entityBoard, newEntities);
	} else if (entity.cardId === CardIds.Collectible.Warrior.SecurityRover && entityBoard.length < 7) {
		const index = entityBoard.map(e => e.entityId).indexOf(entity.entityId);
		const newEntities = spawnEntities(
			CardIds.NonCollectible.Warrior.SecurityRover_GuardBotToken,
			1,
			entityBoard,
			allCards,
			sharedState,
			entity.friendly,
			true,
		);
		entityBoard.splice(index, 0, ...newEntities);
		spectator.registerMinionsSpawn(entityBoard, newEntities);
	} else if (entity.cardId === CardIds.NonCollectible.Warrior.SecurityRoverTavernBrawl && entityBoard.length < 7) {
		const index = entityBoard.map(e => e.entityId).indexOf(entity.entityId);
		const newEntities = spawnEntities(
			CardIds.NonCollectible.Warrior.SecurityRover_GuardBotTokenTavernBrawl,
			1,
			entityBoard,
			allCards,
			sharedState,
			entity.friendly,
			true,
		);
		entityBoard.splice(index, 0, ...newEntities);
		spectator.registerMinionsSpawn(entityBoard, newEntities);
	}
	return;
	// return entity;
};

export const processMinionDeath = (
	board1: BoardEntity[],
	board2: BoardEntity[],
	allCards: AllCardsService,
	cardsData: CardsData,
	sharedState: SharedState,
	spectator: Spectator,
): void => {
	// console.log('boards before minions die', board1, board2);
	const [deadMinionIndexes1, deadEntities1] = makeMinionsDie(board1);
	const [deadMinionIndexes2, deadEntities2] = makeMinionsDie(board2);
	spectator.registerDeadEntities(deadMinionIndexes1, deadEntities1, deadMinionIndexes2, deadEntities2);
	// console.log('boards after minions die', board1.length, board2.length);
	// No death to process, we can return
	if (deadEntities1.length === 0 && deadEntities2.length === 0) {
		return;
		// return [board1, board2];
	}
	sharedState.deaths.push(...deadEntities1);
	sharedState.deaths.push(...deadEntities2);
	board1
		.filter(
			entity =>
				entity.cardId === CardIds.NonCollectible.Neutral.AvatarofNZoth_FishOfNzothTokenTavernBrawl ||
				entity.cardId === CardIds.NonCollectible.Neutral.FishOfNzothTavernBrawl,
		)
		.forEach(entity => rememberDeathrattles(entity, deadEntities1, cardsData));
	board2
		.filter(
			entity =>
				entity.cardId === CardIds.NonCollectible.Neutral.AvatarofNZoth_FishOfNzothTokenTavernBrawl ||
				entity.cardId === CardIds.NonCollectible.Neutral.FishOfNzothTavernBrawl,
		)
		.forEach(entity => rememberDeathrattles(entity, deadEntities2, cardsData));

	if (Math.random() > 0.5) {
		// Now proceed to trigger all deathrattle effects on baord1
		handleDeathsForFirstBoard(
			board1,
			board2,
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
			board1,
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
			board1,
			deadMinionIndexes2,
			deadEntities2,
			allCards,
			cardsData,
			sharedState,
			spectator,
		);
		handleDeathsForFirstBoard(
			board1,
			board2,
			deadMinionIndexes1,
			deadEntities1,
			allCards,
			cardsData,
			sharedState,
			spectator,
		);
	}
	// console.log('board from processMinionDeath', board1, board2);
	// Make sure we only return when there are no more deaths to process
	// FIXME: this will propagate the killer between rounds, which is incorrect. For instance,
	// if a dragon kills a Ghoul, then the Ghoul's deathrattle kills a Kaboom, the killer should
	// now be the ghoul. Then if the Kaboom kills someone, the killer should again change. You could
	// also have multiple killers, which is not taken into account here.
	// The current assumption is that it's a suffienctly fringe case to not matter too much
	processMinionDeath(board1, board2, allCards, cardsData, sharedState, spectator);
	// return [boardWithMaybeDeadMinions, opponentBoard];
};

const handleDeathsForFirstBoard = (
	firstBoard: BoardEntity[],
	otherBoard: BoardEntity[],
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
		if (entity.health <= 0) {
			buildBoardAfterDeathrattleSpawns(
				firstBoard,
				entity,
				index,
				otherBoard,
				allCards,
				cardsData,
				sharedState,
				spectator,
			);
			if (sharedState.debug) {
				console.debug(
					'boards after deathrattle spawns\n',
					stringifySimple(firstBoard) + '\n',
					stringifySimple(otherBoard),
				);
			}
		} else if (firstBoard.length > 0) {
			// const newBoardD = [...firstBoard];
			firstBoard.splice(index, 1, entity);
			// firstBoard = newBoardD;
			// console.log('board after minions fight without death', entity, firstBoard, otherBoard);
		}
	}
	// return [firstBoard, otherBoard];
};

export const applyOnAttackBuffs = (
	attacker: BoardEntity,
	attackingBoard: BoardEntity[],
	allCards: AllCardsService,
): void => {
	if (attacker.cardId === CardIds.NonCollectible.Mage.GlyphGuardianBATTLEGROUNDS) {
		attacker.attack *= 2;
	}
	if (attacker.cardId === CardIds.NonCollectible.Mage.GlyphGuardianTavernBrawl) {
		attacker.attack *= 3;
	}

	// Ripsnarl Captain
	if (isCorrectTribe(allCards.getCard(attacker.cardId).race, Race.PIRATE)) {
		const ripsnarls = attackingBoard
			.filter(e => e.cardId === CardIds.NonCollectible.Neutral.RipsnarlCaptain)
			.filter(e => e.entityId !== attacker.entityId).length;
		const ripsnarlsTB = attackingBoard
			.filter(entity => entity.cardId === CardIds.NonCollectible.Neutral.RipsnarlCaptainTavernBrawl)
			.filter(e => e.entityId !== attacker.entityId).length;
		const ripsnarlBuff = ripsnarls * 2 + ripsnarlsTB * 4;
		attacker.attack += ripsnarlBuff;
		attacker.health += ripsnarlBuff;
	}

	// Dread Admiral Eliza
	if (isCorrectTribe(allCards.getCard(attacker.cardId).race, Race.PIRATE)) {
		const elizas = attackingBoard.filter(e => e.cardId === CardIds.NonCollectible.Neutral.DreadAdmiralEliza).length;
		const elizasTB = attackingBoard.filter(
			e => e.cardId === CardIds.NonCollectible.Neutral.DreadAdmiralElizaTavernBrawl,
		).length;
		const elizaBuff = elizas * 1 + elizasTB * 2;
		attackingBoard.forEach(entity => {
			entity.attack += 2 * elizaBuff;
			entity.health += elizaBuff;
		});
	}
};

export const applyOnBeingAttackedBuffs = (
	attackedEntity: BoardEntity,
	defendingBoard: BoardEntity[],
	allCards: AllCardsService,
): void => {
	if (attackedEntity.taunt) {
		const champions = defendingBoard.filter(
			entity => entity.cardId === CardIds.NonCollectible.Neutral.ChampionOfYshaarj,
		);
		const goldenChampions = defendingBoard.filter(
			entity => entity.cardId === CardIds.NonCollectible.Neutral.ChampionOfYshaarjTavernBrawl,
		);
		champions.forEach(entity => {
			entity.attack += 1;
			entity.health += 1;
		});
		goldenChampions.forEach(entity => {
			entity.attack += 2;
			entity.health += 2;
		});

		const arms = defendingBoard.filter(entity => entity.cardId === CardIds.NonCollectible.Neutral.ArmOfTheEmpire);
		const goldenArms = defendingBoard.filter(
			entity => entity.cardId === CardIds.NonCollectible.Neutral.ArmOfTheEmpireTavernBrawl,
		);
		attackedEntity.attack += 3 * arms.length + 6 * goldenArms.length;
	}
	if (attackedEntity.cardId === CardIds.NonCollectible.Neutral.TormentedRitualist) {
		const neighbours = getNeighbours(defendingBoard, attackedEntity);
		neighbours.forEach(entity => {
			entity.attack += 1;
			entity.health += 1;
		});
	}
	if (attackedEntity.cardId === CardIds.NonCollectible.Neutral.TormentedRitualistTavernBrawl) {
		const neighbours = getNeighbours(defendingBoard, attackedEntity);
		neighbours.forEach(entity => {
			entity.attack += 2;
			entity.health += 2;
		});
	}
};

const makeMinionsDie = (
	board: BoardEntity[],
	// updatedDefenders: readonly BoardEntity[],
): [number[], BoardEntity[]] => {
	const deadMinionIndexes: number[] = [];
	const deadEntities: BoardEntity[] = [];
	// const boardCopy = [...board];
	// console.log('board before making minion die', board.length, board);
	for (let i = 0; i < board.length; i++) {
		const index = board.map(entity => entity.entityId).indexOf(board[i].entityId);
		if (board[i].health <= 0) {
			deadMinionIndexes.push(i);
			deadEntities.push(board[i]);
			board.splice(index, 1);
			// console.log('entity dead', deadEntities, board.length);
		}
	}
	return [deadMinionIndexes, deadEntities];

	// const indexes = [];
	// const boardCopy = [...board];
	// for (const defender of updatedDefenders) {
	// 	const index = boardCopy.map(entity => entity.entityId).indexOf(defender.entityId);
	// 	indexes.push(index);
	// 	if (defender.health <= 0) {
	// 		boardCopy.splice(index, 1);
	// 	}
	// }
	// return [boardCopy, indexes];
};

const handleKillEffects = (
	boardWithKilledMinion: BoardEntity[],
	killerBoard: BoardEntity[],
	deadEntity: BoardEntity,
	allCards: AllCardsService,
): void => {
	if (
		deadEntity.lastAffectedByEntity &&
		deadEntity.lastAffectedByEntity.cardId &&
		isCorrectTribe(allCards.getCard(deadEntity.lastAffectedByEntity.cardId).race, Race.DRAGON)
	) {
		for (const entity of killerBoard) {
			if (entity.cardId === CardIds.NonCollectible.Neutral.WaxriderTogwaggle) {
				entity.attack = entity.attack + 2;
				entity.health = entity.health + 2;
			} else if (entity.cardId === CardIds.NonCollectible.Neutral.WaxriderTogwaggleTavernBrawl) {
				entity.attack = entity.attack + 4;
				entity.health = entity.health + 4;
			}
		}
	}
};

const buildBoardAfterDeathrattleSpawns = (
	boardWithKilledMinion: BoardEntity[],
	deadEntity: BoardEntity,
	deadMinionIndex: number,
	opponentBoard: BoardEntity[],
	allCards: AllCardsService,
	cardsData: CardsData,
	sharedState: SharedState,
	spectator: Spectator,
): void => {
	// TODO: don't apply this for FishOfNZoth
	if (deadMinionIndex >= 0) {
		handleKillEffects(boardWithKilledMinion, opponentBoard, deadEntity, allCards);
	}

	if (sharedState.debug) {
		console.debug(
			'wilml handle deathrattle effect\n',
			stringifySimple(boardWithKilledMinion) + '\n',
			stringifySimpleCard(deadEntity) + '\n',
			stringifySimple(opponentBoard),
		);
	}

	handleDeathrattleEffects(
		boardWithKilledMinion,
		deadEntity,
		deadMinionIndex,
		opponentBoard,
		allCards,
		cardsData,
		sharedState,
		spectator,
	);
	const [entitiesFromNativeDeathrattle, entitiesFromNativeDeathrattleOnOpponentBoard]: [
		readonly BoardEntity[],
		readonly BoardEntity[],
	] = spawnEntitiesFromDeathrattle(
		deadEntity,
		boardWithKilledMinion,
		opponentBoard,
		allCards,
		cardsData,
		sharedState,
	);

	const entitiesFromReborn: readonly BoardEntity[] =
		deadEntity.reborn && deadMinionIndex >= 0
			? spawnEntities(
					deadEntity.cardId,
					1,
					boardWithKilledMinion,
					allCards,
					sharedState,
					deadEntity.friendly,
					false,
			  ).map(entity => ({
					...entity,
					health: 1,
					reborn: false,
			  }))
			: [];
	const entitiesFromEnchantments: readonly BoardEntity[] = spawnEntitiesFromEnchantments(
		deadEntity,
		boardWithKilledMinion,
		allCards,
		cardsData,
		sharedState,
	);

	const candidateEntities: readonly BoardEntity[] = [
		...entitiesFromNativeDeathrattle,
		...entitiesFromReborn,
		...entitiesFromEnchantments,
	];
	// TODO: if "attack immediately" entities spawn, they should attack here
	// It requires a pretty strong refactor of the code though, so for
	// now the simulator has this known flaw
	// const attackImmediatelyEntities = candidateEntities.filter(entity => entity.attackImmediately);
	// for (const attackImmediatelyEntity of attackImmediatelyEntities) {
	// 	const defendingEntity: BoardEntity = getDefendingEntity(opponentBoard, attackImmediatelyEntity);
	// 	spectator.registerAttack(attackImmediatelyEntity, defendingEntity, boardWithKilledMinion, opponentBoard);
	// 	performAttack(
	// 		attackImmediatelyEntity,
	// 		defendingEntity,
	// 		boardWithKilledMinion,
	// 		opponentBoard,
	// 		allCards,
	// 		cardsData,
	// 		sharedState,
	// 		spectator,
	// 	);
	// 	// FIXME: I don't know the behavior with Windfury. Should the attack be done right away, before
	// 	// the windfury triggers again? The current behavior attacks after the windfury is over
	// 	if (defendingEntity.health > 0 && defendingEntity.cardId === CardIds.NonCollectible.Neutral.YoHoOgre) {
	// 		// console.log('yoho ogre attacking immediately', defendingEntity);
	// 		defendingEntity.attackImmediately = true;
	// 	}
	// }
	const aliveEntites = candidateEntities.filter(entity => entity.health > 0);

	const roomToSpawn: number = 7 - boardWithKilledMinion.length;
	const spawnedEntities: readonly BoardEntity[] = aliveEntites.slice(0, roomToSpawn);
	// Minion has already been removed from the board in the previous step
	boardWithKilledMinion.splice(deadMinionIndex, 0, ...spawnedEntities);
	handleSpawnEffects(boardWithKilledMinion, spawnedEntities, allCards);
	spectator.registerMinionsSpawn(boardWithKilledMinion, spawnedEntities);

	const candidateEntitiesForOpponentBoard: readonly BoardEntity[] = [...entitiesFromNativeDeathrattleOnOpponentBoard];
	const roomToSpawnForOpponentBoard: number = 7 - opponentBoard.length;
	const spawnedEntitiesForOpponentBoard: readonly BoardEntity[] = candidateEntitiesForOpponentBoard.slice(
		0,
		roomToSpawnForOpponentBoard,
	);
	opponentBoard.push(...spawnedEntitiesForOpponentBoard);
	// If needed might also have to handle more effects here, like we do for the main board
	spectator.registerMinionsSpawn(opponentBoard, spawnedEntitiesForOpponentBoard);
	

	
	// eslint-disable-next-line prettier/prettier
	if (deadEntity.rememberedDeathrattles?.length ) {
		for (const deathrattle of deadEntity.rememberedDeathrattles) {
			const entityToProcess: BoardEntity = {
				...deadEntity,
				rememberedDeathrattles: undefined,
				cardId: deathrattle,
				enchantments: [{
					cardId: deathrattle,
					originEntityId: deadEntity.entityId
				}]
			}
			buildBoardAfterDeathrattleSpawns(boardWithKilledMinion, entityToProcess, deadMinionIndex, opponentBoard, allCards, cardsData, sharedState, spectator);
		}
	}
};
