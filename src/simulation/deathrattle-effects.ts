/* eslint-disable @typescript-eslint/no-use-before-define */
import { AllCardsService, CardIds, GameTag, Race } from '@firestone-hs/reference-data';
import { BgsPlayerEntity } from '../bgs-player-entity';
import { BoardEntity } from '../board-entity';
import { CardsData } from '../cards/cards-data';
import { eternalKnightAttack, eternalKnightHealth } from '../cards/impl/trinket/eternal-portrait';
import { updateTaunt } from '../keywords/taunt';
import { pickMultipleRandomDifferent } from '../services/utils';
import { isValidDeathrattleEnchantment } from '../simulate-bgs-battle';
import {
	getRandomMinionWithHighestHealth,
	grantRandomStats,
	hasCorrectTribe,
	isDead,
	isFish,
	isGolden,
} from '../utils';
import { dealDamageToMinion } from './attack';
import { addCardsInHand } from './cards-in-hand';
import { spawnEntities } from './deathrattle-spawns';
import { FullGameState } from './internal-game-state';
import { groupLeapfroggerDeathrattles } from './remembered-deathrattle';
import { SharedState } from './shared-state';
import { modifyStats } from './stats';

const DEATHRATTLES_REQUIRE_MEMORY = [CardIds.StitchedSalvager_BG31_999, CardIds.StitchedSalvager_BG31_999_G];

export const computeDeathrattleMultiplier = (
	board: BoardEntity[],
	boardHero: BgsPlayerEntity,
	deadEntity: BoardEntity,
	sharedState: SharedState,
): number => {
	const rivendare =
		!!board.find(
			(entity) =>
				entity.cardId === CardIds.BaronRivendare_BG_FP1_031 ||
				entity.cardId === CardIds.MoiraBronzebeard_BG27_518,
		) || boardHero.secrets?.some((e) => e.cardId === CardIds.TitusTribute_BG28_843);
	const goldenRivendare = board.find(
		(entity) =>
			entity.cardId === CardIds.BaronRivendare_TB_BaconUps_055 ||
			entity.cardId === CardIds.MoiraBronzebeard_BG27_518_G,
	);
	const titus = board.filter((entity) => entity.cardId === CardIds.TitusRivendare_BG25_354).length;
	const goldenTitus = board.filter((entity) => entity.cardId === CardIds.TitusRivendare_BG25_354_G).length;
	const deathlyPhylacteries = boardHero.trinkets.filter(
		(t) => t.cardId === CardIds.DeathlyPhylactery_BG30_MagicItem_700 && t.scriptDataNum1 > 0,
	).length;
	const tombs =
		boardHero.questRewardEntities?.filter((entity) => entity.cardId === CardIds.TurbulentTombs)?.length ?? 0;
	const echoesOfArgus = sharedState.anomalies.includes(CardIds.EchoesOfArgus_BG27_Anomaly_802) ? 1 : 0;
	const scourgeMultiplier = deadEntity.additionalCards?.includes(CardIds.ScourgeTroll) ? 2 : 1;

	const multiplier =
		scourgeMultiplier *
		((goldenRivendare ? 3 : rivendare ? 2 : 1) +
			deathlyPhylacteries +
			titus +
			2 * goldenTitus +
			tombs +
			echoesOfArgus);
	return multiplier;
};

export const applyLightningInvocationEnchantment = (
	boardWithDeadEntity: BoardEntity[],
	boardWithDeadEntityHero: BgsPlayerEntity,
	deadEntity: BoardEntity | BgsPlayerEntity,
	otherBoard: BoardEntity[],
	otherBoardHero: BgsPlayerEntity,
	gameState: FullGameState,
): void => {
	// Because the golden version doubles all the remembered effects
	const multiplier = deadEntity?.cardId === CardIds.SpiritRaptor_BG22_HERO_001_Buddy_G ? 2 : 1;
	for (let i = 0; i < multiplier; i++) {
		const targets = pickMultipleRandomDifferent(otherBoard, 5);
		for (const target of targets) {
			dealDamageToMinion(
				target,
				otherBoard,
				otherBoardHero,
				deadEntity,
				1,
				boardWithDeadEntity,
				boardWithDeadEntityHero,
				gameState,
			);
		}
	}
};

