/* eslint-disable @typescript-eslint/no-use-before-define */
import { AllCardsService, CardIds, Race } from '@firestone-hs/reference-data';
import { BgsGameState } from '../bgs-battle-info';
import { BgsPlayerEntity } from '../bgs-player-entity';
import { BoardEntity } from '../board-entity';
import { CardsData, START_OF_COMBAT_CARD_IDS } from '../cards/cards-data';
import { pickMultipleRandomDifferent, pickRandom } from '../services/utils';
import { afterStatsUpdate, isCorrectTribe, modifyAttack, modifyHealth } from '../utils';
import { dealDamageToEnemy, dealDamageToRandomEnemy, getNeighbours, processMinionDeath, simulateAttack } from './attack';
import { applyAuras, removeAuras } from './auras';
import {
	applyEarthInvocationEnchantment,
	applyFireInvocationEnchantment,
	applyLightningInvocationEnchantment,
	applyWaterInvocationEnchantment,
} from './deathrattle-effects';
import { SharedState } from './shared-state';
import { Spectator } from './spectator/spectator';

export const handleStartOfCombat = (
	playerEntity: BgsPlayerEntity,
	playerBoard: BoardEntity[],
	opponentEntity: BgsPlayerEntity,
	opponentBoard: BoardEntity[],
	currentAttacker: number,
	allCards: AllCardsService,
	spawns: CardsData,
	sharedState: SharedState,
	gameState: BgsGameState,
	spectator: Spectator,
): number => {
	// https://twitter.com/DCalkosz/status/1488361384320528388?s=20&t=1ECxRZFdjqwEa2fRsXk32Q
	// There’s a certain order for Start of Combat hero powers, rather than “coin flips” where
	// an unlucky trigger order could mess up some positioning you had planned for your own hero
	// power. “Precombat” (Al’Akir, Y’Shaarj), then Illidan, then others.
	currentAttacker = handlePreCombatHeroPowers(
		playerEntity,
		playerBoard,
		opponentEntity,
		opponentBoard,
		currentAttacker,
		allCards,
		spawns,
		sharedState,
		gameState,
		spectator,
	);
	currentAttacker = handleIllidanHeroPowers(
		playerEntity,
		playerBoard,
		opponentEntity,
		opponentBoard,
		currentAttacker,
		allCards,
		spawns,
		sharedState,
		gameState,
		spectator,
	);
	currentAttacker = handleStartOfCombatHeroPowers(
		playerEntity,
		playerBoard,
		opponentEntity,
		opponentBoard,
		currentAttacker,
		allCards,
		spawns,
		sharedState,
		gameState,
		spectator,
	);
	currentAttacker = handleStartOfCombatMinions(
		playerEntity,
		playerBoard,
		opponentEntity,
		opponentBoard,
		currentAttacker,
		allCards,
		spawns,
		sharedState,
		gameState,
		spectator,
	);
	return currentAttacker;
};

const handlePreCombatHeroPowers = (
	playerEntity: BgsPlayerEntity,
	playerBoard: BoardEntity[],
	opponentEntity: BgsPlayerEntity,
	opponentBoard: BoardEntity[],
	currentAttacker: number,
	allCards: AllCardsService,
	spawns: CardsData,
	sharedState: SharedState,
	gameState: BgsGameState,
	spectator: Spectator,
): number => {
	// Some are part of the incoming board: Y'Shaarj, Lich King
	// Since the order is not important here, we just always do the player first
	const playerHeroPowerId = playerEntity.heroPowerId || getHeroPowerForHero(playerEntity.cardId);
	if (playerHeroPowerId === CardIds.SwattingInsectsBattlegrounds && playerBoard.length > 0) {
		// Should be sent by the app, but it is an idempotent operation, so we can just reapply it here
		handleAlakirForPlayer(playerBoard, playerEntity, opponentBoard, opponentEntity, allCards, spawns, sharedState, spectator);
	}

	const opponentHeroPowerId = opponentEntity.heroPowerId || getHeroPowerForHero(opponentEntity.cardId);
	if (opponentHeroPowerId === CardIds.SwattingInsectsBattlegrounds && opponentBoard.length > 0) {
		handleAlakirForPlayer(opponentBoard, opponentEntity, playerBoard, playerEntity, allCards, spawns, sharedState, spectator);
	}

	return currentAttacker;
};

