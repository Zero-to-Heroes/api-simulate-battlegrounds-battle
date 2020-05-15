/* eslint-disable @typescript-eslint/no-use-before-define */
import { AllCardsService, CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../board-entity';
import { CardsData } from '../cards/cards-data';
import { PlayerEntity } from '../player-entity';
import { applyAuras, removeAuras } from './auras';
import { handleDeathrattleEffects } from './deathrattle-effects';
import { spawnEntities, spawnEntitiesFromDeathrattle, spawnEntitiesFromEnchantments } from './deathrattle-spawns';
import { applyGlobalModifiers, removeGlobalModifiers } from './global-modifiers';
import { SharedState } from './shared-state';
import { handleSpawnEffects } from './spawn-effect';
import { getHeroPowerForHero } from './start-of-combat';

export const simulateAttack = (
	attackingBoard: BoardEntity[],
	attackingHero: PlayerEntity,
	defendingBoard: BoardEntity[],
	defendingHero: PlayerEntity,
	lastAttackerEntityId: number,
	allCards: AllCardsService,
	spawns: CardsData,
	sharedState: SharedState,
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
	// console.log('opponent board before auras', stringifySimple(defendingBoard));
	applyAuras(attackingBoard, numberOfDeathwingPresents, spawns, allCards);
	applyAuras(defendingBoard, numberOfDeathwingPresents, spawns, allCards);
	// console.log('opponent board after auras', stringifySimple(defendingBoard));

	const attackingEntity =
		attackingEntityIndex != null
			? attackingBoard[attackingEntityIndex]
			: getAttackingEntity(attackingBoard, lastAttackerEntityId);
	// console.log('attackingEntity', stringifySimpleCard(attackingEntity));
	if (attackingEntity) {
		const numberOfAttacks = attackingEntity.megaWindfury ? 4 : attackingEntity.windfury ? 2 : 1;
		for (let i = 0; i < numberOfAttacks; i++) {
			// We refresh the entity in case of windfury
			if (attackingBoard.length === 0 || defendingBoard.length === 0) {
				return;
				// return [attackingBoard, defendingBoard];
			}
			// console.log('before', attackingEntity);
			// attackingEntity = attackingBoard.find(entity => entity.entityId === attackingEntity.entityId);
			// console.log('after', attackingEntity);
			// Check that didn't die
			if (attackingBoard.find(entity => entity.entityId === attackingEntity.entityId)) {
				// console.log('attackingEntity', attackingEntity, attackingBoard);
				applyOnAttackBuffs(attackingEntity);
				const defendingEntity: BoardEntity = getDefendingEntity(defendingBoard, attackingEntity);
				// console.log(
				// 	'battling between',
				// 	stringifySimpleCard(attackingEntity),
				// 	stringifySimpleCard(defendingEntity),
				// );
				performAttack(
					attackingEntity,
					defendingEntity,
					attackingBoard,
					defendingBoard,
					allCards,
					spawns,
					sharedState,
				);
			}
		}
		// console.log('attacking board', attackingBoard, 'defending board', defendingBoard);
	}
	// return [[], []];
	// console.log('before removing auras', attackingBoard, defendingBoard);
	removeAuras(attackingBoard, spawns);
	removeAuras(defendingBoard, spawns);
	removeGlobalModifiers(attackingBoard, defendingBoard);
	// console.log('after removing auras', attackingBoard, defendingBoard);
	// return [attackingBoard, defendingBoard];
};

const performAttack = (
	attackingEntity: BoardEntity,
	defendingEntity: BoardEntity,
	attackingBoard: BoardEntity[],
	defendingBoard: BoardEntity[],
	allCards: AllCardsService,
	spawns: CardsData,
	sharedState: SharedState,
): void => {
	// let newAttackingEntity, newDefendingEntity;
	bumpEntities(attackingEntity, defendingEntity, attackingBoard, allCards, spawns, sharedState);
	bumpEntities(defendingEntity, attackingEntity, defendingBoard, allCards, spawns, sharedState);
	// console.log('after damage', stringifySimpleCard(attackingEntity), stringifySimpleCard(defendingEntity));
	const updatedDefenders = [defendingEntity];
	// Cleave
	if (attackingEntity.cleave) {
		const neighbours: readonly BoardEntity[] = getNeighbours(defendingBoard, defendingEntity);
		for (const neighbour of neighbours) {
			bumpEntities(neighbour, attackingEntity, defendingBoard, allCards, spawns, sharedState);
			updatedDefenders.push(neighbour);
		}
	}

	// Approximate the play order
	updatedDefenders.sort((a, b) => a.entityId - b.entityId);
	processMinionDeath(attackingBoard, defendingBoard, allCards, spawns, sharedState);
};

const getAttackingEntity = (attackingBoard: BoardEntity[], lastAttackerEntityId: number): BoardEntity => {
	const validAttackers = attackingBoard.filter(entity => entity.attack > 0);
	if (validAttackers.length === 0) {
		return null;
	}
	let attackingEntity = validAttackers[0];
	let minNumberOfAttacks: number = attackingEntity.attacksPerformed || 0;
	for (const entity of validAttackers) {
		if ((entity.attacksPerformed || 0) < minNumberOfAttacks) {
			attackingEntity = entity;
			minNumberOfAttacks = entity.attacksPerformed;
		}
	}

	attackingEntity.attacksPerformed = (attackingEntity.attacksPerformed || 0) + 1;
	attackingEntity.attacking = true;
	return attackingEntity;
};

const getNeighbours = (board: BoardEntity[], entity: BoardEntity): readonly BoardEntity[] => {
	const index = board.map(e => e.entityId).indexOf(entity.entityId);
	const neighbours = [];
	if (index - 1 >= 0) {
		neighbours.push(board[index - 1]);
	}
	neighbours.push(entity);
	if (index + 1 < board.length) {
		neighbours.push(board[index + 1]);
	}
	return neighbours;
};

export const dealDamageToRandomEnemy = (
	defendingBoard: BoardEntity[],
	damageSource: BoardEntity,
	damage: number,
	boardWithAttackOrigin: BoardEntity[],
	allCards: AllCardsService,
	cardsData: CardsData,
	sharedState: SharedState,
): void => {
	if (defendingBoard.length === 0) {
		return;
		// return [defendingBoard, boardWithAttackOrigin];
	}
	const defendingEntity: BoardEntity = getDefendingEntity(defendingBoard, damageSource, true);
	// console.log('board before damage', damage, stringifySimple(defendingBoard));
	// console.log('dealing damage to', damage, stringifySimpleCard(defendingEntity));
	dealDamageToEnemy(
		defendingEntity,
		defendingBoard,
		damageSource,
		damage,
		boardWithAttackOrigin,
		allCards,
		cardsData,
		sharedState,
	);
	// console.log('board after damage', damage, stringifySimple(defendingBoard));
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
): void => {
	// console.log('defendingEntity', defendingEntity, defendingBoard);
	const fakeAttacker = {
		...(damageSource || {}),
		attack: damage,
		attacking: true,
	} as BoardEntity;
	bumpEntities(defendingEntity, fakeAttacker, defendingBoard, allCards, cardsData, sharedState);
	const defendingEntityIndex = defendingBoard.map(entity => entity.entityId).indexOf(defendingEntity.entityId);
	defendingBoard[defendingEntityIndex] = defendingEntity;
	// console.log('newDefendingEntity', newDefendingEntity);
	processMinionDeath(defendingBoard, boardWithAttackOrigin, allCards, cardsData, sharedState);
	// console.log('defendingBoard', defendingBoard);
	// return [defendingBoard, boardWithAttackOrigin];
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
		// console.log('minAttack', minAttack, defendingBoard.filter(entity => entity.attack === minAttack));
		possibleDefenders = defendingBoard.filter(entity => entity.attack === minAttack);
	} else if (!ignoreTaunts) {
		const taunts = defendingBoard.filter(entity => entity.taunt);
		// console.log('taunts', taunts);
		possibleDefenders = taunts.length > 0 ? taunts : defendingBoard;
	} else {
		possibleDefenders = defendingBoard;
	}
	return possibleDefenders[Math.floor(Math.random() * possibleDefenders.length)];
};