export const applyWaterInvocationEnchantment = (
	boardWithDeadEntity: BoardEntity[],
	boardWithDeadEntityHero: BgsPlayerEntity,
	otherHero: BgsPlayerEntity,
	deadEntity: BoardEntity, // Can be null when trinket is used
	sourceEntity: BgsPlayerEntity | BoardEntity,
	gameState: FullGameState,
): void => {
	const multiplier = deadEntity?.cardId === CardIds.SpiritRaptor_BG22_HERO_001_Buddy_G ? 2 : 1;
	for (let i = 0; i < multiplier; i++) {
		const validBoard = boardWithDeadEntity.filter((e) => e.health > 0 && !e.definitelyDead);
		const target: BoardEntity = validBoard[validBoard.length - 1];
		if (!!target) {
			updateTaunt(target, true, boardWithDeadEntity, boardWithDeadEntityHero, otherHero, gameState);
			modifyStats(target, sourceEntity, 0, 3, boardWithDeadEntity, boardWithDeadEntityHero, gameState);
		}
	}
};

export const applyFireInvocationEnchantment = (
	boardWithDeadEntity: BoardEntity[],
	boardWithDeadEntityHero: BgsPlayerEntity,
	deadEntity: BoardEntity,
	sourceEntity: BgsPlayerEntity | BoardEntity,
	gameState: FullGameState,
): void => {
	const multiplier = deadEntity?.cardId === CardIds.SpiritRaptor_BG22_HERO_001_Buddy_G ? 2 : 1;
	for (let i = 0; i < multiplier; i++) {
		const target: BoardEntity = boardWithDeadEntity.filter((e) => e.health > 0 && !e.definitelyDead)[0];
		if (!!target) {
			modifyStats(
				target,
				sourceEntity,
				target.attack,
				0,
				boardWithDeadEntity,
				boardWithDeadEntityHero,
				gameState,
			);
		}
	}
};

export const applyEarthInvocationEnchantment = (
	boardWithDeadEntity: BoardEntity[],
	deadEntity: BoardEntity,
	sourceEntity: BgsPlayerEntity | BoardEntity,
	gameState: FullGameState,
): void => {
	const multiplier = deadEntity?.cardId === CardIds.SpiritRaptor_BG22_HERO_001_Buddy_G ? 2 : 1;
	for (let i = 0; i < multiplier; i++) {
		const minionsGrantedDeathrattle: BoardEntity[] = pickMultipleRandomDifferent(boardWithDeadEntity, 4);
		minionsGrantedDeathrattle.forEach((minion) => {
			minion.enchantments.push({
				cardId: CardIds.EarthInvocation_ElementEarthEnchantment,
				originEntityId: deadEntity?.entityId,
				timing: gameState.sharedState.currentEntityId++,
			});
			gameState.spectator.registerPowerTarget(sourceEntity, minion, boardWithDeadEntity, null, null);
		});
	}
};

export const applyLeapFroggerEffect = (
	boardWithDeadEntity: BoardEntity[],
	boardWithDeadEntityHero: BgsPlayerEntity,
	deadEntity: BoardEntity,
	isPremium: boolean,
	gameState: FullGameState,
	multiplier: number,
): void => {
	multiplier = multiplier ?? deadEntity.deathrattleRepeats ?? 1;
	// console.debug('applying leapfrogger effect', deadEntity.entityId, multiplier);
	const buffed = grantRandomStats(
		deadEntity,
		boardWithDeadEntity,
		boardWithDeadEntityHero,
		multiplier * (isPremium ? 2 : 1),
		multiplier * (isPremium ? 2 : 1),
		Race.BEAST,
		false,
		gameState,
	);
	if (buffed) {
		buffed.enchantments = buffed.enchantments ?? [];
		buffed.enchantments.push({
			cardId: isPremium
				? CardIds.Leapfrogger_LeapfrogginEnchantment_BG21_000_Ge
				: CardIds.Leapfrogger_LeapfrogginEnchantment_BG21_000e,
			originEntityId: deadEntity.entityId,
			repeats: multiplier > 1 ? multiplier : 1,
			timing: gameState.sharedState.currentEntityId++,
		});
	}
};

export const applyRecurringNightmareDeathrattleEffect = (
	boardWithDeadEntity: BoardEntity[],
	boardWithDeadEntityHero: BgsPlayerEntity,
	deadEntity: BoardEntity,
	isPremium: boolean,
	gameState: FullGameState,
	multiplier = 1,
): void => {
	// multiplier = multiplier || 1;
	// const target = pickRandom(
	// 	boardWithDeadEntity
	// 		.filter((e) =>
	// 			hasCorrectTribe(e, boardWithDeadEntityHero, Race.UNDEAD, gameState.anomalies, gameState.allCards),
	// 		)
	// 		.filter(
	// 			(e) =>
	// 				e.cardId !== CardIds.RecurringNightmare_BG26_055 &&
	// 				e.cardId !== CardIds.RecurringNightmare_BG26_055_G,
	// 		),
	// );
	// if (target) {
	// 	target.enchantments = target.enchantments ?? [];
	// 	target.enchantments.push({
	// 		cardId: isPremium
	// 			? CardIds.RecurringNightmare_NightmareInsideEnchantment_BG26_055_Ge
	// 			: CardIds.RecurringNightmare_NightmareInsideEnchantment_BG26_055e,
	// 		originEntityId: deadEntity.entityId,
	// 		repeats: multiplier > 1 ? multiplier : 1,
	// 		timing: gameState.sharedState.currentEntityId++,
	// 	});
	// 	gameState.spectator.registerPowerTarget(deadEntity, target, boardWithDeadEntity, null, null);
	// }
};