export const handleIllidanHeroPowers = (
	playerEntity: BgsPlayerEntity,
	playerBoard: BoardEntity[],
	opponentEntity: BgsPlayerEntity,
	opponentBoard: BoardEntity[],
	currentAttacker: number,
	allCards: AllCardsService,
	spawns: CardsData,
	sharedState: SharedState,
	gameState: BgsGameState,
	spectator: Spectator,
): number => {
	// Apparently it's a toin coss about whether to handle Illidan first or Al'Akir first
	// Auras are only relevant for Illidan, and already applied there
	if (Math.random() < 0.5) {
		currentAttacker = handlePlayerIllidanHeroPowers(
			playerEntity,
			playerBoard,
			opponentEntity,
			opponentBoard,
			currentAttacker,
			true,
			allCards,
			spawns,
			sharedState,
			spectator,
		);
		currentAttacker = handlePlayerIllidanHeroPowers(
			opponentEntity,
			opponentBoard,
			playerEntity,
			playerBoard,
			currentAttacker,
			false,
			allCards,
			spawns,
			sharedState,
			spectator,
		);
	} else {
		currentAttacker = handlePlayerIllidanHeroPowers(
			opponentEntity,
			opponentBoard,
			playerEntity,
			playerBoard,
			currentAttacker,
			false,
			allCards,
			spawns,
			sharedState,
			spectator,
		);
		currentAttacker = handlePlayerIllidanHeroPowers(
			playerEntity,
			playerBoard,
			opponentEntity,
			opponentBoard,
			currentAttacker,
			true,
			allCards,
			spawns,
			sharedState,
			spectator,
		);
	}
	return currentAttacker;
};

const handleStartOfCombatMinions = (
	playerEntity: BgsPlayerEntity,
	playerBoard: BoardEntity[],
	opponentEntity: BgsPlayerEntity,
	opponentBoard: BoardEntity[],
	currentAttacker: number,
	allCards: AllCardsService,
	spawns: CardsData,
	sharedState: SharedState,
	gameState: BgsGameState,
	spectator: Spectator,
): number => {
	let attackerForStart = Math.round(Math.random());
	const playerAttackers = playerBoard.filter((entity) => START_OF_COMBAT_CARD_IDS.indexOf(entity.cardId as CardIds) !== -1);
	const opponentAttackers = opponentBoard.filter((entity) => START_OF_COMBAT_CARD_IDS.indexOf(entity.cardId as CardIds) !== -1);
	while (playerAttackers.length > 0 || opponentAttackers.length > 0) {
		if (attackerForStart === 0 && playerAttackers.length > 0) {
			const attacker = playerAttackers.splice(0, 1)[0];
			performStartOfCombatMinionsForPlayer(
				attacker,
				playerBoard,
				playerEntity,
				opponentBoard,
				opponentEntity,
				allCards,
				spawns,
				sharedState,
				gameState,
				spectator,
			);
		} else if (attackerForStart === 1 && opponentAttackers.length > 0) {
			const attacker = opponentAttackers.splice(0, 1)[0];
			performStartOfCombatMinionsForPlayer(
				attacker,
				opponentBoard,
				opponentEntity,
				playerBoard,
				playerEntity,
				allCards,
				spawns,
				sharedState,
				gameState,
				spectator,
			);
		}
		attackerForStart = (attackerForStart + 1) % 2;
	}
	return currentAttacker;
};