export const bumpEntities = (
	entity: BoardEntity,
	bumpInto: BoardEntity,
	entityBoard: BoardEntity[],
	allCards: AllCardsService,
	cardsData: CardsData,
	sharedState: SharedState,
): void => {
	// No attack has no impact
	if (bumpInto.attack === 0) {
		return;
		// return entity;
	}
	if (entity.divineShield) {
		// Handle all the divine shield loss effects here
		// const updatedBoard = [...entityBoard];
		// console.log('handling divine shield loss effect', entityBoard, entity);
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
			// Only "other" friendly minions
			else if (
				entityBoard[i].cardId === CardIds.NonCollectible.Paladin.HolyMackerel &&
				entityBoard[i].entityId !== entity.entityId
			) {
				entityBoard[i].divineShield = true;
			}
			// So that self-buffs from Bolvar are taken into account
			if (entityBoard[i].entityId === entity.entityId) {
				entity.divineShield = false;
			}
		}
		return;
		// return entity;
	}
	// FIXME: there could be a bug here, if a Cleave attacks several IGB at the same time. The current
	// implementation could spawn minions above the max board size. Fringe case though, so leaving it
	// like this for now
	if (entity.cardId === CardIds.Collectible.Warlock.ImpGangBoss && entityBoard.length < 7) {
		// console.log('board before IGB spawn', entityBoard);
		const index = entityBoard.map(e => e.entityId).indexOf(entity.entityId);
		const newEntities = spawnEntities(
			CardIds.NonCollectible.Warlock.ImpGangBoss_ImpToken,
			1,
			entityBoard,
			allCards,
			sharedState,
			true,
		);
		entityBoard.splice(index, 0, ...newEntities);
		// console.log('board after IGB spawn', entityBoard);
	} else if (entity.cardId === CardIds.NonCollectible.Warlock.ImpGangBossTavernBrawl && entityBoard.length < 7) {
		const index = entityBoard.map(e => e.entityId).indexOf(entity.entityId);
		const newEntities = spawnEntities(
			CardIds.NonCollectible.Warlock.ImpGangBoss_ImpTokenTavernBrawl,
			1,
			entityBoard,
			allCards,
			sharedState,
			true,
		);
		entityBoard.splice(index, 0, ...newEntities);
	} else if (entity.cardId === CardIds.NonCollectible.Warlock.ImpMama && entityBoard.length < 7) {
		const newEntities = spawnEntities(
			cardsData.impMamaSpawns[Math.floor(Math.random() * cardsData.impMamaSpawns.length)],
			1,
			entityBoard,
			allCards,
			sharedState,
			true,
		).map(entity => ({ ...entity, taunt: true }));
		const index = entityBoard.map(e => e.entityId).indexOf(entity.entityId);
		entityBoard.splice(index, 0, ...newEntities);
	} else if (entity.cardId === CardIds.NonCollectible.Warlock.ImpMamaTavernBrawl && entityBoard.length < 7) {
		const newEntities = spawnEntities(
			cardsData.impMamaSpawns[Math.floor(Math.random() * cardsData.impMamaSpawns.length)],
			2,
			entityBoard,
			allCards,
			sharedState,
			true,
		).map(entity => ({ ...entity, taunt: true }));
		const index = entityBoard.map(e => e.entityId).indexOf(entity.entityId);
		entityBoard.splice(index, 0, ...newEntities);
	} else if (entity.cardId === CardIds.Collectible.Warrior.SecurityRover && entityBoard.length < 7) {
		const index = entityBoard.map(e => e.entityId).indexOf(entity.entityId);
		const newEntities = spawnEntities(
			CardIds.NonCollectible.Warrior.SecurityRover_GuardBotToken,
			1,
			entityBoard,
			allCards,
			sharedState,
			true,
		);
		entityBoard.splice(index, 0, ...newEntities);
		// console.log('board after spawning security rover token', entityBoard);
	} else if (entity.cardId === CardIds.NonCollectible.Warrior.SecurityRoverTavernBrawl && entityBoard.length < 7) {
		const index = entityBoard.map(e => e.entityId).indexOf(entity.entityId);
		const newEntities = spawnEntities(
			CardIds.NonCollectible.Warrior.SecurityRover_GuardBotTokenTavernBrawl,
			1,
			entityBoard,
			allCards,
			sharedState,
			true,
		);
		entityBoard.splice(index, 0, ...newEntities);
	}
	entity.health = entity.health - bumpInto.attack;
	// Do it last, so that other effects are still processed
	if (bumpInto.poisonous) {
		entity.health = 0;
		// return entity;
	}
	// entity.lastAffectedByEntity = { ...bumpInto };
	entity.lastAffectedByEntity = bumpInto;
	return;
	// return entity;
};