// Some minions like Icesnarl can revive themselves when killing a minion, so it needs to be handled before
// we actually make the minion die
export const handleWheneverMinionsKillEffect = (
	board: BoardEntity[],
	hero: BgsPlayerEntity,
	otherBoard: BoardEntity[],
	otherHero: BgsPlayerEntity,
	gameState: FullGameState,
): void => {
	handleWheneverMinionsKillEffectForBoard(board, hero, otherBoard, otherHero, gameState);
	// It's called once for each board already, so don't duplicate it here
	// handleWheneverMinionsKillEffectForBoard(otherBoard, otherHero, board, hero, gameState);
};

const handleWheneverMinionsKillEffectForBoard = (
	board: BoardEntity[],
	hero: BgsPlayerEntity,
	otherBoard: BoardEntity[],
	otherHero: BgsPlayerEntity,
	gameState: FullGameState,
): void => {
	for (let i = 0; i < board.length; i++) {
		if (board[i].health <= 0 || board[i].definitelyDead) {
			const futureDeadEntity = board[i];
			const killer = futureDeadEntity.lastAffectedByEntity;
			if (!killer) {
				return;
			}

			// Killed an enemy minion
			if (killer.friendly !== futureDeadEntity.friendly) {
				for (const heroPower of otherHero.heroPowers) {
					// Can't be used to resurrect a dead minion
					// https://replays.firestoneapp.com/?reviewId=d1fffee8-0bc3-40f5-9a59-85eef8367095&turn=11&action=4
					if (heroPower.cardId === CardIds.Rokara_GloryOfCombat && !isDead(killer)) {
						modifyStats(killer, otherHero, 1, 0, otherBoard, otherHero, gameState);
					}
				}

				// Icesnarl the Mighty
				otherBoard
					.filter(
						(e) =>
							e.cardId === CardIds.IcesnarlTheMighty_BG20_HERO_100_Buddy ||
							e.cardId === CardIds.IcesnarlTheMighty_BG20_HERO_100_Buddy_G,
					)
					.forEach((icesnarl) => {
						modifyStats(
							icesnarl,
							icesnarl,
							0,
							icesnarl.cardId === CardIds.IcesnarlTheMighty_BG20_HERO_100_Buddy_G ? 2 : 1,
							board,
							hero,
							gameState,
						);
					});
			}
		}
	}
};

export const handleAfterMinionKillsEffect = (
	deadEntity: BoardEntity,
	deadEntityIndexFromRight: number,
	boardWithDeadEntity: BoardEntity[],
	boardWithDeadEntityHero: BgsPlayerEntity,
	otherBoard: BoardEntity[],
	otherBoardHero: BgsPlayerEntity,
	gameState: FullGameState,
): void => {
	// Moved to "whenever kills", as these can revive the minion that kills
	// const killer = deadEntity.lastAffectedByEntity;
	// if (!killer) {
	// 	return;
	// }
	// // Killed an enemy minion
	// if (killer.friendly !== deadEntity.friendly) {
	// }
};

export const applyAfterMinionDiesEffect = (
	deadEntity: BoardEntity,
	deadEntityIndexFromRight: number,
	boardWithDeadEntity: BoardEntity[],
	boardWithDeadEntityHero: BgsPlayerEntity,
	otherBoard: BoardEntity[],
	otherBoardHero: BgsPlayerEntity,
	gameState: FullGameState,
): void => {
	if (hasCorrectTribe(deadEntity, boardWithDeadEntityHero, Race.DEMON, gameState.anomalies, gameState.allCards)) {
		applySoulJugglerEffect(boardWithDeadEntity, boardWithDeadEntityHero, otherBoard, otherBoardHero, gameState);
	}
};