export const handleStartOfCombatHeroPowers = (
	playerEntity: BgsPlayerEntity,
	playerBoard: BoardEntity[],
	opponentEntity: BgsPlayerEntity,
	opponentBoard: BoardEntity[],
	currentAttacker: number,
	allCards: AllCardsService,
	cardsData: CardsData,
	sharedState: SharedState,
	gameState: BgsGameState,
	spectator: Spectator,
): number => {
	const attackingHeroPowerId = playerEntity.heroPowerId || getHeroPowerForHero(playerEntity.cardId);
	const defendingHeroPowerId = opponentEntity.heroPowerId || getHeroPowerForHero(opponentEntity.cardId);
	const numberOfDeathwingPresents =
		(attackingHeroPowerId === CardIds.AllWillBurnBattlegrounds ? 1 : 0) +
		(defendingHeroPowerId === CardIds.AllWillBurnBattlegrounds ? 1 : 0);
	applyAuras(playerBoard, numberOfDeathwingPresents, cardsData, allCards);
	applyAuras(opponentBoard, numberOfDeathwingPresents, cardsData, allCards);

	// Apparently it's a toin coss about whether to handle Illidan first or Al'Akir first
	// Auras are only relevant for Illidan, and already applied there
	if (Math.random() < 0.5) {
		currentAttacker = handlePlayerStartOfCombatHeroPowers(
			playerEntity,
			playerBoard,
			opponentEntity,
			opponentBoard,
			currentAttacker,
			true,
			allCards,
			cardsData,
			sharedState,
			spectator,
		);
		currentAttacker = handlePlayerStartOfCombatHeroPowers(
			opponentEntity,
			opponentBoard,
			playerEntity,
			playerBoard,
			currentAttacker,
			false,
			allCards,
			cardsData,
			sharedState,
			spectator,
		);
	} else {
		currentAttacker = handlePlayerStartOfCombatHeroPowers(
			opponentEntity,
			opponentBoard,
			playerEntity,
			playerBoard,
			currentAttacker,
			false,
			allCards,
			cardsData,
			sharedState,
			spectator,
		);
		currentAttacker = handlePlayerStartOfCombatHeroPowers(
			playerEntity,
			playerBoard,
			opponentEntity,
			opponentBoard,
			currentAttacker,
			true,
			allCards,
			cardsData,
			sharedState,
			spectator,
		);
	}
	removeAuras(playerBoard, cardsData);
	removeAuras(opponentBoard, cardsData);
	return currentAttacker;
};

const handlePlayerIllidanHeroPowers = (
	playerEntity: BgsPlayerEntity,
	playerBoard: BoardEntity[],
	opponentEntity: BgsPlayerEntity,
	opponentBoard: BoardEntity[],
	currentAttacker: number,
	friendly: boolean,
	allCards: AllCardsService,
	spawns: CardsData,
	sharedState: SharedState,
	spectator: Spectator,
): number => {
	const playerHeroPowerId = playerEntity.heroPowerId || getHeroPowerForHero(playerEntity.cardId);
	if (playerHeroPowerId === CardIds.WingmenBattlegrounds && playerBoard.length > 0) {
		handleIllidanForPlayer(playerBoard, playerEntity, opponentBoard, opponentEntity, allCards, spawns, sharedState, spectator);
		currentAttacker = (currentAttacker + 1) % 2;
	}
	return currentAttacker;
};

// TODO: not exactly correct, because of "attack immediately", but it's close enough
const handleIllidanForPlayer = (
	playerBoard: BoardEntity[],
	playerEntity: BgsPlayerEntity,
	opponentBoard: BoardEntity[],
	opponentEntity: BgsPlayerEntity,
	allCards: AllCardsService,
	spawns: CardsData,
	sharedState: SharedState,
	spectator: Spectator,
): void => {
	// Otherwise, if the first minion dies on the attack, and the board has only 2 minions, we
	// miss the second one
	const minionsAtStart = playerBoard.length;
	modifyAttack(playerBoard[0], 2, playerBoard, allCards);
	afterStatsUpdate(playerBoard[0], playerBoard, allCards);
	spectator.registerPowerTarget(playerBoard[0], playerBoard[0], playerBoard);
	if (
		playerBoard.map((e) => e.cardId).includes(CardIds.EclipsionIllidariBattlegrounds2) ||
		playerBoard.map((e) => e.cardId).includes(CardIds.EclipsionIllidariBattlegrounds1)
	) {
		playerBoard[0].immuneWhenAttackCharges = 1;
	}
	simulateAttack(playerBoard, playerEntity, opponentBoard, opponentEntity, undefined, allCards, spawns, sharedState, spectator, 0);

	if (minionsAtStart > 1) {
		modifyAttack(playerBoard[playerBoard.length - 1], 2, playerBoard, allCards);
		afterStatsUpdate(playerBoard[playerBoard.length - 1], playerBoard, allCards);
		spectator.registerPowerTarget(playerBoard[playerBoard.length - 1], playerBoard[playerBoard.length - 1], playerBoard);
		if (playerBoard.map((e) => e.cardId).includes(CardIds.EclipsionIllidariBattlegrounds2)) {
			playerBoard[playerBoard.length - 1].immuneWhenAttackCharges = 1;
		}
		simulateAttack(
			playerBoard,
			playerEntity,
			opponentBoard,
			opponentEntity,
			undefined,
			allCards,
			spawns,
			sharedState,
			spectator,
			playerBoard.length - 1,
		);
	}
};