export const processMinionDeath = (
	board1: BoardEntity[],
	board2: BoardEntity[],
	allCards: AllCardsService,
	cardsData: CardsData,
	sharedState: SharedState,
): void => {
	// console.log('boards before minions die', board1, board2);
	const [deadMinionIndexes1, deadEntities1] = makeMinionsDie(board1);
	const [deadMinionIndexes2, deadEntities2] = makeMinionsDie(board2);
	// console.log('boards after minions die', board1.length, board2.length);
	// No death to process, we can return
	if (deadEntities1.length === 0 && deadEntities2.length === 0) {
		return;
		// return [board1, board2];
	}
	// board1 = board1WithRemovedMinions;
	// board2 = board2WithRemovedMinions;

	// Now proceed to trigger all deathrattle effects on baord1
	// I don't know how accurate this is. I assume that normally the deathrattles could trigger
	// alternating between board1 and board2 based on the play order
	// For now I'll trigger everything from board1 first, then everything from board 2
	// It might not be fully accurate, but is probably a good first approximation
	// console.log('boards after minions died', board1, board2);
	handleDeathsForFirstBoard(board1, board2, deadMinionIndexes1, deadEntities1, allCards, cardsData, sharedState);
	// console.log('boards after minions died and first board processed', board1, board2);
	// Now handle the other board's deathrattles
	handleDeathsForFirstBoard(board2, board1, deadMinionIndexes2, deadEntities2, allCards, cardsData, sharedState);
	// console.log('board from processMinionDeath', board1, board2);
	// Make sure we only return when there are no more deaths to process
	// FIXME: this will propagate the killer between rounds, which is incorrect. For instance,
	// if a dragon kills a Ghoul, then the Ghoul's deathrattle kills a Kaboom, the killer should
	// now be the ghoul. Then if the Kaboom kills someone, the killer should again change. You could
	// also have multiple killers, which is not taken into account here.
	// The current assumption is that it's a suffienctly fringe case to not matter too much
	processMinionDeath(board1, board2, allCards, cardsData, sharedState);
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
): void => {
	for (let i = 0; i < deadMinionIndexes.length; i++) {
		const entity = deadEntities[i];
		const index = deadMinionIndexes[i];
		if (entity.health <= 0) {
			buildBoardAfterDeathrattleSpawns(firstBoard, entity, index, otherBoard, allCards, cardsData, sharedState);
			// console.log('board after dr spawns', entity, firstBoard, otherBoard);
		} else if (firstBoard.length > 0) {
			// const newBoardD = [...firstBoard];
			firstBoard.splice(index, 1, entity);
			// firstBoard = newBoardD;
			// console.log('board after minions fight without death', entity, firstBoard, otherBoard);
		}
	}
	// return [firstBoard, otherBoard];
};