export const applyWheneverMinionDiesEffect = (
	deadEntity: BoardEntity,
	deadEntityIndexFromRight: number,
	boardWithDeadEntity: BoardEntity[],
	boardWithDeadEntityHero: BgsPlayerEntity,
	otherBoard: BoardEntity[],
	otherBoardHero: BgsPlayerEntity,
	gameState: FullGameState,
): void => {
	// console.log('applying minion death effect', stringifySimpleCard(deadEntity, allCards));
	if (hasCorrectTribe(deadEntity, boardWithDeadEntityHero, Race.BEAST, gameState.anomalies, gameState.allCards)) {
		applyScavengingHyenaEffect(boardWithDeadEntity, boardWithDeadEntityHero, gameState);
	}
	if (hasCorrectTribe(deadEntity, boardWithDeadEntityHero, Race.MECH, gameState.anomalies, gameState.allCards)) {
		applyJunkbotEffect(boardWithDeadEntity, boardWithDeadEntityHero, gameState);
	}
	if (hasCorrectTribe(deadEntity, boardWithDeadEntityHero, Race.MURLOC, gameState.anomalies, gameState.allCards)) {
		removeOldMurkEyeAttack(boardWithDeadEntity, boardWithDeadEntityHero, gameState);
		removeOldMurkEyeAttack(otherBoard, otherBoardHero, gameState);
	}
	if (hasCorrectTribe(deadEntity, boardWithDeadEntityHero, Race.ELEMENTAL, gameState.anomalies, gameState.allCards)) {
		applyMossOfTheSchlossEffect(deadEntity, boardWithDeadEntity, boardWithDeadEntityHero, gameState);
	}

	if (deadEntity.taunt) {
		applyBristlemaneScrapsmithEffect(boardWithDeadEntity, boardWithDeadEntityHero, gameState);
		applyQirajiHarbringerEffect(boardWithDeadEntity, boardWithDeadEntityHero, deadEntityIndexFromRight, gameState);
	}

	if (
		deadEntity.cardId === CardIds.EternalKnight_BG25_008 ||
		deadEntity.cardId === CardIds.EternalKnight_BG25_008_G
	) {
		applyEternalKnightEffect(boardWithDeadEntity, boardWithDeadEntityHero, gameState);
	}

	// Putricide-only
	boardWithDeadEntity
		.filter((e) => e.additionalCards?.includes(CardIds.FlesheatingGhoulLegacy_BG26_tt_004))
		.forEach((e) => {
			modifyStats(e, null, 1, 0, boardWithDeadEntity, boardWithDeadEntityHero, gameState);
		});

	applyRotHideGnollEffect(boardWithDeadEntity, boardWithDeadEntityHero, gameState);

	// Overkill
	if (
		deadEntity.health < 0 &&
		gameState.sharedState.currentAttackerEntityId != null &&
		gameState.sharedState.currentAttackerEntityId === deadEntity.lastAffectedByEntity?.entityId
	) {
		// if (deadEntity.lastAffectedByEntity.cardId === CardIds.HeraldOfFlame_BGS_032) {
		// 	const targets = boardWithDeadEntity.filter((entity) => entity.health > 0 && !entity.definitelyDead);
		// 	if (targets.length > 0) {
		// 		const target = targets[0];
		// 		dealDamageToMinion(
		// 			target,
		// 			boardWithDeadEntity,
		// 			boardWithDeadEntityHero,
		// 			deadEntity.lastAffectedByEntity,
		// 			3,
		// 			otherBoard,
		// 			otherBoardHero,
		// 			gameState,
		// 		);
		// 	}
		// } else if (deadEntity.lastAffectedByEntity.cardId === CardIds.HeraldOfFlame_TB_BaconUps_103) {
		// 	const targets = boardWithDeadEntity.filter((entity) => entity.health > 0 && !entity.definitelyDead);
		// 	if (targets.length > 0) {
		// 		const target = targets[0];
		// 		dealDamageToMinion(
		// 			target,
		// 			boardWithDeadEntity,
		// 			boardWithDeadEntityHero,
		// 			deadEntity.lastAffectedByEntity,
		// 			6,
		// 			otherBoard,
		// 			otherBoardHero,
		// 			gameState,
		// 		);
		// 	}
		// }
		// else if (deadEntity.lastAffectedByEntity.cardId === CardIds.WildfireElemental && deadEntity.lastAffectedByEntity.attacking) {
		// 	// } else if (deadEntity.lastAffectedByEntity.cardId === CardIds.WildfireElemental) {
		// 	// console.log('applying WildfireElemental effect', stringifySimple(boardWithDeadEntity, allCards));
		// 	const excessDamage = -deadEntity.health;
		// 	// Prevent propagation of the effect
		// 	deadEntity.lastAffectedByEntity.attacking = false;
		// 	const neighbours = getNeighbours(boardWithDeadEntity, null, boardWithDeadEntity.length - deadEntityIndexFromRight);
		// 	// console.log('neighbours', stringifySimple(neighbours, allCards));
		// 	if (neighbours.length > 0) {
		// 		const randomTarget = neighbours[Math.floor(Math.random() * neighbours.length)];
		// 		dealDamageToEnemy(
		// 			randomTarget,
		// 			boardWithDeadEntity,
		// 			boardWithDeadEntityHero,
		// 			deadEntity.lastAffectedByEntity,
		// 			excessDamage,
		// 			otherBoard,
		// 			otherBoardHero,
		// 			allCards,
		// 			cardsData,
		// 			sharedState,
		// 			spectator,
		// 		);
		// 	}
		// } else if (
		// 	deadEntity.lastAffectedByEntity.cardId === CardIds.WildfireElementalBattlegrounds &&
		// 	deadEntity.lastAffectedByEntity.attacking
		// ) {
		// 	const excessDamage = -deadEntity.health;
		// 	deadEntity.lastAffectedByEntity.attacking = false;
		// 	const neighbours = getNeighbours(boardWithDeadEntity, null, boardWithDeadEntity.length - deadEntityIndexFromRight);
		// 	neighbours.forEach((neighbour) =>
		// 		dealDamageToEnemy(
		// 			neighbour,
		// 			boardWithDeadEntity,
		// 			boardWithDeadEntityHero,
		// 			deadEntity.lastAffectedByEntity,
		// 			excessDamage,
		// 			otherBoard,
		// 			otherBoardHero,
		// 			allCards,
		// 			cardsData,
		// 			sharedState,
		// 			spectator,
		// 		),
		// 	);
		// }
		if (deadEntity.lastAffectedByEntity.cardId === CardIds.IronhideDirehorn_TRL_232) {
			const newEntities = spawnEntities(
				CardIds.IronhideDirehorn_IronhideRuntToken_TRL_232t,
				1,
				otherBoard,
				otherBoardHero,
				boardWithDeadEntity,
				boardWithDeadEntityHero,
				gameState,
				!deadEntity.friendly,
				false,
			);
			otherBoard.splice(otherBoard.length - deadEntityIndexFromRight, 0, ...newEntities);
			// } else if (deadEntity.lastAffectedByEntity.cardId === CardIds.IronhideDirehorn_TB_BaconUps_051) {
			// 	const newEntities = spawnEntities(
			// 		CardIds.IronhideDirehorn_IronhideRuntToken_TB_BaconUps_051t,
			// 		1,
			// 		otherBoard,
			// 		otherBoardHero,
			// 		boardWithDeadEntity,
			// 		boardWithDeadEntityHero,
			// 		gameState,
			// 		!deadEntity.friendly,
			// 		false,
			// 	);
			// 	otherBoard.splice(otherBoard.length - deadEntityIndexFromRight, 0, ...newEntities);
			// } else if (deadEntity.lastAffectedByEntity.cardId === CardIds.SeabreakerGoliath_BGS_080) {
			// 	const otherPirates = otherBoard
			// 		.filter((entity) =>
			// 			hasCorrectTribe(
			// 				entity,
			// 				boardWithDeadEntityHero,
			// 				Race.PIRATE,
			// 				gameState.anomalies,
			// 				gameState.allCards,
			// 			),
			// 		)
			// 		.filter((entity) => entity.entityId !== deadEntity.lastAffectedByEntity.entityId);
			// 	otherPirates.forEach((pirate) => {
			// 		modifyStats(
			// 			pirate,
			// 			deadEntity.lastAffectedByEntity,
			// 			2,
			// 			2,
			// 			boardWithDeadEntity,
			// 			boardWithDeadEntityHero,
			// 			gameState,
			// 		);
			// 	});
			// } else if (deadEntity.lastAffectedByEntity.cardId === CardIds.SeabreakerGoliath_TB_BaconUps_142) {
			// 	const otherPirates = otherBoard
			// 		.filter((entity) =>
			// 			hasCorrectTribe(
			// 				entity,
			// 				boardWithDeadEntityHero,
			// 				Race.PIRATE,
			// 				gameState.anomalies,
			// 				gameState.allCards,
			// 			),
			// 		)
			// 		.filter((entity) => entity.entityId !== deadEntity.lastAffectedByEntity.entityId);
			// 	otherPirates.forEach((pirate) => {
			// 		modifyStats(
			// 			pirate,
			// 			deadEntity.lastAffectedByEntity,
			// 			4,
			// 			4,
			// 			boardWithDeadEntity,
			// 			boardWithDeadEntityHero,
			// 			gameState,
			// 		);
			// 	});
		}
	}
};

