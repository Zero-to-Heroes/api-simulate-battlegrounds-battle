/* eslint-disable @typescript-eslint/no-use-before-define */
import { ALL_BG_RACES, AllCardsService, CardIds, CardType, Race } from '@firestone-hs/reference-data';
import { BgsPlayerEntity } from '../bgs-player-entity';
import { BoardEntity } from '../board-entity';
import { pickRandom, pickRandomLowestHealth, shuffleArray } from '../services/utils';
import {
	addImpliedMechanics,
	addStatsToBoard,
	getMinionsOfDifferentTypes,
	getRandomMinionWithHighestHealth,
	getTeammateInitialState,
	hasCorrectTribe,
	isGolden,
	updateDivineShield,
} from '../utils';
import { removeAurasFromSelf } from './add-minion-to-board';
import {
	dealDamageToMinion,
	dealDamageToRandomEnemy,
	doFullAttack,
	findNearestEnemies,
	getNeighbours,
	processMinionDeath,
	simulateAttack,
} from './attack';
import { addCardsInHand } from './cards-in-hand';
import {
	applyEarthInvocationEnchantment,
	applyFireInvocationEnchantment,
	applyLightningInvocationEnchantment,
	applyWaterInvocationEnchantment,
	rememberDeathrattles,
} from './deathrattle-effects';
import { handleDeathrattles } from './deathrattle-orchestration';
import { spawnEntities } from './deathrattle-spawns';
import { FullGameState } from './internal-game-state';
import { performEntitySpawns } from './spawns';
import { Spectator } from './spectator/spectator';
import { applyAfterStatsUpdate, modifyStats } from './stats';
import { handleSummonsWhenSpace } from './summon-when-space';
import { makeMinionGolden } from './utils/golden';

// TODO 20/04/2024: I'm not too sure about some ordering. The way I understand it, the Start of Combat has
// multiple phases, and in each phase the player order is random
// However, looking at http://replays.firestoneapp.com/?reviewId=a577602e-06f3-4c4b-928d-36ea98c2e6d5&turn=5&action=0,
// it feels that a "start of combat" minion effect could trigger before an opponent's hero power effect
// Or is that limited to Bru'kan?
// I feel that I've asked a lot of questions recently, so I don't want to add that one to the list, as the interaction
// is for now pretty marginal
export const handleStartOfCombat = (
	playerEntity: BgsPlayerEntity,
	playerBoard: BoardEntity[],
	opponentEntity: BgsPlayerEntity,
	opponentBoard: BoardEntity[],
	currentAttacker: number,
	gameState: FullGameState,
): number => {
	handleSummonsWhenSpace(playerBoard, playerEntity, opponentBoard, opponentEntity, gameState);
	const shouldRecomputeCurrentAttacker = true;
	if (shouldRecomputeCurrentAttacker) {
		currentAttacker =
			playerBoard.length > opponentBoard.length
				? 0
				: opponentBoard.length > playerBoard.length
				? 1
				: Math.round(Math.random());
	}

	// https://twitter.com/DCalkosz/status/1564705111850434561
	currentAttacker = handleStartOfCombatQuestRewards(
		playerEntity,
		playerBoard,
		opponentEntity,
		opponentBoard,
		currentAttacker,
		gameState,
	);
	currentAttacker = handleStartOfCombatAnomalies(
		playerEntity,
		playerBoard,
		opponentEntity,
		opponentBoard,
		currentAttacker,
		gameState,
	);
	// https://twitter.com/DCalkosz/status/1488361384320528388?s=20&t=1ECxRZFdjqwEa2fRsXk32Q
	// There’s a certain order for Start of Combat hero powers, rather than “coin flips” where
	// an unlucky trigger order could mess up some positioning you had planned for your own hero
	// power. “Precombat” (Al’Akir, Y’Shaarj), then Illidan, then others.
	// Update: this seems to have changed: https://x.com/LoewenMitchell/status/1737588920139825335?s=20
	// now you have all hero powers trigger in a first phase, then you have Illidan, and once everything has triggered, you have Tavish
	currentAttacker = handlePreCombatHeroPowers(
		playerEntity,
		playerBoard,
		opponentEntity,
		opponentBoard,
		currentAttacker,
		gameState,
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
		gameState,
	);
	currentAttacker = handleStartOfCombatHeroPowers(
		playerEntity,
		playerBoard,
		opponentEntity,
		opponentBoard,
		currentAttacker,
		gameState,
	);
	// Timing confirmed by Mitchell on Discord on 2024-02-21
	currentAttacker = handleStartOfCombatSpells(
		playerEntity,
		playerBoard,
		opponentEntity,
		opponentBoard,
		currentAttacker,
		gameState,
	);
	// Not sure if this can change who the first player will be
	// I don't have any official source on it at the moment, but there are some simulation
	handleStartOfCombatMinions(
		playerEntity,
		playerBoard,
		opponentEntity,
		opponentBoard,
		currentAttacker,
		playerBoardBefore,
		opponentBoardBefore,
		gameState,
	);
	playerEntity.startOfCombatDone = true;
	opponentEntity.startOfCombatDone = true;
	applyAfterStatsUpdate(gameState);
	return currentAttacker;
};

const handlePreCombatHeroPowers = (
	playerEntity: BgsPlayerEntity,
	playerBoard: BoardEntity[],
	opponentEntity: BgsPlayerEntity,
	opponentBoard: BoardEntity[],
	currentAttacker: number,
	gameState: FullGameState,
): number => {
	if (Math.random() < 0.5) {
		currentAttacker = handlePreCombatHeroPowersForPlayer(
			playerEntity,
			playerBoard,
			opponentEntity,
			opponentBoard,
			currentAttacker,
			true,
			gameState,
		);
		currentAttacker = handlePreCombatHeroPowersForPlayer(
			opponentEntity,
			opponentBoard,
			playerEntity,
			playerBoard,
			currentAttacker,
			false,
			gameState,
		);
	} else {
		currentAttacker = handlePreCombatHeroPowersForPlayer(
			opponentEntity,
			opponentBoard,
			playerEntity,
			playerBoard,
			currentAttacker,
			false,
			gameState,
		);
		currentAttacker = handlePreCombatHeroPowersForPlayer(
			playerEntity,
			playerBoard,
			opponentEntity,
			opponentBoard,
			currentAttacker,
			true,
			gameState,
		);
	}
	handleSummonsWhenSpace(playerBoard, playerEntity, opponentBoard, opponentEntity, gameState);
	return currentAttacker;
};