export const applyOnAttackBuffs = (entity: BoardEntity): void => {
	if (entity.cardId === CardIds.NonCollectible.Mage.GlyphGuardianBATTLEGROUNDS) {
		entity.attack *= 2;
		// return {
		// 	...entity,
		// 	attack: 2 * entity.attack,
		// };
	}
	if (entity.cardId === CardIds.NonCollectible.Mage.GlyphGuardianTavernBrawl) {
		entity.attack *= 3;
		// return {
		// 	...entity,
		// 	attack: 3 * entity.attack,
		// };
	}
	// return entity;
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
	// console.log('handling kill effects', boardWithKilledMinion, killerBoard);
	if (
		!deadEntity.lastAffectedByEntity ||
		allCards.getCard(deadEntity.lastAffectedByEntity.cardId).race !== 'DRAGON'
	) {
		return;
		// return [boardWithKilledMinion, killerBoard];
	}
	for (const entity of killerBoard) {
		if (entity.cardId === CardIds.NonCollectible.Neutral.WaxriderTogwaggle) {
			entity.attack = entity.attack + 2;
			entity.health = entity.health + 2;
		} else if (entity.cardId === CardIds.NonCollectible.Neutral.WaxriderTogwaggleTavernBrawl) {
			entity.attack = entity.attack + 4;
			entity.health = entity.health + 4;
		}
	}
};