/** @deprecated */
export const dealDamageToAllMinions = (
	board1: BoardEntity[],
	board1Hero: BgsPlayerEntity,
	board2: BoardEntity[],
	board2Hero: BgsPlayerEntity,
	damageSource: BoardEntity,
	damageDealt: number,
	gameState: FullGameState,
): void => {
	if (board1.length === 0 && board2.length === 0) {
		return;
	}
	for (let i = 0; i < board1.length; i++) {
		dealDamageToMinion(board1[i], board1, board1Hero, damageSource, damageDealt, board2, board2Hero, gameState);
	}
	for (let i = 0; i < board2.length; i++) {
		dealDamageToMinion(board2[i], board2, board2Hero, damageSource, damageDealt, board1, board1Hero, gameState);
	}
};

export const applySoulJugglerEffect = (
	boardWithJugglers: BoardEntity[],
	boardWithJugglersHero: BgsPlayerEntity,
	boardToAttack: BoardEntity[],
	boardToAttackHero: BgsPlayerEntity,
	gameState: FullGameState,
): void => {
	if (boardWithJugglers.length === 0 && boardToAttack.length === 0) {
		return;
		// return [boardWithJugglers, boardToAttack];
	}
	const jugglers = boardWithJugglers.filter((entity) => entity.cardId === CardIds.SoulJuggler_BGS_002);
	for (const juggler of jugglers) {
		const target = getRandomMinionWithHighestHealth(boardToAttack);
		gameState.spectator.registerPowerTarget(
			juggler,
			target,
			boardWithJugglers,
			boardWithJugglersHero,
			boardToAttackHero,
		);
		dealDamageToMinion(
			target,
			boardToAttack,
			boardToAttackHero,
			juggler,
			4,
			boardWithJugglers,
			boardWithJugglersHero,
			gameState,
		);
	}
	const goldenJugglers = boardWithJugglers.filter((entity) => entity.cardId === CardIds.SoulJuggler_TB_BaconUps_075);
	for (const juggler of goldenJugglers) {
		for (let i = 0; i < 2; i++) {
			const target = getRandomMinionWithHighestHealth(boardToAttack);
			gameState.spectator.registerPowerTarget(
				juggler,
				target,
				boardWithJugglers,
				boardWithJugglersHero,
				boardToAttackHero,
			);
			dealDamageToMinion(
				target,
				boardToAttack,
				boardToAttackHero,
				juggler,
				4,
				boardWithJugglers,
				boardWithJugglersHero,
				gameState,
			);
		}
	}
	// processMinionDeath(
	// 	boardWithJugglers,
	// 	boardWithJugglersHero,
	// 	boardToAttack,
	// 	boardToAttackHero,
	// 	allCards,
	// 	cardsData,
	// 	sharedState,
	// 	spectator,
	// );
};

