/* eslint-disable @typescript-eslint/no-use-before-define */
import { ALL_BG_RACES, AllCardsService, CardIds, GameTag, Race, ReferenceCard } from '@firestone-hs/reference-data';
import { SharedState } from 'src/simulation/shared-state';
import { BgsPlayerEntity } from './bgs-player-entity';
import { BoardEntity } from './board-entity';
import { CardsData } from './cards/cards-data';
import { pickRandom, shuffleArray } from './services/utils';
import { applyAurasToSelf, handleAddedMinionAuraEffect } from './simulation/add-minion-to-board';
import { FullGameState } from './simulation/internal-game-state';
import { handleMinionRemovedAuraEffect } from './simulation/remove-minion-from-board';
import { Spectator } from './simulation/spectator/spectator';

const CLEAVE_IDS = [
	CardIds.CaveHydra_BG_LOOT_078,
	CardIds.CaveHydra_TB_BaconUps_151,
	CardIds.FoeReaper4000_BG_GVG_113,
	CardIds.FoeReaper4000_TB_BaconUps_153,
	CardIds.BladeCollector_BG26_817,
	CardIds.BladeCollector_BG26_817_G,
];
const ATTACK_IMMEDIATELY_IDS = [
	CardIds.Scallywag_SkyPirateToken_BGS_061t,
	CardIds.Scallywag_SkyPirateToken_TB_BaconUps_141t,
	CardIds.Onyxia_OnyxianWhelpToken,
	CardIds.ToxicTumbleweed_TumblingAssassinToken_BG28_641t,
];
const CANT_ATTACK_IDS = [CardIds.ArcaneCannon_BGS_077, CardIds.ArcaneCannon_TB_BaconUps_128];

export const buildSingleBoardEntity = (
	cardId: string,
	controllerHero: BgsPlayerEntity,
	friendlyBoard: BoardEntity[],
	allCards: AllCardsService,
	friendly: boolean,
	entityId = 1,
	spawnReborn = false,
	cardsData: CardsData,
	sharedState: SharedState,
	entityToSpawn: BoardEntity,
	originalEntity: BoardEntity = null,
): BoardEntity => {
	const card = allCards.getCard(cardId);
	const attackImmediately = ATTACK_IMMEDIATELY_IDS.indexOf(cardId as CardIds) !== -1;
	const newEntity = !!entityToSpawn
		? ({
				...entityToSpawn,
				entityId: sharedState.currentEntityId++,
				definitelyDead: false,
				avengeCurrent: entityToSpawn.avengeDefault,
				attacking: false,
				damageMultiplier: 1,
				frenzyChargesLeft: 1,
				friendly: friendly,
		  } as BoardEntity)
		: addImpliedMechanics(
				{
					entityId: entityId,
					attack: card.attack,
					hasAttacked: 0,
					cardId: cardId,
					divineShield: hasMechanic(card, 'DIVINE_SHIELD'),
					health: card.health,
					maxHealth: card.health,
					taunt: hasMechanic(card, GameTag[GameTag.TAUNT]),
					reborn: hasMechanic(card, 'REBORN'),
					poisonous: hasMechanic(card, GameTag[GameTag.POISONOUS]),
					venomous: hasMechanic(card, GameTag[GameTag.VENOMOUS]),
					windfury:
						hasMechanic(card, GameTag[GameTag.WINDFURY]) ||
						card.referencedTags?.includes(GameTag[GameTag.WINDFURY]),
					enchantments: [],
					friendly: friendly,
					attackImmediately: attackImmediately,
					avengeCurrent: cardsData.avengeValue(cardId),
					avengeDefault: cardsData.avengeValue(cardId),
				} as BoardEntity,
				cardsData,
		  );

	if (spawnReborn && !entityToSpawn) {
		if (cardId === CardIds.BuildAnUndead_PutricidesCreationToken) {
			const stitchedCardId = !!originalEntity.additionalCards?.length ? originalEntity.additionalCards[0] : null;
			if (stitchedCardId) {
				const stitchedCard = allCards.getCard(stitchedCardId);
				newEntity.attack = newEntity.attack + stitchedCard.attack;
				newEntity.maxHealth = newEntity.maxHealth + stitchedCard.health;
				newEntity.taunt = newEntity.taunt || hasMechanic(stitchedCard, GameTag[GameTag.TAUNT]);
				newEntity.divineShield =
					newEntity.divineShield || hasMechanic(stitchedCard, GameTag[GameTag.DIVINE_SHIELD]);
				newEntity.hadDivineShield = newEntity.hadDivineShield || newEntity.divineShield;
				newEntity.poisonous = newEntity.poisonous || hasMechanic(stitchedCard, GameTag[GameTag.POISONOUS]);
				newEntity.venomous = newEntity.venomous || hasMechanic(stitchedCard, GameTag[GameTag.VENOMOUS]);
				newEntity.windfury = newEntity.windfury || hasMechanic(stitchedCard, GameTag[GameTag.WINDFURY]);
				newEntity.avengeCurrent = newEntity.avengeCurrent || cardsData.avengeValue(stitchedCardId);
				newEntity.avengeDefault = newEntity.avengeDefault || cardsData.avengeValue(stitchedCardId);
			}
		}
		newEntity.health = 1;
		newEntity.reborn = false;
	}

	newEntity.hadDivineShield = newEntity.divineShield || newEntity.hadDivineShield;
	return newEntity;
};