const buildBoardAfterDeathrattleSpawns = (
	boardWithKilledMinion: BoardEntity[],
	deadEntity: BoardEntity,
	deadMinionIndex: number,
	opponentBoard: BoardEntity[],
	// killer: BoardEntity,
	allCards: AllCardsService,
	cardsData: CardsData,
	sharedState: SharedState,
): void => {
	handleKillEffects(boardWithKilledMinion, opponentBoard, deadEntity, allCards);
	handleDeathrattleEffects(
		boardWithKilledMinion,
		deadEntity,
		deadMinionIndex,
		opponentBoard,
		allCards,
		cardsData,
		sharedState,
	);
	const entitiesFromNativeDeathrattle: readonly BoardEntity[] = spawnEntitiesFromDeathrattle(
		deadEntity,
		boardWithKilledMinion,
		allCards,
		cardsData,
		sharedState,
	);
	// console.log('entitiesFromNativeDeathrattle', entitiesFromNativeDeathrattle);
	const entitiesFromReborn: readonly BoardEntity[] = deadEntity.reborn
		? spawnEntities(deadEntity.cardId, 1, boardWithKilledMinion, allCards, sharedState).map(entity => ({
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
	const roomToSpawn: number = 7 - boardWithKilledMinion.length;
	// if (candidateEntities.length > 0) {
	// 	console.log('candidateEntities', roomToSpawn, candidateEntities.map(entity => entity.cardId));
	// }
	const spawnedEntities: readonly BoardEntity[] = candidateEntities.slice(0, roomToSpawn);
	// console.log('spawnedEntities', spawnedEntities);
	// const deadMinionIndex: number = board.map(entity => entity.entityId).indexOf(deadEntity.entityId);
	// console.log('deadMinionIndex', deadMinionIndex, board);
	// const newBoard = [...boardWithKilledMinion];
	// Minion has already been removed from the board in the previous step
	boardWithKilledMinion.splice(deadMinionIndex, 0, ...spawnedEntities);
	handleSpawnEffects(boardWithKilledMinion, spawnedEntities, allCards);
	// console.log('newBoard', boardAfterMinionSpawnEffects, opponentBoard);
	// return [boardAfterMinionSpawnEffects, opponentBoard];
};