const applyScavengingHyenaEffect = (
	board: BoardEntity[],
	boardWithDeadEntityHero: BgsPlayerEntity,
	gameState: FullGameState,
): void => {
	// const copy = [...board];
	for (let i = 0; i < board.length; i++) {
		if (board[i].cardId === CardIds.ScavengingHyenaLegacy_BG_EX1_531) {
			modifyStats(board[i], null, 2, 1, board, boardWithDeadEntityHero, gameState);
			gameState.spectator.registerPowerTarget(board[i], board[i], board, null, null);
		} else if (board[i].cardId === CardIds.ScavengingHyenaLegacy_TB_BaconUps_043) {
			modifyStats(board[i], null, 4, 2, board, boardWithDeadEntityHero, gameState);
			gameState.spectator.registerPowerTarget(board[i], board[i], board, null, null);
		}
	}
};

const applyEternalKnightEffect = (board: BoardEntity[], hero: BgsPlayerEntity, gameState: FullGameState): void => {
	for (let i = 0; i < board.length; i++) {
		if (
			board[i].cardId === CardIds.EternalKnight_BG25_008 ||
			board[i].cardId === CardIds.EternalKnight_BG25_008_G
		) {
			const multiplier = board[i].cardId === CardIds.EternalKnight_BG25_008_G ? 2 : 1;
			modifyStats(
				board[i],
				null,
				multiplier * eternalKnightAttack,
				multiplier * eternalKnightHealth,
				board,
				hero,
				gameState,
			);
			gameState.spectator.registerPowerTarget(board[i], board[i], board, null, null);
		}
	}
};