const handlePreCombatHeroPowersForPlayer = (
	playerEntity: BgsPlayerEntity,
	playerBoard: BoardEntity[],
	opponentEntity: BgsPlayerEntity,
	opponentBoard: BoardEntity[],
	currentAttacker: number,
	friendly: boolean,
	gameState: FullGameState,
): number => {
	if (playerEntity.startOfCombatDone || playerEntity.hpLeft <= 0) {
		return currentAttacker;
	}

	let shouldRecomputeCurrentAttacker = false;
	// Some are part of the incoming board: Y'Shaarj, Lich King, Ozumat
	// Since the order is not important here, we just always do the player first
	const playerHeroPowerId = playerEntity.heroPowerId || getHeroPowerForHero(playerEntity.cardId);
	if (playerHeroPowerId === CardIds.SwattingInsects && playerBoard.length > 0) {
		// Should be sent by the app, but it is an idempotent operation, so we can just reapply it here
		handleAlakirForPlayer(playerBoard, playerEntity, opponentBoard, opponentEntity, gameState);
	} else if (playerEntity.heroPowerUsed && playerHeroPowerId === CardIds.EarthInvocationToken) {
		applyEarthInvocationEnchantment(playerBoard, null, playerEntity, gameState);
	} else if (playerEntity.heroPowerUsed && playerHeroPowerId === CardIds.WaterInvocationToken) {
		applyWaterInvocationEnchantment(playerBoard, playerEntity, null, playerEntity, gameState);
	} else if (playerEntity.heroPowerUsed && playerHeroPowerId === CardIds.FireInvocationToken) {
		applyFireInvocationEnchantment(playerBoard, playerEntity, null, playerEntity, gameState);
	} else if (playerHeroPowerId === CardIds.AllWillBurn) {
		applyAllWillBurn(playerBoard, playerEntity, opponentBoard, opponentEntity, playerEntity, gameState);
	} else if (playerEntity.heroPowerUsed && playerHeroPowerId === CardIds.TamsinRoame_FragrantPhylactery) {
		handleTamsinForPlayer(playerBoard, playerEntity, opponentBoard, opponentEntity, gameState);
		// Tamsin's hero power somehow happens before the current attacker is chosen.
		// See http://replays.firestoneapp.com/?reviewId=bce94e6b-c807-48e4-9c72-2c5c04421213&turn=6&action=9
		// Even worse: if a scallywag token pops, it attacks before the first attacker is recomputed
		shouldRecomputeCurrentAttacker = true;
	} else if (playerEntity.heroPowerUsed && playerHeroPowerId === CardIds.EmbraceYourRage) {
		handleEmbraceYourRageForPlayer(playerBoard, playerEntity, opponentBoard, opponentEntity, gameState);
		shouldRecomputeCurrentAttacker = true;
	} else if (playerEntity.heroPowerUsed && playerHeroPowerId === CardIds.RebornRites) {
		handleRebornRitesForPlayer(playerBoard, playerEntity, opponentBoard, opponentEntity, gameState);
	} else if (playerEntity.heroPowerUsed && playerHeroPowerId === CardIds.TeronGorefiend_RapidReanimation) {
		shouldRecomputeCurrentAttacker = handleTeronForPlayer(
			playerBoard,
			playerEntity,
			opponentBoard,
			opponentEntity,
			gameState,
		);
		// Same as Tamsin? No, because the new minion should repop automatically
	} else if (playerEntity.heroPowerUsed && playerHeroPowerId === CardIds.WaxWarband) {
		handleWaxWarbandForPlayer(playerBoard, playerEntity, opponentBoard, opponentEntity, gameState);
	} else if (playerEntity.heroPowerUsed && playerHeroPowerId === CardIds.LightningInvocationToken) {
		applyLightningInvocationEnchantment(playerBoard, playerEntity, null, opponentBoard, opponentEntity, gameState);
	} else if (
		playerEntity.heroPowerUsed &&
		playerHeroPowerId === CardIds.FlobbidinousFloop_GloriousGloop_BGDUO_HERO_101p
	) {
		applyGloriousGloop(playerBoard, playerEntity, opponentBoard, opponentEntity, gameState);
	}

	processMinionDeath(playerBoard, playerEntity, opponentBoard, opponentEntity, gameState);
	if (shouldRecomputeCurrentAttacker) {
		currentAttacker =
			playerBoard.length > opponentBoard.length
				? friendly
					? 0
					: 1
				: opponentBoard.length > playerBoard.length
				? friendly
					? 1
					: 0
				: Math.round(Math.random());
	}

	return currentAttacker;
};

export const handleIllidanHeroPowers = (
	playerEntity: BgsPlayerEntity,
	playerBoard: BoardEntity[],
	opponentEntity: BgsPlayerEntity,
	opponentBoard: BoardEntity[],
	currentAttacker: number,
	gameState: FullGameState,
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
			gameState,
		);
		currentAttacker = handlePlayerIllidanHeroPowers(
			opponentEntity,
			opponentBoard,
			playerEntity,
			playerBoard,
			currentAttacker,
			false,
			gameState,
		);
	} else {
		currentAttacker = handlePlayerIllidanHeroPowers(
			opponentEntity,
			opponentBoard,
			playerEntity,
			playerBoard,
			currentAttacker,
			false,
			gameState,
		);
		currentAttacker = handlePlayerIllidanHeroPowers(
			playerEntity,
			playerBoard,
			opponentEntity,
			opponentBoard,
			currentAttacker,
			true,
			gameState,
		);
	}
	processMinionDeath(playerBoard, playerEntity, opponentBoard, opponentEntity, gameState);
	handleSummonsWhenSpace(playerBoard, playerEntity, opponentBoard, opponentEntity, gameState);
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
	gameState: FullGameState,
): number => {
	let attackerForStart = Math.random() < 0.5 ? 0 : 1;
	const playerAttackers = [...playerBoard]; //.filter((entity) => START_OF_COMBAT_CARD_IDS.includes(entity.cardId as CardIds));
	const opponentAttackers = [...opponentBoard]; //.filter((entity) =>
	// 	START_OF_COMBAT_CARD_IDS.includes(entity.cardId as CardIds),
	// );

	while (playerAttackers.length > 0 || opponentAttackers.length > 0) {
		let shouldUpdateNextPlayer = false;
		if (attackerForStart === 0 && playerAttackers.length > 0) {
			const attacker = playerAttackers.splice(0, 1)[0];
			if (attacker.health <= 0 || attacker.definitelyDead) {
				continue;
			}
			shouldUpdateNextPlayer = performStartOfCombatMinionsForPlayer(
				attacker,
				playerBoard,
				playerEntity,
				opponentBoard,
				opponentEntity,
				playerBoardBefore,
				opponentBoardBefore,
				gameState,
			);
		} else if (attackerForStart === 0 && playerAttackers.length === 0) {
			shouldUpdateNextPlayer = true;
		} else if (attackerForStart === 1 && opponentAttackers.length > 0) {
			const attacker = opponentAttackers.splice(0, 1)[0];
			if (attacker.health <= 0 || attacker.definitelyDead) {
				continue;
			}
			shouldUpdateNextPlayer = performStartOfCombatMinionsForPlayer(
				attacker,
				opponentBoard,
				opponentEntity,
				playerBoard,
				playerEntity,
				opponentBoardBefore,
				playerBoardBefore,
				gameState,
			);
		} else if (attackerForStart === 1 && opponentAttackers.length === 0) {
			shouldUpdateNextPlayer = true;
		}

		if (shouldUpdateNextPlayer) {
			attackerForStart = (attackerForStart + 1) % 2;
		}
	}
	return currentAttacker;
};

const handleStartOfCombatQuestRewards = (
	playerEntity: BgsPlayerEntity,
	playerBoard: BoardEntity[],
	opponentEntity: BgsPlayerEntity,
	opponentBoard: BoardEntity[],
	currentAttacker: number,
	gameState: FullGameState,
): number => {
	if (Math.random() < 0.5) {
		currentAttacker = handleStartOfCombatQuestRewardsForPlayer(
			playerEntity,
			playerBoard,
			opponentEntity,
			opponentBoard,
			currentAttacker,
			gameState,
			true,
		);
		currentAttacker = handleStartOfCombatQuestRewardsForPlayer(
			opponentEntity,
			opponentBoard,
			playerEntity,
			playerBoard,
			currentAttacker,
			gameState,
			false,
		);
	} else {
		currentAttacker = handleStartOfCombatQuestRewardsForPlayer(
			opponentEntity,
			opponentBoard,
			playerEntity,
			playerBoard,
			currentAttacker,
			gameState,
			false,
		);
		currentAttacker = handleStartOfCombatQuestRewardsForPlayer(
			playerEntity,
			playerBoard,
			opponentEntity,
			opponentBoard,
			currentAttacker,
			gameState,
			true,
		);
	}

	handleSummonsWhenSpace(playerBoard, playerEntity, opponentBoard, opponentEntity, gameState);
	return currentAttacker;
};