export const buildRandomUndeadCreation = (
	controllerHero: BgsPlayerEntity,
	friendlyBoard: BoardEntity[],
	allCards: AllCardsService,
	friendly: boolean,
	cardsData: CardsData,
	sharedState: SharedState,
): BoardEntity => {
	const baseCard = pickRandom(cardsData.putricidePool1);
	const stitchedCardId =
		baseCard === CardIds.EternalSummoner_BG25_009
			? pickRandom(cardsData.putridicePool2ForEternalSummoner)
			: pickRandom(cardsData.putricidePool2);
	const newEntity = buildSingleBoardEntity(
		baseCard,
		controllerHero,
		friendlyBoard,
		allCards,
		friendly,
		sharedState.currentEntityId++,
		false,
		cardsData,
		sharedState,
		null,
	);
	const stitchedCard = allCards.getCard(stitchedCardId);
	newEntity.attack += stitchedCard.attack;
	newEntity.health += stitchedCard.health;
	newEntity.taunt = newEntity.taunt || hasMechanic(stitchedCard, GameTag[GameTag.TAUNT]);
	newEntity.divineShield = newEntity.divineShield || hasMechanic(stitchedCard, GameTag[GameTag.DIVINE_SHIELD]);
	newEntity.poisonous = newEntity.venomous || hasMechanic(stitchedCard, GameTag[GameTag.POISONOUS]);
	newEntity.venomous = newEntity.poisonous || hasMechanic(stitchedCard, GameTag[GameTag.VENOMOUS]);
	newEntity.windfury = newEntity.windfury || hasMechanic(stitchedCard, GameTag[GameTag.WINDFURY]);
	newEntity.avengeCurrent = newEntity.avengeCurrent || cardsData.avengeValue(stitchedCardId);
	newEntity.avengeDefault = newEntity.avengeDefault || cardsData.avengeValue(stitchedCardId);
	return newEntity;
};

export const setEntityStats = (
	entity: BoardEntity,
	attack: number | null,
	health: number | null,
	board: BoardEntity[],
	boardHero: BgsPlayerEntity,
	allCards: AllCardsService,
	sharedState: SharedState,
	spectator: Spectator,
): void => {
	if (attack !== null) {
		entity.attack = attack;
	}
	if (health !== null) {
		entity.health = health;
		entity.maxHealth = health;
	}
	applyAurasToSelf(entity, board, boardHero, allCards, sharedState, spectator);
};