const applyRotHideGnollEffect = (board: BoardEntity[], hero: BgsPlayerEntity, gameState: FullGameState): void => {
	for (let i = 0; i < board.length; i++) {
		if (board[i].cardId === CardIds.RotHideGnoll_BG25_013 || board[i].cardId === CardIds.RotHideGnoll_BG25_013_G) {
			const multiplier = board[i].cardId === CardIds.RotHideGnoll_BG25_013_G ? 2 : 1;
			modifyStats(board[i], null, multiplier * 1, 0, board, hero, gameState);
			gameState.spectator.registerPowerTarget(board[i], board[i], board, null, null);
		}
	}
};

const applyBristlemaneScrapsmithEffect = (
	board: BoardEntity[],
	boardPlayerEntity: BgsPlayerEntity,
	gameState: FullGameState,
): void => {
	for (let i = 0; i < board.length; i++) {
		if (
			board[i].cardId === CardIds.BristlemaneScrapsmith_BG24_707 ||
			board[i].cardId === CardIds.BristlemaneScrapsmith_BG24_707_G
		) {
			const cardsToAdd = Array(CardIds.BristlemaneScrapsmith_BG24_707_G ? 2 : 1).fill(CardIds.BloodGem);
			addCardsInHand(boardPlayerEntity, board, cardsToAdd, gameState);
			gameState.spectator.registerPowerTarget(board[i], board[i], board, boardPlayerEntity, null);
		}
	}
};

const applyMossOfTheSchlossEffect = (
	deadEntity: BoardEntity,
	board: BoardEntity[],
	hero: BgsPlayerEntity,
	gameState: FullGameState,
): void => {
	board
		.filter(
			(e) => e.cardId === CardIds.MossOfTheSchloss_BG30_111 || e.cardId === CardIds.MossOfTheSchloss_BG30_111_G,
		)
		.filter((e) => e.abiityChargesLeft > 0)
		.forEach((entity) => {
			modifyStats(entity, null, deadEntity.maxAttack, deadEntity.maxHealth, board, hero, gameState);
			entity.abiityChargesLeft--;
			gameState.spectator.registerPowerTarget(entity, entity, board, null, null);
		});
};

const applyJunkbotEffect = (board: BoardEntity[], hero: BgsPlayerEntity, gameState: FullGameState): void => {
	for (let i = 0; i < board.length; i++) {
		if (board[i].cardId === CardIds.Junkbot_GVG_106) {
			modifyStats(board[i], board[i], 2, 2, board, hero, gameState);
			// } else if (board[i].cardId === CardIds.Junkbot_TB_BaconUps_046) {
			// 	modifyStats(board[i], board[i], 4, 4, board, hero, gameState);
		}
	}
};

const applyQirajiHarbringerEffect = (
	board: BoardEntity[],
	hero: BgsPlayerEntity,
	deadEntityIndexFromRight: number,
	gameState: FullGameState,
): void => {
	// const qiraji = board.filter((entity) => entity.cardId === CardIds.QirajiHarbinger_BGS_112);
	// const goldenQiraji = board.filter((entity) => entity.cardId === CardIds.QirajiHarbinger_TB_BaconUps_303);
	// // TODO: if reactivated, properly apply buffs one by one, instead of all together
	// if (qiraji.length + goldenQiraji.length > 0) {
	// 	const neighbours = getNeighbours(board, null, deadEntityIndexFromRight);
	// 	const buff = 2 * qiraji.length + 4 * goldenQiraji.length;
	// 	neighbours.forEach((entity) => {
	// 		modifyStats(entity, null, buff, buff, board, hero, gameState);
	// 	});
	// }
};

export const applyMonstrosity = (
	monstrosity: BoardEntity,
	deadEntities: readonly BoardEntity[],
	boardWithDeadEntities: BoardEntity[],
	boardWithDeadEntityHero: BgsPlayerEntity,
	gameState: FullGameState,
): void => {
	for (const deadEntity of deadEntities) {
		modifyStats(monstrosity, null, deadEntity.attack, 0, boardWithDeadEntities, boardWithDeadEntityHero, gameState);
		if (monstrosity.cardId === CardIds.Monstrosity_BG20_HERO_282_Buddy_G) {
			modifyStats(
				monstrosity,
				null,
				deadEntity.attack,
				0,
				boardWithDeadEntities,
				boardWithDeadEntityHero,
				gameState,
			);
		}
	}
};