const handleAlakirForPlayer = (
	playerBoard: BoardEntity[],
	playerEntity: BgsPlayerEntity,
	opponentBoard: BoardEntity[],
	opponentEntity: BgsPlayerEntity,
	allCards: AllCardsService,
	spawns: CardsData,
	sharedState: SharedState,
	spectator: Spectator,
): void => {
	const firstEntity = playerBoard[0];
	firstEntity.windfury = true;
	firstEntity.divineShield = true;
	firstEntity.taunt = true;
	spectator.registerPowerTarget(firstEntity, firstEntity, playerBoard);
};

const handleTamsinForPlayer = (
	playerBoard: BoardEntity[],
	playerEntity: BgsPlayerEntity,
	opponentBoard: BoardEntity[],
	opponentEntity: BgsPlayerEntity,
	allCards: AllCardsService,
	spawns: CardsData,
	sharedState: SharedState,
	spectator: Spectator,
): void => {
	const lowestHealth = Math.min(...playerBoard.map((e) => e.health));
	const entitiesWithLowestHealth = playerBoard.filter((e) => e.health === lowestHealth);
	const chosenEntity = pickRandom(entitiesWithLowestHealth);
	const newBoard = playerBoard.filter((e) => e.entityId !== chosenEntity.entityId);
	const buffedEntities = pickMultipleRandomDifferent(newBoard, 4);
	// How to mark the minion as dead
	chosenEntity.definitelyDead = true;
	buffedEntities.forEach((e) => {
		modifyAttack(e, chosenEntity.attack, newBoard, allCards);
		modifyHealth(e, chosenEntity.health, newBoard, allCards);
		afterStatsUpdate(e, newBoard, allCards);
		spectator.registerPowerTarget(chosenEntity, e, newBoard);
	});
};