export const modifyAttack = (
	entity: BoardEntity,
	amount: number,
	friendlyBoard: BoardEntity[],
	allCards: AllCardsService,
	spectator: Spectator = null,
): void => {
	if (amount === 0) {
		return;
	}

	const realAmount = entity.cardId === CardIds.Tarecgosa_BG21_015_G ? 2 * amount : amount;
	entity.attack = Math.max(0, entity.attack + realAmount);
	entity.previousAttack = entity.attack;
	if (isCorrectTribe(allCards.getCard(entity.cardId).races, Race.DRAGON)) {
		const whelpSmugglers = friendlyBoard.filter(
			(e) => e.cardId === CardIds.WhelpSmuggler_BG21_013 || e.cardId === CardIds.WhelpSmuggler_BG21_013_G,
		);
		whelpSmugglers.forEach((smuggler) => {
			const buff = smuggler.cardId === CardIds.WhelpSmuggler_BG21_013_G ? 2 : 1;
			modifyHealth(entity, buff, friendlyBoard, allCards);
		});

		if (entity.cardId !== CardIds.Stormbringer_BG26_966 && entity.cardId !== CardIds.Stormbringer_BG26_966_G) {
			const stormbringers = friendlyBoard.filter(
				(e) => e.cardId === CardIds.Stormbringer_BG26_966 || e.cardId === CardIds.Stormbringer_BG26_966_G,
			);
			stormbringers.forEach((stormbringer) => {
				const multiplier = stormbringer.cardId === CardIds.Stormbringer_BG26_966_G ? 2 : 1;
				(e) => modifyAttack(e, multiplier * amount, friendlyBoard, allCards);
			});
		}
	}
	if (
		entity.cardId === CardIds.Menagerist_AmalgamToken ||
		entity.cardId === CardIds.Cuddlgam_TB_BaconShop_HP_033t_SKIN_A ||
		entity.cardId === CardIds.Cuddlgam_TB_BaconShop_HP_033t_SKIN_A_G ||
		entity.cardId === CardIds.AbominableAmalgam_TB_BaconShop_HP_033t_SKIN_D ||
		entity.cardId === CardIds.AbominableAmalgam_TB_BaconShop_HP_033t_SKIN_D_G
	) {
		const mishmashes = friendlyBoard.filter(
			(e) =>
				e.cardId === CardIds.Mishmash_TB_BaconShop_HERO_33_Buddy ||
				e.cardId === CardIds.Mishmash_TB_BaconShop_HERO_33_Buddy_G,
		);
		mishmashes.forEach((mishmash) => {
			modifyAttack(
				mishmash,
				(mishmash.cardId === CardIds.Mishmash_TB_BaconShop_HERO_33_Buddy_G ? 2 : 1) * realAmount,
				friendlyBoard,
				allCards,
			);
		});
	}

	if ([CardIds.HunterOfGatherers_BG25_027, CardIds.HunterOfGatherers_BG25_027_G].includes(entity.cardId as CardIds)) {
		addStatsToBoard(
			entity,
			friendlyBoard,
			0,
			entity.cardId === CardIds.HunterOfGatherers_BG25_027_G ? 2 : 1,
			allCards,
			null,
		);
	}
};

export const modifyHealth = (
	entity: BoardEntity,
	amount: number,
	friendlyBoard: BoardEntity[],
	allCards: AllCardsService,
): void => {
	const realAmount = entity.cardId === CardIds.Tarecgosa_BG21_015 ? 2 * amount : amount;
	entity.health += realAmount;
	if (realAmount > 0) {
		entity.maxHealth += realAmount;
	}
	if (
		entity.cardId === CardIds.Menagerist_AmalgamToken ||
		entity.cardId === CardIds.Cuddlgam_TB_BaconShop_HP_033t_SKIN_A ||
		entity.cardId === CardIds.Cuddlgam_TB_BaconShop_HP_033t_SKIN_A_G ||
		entity.cardId === CardIds.AbominableAmalgam_TB_BaconShop_HP_033t_SKIN_D ||
		entity.cardId === CardIds.AbominableAmalgam_TB_BaconShop_HP_033t_SKIN_D_G
	) {
		const mishmashes = friendlyBoard.filter(
			(e) =>
				e.cardId === CardIds.Mishmash_TB_BaconShop_HERO_33_Buddy ||
				e.cardId === CardIds.Mishmash_TB_BaconShop_HERO_33_Buddy_G,
		);
		mishmashes.forEach((mishmash) => {
			modifyHealth(
				mishmash,
				(mishmash.cardId === CardIds.Mishmash_TB_BaconShop_HERO_33_Buddy_G ? 2 : 1) * realAmount,
				friendlyBoard,
				allCards,
			);
		});
	}

	const titanicGuardians = friendlyBoard
		.filter((e) => e.entityId !== entity.entityId)
		.filter(
			(e) =>
				e.cardId === CardIds.TitanicGuardian_TB_BaconShop_HERO_39_Buddy ||
				e.cardId === CardIds.TitanicGuardian_TB_BaconShop_HERO_39_Buddy_G,
		);
	titanicGuardians.forEach((guardian) => {
		modifyHealth(
			guardian,
			(guardian.cardId === CardIds.TitanicGuardian_TB_BaconShop_HERO_39_Buddy_G ? 2 : 1) * realAmount,
			friendlyBoard,
			allCards,
		);
	});
};