export const rememberDeathrattles = (
	fish: BoardEntity,
	inputDeadEntities: readonly BoardEntity[],
	cardsData: CardsData,
	allCards: AllCardsService,
	sharedState: SharedState,
): void => {
	const deadEntities = inputDeadEntities.filter((e) => !isFish(e));
	if (!deadEntities?.length) {
		return;
	}

	// Some infinite loops going on?
	if (fish.rememberedDeathrattles?.length > 100) {
		return;
	}

	const debug = deadEntities.some((e) => e.cardId === CardIds.CorruptedBristler_BG32_431);

	const validDeathrattles = deadEntities
		.filter((entity) => allCards.getCard(entity.cardId).mechanics?.includes(GameTag[GameTag.DEATHRATTLE]))
		.filter((e) => !DEATHRATTLES_REQUIRE_MEMORY.includes(e.cardId as CardIds) || e.memory)
		.map((entity) => ({
			cardId: entity.cardId,
			repeats: 1,
			timing: sharedState.currentEntityId++,
			memory: entity.memory,
			scriptDataNum1: entity.scriptDataNum1,
			scriptDataNum2: entity.scriptDataNum2,
		}));
	const validEnchantments = deadEntities
		.filter((entity) => entity.enchantments?.length)
		.map((entity) => entity.enchantments)
		.reduce((a, b) => a.concat(b), [])
		.flatMap((enchantment) => ({
			cardId: enchantment.cardId,
			repeats: enchantment.repeats ?? 1,
			timing: sharedState.currentEntityId++,
		}))
		.filter((enchantment) => isValidDeathrattleEnchantment(enchantment.cardId));
	// Multiple fish
	const deadEntityRememberedDeathrattles =
		deadEntities
			.filter((e) => !!e.rememberedDeathrattles?.length)
			// If the fish has reborn, it will inherit its own Deathrattles, and we don't want that
			.filter((e) => e.entityId !== fish.rebornFromEntityId)
			.filter((e) => !DEATHRATTLES_REQUIRE_MEMORY.includes(e.cardId as CardIds) || e.memory)
			.flatMap((e) => e.rememberedDeathrattles) ?? [];
	const newDeathrattles = [...validDeathrattles, ...validEnchantments, ...deadEntityRememberedDeathrattles];

	if (newDeathrattles.length > 0) {
		// Order is important - the DR are triggered in the order d the minions have died
		if (isGolden(fish.cardId, allCards)) {
			// https://stackoverflow.com/questions/33305152/how-to-duplicate-elements-in-a-js-array
			const doubleDr = newDeathrattles.reduce((res, current) => res.concat([current, current]), []);
			fish.rememberedDeathrattles = [...(fish.rememberedDeathrattles || []), ...doubleDr];
		} else {
			fish.rememberedDeathrattles = [...(fish.rememberedDeathrattles || []), ...newDeathrattles];
		}

		if (newDeathrattles.some((d) => d.cardId?.startsWith(CardIds.Leapfrogger_BG21_000))) {
			// Not sure exactly why, but if a leapfrogger dies first, then a manasaber,
			// when the fish dies, the manasaber's effect (spawning tokens) is triggered first
			// https://replays.firestoneapp.com/?reviewId=521733fb-8ba1-4663-9a87-3da58e8a09c8&turn=21&action=3
			// HACK: So I will hardcode a rule for now to put leapfrogger effects last
			const leapfroggerDeathrattles = groupLeapfroggerDeathrattles(fish.rememberedDeathrattles);
			fish.rememberedDeathrattles = [
				...fish.rememberedDeathrattles.filter((d) => !d.cardId?.startsWith(CardIds.Leapfrogger_BG21_000)),
				...leapfroggerDeathrattles,
			];
		}
	}
	// console.debug(
	// 	'remembered',
	// 	fish.cardId,
	// 	fish.entityId,
	// 	fish.rememberedDeathrattles.map((d) => ({
	// 		cardId: d.cardId,
	// 		name: allCards.getCard(d.cardId)?.name,
	// 		// repeats: d.repeats,
	// 		// timing: d.timing,
	// 	})),
	// );
};

const removeOldMurkEyeAttack = (
	boardWithDeadEntity: BoardEntity[],
	hero: BgsPlayerEntity,
	gameState: FullGameState,
) => {
	// const murkeyes = boardWithDeadEntity.filter(
	// 	(entity) => entity.cardId === CardIds.OldMurkEyeLegacy || entity.cardId === CardIds.OldMurkEyeVanilla,
	// );
	// const goldenMurkeyes = boardWithDeadEntity.filter((entity) => entity.cardId === CardIds.OldMurkEye);
	// murkeyes.forEach((entity) => {
	// 	modifyStats(entity, null, -1, 0, boardWithDeadEntity, hero, gameState);
	// });
	// goldenMurkeyes.forEach((entity) => {
	// 	modifyStats(entity, null, -2, 0, boardWithDeadEntity, hero, gameState);
	// });
};
