/* eslint-disable @typescript-eslint/no-use-before-define */
import { AllCardsService, CardIds, Race } from '@firestone-hs/reference-data';
import { BgsPlayerEntity } from '../bgs-player-entity';
import { BoardEntity } from '../board-entity';
import { CardsData } from '../cards/cards-data';
import { isCorrectTribe } from '../utils';
import { dealDamageToRandomEnemy, simulateAttack } from './attack';
import { dealDamageToAllMinions } from './deathrattle-effects';
import { spawnEntities } from './deathrattle-spawns';
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
	simulateAttack(playerBoard, playerEntity, opponentBoard, opponentEntity, undefined, allCards, spawns, sharedState, spectator, 0);
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

const handleYShaarj = (
	playerBoard: BoardEntity[],
	playerBoardHero: BgsPlayerEntity,
	tavernTier: number,
	friendly: boolean,
	allCards: AllCardsService,
	spawns: CardsData,
	sharedState: SharedState,
	spectator: Spectator,
): void => {
	const spawnedEntities = spawnEntities(
		spawns.forTavernTier(tavernTier),
		1,
		playerBoard,
		playerBoardHero,
		allCards,
		sharedState,
		friendly,
		false,
	);
	// Assume it goes last
	playerBoard.push(...spawnedEntities);
};

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

const handleLichKing = (playerBoard: BoardEntity[]): void => {
	const nonRebornMinions = playerBoard.filter((minion) => !minion.reborn);
	if (nonRebornMinions.length > 0) {
		const targetReborn = nonRebornMinions[Math.floor(Math.random() * nonRebornMinions.length)];
		targetReborn.reborn = true;
	}
};

const handlePutricide = (playerBoard: BoardEntity[]): void => {
	const target = playerBoard[Math.floor(Math.random() * playerBoard.length)];
	target.attack = target.attack + 10;
};

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
	if (playerHeroPowerId === CardIds.NonCollectible.Demonhunter.WingmenTavernBrawl && playerBoard.length > 0) {
		handleIllidanForPlayer(playerBoard, playerEntity, opponentBoard, opponentEntity, allCards, spawns, sharedState, spectator);
		currentAttacker = (currentAttacker + 1) % 2;
	}
	// else if (
	// 	playerHeroPowerId === CardIds.NonCollectible.Neutral.SwattingInsectsTavernBrawl &&
	// 	playerBoard.length > 0
	// ) {
	// }
	// Will be sent by the client
	// else if (
	// 	playerEntity.heroPowerUsed &&
	// 	playerHeroPowerId === CardIds.NonCollectible.Neutral.EmbraceYourRageTavernBrawl &&
	// 	playerBoard.length < 7
	// ) {
	// 	handleYShaarj(playerBoard, playerEntity, playerEntity.tavernTier, friendly, allCards, spawns, sharedState, spectator);
	// }
	else if (
		playerEntity.heroPowerUsed &&
		playerHeroPowerId === CardIds.NonCollectible.Neutral.NefariousFireTavernBrawl &&
		playerBoard.length > 0
	) {
		handleNefarian(playerBoard, playerEntity, opponentBoard, opponentEntity, allCards, spawns, sharedState, spectator);
	}
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
	spectator: Spectator,
): number => {
	// Apparently it's a toin coss about whether to handle Illidan first or Al'Akir first
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
	// console.log('[start of combat] cazndidates', stringifySimple(playerAttackers), stringifySimple(opponentAttackers));
	while (playerAttackers.length > 0 || opponentAttackers.length > 0) {
		if (attackerForStart === 0 && playerAttackers.length > 0) {
			const attacker = playerAttackers.splice(0, 1)[0];
			// console.log('[start of combat] will perform player attack', attacker);
			performStartOfCombat(
				attacker,
				playerBoard,
				playerEntity,
				opponentBoard,
				opponentEntity,
				allCards,
				spawns,
				sharedState,
				spectator,
			);
		} else if (attackerForStart === 1 && opponentAttackers.length > 0) {
			const attacker = opponentAttackers.splice(0, 1)[0];
			// console.log('[start of combat] will perform opponent attack', attacker);
			performStartOfCombat(
				attacker,
				opponentBoard,
				opponentEntity,
				playerBoard,
				playerEntity,
				allCards,
				spawns,
				sharedState,
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
		case CardIds.NonCollectible.Neutral.IllidanStormrageTavernBrawl2:
			return CardIds.NonCollectible.Demonhunter.WingmenTavernBrawl;
		case CardIds.NonCollectible.Neutral.TheLichKingTavernBrawl2:
			return CardIds.NonCollectible.Neutral.RebornRitesTavernBrawl;
		case CardIds.NonCollectible.Neutral.ProfessorPutricideTavernBrawl:
			return CardIds.NonCollectible.Neutral.RagePotionTavernBrawl;
		case CardIds.NonCollectible.Neutral.NefarianTavernBrawlBATTLEGROUNDS:
			return CardIds.NonCollectible.Neutral.NefariousFireTavernBrawl;
		case CardIds.NonCollectible.Neutral.DeathwingTavernBrawl:
			return CardIds.NonCollectible.Neutral.AllWillBurnTavernBrawl;
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
	spawns: CardsData,
	sharedState: SharedState,
	spectator: Spectator,
): void => {
	// For now we're only dealing with the red whelp
	if (attacker.cardId === CardIds.NonCollectible.Neutral.RedWhelp) {
		const damage = attackingBoard
			.map((entity) => allCards.getCard(entity.cardId).race)
			.filter((race) => isCorrectTribe(race, Race.DRAGON)).length;
		// console.log('[start of combat] damage', damage);
		dealDamageToRandomEnemy(
			defendingBoard,
			defendingBoardHero,
			attacker,
			damage,
			attackingBoard,
			attackingBoardHero,
			allCards,
			spawns,
			sharedState,
			spectator,
		);
	} else if (attacker.cardId === CardIds.NonCollectible.Neutral.RedWhelpTavernBrawl) {
		const damage = attackingBoard
			.map((entity) => allCards.getCard(entity.cardId).race)
			.filter((race) => isCorrectTribe(race, Race.DRAGON)).length;
		// console.log(
		// 	'red whelp start of combat',
		// 	stringifySimpleCard(attacker),
		// 	damage + '\n',
		// 	stringifySimple(defendingBoard) + '\n',
		// 	stringifySimple(attackingBoard),
		// );
		dealDamageToRandomEnemy(
			defendingBoard,
			defendingBoardHero,
			attacker,
			damage,
			attackingBoard,
			attackingBoardHero,
			allCards,
			spawns,
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
			spawns,
			sharedState,
			spectator,
		);
		// console.log(q
		// 	'red whelp after start of combat',
		// 	stringifySimpleCard(attacker) + '\n',
		// 	stringifySimple(defendingBoard) + '\n',
		// 	stringifySimple(attackingBoard),
		// );
	}
	// return [attackingBoard, defendingBoard];
};
