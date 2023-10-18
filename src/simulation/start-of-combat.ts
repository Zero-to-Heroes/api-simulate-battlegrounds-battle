/* eslint-disable @typescript-eslint/no-use-before-define */
import { ALL_BG_RACES, AllCardsService, CardIds, Race } from '@firestone-hs/reference-data';
import { BgsGameState } from '../bgs-battle-info';
import { BgsPlayerEntity } from '../bgs-player-entity';
import { BoardEntity } from '../board-entity';
import { CardsData, START_OF_COMBAT_CARD_IDS } from '../cards/cards-data';
import { pickRandom } from '../services/utils';
import {
	afterStatsUpdate,
	getRandomAliveMinion,
	hasCorrectTribe,
	isCorrectTribe,
	makeMinionGolden,
	modifyAttack,
	modifyHealth,
	stringifySimple,
	updateDivineShield,
} from '../utils';
import {
	dealDamageToEnemy,
	dealDamageToRandomEnemy,
	doFullAttack,
	findNearestEnemies,
	getNeighbours,
	performEntitySpawns,
	processMinionDeath,
	simulateAttack,
} from './attack';
import {
	applyEarthInvocationEnchantment,
	applyFireInvocationEnchantment,
	applyLightningInvocationEnchantment,
	applyWaterInvocationEnchantment,
	handleDeathrattles,
} from './deathrattle-effects';
import { spawnEntities } from './deathrattle-spawns';
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
	// https://twitter.com/DCalkosz/status/1564705111850434561
	currentAttacker = handleStartOfCombatQuestRewards(
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
	currentAttacker = handleStartOfCombatAnomalies(
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
	// Because start of combat powers like Red Whelp's use the board composition before Illidan's strike to know the amount of damage
	const playerBoardBefore = playerBoard.map((e) => ({ ...e }));
	const opponentBoardBefore = opponentBoard.map((e) => ({ ...e }));
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
		playerBoardBefore,
		opponentBoardBefore,
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
	currentAttacker = handlePreCombatHeroPowersForPlayer(
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
	currentAttacker = handlePreCombatHeroPowersForPlayer(
		opponentEntity,
		opponentBoard,
		playerEntity,
		playerBoard,
		currentAttacker,
		allCards,
		spawns,
		sharedState,
		gameState,
		spectator,
	);
	return currentAttacker;
};

const handlePreCombatHeroPowersForPlayer = (
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
	// Some are part of the incoming board: Y'Shaarj, Lich King, Ozumat
	// Since the order is not important here, we just always do the player first
	const playerHeroPowerId = playerEntity.heroPowerId || getHeroPowerForHero(playerEntity.cardId);
	if (playerHeroPowerId === CardIds.SwattingInsects && playerBoard.length > 0) {
		// Should be sent by the app, but it is an idempotent operation, so we can just reapply it here
		handleAlakirForPlayer(
			playerBoard,
			playerEntity,
			opponentBoard,
			opponentEntity,
			allCards,
			spawns,
			sharedState,
			spectator,
		);
	} else if (playerEntity.heroPowerUsed && playerHeroPowerId === CardIds.EarthInvocationToken) {
		applyEarthInvocationEnchantment(playerBoard, null, playerEntity, allCards, sharedState, spectator);
	} else if (playerEntity.heroPowerUsed && playerHeroPowerId === CardIds.WaterInvocationToken) {
		applyWaterInvocationEnchantment(playerBoard, null, playerEntity, allCards, spectator);
	} else if (playerEntity.heroPowerUsed && playerHeroPowerId === CardIds.FireInvocationToken) {
		applyFireInvocationEnchantment(playerBoard, null, playerEntity, allCards, spectator);
	} else if (playerHeroPowerId === CardIds.AllWillBurn) {
		applyAllWillBurn(playerBoard, opponentBoard, playerEntity, allCards, spectator);
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
	cardsData: CardsData,
	sharedState: SharedState,
	gameState: BgsGameState,
	spectator: Spectator,
): number => {
	// console.log('current attacker before', currentAttacker);
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
			cardsData,
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
			cardsData,
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
			cardsData,
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
			cardsData,
			sharedState,
			spectator,
		);
	}
	processMinionDeath(
		playerBoard,
		playerEntity,
		opponentBoard,
		opponentEntity,
		allCards,
		cardsData,
		sharedState,
		spectator,
	);
	// console.log('current attacker after', currentAttacker);
	return currentAttacker;
};

const handleStartOfCombatMinions = (
	playerEntity: BgsPlayerEntity,
	playerBoard: BoardEntity[],
	opponentEntity: BgsPlayerEntity,
	opponentBoard: BoardEntity[],
	currentAttacker: number,
	playerBoardBefore: BoardEntity[],
	opponentBoardBefore: BoardEntity[],
	allCards: AllCardsService,
	spawns: CardsData,
	sharedState: SharedState,
	gameState: BgsGameState,
	spectator: Spectator,
): number => {
	let attackerForStart = currentAttacker;
	const playerAttackers = playerBoard.filter((entity) => START_OF_COMBAT_CARD_IDS.includes(entity.cardId as CardIds));
	const opponentAttackers = opponentBoard.filter((entity) =>
		START_OF_COMBAT_CARD_IDS.includes(entity.cardId as CardIds),
	);
	while (playerAttackers.length > 0 || opponentAttackers.length > 0) {
		if (attackerForStart === 0 && playerAttackers.length > 0) {
			const attacker = playerAttackers.splice(0, 1)[0];
			performStartOfCombatMinionsForPlayer(
				attacker,
				playerBoard,
				playerEntity,
				opponentBoard,
				opponentEntity,
				playerBoardBefore,
				opponentBoardBefore,
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
				opponentBoardBefore,
				playerBoardBefore,
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

const handleStartOfCombatQuestRewards = (
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
	currentAttacker = handleStartOfCombatQuestRewardsForPlayer(
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
	currentAttacker = handleStartOfCombatQuestRewardsForPlayer(
		opponentEntity,
		opponentBoard,
		playerEntity,
		playerBoard,
		currentAttacker,
		allCards,
		spawns,
		sharedState,
		gameState,
		spectator,
	);
	return currentAttacker;
};

const handleStartOfCombatAnomalies = (
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
	currentAttacker = handleStartOfCombatAnomaliesForPlayer(
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
	currentAttacker = handleStartOfCombatAnomaliesForPlayer(
		opponentEntity,
		opponentBoard,
		playerEntity,
		playerBoard,
		currentAttacker,
		allCards,
		spawns,
		sharedState,
		gameState,
		spectator,
	);
	return currentAttacker;
};

const handleStartOfCombatQuestRewardsForPlayer = (
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
	if (!playerEntity.questRewards?.length) {
		return currentAttacker;
	}
	for (const reward of playerEntity.questRewards) {
		switch (reward) {
			case CardIds.EvilTwin:
				if (!!playerBoard.length && playerBoard.length < 7) {
					const highestHealthMinion = [...playerBoard].sort((a, b) => b.health - a.health)[0];
					const copy: BoardEntity = {
						...highestHealthMinion,
						lastAffectedByEntity: null,
					};
					const newMinions = spawnEntities(
						copy.cardId,
						1,
						playerBoard,
						playerEntity,
						opponentBoard,
						opponentEntity,
						allCards,
						spawns,
						sharedState,
						spectator,
						highestHealthMinion.friendly,
						true,
						false,
						false,
						copy,
					);
					const indexFromRight = playerBoard.length - (playerBoard.indexOf(highestHealthMinion) + 1);
					performEntitySpawns(
						newMinions,
						playerBoard,
						playerEntity,
						highestHealthMinion,
						indexFromRight,
						opponentBoard,
						opponentEntity,
						allCards,
						spawns,
						sharedState,
						spectator,
					);
					spectator.registerPowerTarget(playerEntity, copy, playerBoard);
				}
				// Recompute first attacker
				// See https://replays.firestoneapp.com/?reviewId=93229c4a-d864-4196-83dd-2fea2a5bf70a&turn=29&action=0
				return playerBoard.length > opponentBoard.length
					? 0
					: opponentBoard.length > playerBoard.length
					? 1
					: Math.round(Math.random());
			case CardIds.StaffOfOrigination_BG24_Reward_312:
				playerBoard.forEach((entity) => {
					modifyAttack(entity, 15, playerBoard, allCards);
					modifyHealth(entity, 15, playerBoard, allCards);
					afterStatsUpdate(entity, playerBoard, allCards);
					spectator.registerPowerTarget(playerEntity, entity, playerBoard);
				});
				break;
			case CardIds.StolenGold:
				if (playerBoard.length > 0) {
					makeMinionGolden(
						playerBoard[0],
						playerEntity,
						playerBoard,
						playerEntity,
						allCards,
						spectator,
						sharedState,
					);
				}
				if (playerBoard.length > 1) {
					makeMinionGolden(
						playerBoard[playerBoard.length - 1],
						playerEntity,
						playerBoard,
						playerEntity,
						allCards,
						spectator,
						sharedState,
					);
				}
				break;
		}
	}

	return currentAttacker;
};

const handleStartOfCombatAnomaliesForPlayer = (
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
	if (!gameState.anomalies?.length) {
		return currentAttacker;
	}
	for (const anomaly of gameState.anomalies) {
		switch (anomaly) {
			case CardIds.BlessedOrBlighted_BG27_Anomaly_726:
				if (playerBoard.length > 0) {
					const dsTarget = playerBoard[0];
					updateDivineShield(dsTarget, playerBoard, true, allCards);
					const rebornTarget = playerBoard[playerBoard.length - 1];
					rebornTarget.reborn = true;
				}
				break;
			case CardIds.AnomalousTwin_BG27_Anomaly_560:
				if (!!playerBoard.length && playerBoard.length < 7) {
					const highestHealthMinion = [...playerBoard].sort((a, b) => b.health - a.health)[0];
					const copy: BoardEntity = {
						...highestHealthMinion,
						lastAffectedByEntity: null,
					};
					const newMinions = spawnEntities(
						copy.cardId,
						1,
						playerBoard,
						playerEntity,
						opponentBoard,
						opponentEntity,
						allCards,
						spawns,
						sharedState,
						spectator,
						highestHealthMinion.friendly,
						true,
						false,
						false,
						copy,
					);
					const indexFromRight = playerBoard.length - (playerBoard.indexOf(highestHealthMinion) + 1);
					performEntitySpawns(
						newMinions,
						playerBoard,
						playerEntity,
						highestHealthMinion,
						indexFromRight,
						opponentBoard,
						opponentEntity,
						allCards,
						spawns,
						sharedState,
						spectator,
					);
					spectator.registerPowerTarget(playerEntity, copy, playerBoard);
				}
				// Recompute first attacker
				// See https://replays.firestoneapp.com/?reviewId=93229c4a-d864-4196-83dd-2fea2a5bf70a&turn=29&action=0
				return playerBoard.length > opponentBoard.length
					? 0
					: opponentBoard.length > playerBoard.length
					? 1
					: Math.round(Math.random());
		}
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
	if (playerHeroPowerId === CardIds.Wingmen && playerBoard.length > 0) {
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
	const firstAttacker = playerBoard[0];
	const secondAttacker = minionsAtStart > 1 ? playerBoard[playerBoard.length - 1] : null;

	modifyAttack(firstAttacker, 2, playerBoard, allCards);
	modifyHealth(firstAttacker, 1, playerBoard, allCards);
	afterStatsUpdate(firstAttacker, playerBoard, allCards);
	spectator.registerPowerTarget(firstAttacker, firstAttacker, playerBoard);
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

	if (!!secondAttacker && !secondAttacker.definitelyDead && secondAttacker.health > 0) {
		modifyAttack(secondAttacker, 2, playerBoard, allCards);
		modifyHealth(secondAttacker, 1, playerBoard, allCards);
		afterStatsUpdate(secondAttacker, playerBoard, allCards);
		spectator.registerPowerTarget(secondAttacker, secondAttacker, playerBoard);
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
	if (!firstEntity.divineShield) {
		updateDivineShield(firstEntity, playerBoard, true, allCards);
	}
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
	if (!chosenEntity) {
		console.warn('could not pick any entity for tamsin', stringifySimple(entitiesWithLowestHealth, allCards));
		return;
	}
	const newBoard = playerBoard.filter((e) => e.entityId !== chosenEntity.entityId);
	// How to mark the minion as dead
	chosenEntity.definitelyDead = true;
	newBoard.forEach((e) => {
		modifyAttack(e, chosenEntity.attack, newBoard, allCards);
		modifyHealth(e, chosenEntity.health, newBoard, allCards);
		afterStatsUpdate(e, newBoard, allCards);
		spectator.registerPowerTarget(chosenEntity, e, newBoard);
	});
};

const handleTeronForPlayer = (
	playerBoard: BoardEntity[],
	playerEntity: BgsPlayerEntity,
	opponentBoard: BoardEntity[],
	opponentEntity: BgsPlayerEntity,
	allCards: AllCardsService,
	spawns: CardsData,
	sharedState: SharedState,
	spectator: Spectator,
): void => {
	// The board state is snapshot after the minion dies
	const deadMinionEntityId = playerEntity.heroPowerInfo;
	const minionThatWillDie = playerBoard.find((e) => e.entityId === deadMinionEntityId);
	if (minionThatWillDie) {
		const minionIndexFromRight = playerBoard.length - 1 - playerBoard.indexOf(minionThatWillDie);
		playerEntity.rapidReanimationIndexFromRight = minionIndexFromRight;
		playerEntity.rapidReanimationMinion = {
			...minionThatWillDie,
			enchantments: minionThatWillDie.enchantments.map((e) => ({ ...e })) ?? [],
		} as BoardEntity;
		minionThatWillDie.definitelyDead = true;
		spectator.registerPowerTarget(playerEntity, minionThatWillDie, playerBoard);
	}
};

const handleWaxWarbandForPlayer = (
	playerBoard: BoardEntity[],
	playerEntity: BgsPlayerEntity,
	opponentBoard: BoardEntity[],
	opponentEntity: BgsPlayerEntity,
	allCards: AllCardsService,
	cardsData: CardsData,
	sharedState: SharedState,
	spectator: Spectator,
): void => {
	if (playerBoard.length > 0) {
		// let tribesGranted = 0;
		let boardCopy = [...playerBoard];
		let racesLeft = [...ALL_BG_RACES];
		while (racesLeft.length > 0) {
			const tribe = pickRandom(racesLeft);
			const validMinion: BoardEntity = getRandomAliveMinion(boardCopy, tribe, allCards);
			if (validMinion) {
				modifyAttack(validMinion, cardsData.getTavernLevel(validMinion.cardId), playerBoard, allCards);
				modifyHealth(validMinion, cardsData.getTavernLevel(validMinion.cardId), playerBoard, allCards);
				afterStatsUpdate(validMinion, playerBoard, allCards);
				spectator.registerPowerTarget(playerEntity, validMinion, playerBoard);
				boardCopy = boardCopy.filter((e) => e !== validMinion);
				// tribesGranted++;
			} else {
				break;
			}
			racesLeft = racesLeft.filter((r) => r !== tribe);
		}
	}
};

const handleOzumatForPlayer = (
	playerBoard: BoardEntity[],
	playerEntity: BgsPlayerEntity,
	opponentBoard: BoardEntity[],
	opponentEntity: BgsPlayerEntity,
	friendly: boolean,
	allCards: AllCardsService,
	cardsData: CardsData,
	sharedState: SharedState,
	spectator: Spectator,
): void => {
	// Because of some interactions between start of combat hero powers, it can happen that Ozumat is already present
	// on the board when we receive the board state
	if (
		playerBoard.length < 7 &&
		!playerBoard.some((e) => e.cardId === CardIds.Tentacular_OzumatsTentacleToken_BG23_HERO_201pt)
	) {
		const tentacularSize = playerEntity.heroPowerInfo;
		const tentacular = spawnEntities(
			CardIds.Tentacular_OzumatsTentacleToken_BG23_HERO_201pt,
			1,
			playerBoard,
			playerEntity,
			opponentBoard,
			opponentEntity,
			allCards,
			cardsData,
			sharedState,
			spectator,
			friendly,
			true,
			false,
			false,
		);
		tentacular[0].attack = tentacularSize;
		tentacular[0].health = tentacularSize;
		const indexFromRight = 0;
		performEntitySpawns(
			tentacular,
			playerBoard,
			playerEntity,
			playerEntity,
			indexFromRight,
			opponentBoard,
			opponentEntity,
			allCards,
			cardsData,
			sharedState,
			spectator,
		);
		spectator.registerPowerTarget(playerEntity, tentacular[0], playerBoard);
	}
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
	let shouldRecomputeCurrentAttacker = false;
	const playerHeroPowerId = playerEntity.heroPowerId || getHeroPowerForHero(playerEntity.cardId);
	if (playerEntity.heroPowerUsed && playerHeroPowerId === CardIds.TamsinRoame_FragrantPhylactery) {
		handleTamsinForPlayer(
			playerBoard,
			playerEntity,
			opponentBoard,
			opponentEntity,
			allCards,
			cardsData,
			sharedState,
			spectator,
		);
		// Tamsin's hero power somehow happens before the current attacker is chosen.
		// See http://replays.firestoneapp.com/?reviewId=bce94e6b-c807-48e4-9c72-2c5c04421213&turn=6&action=9
		shouldRecomputeCurrentAttacker = true;
	} else if (playerEntity.heroPowerUsed && playerHeroPowerId === CardIds.TeronGorefiend_RapidReanimation) {
		handleTeronForPlayer(
			playerBoard,
			playerEntity,
			opponentBoard,
			opponentEntity,
			allCards,
			cardsData,
			sharedState,
			spectator,
		);
		// Same as Tamsin? No, because the new minion should repop automatically
	} else if (playerEntity.heroPowerUsed && playerHeroPowerId === CardIds.WaxWarband) {
		handleWaxWarbandForPlayer(
			playerBoard,
			playerEntity,
			opponentBoard,
			opponentEntity,
			allCards,
			cardsData,
			sharedState,
			spectator,
		);
		// Same as Tamsin? No, because the new minion should repop automatically
	} else if (playerHeroPowerId === CardIds.Ozumat_Tentacular) {
		handleOzumatForPlayer(
			playerBoard,
			playerEntity,
			opponentBoard,
			opponentEntity,
			friendly,
			allCards,
			cardsData,
			sharedState,
			spectator,
		);
		// Same as Tamsin? No, because the new minion should repop automatically
	} else if (playerEntity.heroPowerUsed && playerHeroPowerId === CardIds.AimLeftToken) {
		const target = opponentBoard[0];
		const damageDone = dealDamageToEnemy(
			target,
			opponentBoard,
			opponentEntity,
			null,
			playerEntity.heroPowerInfo2 ?? 0,
			playerBoard,
			playerEntity,
			allCards,
			cardsData,
			sharedState,
			spectator,
		);
		// processMinionDeath(playerBoard, playerEntity, opponentBoard, opponentEntity, allCards, cardsData, sharedState, spectator);
		playerEntity.deadEyeDamageDone = damageDone;
	} else if (playerEntity.heroPowerUsed && playerHeroPowerId === CardIds.AimRightToken) {
		const target = opponentBoard[opponentBoard.length - 1];
		const damageDone = dealDamageToEnemy(
			target,
			opponentBoard,
			opponentEntity,
			null,
			playerEntity.heroPowerInfo2 ?? 0,
			playerBoard,
			playerEntity,
			allCards,
			cardsData,
			sharedState,
			spectator,
		);
		// processMinionDeath(playerBoard, playerEntity, opponentBoard, opponentEntity, allCards, cardsData, sharedState, spectator);
		playerEntity.deadEyeDamageDone = damageDone;
	} else if (playerEntity.heroPowerUsed && playerHeroPowerId === CardIds.AimLowToken) {
		const smallestHealthMinion = [...opponentBoard].sort((a, b) => a.health - b.health)[0];
		const target = pickRandom(opponentBoard.filter((e) => e.health === smallestHealthMinion.health));
		const damageDone = dealDamageToEnemy(
			target,
			opponentBoard,
			opponentEntity,
			null,
			playerEntity.heroPowerInfo2 ?? 0,
			playerBoard,
			playerEntity,
			allCards,
			cardsData,
			sharedState,
			spectator,
		);
		// processMinionDeath(playerBoard, playerEntity, opponentBoard, opponentEntity, allCards, cardsData, sharedState, spectator);
		playerEntity.deadEyeDamageDone = damageDone;
	} else if (playerEntity.heroPowerUsed && playerHeroPowerId === CardIds.AimHighToken) {
		const highestHealthMinion = [...opponentBoard].sort((a, b) => b.health - a.health)[0];
		const target = pickRandom(opponentBoard.filter((e) => e.health === highestHealthMinion.health));
		const damageDone = dealDamageToEnemy(
			target,
			opponentBoard,
			opponentEntity,
			null,
			playerEntity.heroPowerInfo2 ?? 0,
			playerBoard,
			playerEntity,
			allCards,
			cardsData,
			sharedState,
			spectator,
		);
		// processMinionDeath(playerBoard, playerEntity, opponentBoard, opponentEntity, allCards, cardsData, sharedState, spectator);
		playerEntity.deadEyeDamageDone = damageDone;
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
	}
	processMinionDeath(
		playerBoard,
		playerEntity,
		opponentBoard,
		opponentEntity,
		allCards,
		cardsData,
		sharedState,
		spectator,
	);
	if (shouldRecomputeCurrentAttacker) {
		currentAttacker =
			playerBoard.length > opponentBoard.length
				? 0
				: opponentBoard.length > playerBoard.length
				? 1
				: currentAttacker;
	}
	return currentAttacker;
};

export const getHeroPowerForHero = (heroCardId: string): string => {
	switch (heroCardId) {
		case CardIds.IllidanStormrage_TB_BaconShop_HERO_08:
			return CardIds.Wingmen;
		case CardIds.TheLichKing_TB_BaconShop_HERO_22:
			return CardIds.RebornRites;
		case CardIds.ProfessorPutricide_BG25_HERO_100:
			return CardIds.RagePotion;
		case CardIds.Deathwing_TB_BaconShop_HERO_52:
			return CardIds.AllWillBurn;
		case CardIds.TeronGorefiend_BG25_HERO_103:
			return CardIds.TeronGorefiend_RapidReanimation;
	}
	return null;
};

export const performStartOfCombatMinionsForPlayer = (
	attacker: BoardEntity,
	attackingBoard: BoardEntity[],
	attackingBoardHero: BgsPlayerEntity,
	defendingBoard: BoardEntity[],
	defendingBoardHero: BgsPlayerEntity,
	// Apparently, the board composition used for start of combat minion effects (like Red Whelp, and I assume it works the
	// same way for others like Prized Promo Drake or Mantid Queen) is the one that is used before Illidan's effect is handled.
	// Since this also runs before HP start of combat, we probably also use the state as it was before HP were triggered, like
	// Tamsin's Phylactery.
	attackingBoardBefore: BoardEntity[],
	defendingBoardBefore: BoardEntity[],
	allCards: AllCardsService,
	cardsData: CardsData,
	sharedState: SharedState,
	gameState: BgsGameState,
	spectator: Spectator,
): void => {
	// Don't forget to update START_OF_COMBAT_CARD_IDS
	if (attacker.cardId === CardIds.RedWhelp_BGS_019) {
		const damage = attackingBoardBefore
			.map((entity) => allCards.getCard(entity.cardId).races)
			.filter((races) => isCorrectTribe(races, Race.DRAGON)).length;
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
	} else if (attacker.cardId === CardIds.RedWhelp_TB_BaconUps_102) {
		const damage = attackingBoardBefore
			.map((entity) => allCards.getCard(entity.cardId).races)
			.filter((races) => isCorrectTribe(races, Race.DRAGON)).length;
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
	} else if (
		attacker.cardId === CardIds.PrizedPromoDrake_BG21_014 ||
		attacker.cardId === CardIds.PrizedPromoDrake_BG21_014_G
	) {
		const numberOfDragons = attackingBoardBefore
			.map((entity) => allCards.getCard(entity.cardId).races)
			.filter((races) => isCorrectTribe(races, Race.DRAGON)).length;
		const neighbours = getNeighbours(attackingBoard, attacker);
		const multiplier = attacker.cardId === CardIds.PrizedPromoDrake_BG21_014_G ? 2 : 1;
		neighbours.forEach((entity) => {
			modifyAttack(entity, multiplier * numberOfDragons, attackingBoard, allCards);
			modifyHealth(entity, multiplier * numberOfDragons, attackingBoard, allCards);
			afterStatsUpdate(entity, attackingBoard, allCards);
			spectator.registerPowerTarget(attacker, entity, attackingBoard);
		});
	} else if (
		attacker.cardId === CardIds.ChoralMrrrglr_BG26_354 ||
		attacker.cardId === CardIds.ChoralMrrrglr_BG26_354_G
	) {
		// const statsOfMinionsInHand = attackingBoardHero.hand
		// 	.map((c) => (c.attack ?? 0) + (c.health ?? 0))
		// 	.reduce((a, b) => a + b, 0);
		const multiplier = attacker.cardId === CardIds.ChoralMrrrglr_BG26_354_G ? 2 : 1;
		modifyAttack(attacker, multiplier * attackingBoardHero.globalInfo?.ChoralAttackBuff, attackingBoard, allCards);
		modifyHealth(attacker, multiplier * attackingBoardHero.globalInfo?.ChoralHealthBuff, attackingBoard, allCards);
		afterStatsUpdate(attacker, attackingBoard, allCards);
		spectator.registerPowerTarget(attacker, attacker, attackingBoard);
	} else if (
		attacker.cardId === CardIds.AmberGuardian_BG24_500 ||
		attacker.cardId === CardIds.AmberGuardian_BG24_500_G
	) {
		// First try to get a target without divine shield, and if none is available, pick one with divine shield
		const otherDragons = attackingBoard
			.filter((e) => hasCorrectTribe(e, Race.DRAGON, allCards))
			.filter((e) => e.entityId !== attacker.entityId);
		const loops = attacker.cardId === CardIds.AmberGuardian_BG24_500_G ? 2 : 1;
		const dragonsToConsider = otherDragons;
		for (let i = 0; i < loops; i++) {
			const otherDragon =
				pickRandom(dragonsToConsider.filter((e) => !e.divineShield)) ?? pickRandom(dragonsToConsider);
			if (otherDragon) {
				if (!otherDragon.divineShield) {
					updateDivineShield(otherDragon, attackingBoard, true, allCards);
				}
				modifyAttack(otherDragon, 2, attackingBoard, allCards);
				modifyHealth(otherDragon, 2, attackingBoard, allCards);
				afterStatsUpdate(otherDragon, attackingBoard, allCards);
				spectator.registerPowerTarget(attacker, otherDragon, attackingBoard);
				dragonsToConsider.splice(dragonsToConsider.indexOf(otherDragon), 1);
			}
		}
	} else if (
		attacker.cardId === CardIds.SanctumRester_BG26_356 ||
		attacker.cardId === CardIds.SanctumRester_BG26_356_G
	) {
		const buff = attacker.cardId === CardIds.SanctumRester_BG26_356_G ? 16 : 8;
		// First try to get a target without divine shield, and if none is available, pick one with divine shield
		const otherDragons = attackingBoard
			.filter((e) => hasCorrectTribe(e, Race.DRAGON, allCards))
			.filter((e) => e.entityId !== attacker.entityId);
		otherDragons.forEach((otherDragon) => {
			modifyHealth(otherDragon, buff, attackingBoard, allCards);
			afterStatsUpdate(otherDragon, attackingBoard, allCards);
			spectator.registerPowerTarget(attacker, otherDragon, attackingBoard);
		});
	} else if (
		attacker.cardId === CardIds.Soulsplitter_BG25_023 ||
		attacker.cardId === CardIds.Soulsplitter_BG25_023_G
	) {
		const numberOfTargets = attacker.cardId === CardIds.Soulsplitter_BG25_023_G ? 2 : 1;
		for (let i = 0; i < numberOfTargets; i++) {
			const undeadsWithoutReborn = attackingBoard
				.filter((e) => hasCorrectTribe(e, Race.UNDEAD, allCards))
				.filter((e) => !e.reborn);
			const chosenUndead = pickRandom(undeadsWithoutReborn);
			if (chosenUndead) {
				chosenUndead.reborn = true;
				spectator.registerPowerTarget(attacker, chosenUndead, attackingBoard);
			}
		}
	} else if (
		attacker.cardId === CardIds.Crabby_BG22_HERO_000_Buddy ||
		attacker.cardId === CardIds.Crabby_BG22_HERO_000_Buddy_G
	) {
		const neighbours = getNeighbours(attackingBoard, attacker);
		const multiplier = attacker.cardId === CardIds.Crabby_BG22_HERO_000_Buddy_G ? 2 : 1;
		neighbours.forEach((entity) => {
			modifyAttack(entity, multiplier * (attackingBoardHero.deadEyeDamageDone ?? 0), attackingBoard, allCards);
			modifyHealth(entity, multiplier * (attackingBoardHero.deadEyeDamageDone ?? 0), attackingBoard, allCards);
			afterStatsUpdate(entity, attackingBoard, allCards);
			spectator.registerPowerTarget(attacker, entity, attackingBoard);
		});
	} else if (
		attacker.cardId === CardIds.CorruptedMyrmidon_BG23_012 ||
		attacker.cardId === CardIds.CorruptedMyrmidon_BG23_012_G
	) {
		const multiplier = attacker.cardId === CardIds.CorruptedMyrmidon_BG23_012_G ? 2 : 1;
		modifyAttack(attacker, multiplier * attacker.attack, attackingBoard, allCards);
		modifyHealth(attacker, multiplier * attacker.health, attackingBoard, allCards);
		afterStatsUpdate(attacker, attackingBoard, allCards);
		spectator.registerPowerTarget(attacker, attacker, attackingBoard);
	} else if (
		attacker.cardId === CardIds.InterrogatorWhitemane_BG24_704 ||
		attacker.cardId === CardIds.InterrogatorWhitemane_BG24_704_G
	) {
		if (defendingBoard.length > 0) {
			const attackerIndex = attackingBoard.indexOf(attacker);
			const defenderPosition = attackerIndex - (attackingBoard.length - defendingBoard.length) / 2;
			if (Math.round(defenderPosition) === defenderPosition) {
				castImpure(defendingBoard[defenderPosition], attacker, attackingBoard, spectator);
			} else {
				castImpure(defendingBoard[defenderPosition - 0.5], attacker, attackingBoard, spectator);
				castImpure(defendingBoard[defenderPosition + 0.5], attacker, attackingBoard, spectator);
			}
		}
	} else if (attacker.cardId === CardIds.MantidQueen_BG22_402 || attacker.cardId === CardIds.MantidQueen_BG22_402_G) {
		const multiplier = attacker.cardId === CardIds.MantidQueen_BG22_402_G ? 2 : 1;
		const allRaces = attackingBoardBefore
			.map((entity) => entity.cardId)
			.flatMap((cardId) => allCards.getCard(cardId).races)
			.filter((race) => !!race && race !== Race[Race.BLANK]);
		const totalRaces =
			[...new Set(allRaces.filter((race) => race !== Race[Race.ALL]))].length +
			allRaces.filter((race) => race === Race[Race.ALL]).length;
		for (let i = 0; i < multiplier; i++) {
			for (let j = 0; j < totalRaces; j++) {
				const buffType = getRandomMantidQueenBuffType(attacker);
				switch (buffType) {
					case 'stats':
						modifyAttack(attacker, 5, attackingBoard, allCards);
						modifyHealth(attacker, 5, attackingBoard, allCards);
						afterStatsUpdate(attacker, attackingBoard, allCards);
						break;
					case 'reborn':
						attacker.reborn = true;
						break;
					case 'taunt':
						attacker.taunt = true;
						break;
					case 'windfury':
						attacker.windfury = true;
						break;
				}
				spectator.registerPowerTarget(attacker, attacker, attackingBoard);
			}
		}
	} else if (
		attacker.cardId === CardIds.CarbonicCopy_BG27_503 ||
		attacker.cardId === CardIds.CarbonicCopy_BG27_503_G
	) {
		const numberOfCopies = attacker.cardId === CardIds.CarbonicCopy_BG27_503_G ? 2 : 1;
		for (let i = 0; i < numberOfCopies; i++) {
			if (!!attackingBoard.length && attackingBoard.length < 7) {
				const copy: BoardEntity = {
					...attacker,
					lastAffectedByEntity: null,
				};
				const newMinions = spawnEntities(
					copy.cardId,
					1,
					attackingBoard,
					attackingBoardHero,
					defendingBoard,
					defendingBoardHero,
					allCards,
					cardsData,
					sharedState,
					spectator,
					attacker.friendly,
					true,
					false,
					false,
					copy,
				);
				const indexFromRight = attackingBoard.length - (attackingBoard.indexOf(attacker) + 1);
				performEntitySpawns(
					newMinions,
					attackingBoard,
					attackingBoardHero,
					attacker,
					indexFromRight,
					defendingBoard,
					defendingBoardHero,
					allCards,
					cardsData,
					sharedState,
					spectator,
				);
				spectator.registerPowerTarget(attacker, copy, attackingBoard);
			}
		}
	} else if (
		attacker.cardId === CardIds.DiremuckForager_BG27_556 ||
		attacker.cardId === CardIds.DiremuckForager_BG27_556_G
	) {
		const potentialTargets = attackingBoardHero.hand.filter((e) => hasCorrectTribe(e, Race.MURLOC, allCards));
		if (potentialTargets.length > 0) {
			const target = pickRandom(potentialTargets);
			const diremuckBuff = attacker.cardId === CardIds.DiremuckForager_BG27_556_G ? 4 : 2;
			modifyAttack(target, diremuckBuff, attackingBoard, allCards);
			modifyHealth(target, diremuckBuff, attackingBoard, allCards);
			afterStatsUpdate(target, attackingBoard, allCards);
			spectator.registerPowerTarget(attacker, target, attackingBoard);
			if (attackingBoard.length < 7) {
				target.summonedFromHand = true;
				const newMinions = spawnEntities(
					target.cardId,
					1,
					attackingBoard,
					attackingBoardHero,
					defendingBoard,
					defendingBoardHero,
					allCards,
					cardsData,
					sharedState,
					spectator,
					target.friendly,
					false,
					false,
					true,
					{ ...target } as BoardEntity,
				);
				for (const s of newMinions) {
					s.onCanceledSummon = () => (target.summonedFromHand = false);
				}
				performEntitySpawns(
					newMinions,
					attackingBoard,
					attackingBoardHero,
					attacker,
					0,
					defendingBoard,
					defendingBoardHero,
					allCards,
					cardsData,
					sharedState,
					spectator,
				);
			}
		}
	} else if (
		attacker.cardId === CardIds.HawkstriderHerald_BG27_079 ||
		attacker.cardId === CardIds.HawkstriderHerald_BG27_079_G
	) {
		const multiplier = attacker.cardId === CardIds.HawkstriderHerald_BG27_079_G ? 2 : 1;
		for (const entity of attackingBoard) {
			for (let i = 0; i < multiplier; i++) {
				handleDeathrattles(
					attackingBoard,
					attackingBoardHero,
					entity,
					attackingBoard.length - 1 - attackingBoard.indexOf(entity),
					defendingBoard,
					defendingBoardHero,
					[],
					allCards,
					cardsData,
					sharedState,
					spectator,
				);
			}
		}
	} else if (
		attacker.cardId === CardIds.AudaciousAnchor_BG28_904 ||
		attacker.cardId === CardIds.AudaciousAnchor_BG28_904_G
	) {
		const iterations = attacker.cardId === CardIds.AudaciousAnchor_BG28_904_G ? 2 : 1;
		for (let i = 0; i < iterations; i++) {
			const targets = findNearestEnemies(
				attackingBoard,
				attacker,
				attackingBoard.length - 1 - attackingBoard.indexOf(attacker),
				defendingBoard,
				1,
				allCards,
			);
			if (!targets.length) {
				break;
			}

			const target = targets[0];
			let battleAttacker = attacker;
			let battleDefender = target;
			while (
				battleAttacker.health > 0 &&
				battleDefender.health > 0 &&
				!battleAttacker.definitelyDead &&
				!battleDefender.definitelyDead
			) {
				doFullAttack(
					battleAttacker,
					attackingBoard,
					attackingBoardHero,
					battleDefender,
					defendingBoard,
					defendingBoardHero,
					allCards,
					cardsData,
					sharedState,
					spectator,
				);
				battleAttacker = target;
				battleDefender = attacker;
			}
		}
	}
};

const applyAllWillBurn = (
	board1: BoardEntity[],
	board2: BoardEntity[],
	sourceEntity: BgsPlayerEntity | BoardEntity,
	allCards: AllCardsService,
	spectator: Spectator,
): void => {
	for (const entity of board1) {
		modifyAttack(entity, 2, board1, allCards);
		afterStatsUpdate(entity, board1, allCards);
		spectator.registerPowerTarget(sourceEntity, entity, board1);
	}
	for (const entity of board2) {
		modifyAttack(entity, 2, board2, allCards);
		afterStatsUpdate(entity, board2, allCards);
		spectator.registerPowerTarget(sourceEntity, entity, board2);
	}
};

const castImpure = (entity: BoardEntity, source: BoardEntity, board: BoardEntity[], spectator: Spectator) => {
	if (!entity) {
		return;
	}
	const multiplier = source.cardId === CardIds.InterrogatorWhitemane_BG24_704_G ? 3 : 2;
	entity.taunt = true;
	entity.damageMultiplier = entity.damageMultiplier ?? 1;
	entity.damageMultiplier *= multiplier;
	spectator.registerPowerTarget(source, entity, board);
};

const getRandomMantidQueenBuffType = (entity: BoardEntity): 'stats' | 'reborn' | 'windfury' | 'taunt' => {
	const possibilities: ('stats' | 'reborn' | 'windfury' | 'taunt')[] = ['stats'];
	if (!entity.reborn) {
		possibilities.push('reborn');
	}
	if (!entity.windfury) {
		possibilities.push('windfury');
	}
	if (!entity.taunt) {
		possibilities.push('taunt');
	}
	return pickRandom(possibilities);
};
