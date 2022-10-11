/* eslint-disable @typescript-eslint/no-use-before-define */
import { AllCardsService, CardIds, Race } from '@firestone-hs/reference-data';
import { BgsGameState } from '../bgs-battle-info';
import { BgsPlayerEntity } from '../bgs-player-entity';
import { BoardEntity } from '../board-entity';
import { CardsData, START_OF_COMBAT_CARD_IDS } from '../cards/cards-data';
import { pickMultipleRandomDifferent, pickRandom } from '../services/utils';
import { afterStatsUpdate, isCorrectTribe, makeMinionGolden, modifyAttack, modifyHealth, stringifySimple } from '../utils';
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
	if (playerHeroPowerId === CardIds.SwattingInsectsBattlegrounds && playerBoard.length > 0) {
		// Should be sent by the app, but it is an idempotent operation, so we can just reapply it here
		handleAlakirForPlayer(playerBoard, playerEntity, opponentBoard, opponentEntity, allCards, spawns, sharedState, spectator);
	} else if (playerEntity.heroPowerUsed && playerHeroPowerId === CardIds.EarthInvocationToken) {
		applyEarthInvocationEnchantment(playerBoard, null, playerEntity, allCards, sharedState, spectator);
	} else if (playerEntity.heroPowerUsed && playerHeroPowerId === CardIds.WaterInvocationToken) {
		applyWaterInvocationEnchantment(playerBoard, null, playerEntity, allCards, spectator);
	} else if (playerEntity.heroPowerUsed && playerHeroPowerId === CardIds.FireInvocationToken) {
		applyFireInvocationEnchantment(playerBoard, null, playerEntity, allCards, spectator);
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
	processMinionDeath(playerBoard, playerEntity, opponentBoard, opponentEntity, allCards, cardsData, sharedState, spectator);
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
	const opponentAttackers = opponentBoard.filter((entity) => START_OF_COMBAT_CARD_IDS.includes(entity.cardId as CardIds));
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
						entityId: sharedState.currentEntityId++,
					};
					const index = playerBoard.indexOf(highestHealthMinion);
					// Insert the copy at the right of the minion
					playerBoard.splice(index + 1, 0, copy);
					// playerBoard.push(copy);
					spectator.registerPowerTarget(playerEntity, copy, playerBoard);
				}
				break;
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
					makeMinionGolden(playerBoard[0], playerEntity, playerBoard, allCards, spectator);
				}
				if (playerBoard.length > 1) {
					makeMinionGolden(playerBoard[playerBoard.length - 1], playerEntity, playerBoard, allCards, spectator);
				}
				break;
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
	const attackingHeroPowerId = playerEntity.heroPowerId || getHeroPowerForHero(playerEntity.cardId);
	const defendingHeroPowerId = opponentEntity.heroPowerId || getHeroPowerForHero(opponentEntity.cardId);
	const numberOfDeathwingPresents =
		(attackingHeroPowerId === CardIds.AllWillBurnBattlegrounds ? 1 : 0) +
		(defendingHeroPowerId === CardIds.AllWillBurnBattlegrounds ? 1 : 0);
	const isSmokingGunPresentForAttacker = playerEntity.questRewards?.includes(CardIds.TheSmokingGun);
	const isSmokingGunPresentForDefender = opponentEntity.questRewards?.includes(CardIds.TheSmokingGun);
	applyAuras(playerBoard, numberOfDeathwingPresents, isSmokingGunPresentForAttacker, cardsData, allCards, sharedState);
	applyAuras(opponentBoard, numberOfDeathwingPresents, isSmokingGunPresentForDefender, cardsData, allCards, sharedState);

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
	const firstAttacker = playerBoard[0];
	const secondAttacker = minionsAtStart > 1 ? playerBoard[playerBoard.length - 1] : null;

	modifyAttack(firstAttacker, 2, playerBoard, allCards);
	afterStatsUpdate(firstAttacker, playerBoard, allCards);
	spectator.registerPowerTarget(firstAttacker, firstAttacker, playerBoard);
	if (
		playerBoard.map((e) => e.cardId).includes(CardIds.EclipsionIllidariBattlegrounds_TB_BaconShop_HERO_08_Buddy) ||
		playerBoard.map((e) => e.cardId).includes(CardIds.EclipsionIllidariBattlegrounds_TB_BaconShop_HERO_08_Buddy_G)
	) {
		firstAttacker.immuneWhenAttackCharges = 1;
	}
	simulateAttack(playerBoard, playerEntity, opponentBoard, opponentEntity, undefined, allCards, spawns, sharedState, spectator, 0);

	if (!!secondAttacker && !secondAttacker.definitelyDead && secondAttacker.health > 0) {
		modifyAttack(secondAttacker, 2, playerBoard, allCards);
		afterStatsUpdate(secondAttacker, playerBoard, allCards);
		spectator.registerPowerTarget(secondAttacker, secondAttacker, playerBoard);
		if (playerBoard.map((e) => e.cardId).includes(CardIds.EclipsionIllidariBattlegrounds_TB_BaconShop_HERO_08_Buddy_G)) {
			secondAttacker.immuneWhenAttackCharges = 1;
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
	if (!chosenEntity) {
		console.warn('could not pick any entity for tamsin', stringifySimple(entitiesWithLowestHealth, allCards));
		return;
	}
	const newBoard = playerBoard.filter((e) => e.entityId !== chosenEntity.entityId);
	const buffedEntities = pickMultipleRandomDifferent(newBoard, 5);
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
	let shouldRecomputeCurrentAttacker = false;
	const playerHeroPowerId = playerEntity.heroPowerId || getHeroPowerForHero(playerEntity.cardId);
	if (playerEntity.heroPowerUsed && playerHeroPowerId === CardIds.TamsinRoame_FragrantPhylactery) {
		handleTamsinForPlayer(playerBoard, playerEntity, opponentBoard, opponentEntity, allCards, cardsData, sharedState, spectator);
		// Tamsin's hero power somehow happens before the current attacker is chosen.
		// See http://replays.firestoneapp.com/?reviewId=bce94e6b-c807-48e4-9c72-2c5c04421213&turn=6&action=9
		shouldRecomputeCurrentAttacker = true;
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
		// processMinionDeath(playerBoard, playerEntity, opponentBoard, opponentEntity, allCards, cardsData, sharedState, spectator);
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
			playerEntity.heroPowerInfo ?? 0,
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
			playerEntity.heroPowerInfo ?? 0,
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
	processMinionDeath(playerBoard, playerEntity, opponentBoard, opponentEntity, allCards, cardsData, sharedState, spectator);
	if (shouldRecomputeCurrentAttacker) {
		currentAttacker = playerBoard.length > opponentBoard.length ? 0 : opponentBoard.length > playerBoard.length ? 1 : currentAttacker;
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
	const attackingHeroPowerId = attackingBoardHero.heroPowerId || getHeroPowerForHero(attackingBoardHero.cardId);
	const defendingHeroPowerId = defendingBoardHero.heroPowerId || getHeroPowerForHero(defendingBoardHero.cardId);
	const numberOfDeathwingPresents =
		(attackingHeroPowerId === CardIds.AllWillBurnBattlegrounds ? 1 : 0) +
		(defendingHeroPowerId === CardIds.AllWillBurnBattlegrounds ? 1 : 0);
	const isSmokingGunPresentForAttacker = attackingBoardHero.questRewards?.includes(CardIds.TheSmokingGun);
	const isSmokingGunPresentForDefender = defendingBoardHero.questRewards?.includes(CardIds.TheSmokingGun);
	applyAuras(attackingBoard, numberOfDeathwingPresents, isSmokingGunPresentForAttacker, cardsData, allCards, sharedState);
	applyAuras(defendingBoard, numberOfDeathwingPresents, isSmokingGunPresentForDefender, cardsData, allCards, sharedState);

	// Don't forget to update START_OF_COMBAT_CARD_IDS
	if (attacker.cardId === CardIds.RedWhelp) {
		const damage = attackingBoardBefore
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
		const damage = attackingBoardBefore
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
		const numberOfDragons = attackingBoardBefore
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
		const dragons = attackingBoardBefore
			.map((entity) => allCards.getCard(entity.cardId).race)
			.filter((race) => isCorrectTribe(race, Race.DRAGON)).length;
		const neighbours = getNeighbours(attackingBoard, attacker);
		neighbours.forEach((entity) => {
			modifyAttack(entity, 2 * dragons, attackingBoard, allCards);
			modifyHealth(entity, 2 * dragons, attackingBoard, allCards);
			afterStatsUpdate(entity, attackingBoard, allCards);
			spectator.registerPowerTarget(attacker, entity, attackingBoard);
		});
	} else if (attacker.cardId === CardIds.AmberGuardian || attacker.cardId === CardIds.AmberGuardianBattlegrounds) {
		// First try to get a target without divine shield, and if none is available, pick one with divine shield
		const otherDragon =
			pickRandom(attackingBoard.filter((e) => e.entityId !== attacker.entityId).filter((e) => !e.divineShield)) ??
			pickRandom(attackingBoard.filter((e) => e.entityId !== attacker.entityId));
		if (otherDragon) {
			otherDragon.divineShield = true;
			modifyAttack(otherDragon, attacker.cardId === CardIds.AmberGuardianBattlegrounds ? 4 : 2, attackingBoard, allCards);
			modifyHealth(otherDragon, attacker.cardId === CardIds.AmberGuardianBattlegrounds ? 4 : 2, attackingBoard, allCards);
			afterStatsUpdate(otherDragon, attackingBoard, allCards);
			spectator.registerPowerTarget(attacker, otherDragon, attackingBoard);
		}
	} else if (attacker.cardId === CardIds.Crabby_BG22_HERO_000_Buddy || attacker.cardId === CardIds.CrabbyBattlegrounds) {
		const neighbours = getNeighbours(attackingBoard, attacker);
		const multiplier = attacker.cardId === CardIds.CrabbyBattlegrounds ? 2 : 1;
		neighbours.forEach((entity) => {
			modifyAttack(entity, multiplier * (attackingBoardHero.deadEyeDamageDone ?? 0), attackingBoard, allCards);
			modifyHealth(entity, multiplier * (attackingBoardHero.deadEyeDamageDone ?? 0), attackingBoard, allCards);
			afterStatsUpdate(entity, attackingBoard, allCards);
			spectator.registerPowerTarget(attacker, entity, attackingBoard);
		});
	} else if (attacker.cardId === CardIds.CorruptedMyrmidon || attacker.cardId === CardIds.CorruptedMyrmidonBattlegrounds) {
		const multiplier = attacker.cardId === CardIds.CorruptedMyrmidonBattlegrounds ? 2 : 1;
		modifyAttack(attacker, multiplier * attacker.attack, attackingBoard, allCards);
		modifyHealth(attacker, multiplier * attacker.health, attackingBoard, allCards);
		afterStatsUpdate(attacker, attackingBoard, allCards);
		spectator.registerPowerTarget(attacker, attacker, attackingBoard);
	} else if (attacker.cardId === CardIds.MantidQueen || attacker.cardId === CardIds.MantidQueenBattlegrounds) {
		const multiplier = attacker.cardId === CardIds.MantidQueenBattlegrounds ? 2 : 1;
		const allRaces = attackingBoardBefore
			.map((entity) => entity.cardId)
			.map((cardId) => allCards.getCard(cardId).race)
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
					case 'divine-shield':
						attacker.divineShield = true;
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
	}
	removeAuras(attackingBoard, cardsData);
	removeAuras(defendingBoard, cardsData);
};

const getRandomMantidQueenBuffType = (entity: BoardEntity): 'stats' | 'divine-shield' | 'windfury' | 'taunt' => {
	const possibilities: ('stats' | 'divine-shield' | 'windfury' | 'taunt')[] = ['stats'];
	if (!entity.divineShield) {
		possibilities.push('divine-shield');
	}
	if (!entity.windfury) {
		possibilities.push('windfury');
	}
	if (!entity.taunt) {
		possibilities.push('taunt');
	}
	return pickRandom(possibilities);
};
