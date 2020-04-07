/* eslint-disable @typescript-eslint/no-use-before-define */
import { AllCardsService, CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../board-entity';
import { CardsData } from '../cards/cards-data';
import { PlayerEntity } from '../player-entity';
import { dealDamageToRandomEnemy, simulateAttack } from './attack';
import { dealDamageToAllMinions } from './deathrattle-effects';
import { SharedState } from './shared-state';

const handleIllidan = (
	playerBoard: BoardEntity[],
	playerEntity: PlayerEntity,
	opponentBoard: BoardEntity[],
	opponentEntity: PlayerEntity,
	allCards: AllCardsService,
	spawns: CardsData,
	sharedState: SharedState,
): void => {
	simulateAttack(
		playerBoard,
		playerEntity,
		opponentBoard,
		opponentEntity,
		undefined,
		allCards,
		spawns,
		sharedState,
		0,
	);
	if (playerBoard.length > 1) {
		simulateAttack(
			playerBoard,
			playerEntity,
			opponentBoard,
			opponentEntity,
			undefined,
			allCards,
			spawns,
			sharedState,
			playerBoard.length - 1,
		);
	}
};

const handleNefarian = (
	playerBoard: BoardEntity[],
	opponentBoard: BoardEntity[],
	allCards: AllCardsService,
	spawns: CardsData,
	sharedState: SharedState,
): void => {
	// Theoretically we need to pass the player's board, in case this kills any enemy
	// minion that can interact with the player board
	// However, there are no such minions with 1 health
	dealDamageToAllMinions(opponentBoard, [], null, 1, allCards, spawns, sharedState);
};

const handleLichKing = (playerBoard: BoardEntity[]): void => {
	const nonRebornMinions = playerBoard.filter(minion => !minion.reborn);
	if (nonRebornMinions.length > 0) {
		const targetReborn = nonRebornMinions[Math.floor(Math.random() * nonRebornMinions.length)];
		targetReborn.reborn = true;
	}
};

const handlePutricide = (playerBoard: BoardEntity[]): void => {
	const target = playerBoard[Math.floor(Math.random() * playerBoard.length)];
	target.attack = target.attack + 10;
};

export const handleStartOfCombat = (
	playerEntity: PlayerEntity,
	playerBoard: BoardEntity[],
	opponentEntity: PlayerEntity,
	opponentBoard: BoardEntity[],
	allCards: AllCardsService,
	spawns: CardsData,
	sharedState: SharedState,
): void => {
	let currentAttacker = Math.round(Math.random());

	if (playerEntity.cardId === CardIds.NonCollectible.Neutral.IllidanStormrageTavernBrawl2 && playerBoard.length > 0) {
		handleIllidan(playerBoard, playerEntity, opponentBoard, opponentEntity, allCards, spawns, sharedState);
	} else if (
		opponentEntity.cardId === CardIds.NonCollectible.Neutral.IllidanStormrageTavernBrawl2 &&
		opponentBoard.length > 0
	) {
		handleIllidan(opponentBoard, opponentEntity, playerBoard, playerEntity, allCards, spawns, sharedState);
	}

	if (playerEntity.cardId === CardIds.NonCollectible.Neutral.TheLichKingTavernBrawl2 && playerBoard.length > 0) {
		handleLichKing(playerBoard);
	} else if (
		opponentEntity.cardId === CardIds.NonCollectible.Neutral.TheLichKingTavernBrawl2 &&
		opponentBoard.length > 0
	) {
		handleLichKing(opponentBoard);
	}

	if (
		playerEntity.cardId === CardIds.NonCollectible.Neutral.ProfessorPutricideTavernBrawl &&
		playerBoard.length > 0
	) {
		handlePutricide(playerBoard);
	} else if (
		opponentEntity.cardId === CardIds.NonCollectible.Neutral.ProfessorPutricideTavernBrawl &&
		opponentBoard.length > 0
	) {
		handlePutricide(opponentBoard);
	}

	if (
		playerEntity.cardId === CardIds.NonCollectible.Neutral.NefarianTavernBrawlBATTLEGROUNDS &&
		playerBoard.length > 0
	) {
		handleNefarian(playerBoard, opponentBoard, allCards, spawns, sharedState);
	} else if (
		opponentEntity.cardId === CardIds.NonCollectible.Neutral.NefarianTavernBrawlBATTLEGROUNDS &&
		opponentBoard.length > 0
	) {
		handleNefarian(opponentBoard, playerBoard, allCards, spawns, sharedState);
	}

	// console.log('[start of combat] attacker', currentAttacker);
	const playerAttackers = playerBoard.filter(entity => spawns.startOfCombats.indexOf(entity.cardId) !== -1);
	const opponentAttackers = opponentBoard.filter(entity => spawns.startOfCombats.indexOf(entity.cardId) !== -1);
	// console.log('[start of combat] cazndidates', playerAttackers, opponentAttackers);
	while (playerAttackers.length > 0 || opponentAttackers.length > 0) {
		if (currentAttacker === 0 && playerAttackers.length > 0) {
			const attacker = playerAttackers.splice(0, 1)[0];
			// console.log('[start of combat] will perform player attack', attacker);
			performStartOfCombat(attacker, playerBoard, opponentBoard, allCards, spawns, sharedState);
		} else if (currentAttacker === 1 && opponentAttackers.length > 0) {
			const attacker = opponentAttackers.splice(0, 1)[0];
			// console.log('[start of combat] will perform opponent attack', attacker);
			performStartOfCombat(attacker, opponentBoard, playerBoard, allCards, spawns, sharedState);
		}
		currentAttacker = (currentAttacker + 1) % 2;
	}
	// return [playerBoard, opponentBoard];
};

export const performStartOfCombat = (
	attacker: BoardEntity,
	attackingBoard: BoardEntity[],
	defendingBoard: BoardEntity[],
	allCards: AllCardsService,
	spawns: CardsData,
	sharedState: SharedState,
): void => {
	// For now we're only dealing with the red whelp
	if (attacker.cardId === 'BGS_019') {
		const damage = attackingBoard
			.map(entity => allCards.getCard(entity.cardId).race)
			.filter(race => race === 'DRAGON').length;
		// console.log('[start of combat] damage', damage);
		dealDamageToRandomEnemy(defendingBoard, attacker, damage, attackingBoard, allCards, spawns, sharedState);
	} else if (attacker.cardId === 'TB_BaconUps_102') {
		const damage = attackingBoard
			.map(entity => allCards.getCard(entity.cardId).race)
			.filter(race => race === 'DRAGON').length;
		dealDamageToRandomEnemy(defendingBoard, attacker, damage, attackingBoard, allCards, spawns, sharedState);
		dealDamageToRandomEnemy(defendingBoard, attacker, damage, attackingBoard, allCards, spawns, sharedState);
	}
	// return [attackingBoard, defendingBoard];
};