export const afterStatsUpdate = (
	entity: BoardEntity,
	friendlyBoard: BoardEntity[],
	allCards: AllCardsService,
): void => {
	if (hasCorrectTribe(entity, Race.ELEMENTAL, allCards)) {
		const masterOfRealities = friendlyBoard.filter(
			(e) => e.cardId === CardIds.MasterOfRealities_BG21_036 || e.cardId === CardIds.MasterOfRealities_BG21_036_G,
		);
		masterOfRealities.forEach((master) => {
			modifyAttack(
				master,
				master.cardId === CardIds.MasterOfRealities_BG21_036_G ? 2 : 1,
				friendlyBoard,
				allCards,
			);
			modifyHealth(
				master,
				master.cardId === CardIds.MasterOfRealities_BG21_036_G ? 2 : 1,
				friendlyBoard,
				allCards,
			);
		});
	}
	const tentaclesOfCthun = friendlyBoard
		.filter((e) => e.entityId !== entity.entityId)
		.filter(
			(e) =>
				e.cardId === CardIds.TentacleOfCthun_TB_BaconShop_HERO_29_Buddy ||
				e.cardId === CardIds.TentacleOfCthun_TB_BaconShop_HERO_29_Buddy_G,
		);
	tentaclesOfCthun.forEach((tentacle) => {
		modifyAttack(
			tentacle,
			tentacle.cardId === CardIds.TentacleOfCthun_TB_BaconShop_HERO_29_Buddy_G ? 2 : 1,
			friendlyBoard,
			allCards,
		);
		modifyHealth(
			tentacle,
			tentacle.cardId === CardIds.TentacleOfCthun_TB_BaconShop_HERO_29_Buddy_G ? 2 : 1,
			friendlyBoard,
			allCards,
		);
	});
};

export const makeMinionGolden = (
	target: BoardEntity,
	source: BoardEntity | BgsPlayerEntity,
	targetBoard: BoardEntity[],
	targetBoardHero: BgsPlayerEntity,
	allCards: AllCardsService,
	spectator: Spectator,
	sharedState: SharedState,
): void => {
	// Typically, we are already golden
	if (isMinionGolden(target, allCards)) {
		return;
	}

	// console.log('before transforming minion', stringifySimple(targetBoard, allCards));
	handleMinionRemovedAuraEffect(targetBoard, target, targetBoardHero, allCards, spectator);
	// console.log('after removed effect', stringifySimple(targetBoard, allCards));
	const refCard = allCards.getCard(target.cardId);
	const goldenCard = allCards.getCardFromDbfId(refCard.battlegroundsPremiumDbfId);
	target.cardId = goldenCard.id;
	// A minion becoming golden ignore the current death.
	// This way of handling it is not ideal, since it will still trigger if both avenges trigger at the same time, but
	// should solve the other cases
	target.avengeCurrent = Math.min(target.avengeDefault, target.avengeCurrent + 1);
	modifyAttack(target, refCard.attack, targetBoard, allCards);
	modifyHealth(target, refCard.health, targetBoard, allCards);
	afterStatsUpdate(target, targetBoard, allCards);

	// console.log('before adding new effect', stringifySimple(targetBoard, allCards));
	handleAddedMinionAuraEffect(targetBoard, targetBoardHero, target, allCards, spectator, sharedState);
	// console.log('after adding new effect', stringifySimple(targetBoard, allCards));

	spectator.registerPowerTarget(source, target, targetBoard, null, null);
};