const handlePlayerStartOfCombatHeroPowers = (
	playerEntity: BgsPlayerEntity,
	playerBoard: BoardEntity[],
	opponentEntity: BgsPlayerEntity,
	opponentBoard: BoardEntity[],
	currentAttacker: number,
	friendly: boolean,
	allCards: AllCardsService,
	cardsData: CardsData,
	sharedState: SharedState,
	spectator: Spectator,
): number => {
	const playerHeroPowerId = playerEntity.heroPowerId || getHeroPowerForHero(playerEntity.cardId);
	if (playerEntity.heroPowerUsed && playerHeroPowerId === CardIds.TamsinRoame_FragrantPhylactery) {
		handleTamsinForPlayer(playerBoard, playerEntity, opponentBoard, opponentEntity, allCards, cardsData, sharedState, spectator);
	} else if (playerEntity.heroPowerUsed && playerHeroPowerId === CardIds.AimLeftToken) {
		const target = opponentBoard[0];
		const damageDone = dealDamageToEnemy(
			target,
			opponentBoard,
			opponentEntity,
			null,
			playerEntity.heroPowerInfo ?? 0,
			playerBoard,
			playerEntity,
			allCards,
			cardsData,
			sharedState,
			spectator,
		);
		processMinionDeath(playerBoard, playerEntity, opponentBoard, opponentEntity, allCards, cardsData, sharedState, spectator);
		playerEntity.deadEyeDamageDone = damageDone;
	} else if (playerEntity.heroPowerUsed && playerHeroPowerId === CardIds.AimRightToken) {
		const target = opponentBoard[opponentBoard.length - 1];
		const damageDone = dealDamageToEnemy(
			target,
			opponentBoard,
			opponentEntity,
			null,
			playerEntity.heroPowerInfo ?? 0,
			playerBoard,
			playerEntity,
			allCards,
			cardsData,
			sharedState,
			spectator,
		);
		processMinionDeath(playerBoard, playerEntity, opponentBoard, opponentEntity, allCards, cardsData, sharedState, spectator);
		playerEntity.deadEyeDamageDone = damageDone;
	} else if (playerEntity.heroPowerUsed && playerHeroPowerId === CardIds.AimLowToken) {
		const smallestHealthMinion = [...opponentBoard].sort((a, b) => a.health - b.health)[0];
		const target = pickRandom(opponentBoard.filter((e) => e.health === smallestHealthMinion.health));
		const damageDone = dealDamageToEnemy(
			target,
			opponentBoard,
			opponentEntity,
			null,
			playerEntity.heroPowerInfo ?? 0,
			playerBoard,
			playerEntity,
			allCards,
			cardsData,
			sharedState,
			spectator,
		);
		processMinionDeath(playerBoard, playerEntity, opponentBoard, opponentEntity, allCards, cardsData, sharedState, spectator);
		playerEntity.deadEyeDamageDone = damageDone;
	} else if (playerEntity.heroPowerUsed && playerHeroPowerId === CardIds.AimHighToken) {
		const highestHealthMinion = [...opponentBoard].sort((a, b) => b.health - a.health)[0];
		const target = pickRandom(opponentBoard.filter((e) => e.health === highestHealthMinion.health));
		const damageDone = dealDamageToEnemy(
			target,
			opponentBoard,
			opponentEntity,
			null,
			playerEntity.heroPowerInfo ?? 0,
			playerBoard,
			playerEntity,
			allCards,
			cardsData,
			sharedState,
			spectator,
		);
		processMinionDeath(playerBoard, playerEntity, opponentBoard, opponentEntity, allCards, cardsData, sharedState, spectator);
		playerEntity.deadEyeDamageDone = damageDone;
	} else if (playerEntity.heroPowerUsed && playerHeroPowerId === CardIds.EarthInvocationToken) {
		applyEarthInvocationEnchantment(playerBoard, null, allCards, spectator);
	} else if (playerEntity.heroPowerUsed && playerHeroPowerId === CardIds.WaterInvocationToken) {
		applyWaterInvocationEnchantment(playerBoard, null, allCards, spectator);
	} else if (playerEntity.heroPowerUsed && playerHeroPowerId === CardIds.FireInvocationToken) {
		applyFireInvocationEnchantment(playerBoard, null, allCards, spectator);
	} else if (playerEntity.heroPowerUsed && playerHeroPowerId === CardIds.LightningInvocationToken) {
		applyLightningInvocationEnchantment(
			playerBoard,
			playerEntity,
			null,
			opponentBoard,
			opponentEntity,
			allCards,
			cardsData,
			sharedState,
			spectator,
		);
		processMinionDeath(playerBoard, playerEntity, opponentBoard, opponentEntity, allCards, cardsData, sharedState, spectator);
	}
	return currentAttacker;
};

export const getHeroPowerForHero = (heroCardId: string): string => {
	switch (heroCardId) {
		case CardIds.IllidanStormrageBattlegrounds:
			return CardIds.WingmenBattlegrounds;
		case CardIds.TheLichKingBattlegrounds:
			return CardIds.RebornRitesBattlegrounds;
		case CardIds.ProfessorPutricideBattlegrounds:
			return CardIds.RagePotionBattlegrounds;
		case CardIds.DeathwingBattlegrounds:
			return CardIds.AllWillBurnBattlegrounds;
	}
	return null;
};

