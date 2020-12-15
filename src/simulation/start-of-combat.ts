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
	opponentBoard: BoardEntity[],
	allCards: AllCardsService,
	spawns: CardsData,
	sharedState: SharedState,
	spectator: Spectator,
): void => {
	// Theoretically we need to pass the player's board, in case this kills any enemy
	// minion that can interact with the player board
	// However, there are no such minions with 1 health
	dealDamageToAllMinions(opponentBoard, [], null, 1, allCards, spawns, sharedState, spectator);
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

const handlePlayerStartOfCombatHeroPowers = (
	playerEntity: BgsPlayerEntity,
	playerBoard: BoardEntity[],
	opponentEntity: BgsPlayerEntity,
	opponentBoard: BoardEntity[],
	friendly: boolean,
	allCards: AllCardsService,
	spawns: CardsData,
	sharedState: SharedState,
	spectator: Spectator,
): void => {
	// Lich King should be handled in the incoming board state
	const playerHeroPowerId = playerEntity.heroPowerId || getHeroPowerForHero(playerEntity.cardId);
	if (playerHeroPowerId === CardIds.NonCollectible.Demonhunter.WingmenTavernBrawl && playerBoard.length > 0) {
		handleIllidanForPlayer(
			playerBoard,
			playerEntity,
			opponentBoard,
			opponentEntity,
			allCards,
			spawns,
			sharedState,
			spectator,
		);
	}
	// else if (
	// 	playerHeroPowerId === CardIds.NonCollectible.Neutral.SwattingInsectsTavernBrawl &&
	// 	playerBoard.length > 0
	// ) {
	// 	// TODO: Al'Akir as well should be handled via the game state, but since it's idempotent it doesn't hurt
	// 	// if we apply it multiple times
	// 	handleAlakirForPlayer(
	// 		playerBoard,
	// 		playerEntity,
	// 		opponentBoard,
	// 		opponentEntity,
	// 		allCards,
	// 		spawns,
	// 		sharedState,
	// 		spectator,
	// 	);
	// }
	else if (
		playerEntity.heroPowerUsed &&
		playerHeroPowerId === CardIds.NonCollectible.Neutral.EmbraceYourRageTavernBrawl &&
		playerBoard.length < 7
	) {
		handleYShaarj(playerBoard, playerEntity.tavernTier, friendly, allCards, spawns, sharedState, spectator);
	} else if (
		playerEntity.heroPowerUsed &&
		playerHeroPowerId === CardIds.NonCollectible.Neutral.NefariousFireTavernBrawl &&
		playerBoard.length > 0
	) {
		handleNefarian(playerBoard, opponentBoard, allCards, spawns, sharedState, spectator);
	}
};

// const handleOpponentStartOfCombatHeroPowers = (
// 	playerEntity: BgsPlayerEntity,
// 	playerBoard: BoardEntity[],
// 	opponentEntity: BgsPlayerEntity,
// 	opponentBoard: BoardEntity[],
// 	allCards: AllCardsService,
// 	spawns: CardsData,
// 	sharedState: SharedState,
// 	spectator: Spectator,
// ): void => {
// 	const opponentHeroPowerId = opponentEntity.heroPowerId || getHeroPowerForHero(opponentEntity.cardId);
// 	if (opponentHeroPowerId === CardIds.NonCollectible.Demonhunter.WingmenTavernBrawl && opponentBoard.length > 0) {
// 		handleIllidanForPlayer(
// 			opponentBoard,
// 			opponentEntity,
// 			playerBoard,
// 			playerEntity,
// 			allCards,
// 			spawns,
// 			sharedState,
// 			spectator,
// 		);
// 	}
// 	// else if (
// 	// 	opponentHeroPowerId === CardIds.NonCollectible.Neutral.SwattingInsectsTavernBrawl &&
// 	// 	opponentBoard.length > 0
// 	// ) {
// 	// 	handleAlakirForPlayer(
// 	// 		opponentBoard,
// 	// 		opponentEntity,
// 	// 		playerBoard,
// 	// 		playerEntity,
// 	// 		allCards,
// 	// 		spawns,
// 	// 		sharedState,
// 	// 		spectator,
// 	// 	);
// 	// }
// 	else if (
// 		opponentEntity.heroPowerUsed &&
// 		opponentHeroPowerId === CardIds.NonCollectible.Neutral.NefariousFireTavernBrawl &&
// 		opponentBoard.length > 0
// 	) {
// 		handleNefarian(opponentBoard, playerBoard, allCards, spawns, sharedState, spectator);
// 	}
// };

export const handleStartOfCombat = (
	playerEntity: BgsPlayerEntity,
	playerBoard: BoardEntity[],
	opponentEntity: BgsPlayerEntity,
	opponentBoard: BoardEntity[],
	allCards: AllCardsService,
	spawns: CardsData,
	sharedState: SharedState,
	spectator: Spectator,
): void => {
	// Apparently it's a toin coss about whether to handle Illidan first or Al'Akir first
	if (Math.random() < 0.5) {
		handlePlayerStartOfCombatHeroPowers(
			playerEntity,
			playerBoard,
			opponentEntity,
			opponentBoard,
			true,
			allCards,
			spawns,
			sharedState,
			spectator,
		);
		handlePlayerStartOfCombatHeroPowers(
			opponentEntity,
			opponentBoard,
			playerEntity,
			playerBoard,
			false,
			allCards,
			spawns,
			sharedState,
			spectator,
		);
	} else {
		handlePlayerStartOfCombatHeroPowers(
			opponentEntity,
			opponentBoard,
			playerEntity,
			playerBoard,
			false,
			allCards,
			spawns,
			sharedState,
			spectator,
		);
		handlePlayerStartOfCombatHeroPowers(
			playerEntity,
			playerBoard,
			opponentEntity,
			opponentBoard,
			true,
			allCards,
			spawns,
			sharedState,
			spectator,
		);
	}

	// if (
	// 	playerEntity.heroPowerUsed &&
	// 	playerHeroPowerId === CardIds.NonCollectible.Neutral.RagePotionTavernBrawl &&
	// 	playerBoard.length > 0
	// ) {
	// 	handlePutricide(playerBoard);
	// } else if (
	// 	opponentEntity.heroPowerUsed &&
	// 	opponentHeroPowerId === CardIds.NonCollectible.Neutral.RagePotionTavernBrawl &&
	// 	opponentBoard.length > 0
	// ) {
	// 	handlePutricide(opponentBoard);
	// }

	let currentAttacker = Math.round(Math.random());

	// console.log('[start of combat] attacker', currentAttacker);
	const playerAttackers = playerBoard.filter(entity => spawns.startOfCombats.indexOf(entity.cardId) !== -1);
	const opponentAttackers = opponentBoard.filter(entity => spawns.startOfCombats.indexOf(entity.cardId) !== -1);
	// console.log('[start of combat] cazndidates', stringifySimple(playerAttackers), stringifySimple(opponentAttackers));
	while (playerAttackers.length > 0 || opponentAttackers.length > 0) {
		if (currentAttacker === 0 && playerAttackers.length > 0) {
			const attacker = playerAttackers.splice(0, 1)[0];
			// console.log('[start of combat] will perform player attack', attacker);
			performStartOfCombat(attacker, playerBoard, opponentBoard, allCards, spawns, sharedState, spectator);
		} else if (currentAttacker === 1 && opponentAttackers.length > 0) {
			const attacker = opponentAttackers.splice(0, 1)[0];
			// console.log('[start of combat] will perform opponent attack', attacker);
			performStartOfCombat(attacker, opponentBoard, playerBoard, allCards, spawns, sharedState, spectator);
		}
		currentAttacker = (currentAttacker + 1) % 2;
	}
	// return [playerBoard, opponentBoard];
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
	defendingBoard: BoardEntity[],
	allCards: AllCardsService,
	spawns: CardsData,
	sharedState: SharedState,
	spectator: Spectator,
): void => {
	// For now we're only dealing with the red whelp
	if (attacker.cardId === CardIds.NonCollectible.Neutral.RedWhelp) {
		const damage = attackingBoard
			.map(entity => allCards.getCard(entity.cardId).race)
			.filter(race => isCorrectTribe(race, Race.DRAGON)).length;
		// console.log('[start of combat] damage', damage);
		dealDamageToRandomEnemy(
			defendingBoard,
			attacker,
			damage,
			attackingBoard,
			allCards,
			spawns,
			sharedState,
			spectator,
		);
	} else if (attacker.cardId === CardIds.NonCollectible.Neutral.RedWhelpTavernBrawl) {
		const damage = attackingBoard
			.map(entity => allCards.getCard(entity.cardId).race)
			.filter(race => isCorrectTribe(race, Race.DRAGON)).length;
		// console.log(
		// 	'red whelp start of combat',
		// 	stringifySimpleCard(attacker),
		// 	damage + '\n',
		// 	stringifySimple(defendingBoard) + '\n',
		// 	stringifySimple(attackingBoard),
		// );
		dealDamageToRandomEnemy(
			defendingBoard,
			attacker,
			damage,
			attackingBoard,
			allCards,
			spawns,
			sharedState,
			spectator,
		);
		dealDamageToRandomEnemy(
			defendingBoard,
			attacker,
			damage,
			attackingBoard,
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