export const isMinionGolden = (entity: BoardEntity, allCards: AllCardsService): boolean => {
	const ref = allCards.getCard(entity.cardId);
	return !ref.battlegroundsPremiumDbfId;
	// Why this condition?
	// || !allCards.getCardFromDbfId(ref.battlegroundsPremiumDbfId).id
};

export const grantRandomAttack = (
	source: BoardEntity,
	board: BoardEntity[],
	additionalAttack: number,
	allCards: AllCardsService,
	spectator: Spectator,
	excludeSource = false,
): void => {
	const candidateBoard = board
		.filter((e) => !excludeSource || e.entityId !== source.entityId)
		.filter((e) => e.health > 0 && !e.definitelyDead);
	if (candidateBoard.length > 0) {
		const target = candidateBoard[Math.floor(Math.random() * candidateBoard.length)];
		modifyAttack(target, additionalAttack, candidateBoard, allCards);
		afterStatsUpdate(target, candidateBoard, allCards);
		spectator.registerPowerTarget(source, target, board, null, null);
	}
};

export const grantRandomHealth = (
	source: BoardEntity,
	board: BoardEntity[],
	health: number,
	allCards: AllCardsService,
	spectator: Spectator,
	excludeSource = false,
): void => {
	const candidateBoard = board
		.filter((e) => !excludeSource || e.entityId !== source.entityId)
		.filter((e) => e.health > 0 && !e.definitelyDead);
	if (candidateBoard.length > 0) {
		const target = candidateBoard[Math.floor(Math.random() * candidateBoard.length)];
		modifyHealth(target, health, board, allCards);
		afterStatsUpdate(target, board, allCards);
		spectator.registerPowerTarget(source, target, board, null, null);
	}
};

export const grantRandomStats = (
	source: BoardEntity,
	board: BoardEntity[],
	attack: number,
	health: number,
	race: Race,
	excludeSource: boolean,
	allCards: AllCardsService,
	spectator?: Spectator,
): BoardEntity => {
	if (board.length > 0) {
		const target: BoardEntity = getRandomAliveMinion(
			board.filter((e) => !!e.cardId).filter((e) => (excludeSource ? e.entityId !== source.entityId : true)),
			race,
			allCards,
		);
		if (target) {
			modifyAttack(target, attack, board, allCards);
			modifyHealth(target, health, board, allCards);
			afterStatsUpdate(target, board, allCards);
			if (spectator) {
				spectator.registerPowerTarget(source, target, board, null, null);
			}
			return target;
		}
	}
	return null;
};

