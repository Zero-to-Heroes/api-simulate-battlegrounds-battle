/* eslint-disable @typescript-eslint/no-use-before-define */
import { AllCardsService, CardIds, Race } from '@firestone-hs/reference-data';
import { BgsGameState } from '../bgs-battle-info';
import { BgsPlayerEntity } from '../bgs-player-entity';
import { BoardEntity } from '../board-entity';
import { CardsData } from '../cards/cards-data';
import { afterStatsUpdate, isCorrectTribe, modifyAttack, modifyHealth } from '../utils';
import { dealDamageToEnemy, dealDamageToRandomEnemy, getNeighbours, processMinionDeath, simulateAttack } from './attack';
import { applyAuras, removeAuras } from './auras';
import {
	applyEarthInvocationEnchantment,
	applyFireInvocationEnchantment,
	applyLightningInvocationEnchantment,
	applyWaterInvocationEnchantment,
	dealDamageToAllMinions,
} from './deathrattle-effects';
import { SharedState } from './shared-state';
import { Spectator } from './spectator/spectator';

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
	if (playerBoard.map((e) => e.cardId).includes(CardIds.EclipsionIllidariBattlegrounds2)) {
		playerBoard[0].immuneWhenAttackCharges = 2;
	} else if (playerBoard.map((e) => e.cardId).includes(CardIds.EclipsionIllidariBattlegrounds1)) {
		playerBoard[0].immuneWhenAttackCharges = 1;
	}
	simulateAttack(playerBoard, playerEntity, opponentBoard, opponentEntity, undefined, allCards, spawns, sharedState, spectator, 0);

	if (minionsAtStart > 1) {
		modifyAttack(playerBoard[playerBoard.length - 1], 2, playerBoard, allCards);
		afterStatsUpdate(playerBoard[playerBoard.length - 1], playerBoard, allCards);
		spectator.registerPowerTarget(playerBoard[playerBoard.length - 1], playerBoard[playerBoard.length - 1], playerBoard);
		if (playerBoard.map((e) => e.cardId).includes(CardIds.EclipsionIllidariBattlegrounds2)) {
			playerBoard[playerBoard.length - 1].immuneWhenAttackCharges = 2;
		} else if (playerBoard.map((e) => e.cardId).includes(CardIds.EclipsionIllidariBattlegrounds1)) {
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
};

// const handleYShaarj = (
// 	playerBoard: BoardEntity[],
// 	playerBoardHero: BgsPlayerEntity,
// 	tavernTier: number,
// 	friendly: boolean,
// 	allCards: AllCardsService,
// 	spawns: CardsData,
// 	sharedState: SharedState,
// 	spectator: Spectator,
// ): void => {
// 	const spawnedEntities = spawnEntities(
// 		spawns.forTavernTier(tavernTier),
// 		1,
// 		playerBoard,
// 		playerBoardHero,
// 		allCards,
// 		sharedState,
// 		friendly,
// 		false,
// 	);
// 	// Assume it goes last
// 	playerBoard.push(...spawnedEntities);
// };

const handleNefarian = (
	playerBoard: BoardEntity[],
	playerBoardHero: BgsPlayerEntity,
	opponentBoard: BoardEntity[],
	opponentBoardHero: BgsPlayerEntity,
	allCards: AllCardsService,
	spawns: CardsData,
	sharedState: SharedState,
	spectator: Spectator,
): void => {
	// Theoretically we need to pass the player's board, in case this kills any enemy
	// minion that can interact with the player board
	// However, there are no such minions with 1 health
	dealDamageToAllMinions(opponentBoard, opponentBoardHero, [], playerBoardHero, null, 1, allCards, spawns, sharedState, spectator);
};

// const handleLichKing = (playerBoard: BoardEntity[]): void => {
// 	const nonRebornMinions = playerBoard.filter((minion) => !minion.reborn);
// 	if (nonRebornMinions.length > 0) {
// 		const targetReborn = nonRebornMinions[Math.floor(Math.random() * nonRebornMinions.length)];
// 		targetReborn.reborn = true;
// 	}
// };

// const handlePutricide = (playerBoard: BoardEntity[]): void => {
// 	const target = playerBoard[Math.floor(Math.random() * playerBoard.length)];
// 	target.attack = target.attack + 10;
// };

const handlePlayerStartOfCombatHeroPowers = (
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
	// Lich King should be handled in the incoming board state
	const playerHeroPowerId = playerEntity.heroPowerId || getHeroPowerForHero(playerEntity.cardId);
	if (playerHeroPowerId === CardIds.SwattingInsectsBattlegrounds && playerBoard.length > 0) {
		// Should be sent by the app, but it is an idempotent operation, so we can just reapply it here
		handleAlakirForPlayer(playerBoard, playerEntity, opponentBoard, opponentEntity, allCards, spawns, sharedState, spectator);
	} else if (playerHeroPowerId === CardIds.WingmenBattlegrounds && playerBoard.length > 0) {
		handleIllidanForPlayer(playerBoard, playerEntity, opponentBoard, opponentEntity, allCards, spawns, sharedState, spectator);
		currentAttacker = (currentAttacker + 1) % 2;
	} else if (playerHeroPowerId === CardIds.AimLeftToken) {
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
			spawns,
			sharedState,
			spectator,
		);
		playerEntity.deadEyeDamageDone = damageDone;
	} else if (playerHeroPowerId === CardIds.AimRightToken) {
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
			spawns,
			sharedState,
			spectator,
		);
		playerEntity.deadEyeDamageDone = damageDone;
	} else if (playerHeroPowerId === CardIds.AimLowToken) {
		const target = [...opponentBoard].sort((a, b) => a.health - b.health)[0];
		const damageDone = dealDamageToEnemy(
			target,
			opponentBoard,
			opponentEntity,
			null,
			playerEntity.heroPowerInfo ?? 0,
			playerBoard,
			playerEntity,
			allCards,
			spawns,
			sharedState,
			spectator,
		);
		playerEntity.deadEyeDamageDone = damageDone;
	} else if (playerHeroPowerId === CardIds.AimHighToken) {
		const target = [...opponentBoard].sort((a, b) => b.health - a.health)[0];
		const damageDone = dealDamageToEnemy(
			target,
			opponentBoard,
			opponentEntity,
			null,
			playerEntity.heroPowerInfo ?? 0,
			playerBoard,
			playerEntity,
			allCards,
			spawns,
			sharedState,
			spectator,
		);
		playerEntity.deadEyeDamageDone = damageDone;
	} else if (playerHeroPowerId === CardIds.EarthInvocationToken) {
		applyEarthInvocationEnchantment(playerBoard, null, allCards, spectator);
	} else if (playerHeroPowerId === CardIds.WaterInvocationToken) {
		applyWaterInvocationEnchantment(playerBoard, null, allCards, spectator);
	} else if (playerHeroPowerId === CardIds.FireInvocationToken) {
		applyFireInvocationEnchantment(playerBoard, null, allCards, spectator);
	} else if (playerHeroPowerId === CardIds.LightningInvocationToken) {
		applyLightningInvocationEnchantment(
			playerBoard,
			playerEntity,
			null,
			opponentBoard,
			opponentEntity,
			allCards,
			spawns,
			sharedState,
			spectator,
		);
	}
	// else if (
	// 	playerHeroPowerId === CardIds.SwattingInsectsBattlegrounds &&
	// 	playerBoard.length > 0
	// ) {
	// }
	// Will be sent by the client
	// else if (
	// 	playerEntity.heroPowerUsed &&
	// 	playerHeroPowerId === CardIds.EmbraceYourRageBattlegrounds &&
	// 	playerBoard.length < 7
	// ) {
	// 	handleYShaarj(playerBoard, playerEntity, playerEntity.tavernTier, friendly, allCards, spawns, sharedState, spectator);
	// }
	// else if (playerEntity.heroPowerUsed && playerHeroPowerId === CardIds.NefariousFireBattlegrounds && playerBoard.length > 0) {
	// 	handleNefarian(playerBoard, playerEntity, opponentBoard, opponentEntity, allCards, spawns, sharedState, spectator);
	// }
	return currentAttacker;
};

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
			spawns,
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
			spawns,
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
			spawns,
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
			spawns,
			sharedState,
			spectator,
		);
	}

	let attackerForStart = Math.round(Math.random());

	const playerAttackers = playerBoard.filter((entity) => spawns.startOfCombats.indexOf(entity.cardId) !== -1);
	const opponentAttackers = opponentBoard.filter((entity) => spawns.startOfCombats.indexOf(entity.cardId) !== -1);
	while (playerAttackers.length > 0 || opponentAttackers.length > 0) {
		if (attackerForStart === 0 && playerAttackers.length > 0) {
			const attacker = playerAttackers.splice(0, 1)[0];
			performStartOfCombat(
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
			performStartOfCombat(
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
	// TODO: update that in case of Illidan's HP
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

export const performStartOfCombat = (
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