const handleStartOfCombatSpells = (
	playerEntity: BgsPlayerEntity,
	playerBoard: BoardEntity[],
	opponentEntity: BgsPlayerEntity,
	opponentBoard: BoardEntity[],
	currentAttacker: number,
	gameState: FullGameState,
): number => {
	if (Math.random() < 0.5) {
		currentAttacker = handleStartOfCombatSpellsForPlayer(
			playerEntity,
			playerBoard,
			opponentEntity,
			opponentBoard,
			currentAttacker,
			gameState,
		);
		currentAttacker = handleStartOfCombatSpellsForPlayer(
			opponentEntity,
			opponentBoard,
			playerEntity,
			playerBoard,
			currentAttacker,
			gameState,
		);
	} else {
		currentAttacker = handleStartOfCombatSpellsForPlayer(
			opponentEntity,
			opponentBoard,
			playerEntity,
			playerBoard,
			currentAttacker,
			gameState,
		);
		currentAttacker = handleStartOfCombatSpellsForPlayer(
			playerEntity,
			playerBoard,
			opponentEntity,
			opponentBoard,
			currentAttacker,
			gameState,
		);
	}
	handleSummonsWhenSpace(playerBoard, playerEntity, opponentBoard, opponentEntity, gameState);
	return currentAttacker;
};

const handleStartOfCombatAnomalies = (
	playerEntity: BgsPlayerEntity,
	playerBoard: BoardEntity[],
	opponentEntity: BgsPlayerEntity,
	opponentBoard: BoardEntity[],
	currentAttacker: number,
	gameState: FullGameState,
): number => {
	currentAttacker = handleStartOfCombatAnomaliesForPlayer(
		playerEntity,
		playerBoard,
		opponentEntity,
		opponentBoard,
		currentAttacker,
		gameState,
	);
	currentAttacker = handleStartOfCombatAnomaliesForPlayer(
		opponentEntity,
		opponentBoard,
		playerEntity,
		playerBoard,
		currentAttacker,
		gameState,
	);
	handleSummonsWhenSpace(playerBoard, playerEntity, opponentBoard, opponentEntity, gameState);
	return currentAttacker;
};

const handleStartOfCombatQuestRewardsForPlayer = (
	playerEntity: BgsPlayerEntity,
	playerBoard: BoardEntity[],
	opponentEntity: BgsPlayerEntity,
	opponentBoard: BoardEntity[],
	currentAttacker: number,
	gameState: FullGameState,
	playerIsFriendly: boolean,
): number => {
	if (playerEntity.startOfCombatDone) {
		return currentAttacker;
	}

	for (const trinket of playerEntity.trinkets) {
		switch (trinket.cardId) {
			case CardIds.HolyMallet:
				if (playerBoard.length > 0) {
					updateDivineShield(playerBoard[0], playerBoard, true, gameState.allCards);
					gameState.spectator.registerPowerTarget(playerEntity, playerBoard[0], playerBoard, null, null);
					if (playerBoard.length > 1) {
						updateDivineShield(playerBoard[1], playerBoard, true, gameState.allCards);
						gameState.spectator.registerPowerTarget(playerEntity, playerBoard[1], playerBoard, null, null);
					}
				}
				break;
			case CardIds.ValorousMedallion:
				addStatsToBoard(trinket, playerBoard, playerEntity, 2, 2, gameState);
				break;
		}
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
						gameState.allCards,
						gameState.cardsData,
						gameState.sharedState,
						gameState.spectator,
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
						gameState,
					);
					gameState.spectator.registerPowerTarget(playerEntity, copy, playerBoard, null, null);
					// Recompute first attacker
					// See https://replays.firestoneapp.com/?reviewId=93229c4a-d864-4196-83dd-2fea2a5bf70a&turn=29&action=0
					return playerBoard.length > opponentBoard.length
						? playerIsFriendly
							? 0
							: 1
						: opponentBoard.length > playerBoard.length
						? playerIsFriendly
							? 1
							: 0
						: Math.round(Math.random());
				}
				break;
			case CardIds.StaffOfOrigination_BG24_Reward_312:
				playerBoard.forEach((entity) => {
					modifyStats(entity, 15, 15, playerBoard, playerEntity, gameState);
					gameState.spectator.registerPowerTarget(playerEntity, entity, playerBoard, null, null);
				});
				break;
			case CardIds.StolenGold:
				if (playerBoard.length > 0) {
					makeMinionGolden(playerBoard[0], playerEntity, playerBoard, playerEntity, gameState);
				}
				if (playerBoard.length > 1) {
					makeMinionGolden(
						playerBoard[playerBoard.length - 1],
						playerEntity,
						playerBoard,
						playerEntity,
						gameState,
					);
				}
				break;
		}
	}

	return currentAttacker;
};