export const addCardsInHand = (
	playerEntity: BgsPlayerEntity,
	board: BoardEntity[],
	cardsAdded: readonly any[],
	gameState: FullGameState,
): void => {
	const previousCardsInHand = playerEntity.hand?.length ?? 0;
	const sages = board.filter((e) => e.cardId === CardIds.DeathsHeadSage_BG20_HERO_103_Buddy);
	const sagesGolden = board.filter((e) => e.cardId === CardIds.DeathsHeadSage_BG20_HERO_103_Buddy_G);
	const multiplier = sages.length + 2 * sagesGolden.length;

	const cardsThatWillBeAdded: BoardEntity[] = [];
	for (const cardAdded of cardsAdded) {
		const cardToAdd: BoardEntity = (cardAdded as BoardEntity)?.cardId
			? buildSingleBoardEntity(
					cardAdded as string,
					playerEntity,
					board,
					gameState.allCards,
					playerEntity.friendly,
					gameState.sharedState.currentEntityId++,
					false,
					gameState.cardsData,
					gameState.sharedState,
					cardAdded,
			  )
			: buildSingleBoardEntity(
					cardAdded as string,
					playerEntity,
					board,
					gameState.allCards,
					playerEntity.friendly,
					gameState.sharedState.currentEntityId++,
					false,
					gameState.cardsData,
					gameState.sharedState,
					null,
			  );
		cardsThatWillBeAdded.push(cardToAdd);
		if (cardToAdd.cardId === CardIds.BloodGem) {
			for (let i = 0; i < multiplier; i++) {
				cardsThatWillBeAdded.push({ ...cardToAdd });
			}
		}
	}

	for (let i = 0; i < cardsThatWillBeAdded.length; i++) {
		if (playerEntity.hand.length >= 10) {
			break;
		}
		playerEntity.hand.push(cardsThatWillBeAdded[i]);
	}

	const numCardsAdded = playerEntity.hand.length - previousCardsInHand;

	for (let i = 0; i < numCardsAdded; i++) {
		const peggys = board.filter(
			(e) => e.cardId === CardIds.PeggySturdybone_BG25_032 || e.cardId === CardIds.PeggySturdybone_BG25_032_G,
		);
		peggys.forEach((peggy) => {
			const pirate = getRandomAliveMinion(
				board.filter((e) => e.entityId !== peggy.entityId),
				Race.PIRATE,
				gameState.allCards,
			);
			if (pirate) {
				modifyAttack(
					pirate,
					peggy.cardId === CardIds.PeggySturdybone_BG25_032_G ? 2 : 1,
					board,
					gameState.allCards,
				);
				modifyHealth(
					pirate,
					peggy.cardId === CardIds.PeggySturdybone_BG25_032_G ? 2 : 1,
					board,
					gameState.allCards,
				);
				afterStatsUpdate(pirate, board, gameState.allCards);
				gameState.spectator.registerPowerTarget(peggy, pirate, board, playerEntity, null);
			}
		});

		const thornCaptains = board.filter(
			(e) => e.cardId === CardIds.Thorncaptain_BG25_045 || e.cardId === CardIds.Thorncaptain_BG25_045_G,
		);
		thornCaptains.forEach((captain) => {
			modifyHealth(
				captain,
				captain.cardId === CardIds.Thorncaptain_BG25_045_G ? 2 : 1,
				board,
				gameState.allCards,
			);
			afterStatsUpdate(captain, board, gameState.allCards);
			gameState.spectator.registerPowerTarget(captain, captain, board, playerEntity, null);
		});
	}
};

export const removeCardFromHand = (playerEntity: BgsPlayerEntity, card: BoardEntity): void => {
	let cardToRemove: BoardEntity;
	if (card?.entityId) {
		cardToRemove = playerEntity.hand.find((c) => c?.entityId !== card.entityId);
	} else if (card?.cardId) {
		cardToRemove = playerEntity.hand.find((c) => c?.cardId === card.cardId);
	} else {
		// Remove a single random card in hand that doesn't have an entityId
		cardToRemove =
			pickRandom(playerEntity.hand.filter((c) => !c?.entityId && !c?.cardId)) ?? pickRandom(playerEntity.hand);
	}
	// Remove the first occurrence of the card from playerEntity.cardsInHand, even if it is null
	const index = playerEntity.hand.indexOf(cardToRemove);
	if (index !== -1) {
		playerEntity.hand.splice(index, 1);
	}
};

export const grantRandomDivineShield = (
	source: BoardEntity,
	board: BoardEntity[],
	allCards: AllCardsService,
	spectator: Spectator,
): void => {
	const elligibleEntities = board
		.filter((entity) => !entity.divineShield)
		.filter((entity) => entity.health > 0 && !entity.definitelyDead);
	if (elligibleEntities.length > 0) {
		const chosen = elligibleEntities[Math.floor(Math.random() * elligibleEntities.length)];
		updateDivineShield(chosen, board, true, allCards);
		spectator.registerPowerTarget(source, chosen, board, null, null);
	}
	// return board;
};