export const performStartOfCombatMinionsForPlayer = (
	attacker: BoardEntity,
	attackingBoard: BoardEntity[],
	attackingBoardHero: BgsPlayerEntity,
	defendingBoard: BoardEntity[],
	defendingBoardHero: BgsPlayerEntity,
	allCards: AllCardsService,
	cardsData: CardsData,
	sharedState: SharedState,
	gameState: BgsGameState,
	spectator: Spectator,
): void => {
	const attackingHeroPowerId = attackingBoardHero.heroPowerId || getHeroPowerForHero(attackingBoardHero.cardId);
	const defendingHeroPowerId = defendingBoardHero.heroPowerId || getHeroPowerForHero(defendingBoardHero.cardId);
	const numberOfDeathwingPresents =
		(attackingHeroPowerId === CardIds.AllWillBurnBattlegrounds ? 1 : 0) +
		(defendingHeroPowerId === CardIds.AllWillBurnBattlegrounds ? 1 : 0);
	applyAuras(attackingBoard, numberOfDeathwingPresents, cardsData, allCards);
	applyAuras(defendingBoard, numberOfDeathwingPresents, cardsData, allCards);

	// For now we're only dealing with the red whelp
	if (attacker.cardId === CardIds.RedWhelp) {
		const damage = attackingBoard
			.map((entity) => allCards.getCard(entity.cardId).race)
			.filter((race) => isCorrectTribe(race, Race.DRAGON)).length;
		dealDamageToRandomEnemy(
			defendingBoard,
			defendingBoardHero,
			attacker,
			damage,
			attackingBoard,
			attackingBoardHero,
			allCards,
			cardsData,
			sharedState,
			spectator,
		);
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
	} else if (attacker.cardId === CardIds.RedWhelpBattlegrounds) {
		const damage = attackingBoard
			.map((entity) => allCards.getCard(entity.cardId).race)
			.filter((race) => isCorrectTribe(race, Race.DRAGON)).length;
		dealDamageToRandomEnemy(
			defendingBoard,
			defendingBoardHero,
			attacker,
			damage,
			attackingBoard,
			attackingBoardHero,
			allCards,
			cardsData,
			sharedState,
			spectator,
		);
		dealDamageToRandomEnemy(
			defendingBoard,
			defendingBoardHero,
			attacker,
			damage,
			attackingBoard,
			attackingBoardHero,
			allCards,
			cardsData,
			sharedState,
			spectator,
		);
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
	} else if (attacker.cardId === CardIds.PrizedPromoDrake) {
		const numberOfDragons = attackingBoard
			.map((entity) => allCards.getCard(entity.cardId).race)
			.filter((race) => isCorrectTribe(race, Race.DRAGON)).length;
		const neighbours = getNeighbours(attackingBoard, attacker);
		neighbours.forEach((entity) => {
			modifyAttack(entity, numberOfDragons, attackingBoard, allCards);
			modifyHealth(entity, numberOfDragons, attackingBoard, allCards);
			afterStatsUpdate(entity, attackingBoard, allCards);
			spectator.registerPowerTarget(attacker, entity, attackingBoard);
		});
	} else if (attacker.cardId === CardIds.PrizedPromoDrakeBattlegrounds) {
		const dragons = attackingBoard
			.map((entity) => allCards.getCard(entity.cardId).race)
			.filter((race) => isCorrectTribe(race, Race.DRAGON)).length;
		const neighbours = getNeighbours(attackingBoard, attacker);
		neighbours.forEach((entity) => {
			modifyAttack(entity, 2 * dragons, attackingBoard, allCards);
			modifyHealth(entity, 2 * dragons, attackingBoard, allCards);
			afterStatsUpdate(entity, attackingBoard, allCards);
			spectator.registerPowerTarget(attacker, entity, attackingBoard);
		});
	} else if (attacker.cardId === CardIds.Crabby1 || attacker.cardId === CardIds.CrabbyBattlegrounds) {
		const neighbours = getNeighbours(attackingBoard, attacker);
		const multiplier = attacker.cardId === CardIds.CrabbyBattlegrounds ? 2 : 1;
		neighbours.forEach((entity) => {
			modifyAttack(entity, multiplier * (attackingBoardHero.deadEyeDamageDone ?? 0), attackingBoard, allCards);
			modifyHealth(entity, multiplier * (attackingBoardHero.deadEyeDamageDone ?? 0), attackingBoard, allCards);
			afterStatsUpdate(entity, attackingBoard, allCards);
			spectator.registerPowerTarget(attacker, entity, attackingBoard);
		});
	}
	removeAuras(attackingBoard, cardsData);
	removeAuras(defendingBoard, cardsData);
};