const handleStartOfCombatSpellsForPlayer = (
	playerEntity: BgsPlayerEntity,
	playerBoard: BoardEntity[],
	opponentEntity: BgsPlayerEntity,
	opponentBoard: BoardEntity[],
	currentAttacker: number,
	gameState: FullGameState,
): number => {
	if (playerEntity.startOfCombatDone) {
		return currentAttacker;
	}
	if (!playerEntity.secrets?.length) {
		return currentAttacker;
	}
	for (const secret of playerEntity.secrets) {
		switch (secret.cardId) {
			case CardIds.UpperHand_BG28_573:
				if (!!opponentBoard.length) {
					const target = pickRandom(opponentBoard);
					target.health = 1;
					target.maxHealth = 1;
					gameState.spectator.registerPowerTarget(playerEntity, target, opponentBoard, null, null);
				}
				break;
			case CardIds.BoonOfBeetles_BG28_603:
				secret.scriptDataNum1 = secret.scriptDataNum1 ?? 1;
				break;
			case CardIds.FleetingVigor_BG28_519:
				addStatsToBoard(secret, playerBoard, playerEntity, 2, 1, gameState);
				break;
			case CardIds.ToxicTumbleweed_BG28_641:
				if (playerBoard.length < 7) {
					const newMinions = spawnEntities(
						CardIds.ToxicTumbleweed_TumblingAssassinToken_BG28_641t,
						1,
						playerBoard,
						playerEntity,
						opponentBoard,
						opponentEntity,
						gameState.allCards,
						gameState.cardsData,
						gameState.sharedState,
						gameState.spectator,
						playerEntity.friendly,
						true,
						false,
						false,
					);
					newMinions[0].attackImmediately = true;
					performEntitySpawns(
						newMinions,
						playerBoard,
						playerEntity,
						null,
						0,
						opponentBoard,
						opponentEntity,
						gameState,
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
	gameState: FullGameState,
): number => {
	if (!gameState.anomalies?.length || playerEntity.startOfCombatDone) {
		return currentAttacker;
	}
	for (const anomaly of gameState.anomalies) {
		switch (anomaly) {
			case CardIds.BlessedOrBlighted_BG27_Anomaly_726:
				if (playerBoard.length > 0) {
					const dsTarget = playerBoard[0];
					updateDivineShield(dsTarget, playerBoard, true, gameState.allCards);
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
						gameState.allCards,
						gameState.cardsData,
						gameState.sharedState,
						gameState.spectator,
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
						gameState,
					);
					gameState.spectator.registerPowerTarget(playerEntity, copy, playerBoard, null, null);
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
	gameState: FullGameState,
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
			gameState,
		);
		currentAttacker = handlePlayerStartOfCombatHeroPowers(
			opponentEntity,
			opponentBoard,
			playerEntity,
			playerBoard,
			currentAttacker,
			false,
			gameState,
		);
	} else {
		currentAttacker = handlePlayerStartOfCombatHeroPowers(
			opponentEntity,
			opponentBoard,
			playerEntity,
			playerBoard,
			currentAttacker,
			false,
			gameState,
		);
		currentAttacker = handlePlayerStartOfCombatHeroPowers(
			playerEntity,
			playerBoard,
			opponentEntity,
			opponentBoard,
			currentAttacker,
			true,
			gameState,
		);
	}
	handleSummonsWhenSpace(playerBoard, playerEntity, opponentBoard, opponentEntity, gameState);
	return currentAttacker;
};

const handlePlayerIllidanHeroPowers = (
	playerEntity: BgsPlayerEntity,
	playerBoard: BoardEntity[],
	opponentEntity: BgsPlayerEntity,
	opponentBoard: BoardEntity[],
	currentAttacker: number,
	friendly: boolean,
	gameState: FullGameState,
): number => {
	if (playerEntity.hpLeft <= 0) {
		return currentAttacker;
	}
	const playerHeroPowerId = playerEntity.heroPowerId || getHeroPowerForHero(playerEntity.cardId);
	if (playerHeroPowerId === CardIds.Wingmen && playerBoard.length > 0) {
		// After Illidan triggers, it's always the other opponent's turn
		// https://x.com/LoewenMitchell/status/1752714583360639131?s=20
		handleIllidanForPlayer(playerBoard, playerEntity, opponentBoard, opponentEntity, gameState, currentAttacker);
		currentAttacker = friendly ? 1 : 0;
	}
	return currentAttacker;
};

// TODO: not exactly correct, because of "attack immediately", but it's close enough
const handleIllidanForPlayer = (
	playerBoard: BoardEntity[],
	playerEntity: BgsPlayerEntity,
	opponentBoard: BoardEntity[],
	opponentEntity: BgsPlayerEntity,
	gameState: FullGameState,
	currentAttacker: number,
): void => {
	if (playerEntity.startOfCombatDone) {
		return;
	}
	// Otherwise, if the first minion dies on the attack, and the board has only 2 minions, we
	// miss the second one
	const minionsAtStart = playerBoard.length;
	const firstAttacker = playerBoard[0];
	const secondAttacker = minionsAtStart > 1 ? playerBoard[playerBoard.length - 1] : null;

	// Stats updates
	modifyStats(firstAttacker, 2, 1, playerBoard, playerEntity, gameState);
	gameState.spectator.registerPowerTarget(firstAttacker, firstAttacker, playerBoard, playerEntity, opponentEntity);
	if (!!secondAttacker && !secondAttacker.definitelyDead && secondAttacker.health > 0) {
		modifyStats(secondAttacker, 2, 1, playerBoard, playerEntity, gameState);
		gameState.spectator.registerPowerTarget(
			secondAttacker,
			secondAttacker,
			playerBoard,
			playerEntity,
			opponentEntity,
		);
	}

	// Attacks
	firstAttacker.attackImmediately = true;
	simulateAttack(playerBoard, playerEntity, opponentBoard, opponentEntity, gameState);
	// See http://replays.firestoneapp.com/?reviewId=f16b7a49-c2a2-4ac5-a9eb-a75f83246f70&turn=6&action=8
	firstAttacker.hasAttacked = 0;
	if (!!secondAttacker && !secondAttacker.definitelyDead && secondAttacker.health > 0) {
		secondAttacker.attackImmediately = true;
		simulateAttack(playerBoard, playerEntity, opponentBoard, opponentEntity, gameState);
		secondAttacker.hasAttacked = 0;
	}

	// // See http://replays.firestoneapp.com/?reviewId=7e9ec42c-a8f6-43d2-9f39-cc486dfa2395&turn=6&action=5
	// if (firstAttacker.definitelyDead || firstAttacker.health <= 0) {
	// 	currentAttacker = (currentAttacker + 1) % 2;
	// }
	// return currentAttacker;
};

const handleAlakirForPlayer = (
	playerBoard: BoardEntity[],
	playerEntity: BgsPlayerEntity,
	opponentBoard: BoardEntity[],
	opponentEntity: BgsPlayerEntity,
	gameState: FullGameState,
): void => {
	const firstEntity = playerBoard[0];
	firstEntity.windfury = true;
	if (!firstEntity.divineShield) {
		updateDivineShield(firstEntity, playerBoard, true, gameState.allCards);
	}
	firstEntity.taunt = true;
	gameState.spectator.registerPowerTarget(firstEntity, firstEntity, playerBoard, playerEntity, opponentEntity);
};

const handleTamsinForPlayer = (
	playerBoard: BoardEntity[],
	playerEntity: BgsPlayerEntity,
	opponentBoard: BoardEntity[],
	opponentEntity: BgsPlayerEntity,
	gameState: FullGameState,
): void => {
	const chosenEntity = pickRandomLowestHealth(playerBoard);
	if (!chosenEntity) {
		console.warn('could not pick any entity for tamsin');
		return;
	}
	gameState.spectator.registerPowerTarget(playerEntity, chosenEntity, playerBoard, null, null);
	const newBoard = playerBoard.filter((e) => e.entityId !== chosenEntity.entityId);
	// How to mark the minion as dead
	chosenEntity.definitelyDead = true;
	newBoard.forEach((e) => {
		modifyStats(e, chosenEntity.attack, chosenEntity.health, newBoard, playerEntity, gameState);
		gameState.spectator.registerPowerTarget(chosenEntity, e, newBoard, playerEntity, opponentEntity);
	});
};

const applyGloriousGloop = (
	playerBoard: BoardEntity[],
	playerEntity: BgsPlayerEntity,
	opponentBoard: BoardEntity[],
	opponentEntity: BgsPlayerEntity,
	gameState: FullGameState,
): void => {
	if (!playerBoard?.length) {
		return;
	}
	const target = playerBoard.find((m) =>
		m.enchantments?.some((e) => e.cardId === CardIds.GloriousGloop_InTheGloopEnchantment_BGDUO_HERO_101pe2),
	);
	if (!target) {
		return;
	}

	const teammateState = getTeammateInitialState(gameState.gameState, playerEntity);
	if (!teammateState?.board?.length) {
		return;
	}
	const highestTier = Math.max(
		...teammateState.board.map((entity) => gameState.allCards.getCard(entity.cardId).techLevel),
	);
	const candidates = teammateState.board.filter(
		(entity) => gameState.allCards.getCard(entity.cardId).techLevel === highestTier,
	);
	if (!candidates.length) {
		return;
	}
	const highestTierMinion = pickRandom(candidates);
	const clone: BoardEntity = addImpliedMechanics(
		{
			...highestTierMinion,
			lastAffectedByEntity: null,
			definitelyDead: false,
			attackImmediately: false,
		},
		gameState.cardsData,
	);
	gameState.spectator.registerPowerTarget(playerEntity, target, playerBoard, playerEntity, opponentEntity);
	// Replace the "target" minion with the "clone"
	const index = playerBoard.indexOf(target);
	playerBoard.splice(index, 1, clone);
};

const handleEmbraceYourRageForPlayer = (
	playerBoard: BoardEntity[],
	playerEntity: BgsPlayerEntity,
	opponentBoard: BoardEntity[],
	opponentEntity: BgsPlayerEntity,
	gameState: FullGameState,
): void => {
	const createdCardId = playerEntity.heroPowerInfo as string;
	if (!createdCardId?.length) {
		// console.warn('no card id for embrace your rage');
		return;
	}
	const spawns = spawnEntities(
		createdCardId,
		1,
		playerBoard,
		playerEntity,
		opponentBoard,
		opponentEntity,
		gameState.allCards,
		gameState.cardsData,
		gameState.sharedState,
		gameState.spectator,
		playerEntity.friendly,
		true,
		false,
		false,
	);
	const indexFromRight = 0;
	performEntitySpawns(
		spawns,
		playerBoard,
		playerEntity,
		playerEntity,
		indexFromRight,
		opponentBoard,
		opponentEntity,
		gameState,
	);
	gameState.spectator.registerPowerTarget(playerEntity, spawns[0], playerBoard, playerEntity, opponentEntity);
	addCardsInHand(playerEntity, playerBoard, spawns, gameState);
	gameState.spectator.registerPowerTarget(playerEntity, spawns[0], playerBoard, playerEntity, opponentEntity);
};

const handleRebornRitesForPlayer = (
	playerBoard: BoardEntity[],
	playerEntity: BgsPlayerEntity,
	opponentBoard: BoardEntity[],
	opponentEntity: BgsPlayerEntity,
	gameState: FullGameState,
): void => {
	const targetEntityId = playerEntity.heroPowerInfo as number;
	const target = playerBoard.find((entity) => entity.entityId === targetEntityId);
	if (!target) {
		return;
	}

	target.reborn = true;
	gameState.spectator.registerPowerTarget(playerEntity, target, playerBoard, playerEntity, opponentEntity);
};

const handleTeronForPlayer = (
	playerBoard: BoardEntity[],
	playerEntity: BgsPlayerEntity,
	opponentBoard: BoardEntity[],
	opponentEntity: BgsPlayerEntity,
	gameState: FullGameState,
): boolean => {
	// Getting the right enchantment can be tricky. The RapidReanimation enchantment can sometimes be
	// in the Graveyard zone, so we can't filter them out. In that case, we can have multiple
	// enchantments
	// However, because of how things are handled in the logs, we should be able to always take the one *
	// with the biggest entityId
	const minionThatWillDie = playerBoard
		.filter((m) => m.enchantments.some((e) => e.cardId === CardIds.RapidReanimation_ImpendingDeathEnchantment))
		.sort(
			(a, b) =>
				b.enchantments.find((e) => e.cardId === CardIds.RapidReanimation_ImpendingDeathEnchantment)
					.originEntityId -
					a.enchantments.find((e) => e.cardId === CardIds.RapidReanimation_ImpendingDeathEnchantment)
						.originEntityId || b.entityId - a.entityId,
		)[0];
	if (minionThatWillDie) {
		// So this is a bit tricky (as all the stuff with indices...). Because in practice it's more likely that players use Rapid Reanimation
		// on minions that they want to die quickly, most of the time they will be placed
		// to the left of the board
		// So using a left-based index (usually 0) is more likely to be correct after minions spawn on the board
		// Update: this looks like it's not the case, and looking at
		// http://replays.firestoneapp.com/?reviewId=2e6b389f-d904-43a2-a7cd-928a60d973ce&turn=11&action=1
		// the index seems to be right-based at least in some cases
		// Looks like even this is wrong:
		// http://replays.firestoneapp.com/?reviewId=9a46ab39-ccf0-478c-a010-68f2abb06c6f&turn=9&action=0
		const rapidReanimationIndexFromLeft = playerBoard.indexOf(minionThatWillDie);
		playerEntity.rapidReanimationIndexFromRight = playerBoard.length - 1 - rapidReanimationIndexFromLeft;
		const minionToCopy = {
			...minionThatWillDie,
			enchantments: minionThatWillDie.enchantments.map((e) => ({ ...e })) ?? [],
			pendingAttackBuffs: [],
		} as BoardEntity;
		removeAurasFromSelf(
			minionToCopy,
			playerBoard,
			playerEntity,
			gameState.allCards,
			gameState.sharedState,
			gameState.spectator,
		);
		playerEntity.rapidReanimationMinion = minionToCopy;
		minionThatWillDie.definitelyDead = true;
		gameState.spectator.registerPowerTarget(
			playerEntity,
			minionThatWillDie,
			playerBoard,
			playerEntity,
			opponentEntity,
		);
		return true;
	}
	return false;
};

const handleWaxWarbandForPlayer = (
	playerBoard: BoardEntity[],
	playerEntity: BgsPlayerEntity,
	opponentBoard: BoardEntity[],
	opponentEntity: BgsPlayerEntity,
	gameState: FullGameState,
): void => {
	if (playerBoard.length > 0) {
		const boardWithTribes = playerBoard.filter((e) => !!gameState.allCards.getCard(e.cardId)?.races?.length);
		const boardWithoutAll = boardWithTribes.filter(
			(e) => !gameState.allCards.getCard(e.cardId).races.includes(Race[Race.ALL]),
		);
		const selectedMinions = selectMinions(boardWithoutAll, ALL_BG_RACES, gameState.allCards);
		const allMinions = [
			...selectedMinions,
			...boardWithTribes.filter((e) => gameState.allCards.getCard(e.cardId).races.includes(Race[Race.ALL])),
		];
		allMinions.forEach((e) => {
			modifyStats(
				e,
				gameState.cardsData.getTavernLevel(e.cardId),
				gameState.cardsData.getTavernLevel(e.cardId),
				playerBoard,
				playerEntity,
				gameState,
			);
			gameState.spectator.registerPowerTarget(playerEntity, e, playerBoard, playerEntity, opponentEntity);
		});
	}
};

// Not perfect, as I don't think this solves the issue where some cards are mutually exclusive
const selectMinions = (minions: BoardEntity[], tribes: Race[], allCards: AllCardsService): BoardEntity[] => {
	// Step 1
	const minionsByTribe: { [tribe: string]: BoardEntity[] } = {};
	for (const minion of minions) {
		for (const tribe of allCards.getCard(minion.cardId).races) {
			if (!minionsByTribe[tribe]) {
				minionsByTribe[tribe] = [];
			}
			minionsByTribe[tribe].push(minion);
		}
	}
	for (const tribe of ALL_BG_RACES) {
		minionsByTribe[tribe] = shuffleArray(minionsByTribe[Race[tribe]] ?? []);
	}

	const selectedMinions: BoardEntity[] = [];

	// Step 3
	for (const tribe of tribes) {
		if (minionsByTribe[tribe]) {
			minionsByTribe[tribe].sort(
				(a, b) => allCards.getCard(a.cardId).races.length - allCards.getCard(b.cardId).races.length,
			);
			for (const minion of minionsByTribe[tribe]) {
				if (!selectedMinions.includes(minion)) {
					selectedMinions.push(minion);
					break;
				}
			}
		}
	}

	// Step 4
	return selectedMinions;
};

const handlePlayerStartOfCombatHeroPowers = (
	playerEntity: BgsPlayerEntity,
	playerBoard: BoardEntity[],
	opponentEntity: BgsPlayerEntity,
	opponentBoard: BoardEntity[],
	currentAttacker: number,
	friendly: boolean,
	gameState: FullGameState,
): number => {
	if (playerEntity.startOfCombatDone || playerEntity.hpLeft <= 0) {
		return currentAttacker;
	}
	// eslint-disable-next-line prefer-const
	let shouldRecomputeCurrentAttacker = false;
	const playerHeroPowerId = playerEntity.heroPowerId || getHeroPowerForHero(playerEntity.cardId);
	// TODO: should this recompute the first attack order?
	if (playerEntity.heroPowerUsed && playerHeroPowerId === CardIds.AimLeftToken) {
		const target = opponentBoard[0];
		const damageDone = dealDamageToMinion(
			target,
			opponentBoard,
			opponentEntity,
			null,
			playerEntity.heroPowerInfo2 ?? 0,
			playerBoard,
			playerEntity,
			gameState,
		);
		// processMinionDeath(playerBoard, playerEntity, opponentBoard, opponentEntity, allCards, cardsData, sharedState, spectator);
		playerEntity.deadEyeDamageDone = damageDone;
	} else if (playerEntity.heroPowerUsed && playerHeroPowerId === CardIds.AimRightToken) {
		const target = opponentBoard[opponentBoard.length - 1];
		const damageDone = dealDamageToMinion(
			target,
			opponentBoard,
			opponentEntity,
			null,
			playerEntity.heroPowerInfo2 ?? 0,
			playerBoard,
			playerEntity,
			gameState,
		);
		// processMinionDeath(playerBoard, playerEntity, opponentBoard, opponentEntity, allCards, cardsData, sharedState, spectator);
		playerEntity.deadEyeDamageDone = damageDone;
	} else if (playerEntity.heroPowerUsed && playerHeroPowerId === CardIds.AimLowToken) {
		const smallestHealthMinion = [...opponentBoard].sort((a, b) => a.health - b.health)[0];
		const target = pickRandom(opponentBoard.filter((e) => e.health === smallestHealthMinion.health));
		const damageDone = dealDamageToMinion(
			target,
			opponentBoard,
			opponentEntity,
			null,
			playerEntity.heroPowerInfo2 ?? 0,
			playerBoard,
			playerEntity,
			gameState,
		);
		// processMinionDeath(playerBoard, playerEntity, opponentBoard, opponentEntity, allCards, cardsData, sharedState, spectator);
		playerEntity.deadEyeDamageDone = damageDone;
	} else if (playerEntity.heroPowerUsed && playerHeroPowerId === CardIds.AimHighToken) {
		const highestHealthMinion = [...opponentBoard].sort((a, b) => b.health - a.health)[0];
		const target = pickRandom(opponentBoard.filter((e) => e.health === highestHealthMinion.health));
		const damageDone = dealDamageToMinion(
			target,
			opponentBoard,
			opponentEntity,
			null,
			playerEntity.heroPowerInfo2 ?? 0,
			playerBoard,
			playerEntity,
			gameState,
		);
		// processMinionDeath(playerBoard, playerEntity, opponentBoard, opponentEntity, allCards, cardsData, sharedState, spectator);
		playerEntity.deadEyeDamageDone = damageDone;
	}
	processMinionDeath(playerBoard, playerEntity, opponentBoard, opponentEntity, gameState);
	if (shouldRecomputeCurrentAttacker) {
		const previousCurrentAttacker = currentAttacker;
		currentAttacker =
			playerBoard.length > opponentBoard.length
				? friendly
					? 0
					: 1
				: opponentBoard.length > playerBoard.length
				? friendly
					? 1
					: 0
				: currentAttacker;
		// console.debug(
		// 	'recompting current attacker',
		// 	currentAttacker,
		// 	playerBoard.length,
		// 	opponentBoard.length,
		// 	previousCurrentAttacker,
		// 	stringifySimple(playerBoard, allCards),
		// 	stringifySimple(opponentBoard, allCards),
		// );
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
	gameState: FullGameState,
): boolean => {
	if (attackingBoardHero.startOfCombatDone) {
		return false;
	}
	let hasProcessed = true;
	// Don't forget to update START_OF_COMBAT_CARD_IDS
	if (attacker.cardId === CardIds.RedWhelp_BGS_019) {
		const damage = attackingBoardBefore.filter((entity) =>
			hasCorrectTribe(entity, attackingBoardHero, Race.DRAGON, gameState.allCards),
		).length;
		dealDamageToRandomEnemy(
			defendingBoard,
			defendingBoardHero,
			attacker,
			damage,
			attackingBoard,
			attackingBoardHero,
			gameState,
		);
	} else if (attacker.cardId === CardIds.RedWhelp_TB_BaconUps_102) {
		const damage = attackingBoardBefore.filter((entity) =>
			hasCorrectTribe(entity, attackingBoardHero, Race.DRAGON, gameState.allCards),
		).length;
		dealDamageToRandomEnemy(
			defendingBoard,
			defendingBoardHero,
			attacker,
			damage,
			attackingBoard,
			attackingBoardHero,
			gameState,
		);
		dealDamageToRandomEnemy(
			defendingBoard,
			defendingBoardHero,
			attacker,
			damage,
			attackingBoard,
			attackingBoardHero,
			gameState,
		);
	} else if (
		attacker.cardId === CardIds.PrizedPromoDrake_BG21_014 ||
		attacker.cardId === CardIds.PrizedPromoDrake_BG21_014_G
	) {
		const stats = attacker.cardId === CardIds.PrizedPromoDrake_BG21_014_G ? 6 : 3;
		const targets = attackingBoard
			.filter((e) => e.entityId !== attacker.entityId)
			.filter((e) => hasCorrectTribe(e, attackingBoardHero, Race.DRAGON, gameState.allCards));
		for (const entity of targets) {
			modifyStats(entity, stats, stats, attackingBoard, attackingBoardHero, gameState);
			gameState.spectator.registerPowerTarget(
				attacker,
				entity,
				attackingBoard,
				attackingBoardHero,
				defendingBoardHero,
			);
		}
	} else if (
		attacker.cardId === CardIds.ChoralMrrrglr_BG26_354 ||
		attacker.cardId === CardIds.ChoralMrrrglr_BG26_354_G
	) {
		const multiplier = attacker.cardId === CardIds.ChoralMrrrglr_BG26_354_G ? 2 : 1;
		modifyStats(
			attacker,
			multiplier * attackingBoardHero.globalInfo?.ChoralAttackBuff,
			multiplier * attackingBoardHero.globalInfo?.ChoralHealthBuff,
			attackingBoard,
			attackingBoardHero,
			gameState,
		);
		gameState.spectator.registerPowerTarget(
			attacker,
			attacker,
			attackingBoard,
			attackingBoardHero,
			defendingBoardHero,
		);
	} else if (
		attacker.cardId === CardIds.AmberGuardian_BG24_500 ||
		attacker.cardId === CardIds.AmberGuardian_BG24_500_G
	) {
		// First try to get a target without divine shield, and if none is available, pick one with divine shield
		const otherDragons = attackingBoard
			.filter((e) => hasCorrectTribe(e, attackingBoardHero, Race.DRAGON, gameState.allCards))
			.filter((e) => e.entityId !== attacker.entityId);
		const loops = attacker.cardId === CardIds.AmberGuardian_BG24_500_G ? 2 : 1;
		const dragonsToConsider = otherDragons;
		for (let i = 0; i < loops; i++) {
			const otherDragon =
				pickRandom(dragonsToConsider.filter((e) => !e.divineShield)) ?? pickRandom(dragonsToConsider);
			if (otherDragon) {
				if (!otherDragon.divineShield) {
					updateDivineShield(otherDragon, attackingBoard, true, gameState.allCards);
				}
				modifyStats(otherDragon, 7, 7, attackingBoard, attackingBoardHero, gameState);
				gameState.spectator.registerPowerTarget(
					attacker,
					otherDragon,
					attackingBoard,
					attackingBoardHero,
					defendingBoardHero,
				);
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
			.filter((e) => hasCorrectTribe(e, attackingBoardHero, Race.DRAGON, gameState.allCards))
			.filter((e) => e.entityId !== attacker.entityId);
		otherDragons.forEach((otherDragon) => {
			modifyStats(otherDragon, 0, buff, attackingBoard, attackingBoardHero, gameState);
			gameState.spectator.registerPowerTarget(
				attacker,
				otherDragon,
				attackingBoard,
				attackingBoardHero,
				defendingBoardHero,
			);
		});
	} else if (
		attacker.cardId === CardIds.Soulsplitter_BG25_023 ||
		attacker.cardId === CardIds.Soulsplitter_BG25_023_G
	) {
		const numberOfTargets = attacker.cardId === CardIds.Soulsplitter_BG25_023_G ? 2 : 1;
		for (let i = 0; i < numberOfTargets; i++) {
			const undeadsWithoutReborn = attackingBoard
				.filter((e) => hasCorrectTribe(e, attackingBoardHero, Race.UNDEAD, gameState.allCards))
				.filter((e) => !e.reborn);
			const chosenUndead = pickRandom(undeadsWithoutReborn);
			if (chosenUndead) {
				chosenUndead.reborn = true;
				gameState.spectator.registerPowerTarget(
					attacker,
					chosenUndead,
					attackingBoard,
					attackingBoardHero,
					defendingBoardHero,
				);
			}
		}
	} else if (
		attacker.cardId === CardIds.Crabby_BG22_HERO_000_Buddy ||
		attacker.cardId === CardIds.Crabby_BG22_HERO_000_Buddy_G
	) {
		const neighbours = getNeighbours(attackingBoard, attacker);
		const multiplier = attacker.cardId === CardIds.Crabby_BG22_HERO_000_Buddy_G ? 2 : 1;
		neighbours.forEach((entity) => {
			modifyStats(
				entity,
				multiplier * (attackingBoardHero.deadEyeDamageDone ?? 0),
				multiplier * (attackingBoardHero.deadEyeDamageDone ?? 0),
				attackingBoard,
				attackingBoardHero,
				gameState,
			);
			gameState.spectator.registerPowerTarget(
				attacker,
				entity,
				attackingBoard,
				attackingBoardHero,
				defendingBoardHero,
			);
		});
	} else if (
		attacker.cardId === CardIds.CorruptedMyrmidon_BG23_012 ||
		attacker.cardId === CardIds.CorruptedMyrmidon_BG23_012_G
	) {
		const multiplier = attacker.cardId === CardIds.CorruptedMyrmidon_BG23_012_G ? 2 : 1;
		modifyStats(
			attacker,
			multiplier * attacker.attack,
			multiplier * attacker.health,
			attackingBoard,
			attackingBoardHero,
			gameState,
		);
		gameState.spectator.registerPowerTarget(
			attacker,
			attacker,
			attackingBoard,
			attackingBoardHero,
			defendingBoardHero,
		);
	} else if (
		attacker.cardId === CardIds.InterrogatorWhitemane_BG24_704 ||
		attacker.cardId === CardIds.InterrogatorWhitemane_BG24_704_G
	) {
		if (defendingBoard.length > 0) {
			const attackerIndex = attackingBoard.indexOf(attacker);
			const defenderPosition = attackerIndex - (attackingBoard.length - defendingBoard.length) / 2;
			if (Math.round(defenderPosition) === defenderPosition) {
				castImpure(defendingBoard[defenderPosition], attacker, attackingBoard, gameState.spectator);
			} else {
				castImpure(defendingBoard[defenderPosition - 0.5], attacker, attackingBoard, gameState.spectator);
				castImpure(defendingBoard[defenderPosition + 0.5], attacker, attackingBoard, gameState.spectator);
			}
		}
	} else if (attacker.cardId === CardIds.MantidQueen_BG22_402 || attacker.cardId === CardIds.MantidQueen_BG22_402_G) {
		const multiplier = attacker.cardId === CardIds.MantidQueen_BG22_402_G ? 2 : 1;
		const allRaces = attackingBoardBefore
			.map((entity) => entity.cardId)
			.flatMap((cardId) => gameState.allCards.getCard(cardId).races)
			.filter((race) => !!race && race !== Race[Race.BLANK]);
		const totalRaces =
			[...new Set(allRaces.filter((race) => race !== Race[Race.ALL]))].length +
			allRaces.filter((race) => race === Race[Race.ALL]).length;
		for (let i = 0; i < multiplier; i++) {
			for (let j = 0; j < totalRaces; j++) {
				const buffType = getRandomMantidQueenBuffType(attacker);
				switch (buffType) {
					case 'stats':
						modifyStats(attacker, 5, 5, attackingBoard, attackingBoardHero, gameState);
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
				gameState.spectator.registerPowerTarget(
					attacker,
					attacker,
					attackingBoard,
					attackingBoardHero,
					defendingBoardHero,
				);
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
					gameState.allCards,
					gameState.cardsData,
					gameState.sharedState,
					gameState.spectator,
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
					gameState,
				);
				gameState.spectator.registerPowerTarget(
					attacker,
					copy,
					attackingBoard,
					attackingBoardHero,
					defendingBoardHero,
				);
			}
		}
	} else if (
		attacker.cardId === CardIds.DiremuckForager_BG27_556 ||
		attacker.cardId === CardIds.DiremuckForager_BG27_556_G
	) {
		const potentialTargets = attackingBoardHero.hand
			.filter((e) => !!e.cardId)
			.filter((e) => gameState.allCards.getCard(e.cardId).type?.toUpperCase() === CardType[CardType.MINION])
			.filter((e) => !e.locked);
		if (potentialTargets.length > 0) {
			const target = pickRandom(potentialTargets);
			// When it's the opponent, the game state already contains all the buffs
			// It can happen that, for the opponent, a card is first added to their hand (eg with Embrace Your Rage)
			// and then summoned by Diremuck. In that case, the stats need to be buffed
			// Update 29.2 18/04/2024: this is no longer the case, and the minions passed in the initial state should
			// reflect the values they have in hand
			// if (target?.friendly || !target?.inInitialState) {
			const diremuckBuff = attacker.cardId === CardIds.DiremuckForager_BG27_556_G ? 4 : 2;
			modifyStats(target, diremuckBuff, diremuckBuff, attackingBoard, attackingBoardHero, gameState);
			gameState.spectator.registerPowerTarget(
				attacker,
				target,
				attackingBoard,
				attackingBoardHero,
				defendingBoardHero,
			);
			// }
			if (attackingBoard.length < 7) {
				target.locked = true;
				const newMinions = spawnEntities(
					target.cardId,
					1,
					attackingBoard,
					attackingBoardHero,
					defendingBoard,
					defendingBoardHero,
					gameState.allCards,
					gameState.cardsData,
					gameState.sharedState,
					gameState.spectator,
					attacker.friendly,
					false,
					false,
					true,
					{ ...target } as BoardEntity,
				);
				for (const s of newMinions) {
					s.onCanceledSummon = () => (target.locked = false);
				}
				performEntitySpawns(
					newMinions,
					attackingBoard,
					attackingBoardHero,
					attacker,
					attackingBoard.length - (attackingBoard.indexOf(attacker) + 1),
					defendingBoard,
					defendingBoardHero,
					gameState,
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
				gameState.spectator.registerPowerTarget(
					attacker,
					entity,
					attackingBoard,
					attackingBoardHero,
					defendingBoardHero,
				);
				handleDeathrattles({
					gameState: gameState,
					playerDeadEntities: attackingBoardHero.friendly ? [entity] : [],
					playerDeadEntityIndexesFromRight: attackingBoardHero.friendly
						? [attackingBoard.length - 1 - attackingBoard.indexOf(entity)]
						: [],
					opponentDeadEntities: attackingBoardHero.friendly ? [] : [entity],
					opponentDeadEntityIndexesFromRight: attackingBoardHero.friendly
						? []
						: [attackingBoard.length - 1 - attackingBoard.indexOf(entity)],
				});
			}
		}
		// console.debug('done triggering hawkstrider\n\n\n');
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
				gameState.allCards,
			);
			if (!targets.length) {
				break;
			}
			if (targets.length > 2) {
				console.error('Invalid number of targets', targets.length);
			}

			const target = pickRandom(targets);
			while (attacker.health > 0 && target.health > 0 && !attacker.definitelyDead && !target.definitelyDead) {
				// Attackers don't alternate
				// See http://replays.firestoneapp.com/?reviewId=f9f6bf62-db73-49ad-8187-d2f8848b7f36&turn=17&action=0
				doFullAttack(
					attacker,
					attackingBoard,
					attackingBoardHero,
					target,
					defendingBoard,
					defendingBoardHero,
					gameState,
				);
			}
		}
	} else if (
		attacker.cardId === CardIds.PilotedWhirlOTron_BG21_HERO_030_Buddy ||
		attacker.cardId === CardIds.PilotedWhirlOTron_BG21_HERO_030_Buddy_G
	) {
		// const iterations = attacker.cardId === CardIds.PilotedWhirlOTron_BG21_HERO_030_Buddy_G ? 2 : 1;
		rememberDeathrattles(
			attacker,
			attackingBoard.filter(
				(e) =>
					e.cardId !== CardIds.PilotedWhirlOTron_BG21_HERO_030_Buddy &&
					e.cardId !== CardIds.PilotedWhirlOTron_BG21_HERO_030_Buddy_G,
			),
			gameState.cardsData,
			gameState.allCards,
			gameState.sharedState,
		);
		gameState.spectator.registerPowerTarget(
			attacker,
			attacker,
			attackingBoard,
			attackingBoardHero,
			defendingBoardHero,
		);
	} else if (
		attacker.cardId === CardIds.IrateRooster_BG29_990 ||
		attacker.cardId === CardIds.IrateRooster_BG29_990_G
	) {
		const loops = attacker.cardId === CardIds.IrateRooster_BG29_990_G ? 2 : 1;
		for (let i = 0; i < loops; i++) {
			const neighbours = getNeighbours(attackingBoard, attacker);
			for (const neighbour of neighbours) {
				gameState.spectator.registerPowerTarget(
					attacker,
					neighbour,
					attackingBoard,
					attackingBoardHero,
					defendingBoardHero,
				);
				dealDamageToMinion(
					neighbour,
					attackingBoard,
					attackingBoardHero,
					attacker,
					1,
					defendingBoard,
					defendingBoardHero,
					gameState,
				);
				modifyStats(neighbour, 4, 0, attackingBoard, attackingBoardHero, gameState);
			}
		}
	} else if (
		attacker.cardId === CardIds.MisfitDragonling_BG29_814 ||
		attacker.cardId === CardIds.MisfitDragonling_BG29_814_G
	) {
		const multiplier = attacker.cardId === CardIds.MisfitDragonling_BG29_814_G ? 2 : 1;
		const tier = attackingBoardHero.tavernTier;
		const stats = multiplier * tier;
		modifyStats(attacker, stats, stats, attackingBoard, attackingBoardHero, gameState);
		gameState.spectator.registerPowerTarget(
			attacker,
			attacker,
			attackingBoard,
			attackingBoardHero,
			defendingBoardHero,
		);
	} else if (
		attacker.cardId === CardIds.ThousandthPaperDrake_BG29_810 ||
		attacker.cardId === CardIds.ThousandthPaperDrake_BG29_810_G
	) {
		const loops = attacker.cardId === CardIds.ThousandthPaperDrake_BG29_810_G ? 2 : 1;
		const pickedTargets = [];
		const dragons = attackingBoard.filter((e) =>
			hasCorrectTribe(e, attackingBoardHero, Race.DRAGON, gameState.allCards),
		);
		for (let i = 0; i < loops; i++) {
			const target = dragons.filter((e) => !pickedTargets.includes(e))[0];
			if (!!target) {
				modifyStats(target, 1, 2, attackingBoard, attackingBoardHero, gameState);
				target.windfury = true;
				gameState.spectator.registerPowerTarget(
					attacker,
					target,
					attackingBoard,
					attackingBoardHero,
					defendingBoardHero,
				);
				pickedTargets.push(target);
			}
		}
	} else if (
		attacker.cardId === CardIds.YulonFortuneGranter_BG29_811 ||
		attacker.cardId === CardIds.YulonFortuneGranter_BG29_811_G
	) {
		const loops = attacker.cardId === CardIds.YulonFortuneGranter_BG29_811_G ? 2 : 1;
		for (let i = 0; i < loops; i++) {
			const candidateBoard = attackingBoard
				.filter((e) => !isGolden(e.cardId, gameState.allCards))
				.filter(
					(e) =>
						e.cardId !== CardIds.YulonFortuneGranter_BG29_811 &&
						e.cardId !== CardIds.YulonFortuneGranter_BG29_811_G,
				);
			// Because we pick one at random from all the ones that have the lowest tier
			const randomBoard = shuffleArray(candidateBoard);
			const candidates = randomBoard.sort(
				(a, b) => gameState.cardsData.getTavernLevel(a.cardId) - gameState.cardsData.getTavernLevel(b.cardId),
			);
			const target = candidates[0];
			if (!!target) {
				makeMinionGolden(target, attacker, attackingBoard, attackingBoardHero, gameState);
			}
		}
	} else if (
		attacker.cardId === CardIds.HoardingHatespawn_BG29_872 ||
		attacker.cardId === CardIds.HoardingHatespawn_BG29_872_G
	) {
		const stats = attacker.cardId === CardIds.HoardingHatespawn_BG29_872_G ? 20 : 10;
		const target = getRandomMinionWithHighestHealth(defendingBoard);
		if (!!target) {
			const previousAttack = target.attack;
			const previousHealth = target.health;
			target.attack = Math.max(0, target.attack - stats);
			target.health = Math.max(0, target.health - stats);
			target.maxHealth = Math.max(0, target.maxHealth - stats);
			modifyStats(
				attacker,
				previousAttack - target.attack,
				previousHealth - target.health,
				attackingBoard,
				attackingBoardHero,
				gameState,
			);
			gameState.spectator.registerPowerTarget(
				attacker,
				target,
				attackingBoard,
				attackingBoardHero,
				defendingBoardHero,
			);
		}
	} else if (
		attacker.cardId === CardIds.TheUninvitedGuest_BG29_875 ||
		attacker.cardId === CardIds.TheUninvitedGuest_BG29_875_G
	) {
		const targetEnchantment =
			attacker.cardId === CardIds.TheUninvitedGuest_BG29_875_G
				? CardIds.TheUninvitedGuest_UninvitedEnchantment_BG29_875_Ge
				: CardIds.TheUninvitedGuest_UninvitedEnchantment_BG29_875e;
		attackingBoard
			.filter((e) => e.entityId != attacker.entityId)
			.forEach((e) => {
				e.enchantments = e.enchantments || [];
				if (!e.enchantments.some((e) => e.cardId === targetEnchantment)) {
					e.enchantments.push({
						cardId: targetEnchantment,
						originEntityId: attacker.entityId,
						timing: gameState.sharedState.currentEntityId++,
					});
				}
			});
	} else if (attacker.cardId === CardIds.Sandy_BGDUO_125 || attacker.cardId === CardIds.Sandy_BGDUO_125_G) {
		const teammateState = getTeammateInitialState(gameState.gameState, attackingBoardHero);
		if (teammateState?.board?.length) {
			const isGolden = attacker.cardId === CardIds.Sandy_BGDUO_125_G;
			const minionToCopy = getRandomMinionWithHighestHealth(teammateState.board);
			const copy: BoardEntity = { ...minionToCopy, enchantments: [...minionToCopy.enchantments] };
			const attackerIndex = attackingBoard.indexOf(attacker);
			// Insert the copy in its place
			attackingBoard.splice(attackerIndex, 0, copy);
			if (isGolden) {
				makeMinionGolden(copy, copy, attackingBoard, attackingBoardHero, gameState);
			}
		}
	} else if (
		attacker.cardId === CardIds.Vaelastrasz_TB_BaconShop_HERO_56_Buddy ||
		attacker.cardId === CardIds.Vaelastrasz_TB_BaconShop_HERO_56_Buddy_G
	) {
		const vaelastraszBonus = attacker.cardId === CardIds.Vaelastrasz_TB_BaconShop_HERO_56_Buddy_G ? 6 : 3;
		attackingBoard
			.filter((e) => e.entityId !== attacker.entityId)
			.forEach((e) => {
				modifyStats(e, vaelastraszBonus, vaelastraszBonus, attackingBoard, attackingBoardHero, gameState);
				gameState.spectator.registerPowerTarget(
					attacker,
					e,
					attackingBoard,
					attackingBoardHero,
					defendingBoardHero,
				);
			});
	} else if (
		attacker.cardId === CardIds.ElderTaggawag_TB_BaconShop_HERO_14_Buddy ||
		attacker.cardId === CardIds.ElderTaggawag_TB_BaconShop_HERO_14_Buddy_G
	) {
		const minionsOfDifferentTypes = getMinionsOfDifferentTypes(attackingBoard, attackingBoardHero, gameState);
		if (minionsOfDifferentTypes.length >= 4) {
			const highestAttackOnBoard = Math.max(...attackingBoard.map((entity) => entity.attack));
			const highestHealthOnBoard = Math.max(...attackingBoard.map((entity) => entity.health));
			const multiplier = attacker.cardId === CardIds.ElderTaggawag_TB_BaconShop_HERO_14_Buddy_G ? 2 : 1;
			modifyStats(
				attacker,
				highestAttackOnBoard * multiplier,
				highestHealthOnBoard * multiplier,
				attackingBoard,
				attackingBoardHero,
				gameState,
			);
			gameState.spectator.registerPowerTarget(
				attacker,
				attacker,
				attackingBoard,
				attackingBoardHero,
				defendingBoardHero,
			);
		}
	} else {
		hasProcessed = false;
	}
	processMinionDeath(attackingBoard, attackingBoardHero, defendingBoard, defendingBoardHero, gameState);
	return hasProcessed;
};

const applyAllWillBurn = (
	board1: BoardEntity[],
	board1Hero: BgsPlayerEntity,
	board2: BoardEntity[],
	board2Hero: BgsPlayerEntity,
	sourceEntity: BgsPlayerEntity | BoardEntity,
	gameState: FullGameState,
): void => {
	for (const entity of board1) {
		modifyStats(entity, 2, 0, board1, board1Hero, gameState);
		gameState.spectator.registerPowerTarget(sourceEntity, entity, board1, null, null);
	}
	for (const entity of board2) {
		modifyStats(entity, 2, 0, board2, board1Hero, gameState);
		gameState.spectator.registerPowerTarget(sourceEntity, entity, board2, null, null);
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
	spectator.registerPowerTarget(source, entity, board, null, null);
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