export const updateDivineShield = (
	entity: BoardEntity,
	board: BoardEntity[],
	newValue: boolean,
	allCards: AllCardsService,
): void => {
	// if ((entity.divineShield ?? false) === newValue) {
	// 	return;
	// }
	entity.hadDivineShield = newValue || entity.divineShield || entity.hadDivineShield;
	entity.divineShield = newValue;
	if (entity.divineShield) {
		const boardForDrake = board;
		const statsBonus =
			8 * boardForDrake.filter((e) => e.cardId === CardIds.CyborgDrake_BG25_043).length +
			16 * boardForDrake.filter((e) => e.cardId === CardIds.CyborgDrake_BG25_043_G).length;
		// Don't trigger all "on attack changed" effects, since it's an aura
		entity.attack += statsBonus;
	} else {
		// Also consider itself
		const boardForDrake = board;
		const statsBonus =
			8 * boardForDrake.filter((e) => e.cardId === CardIds.CyborgDrake_BG25_043).length +
			16 * boardForDrake.filter((e) => e.cardId === CardIds.CyborgDrake_BG25_043_G).length;
		entity.attack -= statsBonus;
	}
};

export const grantAllDivineShield = (board: BoardEntity[], tribe: string, cards: AllCardsService): void => {
	const elligibleEntities = board
		.filter((entity) => !entity.divineShield)
		.filter((entity) => isCorrectTribe(cards.getCard(entity.cardId).races, getRaceEnum(tribe)));
	for (const entity of elligibleEntities) {
		updateDivineShield(entity, board, true, cards);
	}
};

export const getRandomAliveMinion = (board: BoardEntity[], race: Race, allCards: AllCardsService): BoardEntity => {
	const validTribes = board
		.filter((e) => !race || isCorrectTribe(allCards.getCard(e?.cardId).races, race))
		.filter((e) => !!e?.health && !e.definitelyDead);
	if (!validTribes.length) {
		return null;
	}
	const randomIndex = Math.floor(Math.random() * validTribes.length);
	return validTribes[randomIndex];
};

export const getRandomMinionWithHighestHealth = (board: BoardEntity[]): BoardEntity => {
	if (!board.length) {
		return null;
	}

	const highestHealth = Math.max(...board.map((e) => e.health));
	const validMinions = board.filter((e) => e.health === highestHealth);
	return validMinions[Math.floor(Math.random() * validMinions.length)];
};

export const addStatsToBoard = (
	sourceEntity: BoardEntity | BgsPlayerEntity,
	board: BoardEntity[],
	attack: number,
	health: number,
	allCards: AllCardsService,
	spectator: Spectator,
	tribe?: string,
): void => {
	for (const entity of board) {
		if (!tribe || hasCorrectTribe(entity, Race[tribe], allCards)) {
			modifyAttack(entity, attack, board, allCards);
			modifyHealth(entity, health, board, allCards);
			afterStatsUpdate(entity, board, allCards);
			spectator?.registerPowerTarget(sourceEntity, entity, board, null, null);
		}
	}
};

export const grantStatsToMinionsOfEachType = (
	source: BoardEntity,
	board: BoardEntity[],
	attack: number,
	health: number,
	allCards: AllCardsService,
	spectator: Spectator,
	numberOfDifferentTypes = 99,
): void => {
	if (board.length > 0) {
		let boardCopy = [...board];
		const allRaces = shuffleArray(ALL_BG_RACES);
		let typesBuffed = 0;
		for (const tribe of allRaces) {
			if (typesBuffed >= numberOfDifferentTypes) {
				return;
			}

			const validMinion: BoardEntity = getRandomAliveMinion(boardCopy, tribe, allCards);
			if (validMinion) {
				modifyAttack(validMinion, attack, board, allCards);
				modifyHealth(validMinion, health, board, allCards);
				afterStatsUpdate(validMinion, board, allCards);
				spectator.registerPowerTarget(source, validMinion, board, null, null);
				boardCopy = boardCopy.filter((e) => e !== validMinion);
				typesBuffed++;
			}
		}
	}
};

export const hasMechanic = (card: ReferenceCard, mechanic: string): boolean => {
	return card.mechanics?.includes(mechanic);
};

export const hasCorrectTribe = (entity: BoardEntity, targetTribe: Race, allCards: AllCardsService): boolean => {
	return isCorrectTribe(allCards.getCard(entity.cardId).races, targetTribe);
};

export const isCorrectTribe = (cardRaces: readonly string[], targetTribe: Race): boolean => {
	if (!cardRaces?.length) {
		return false;
	}
	return cardRaces
		.map((cardRace) => getRaceEnum(cardRace))
		.some((raceEnum) => raceEnum === Race.ALL || raceEnum === targetTribe);
};

export const getRaceEnum = (race: string): Race => {
	return Race[race];
};

export const addImpliedMechanics = (entity: BoardEntity, cardsData: CardsData): BoardEntity => {
	const cleave = CLEAVE_IDS.indexOf(entity.cardId as CardIds) !== -1;
	const cantAttack = CANT_ATTACK_IDS.indexOf(entity.cardId as CardIds) !== -1;
	return setImplicitDataForEntity(
		{
			...entity,
			cleave: cleave,
			cantAttack: cantAttack,
			divineShield: entity.divineShield || entity.hadDivineShield,
			immuneWhenAttackCharges:
				entity.cardId === CardIds.Warpwing_BG24_004 || entity.cardId === CardIds.Warpwing_BG24_004_G
					? 99999
					: 0,
			frenzyChargesLeft:
				entity.cardId === CardIds.BristlebackKnight_BG20_204_G
					? 2
					: entity.cardId === CardIds.BristlebackKnight_BG20_204
					? 1
					: 0,
			// It's not an issue adding a charge for entities without a special ability
			abiityChargesLeft: [
				CardIds.TransmutedBramblewitch_BG27_013_G,
				CardIds.Mannoroth_BG27_507_G,
				CardIds.EclipsionIllidari_TB_BaconShop_HERO_08_Buddy_G,
			].includes(entity.cardId as CardIds)
				? 2
				: 1,
		} as BoardEntity,
		cardsData,
	);
};

const setImplicitDataForEntity = (entity: BoardEntity, cardsData: CardsData): BoardEntity => {
	entity.cardId = normalizeCardIdForSkin(entity.cardId);
	entity.maxHealth = Math.max(0, entity.health);
	const avengeValue = cardsData.avengeValue(entity.cardId);
	if (avengeValue > 0) {
		entity.avengeCurrent = avengeValue;
		entity.avengeDefault = avengeValue;
	}
	return entity;
};

export const normalizeCardIdForSkin = (cardId: string): string => {
	if (!cardId?.length) {
		return cardId;
	}
	const skinMatch = cardId.match(/(.*)_SKIN_.*/);
	if (skinMatch) {
		return skinMatch[1];
	}
	return cardId;
};

export const stringifySimple = (board: readonly BoardEntity[], allCards: AllCardsService = null): string => {
	return '[' + board.map((entity) => stringifySimpleCard(entity, allCards)).join(', ') + ']';
};

export const stringifySimpleCard = (entity: BoardEntity, allCards: AllCardsService = null): string => {
	return entity
		? `${allCards?.getCard(entity.cardId)?.name ?? entity.cardId}/entityId=${entity.entityId}/hp=${entity.health}`
		: null;
};

export const isFish = (entity: BoardEntity): boolean => {
	return (
		entity.cardId.startsWith(CardIds.AvatarOfNzoth_FishOfNzothToken) ||
		entity.cardId.startsWith(CardIds.FishOfNzoth) ||
		entity.additionalCards?.includes(CardIds.DevourerOfSouls_BG_RLK_538)
	);
};

export const isPilotedWhirlOTron = (entity: BoardEntity): boolean => {
	return entity.cardId.startsWith(CardIds.PilotedWhirlOTron_BG21_HERO_030_Buddy);
};

export const isGolden = (cardId: string, allCards: AllCardsService): boolean => {
	return !!allCards.getCard(cardId).battlegroundsNormalDbfId;
};
