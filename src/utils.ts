/* eslint-disable @typescript-eslint/no-use-before-define */
import { AllCardsService, ALL_BG_RACES, CardIds, Race, ReferenceCard } from '@firestone-hs/reference-data';
import { SharedState } from 'src/simulation/shared-state';
import { BgsPlayerEntity } from './bgs-player-entity';
import { BoardEntity } from './board-entity';
import { CardsData } from './cards/cards-data';
import { Spectator } from './simulation/spectator/spectator';

const CLEAVE_IDS = [
	CardIds.CaveHydra_BG_LOOT_078,
	CardIds.CaveHydraBattlegrounds,
	CardIds.FoeReaper4000_BG_GVG_113,
	CardIds.FoeReaper4000Battlegrounds,
];
// Because for some reason, the Taunt keyword is only a referenced tag,
// so we have to know when a taunt minion is spawned (the taunt tag
// is passed in input properly, so it's not an issue there)
const TAUNT_IDS = [
	CardIds.YoHoOgre,
	CardIds.YoHoOgreBattlegrounds,
	CardIds.SecurityRover_GuardBotToken,
	CardIds.SecurityRover_GuardBotTokenBattlegrounds,
	CardIds.MoltenRock,
	CardIds.MoltenRockBattlegrounds,
	CardIds.LieutenantGarr,
	CardIds.LieutenantGarrBattlegrounds,
	CardIds.GentleDjinni,
	CardIds.GentleDjinniBattlegrounds,
	CardIds.AcolyteOfCthun,
	CardIds.AcolyteOfCthunBattlegrounds,
	CardIds.RingMatron_BG_DMF_533,
	CardIds.RingMatronBattlegrounds,
	CardIds.DynamicDuo,
	CardIds.DynamicDuoBattlegrounds,
	CardIds.InsatiableUrzul,
	CardIds.InsatiableUrzulBattlegrounds,
	CardIds.MasterOfRealities_BG21_036,
	CardIds.MasterOfRealitiesBattlegrounds,
	CardIds.BrannsEpicEggBattlegrounds_TB_BaconShop_HERO_43_Buddy,
	CardIds.BrannsEpicEggBattlegrounds_TB_BaconShop_HERO_43_Buddy_G,
	CardIds.KilrekBattlegrounds_TB_BaconShop_HERO_37_Buddy,
	CardIds.KilrekBattlegrounds_TB_BaconShop_HERO_37_Buddy_G,
	CardIds.Glowscale,
	CardIds.GlowscaleBattlegrounds,
	CardIds.SilverbackPatriarch_BG_CS2_127,
	CardIds.SilverbackPatriarch_BG_CS2_127_G,
	CardIds.SparringPartner_BG_AT_069,
	CardIds.SparringPartnerBattlegrounds,
	CardIds.TunnelBlaster_BG_DAL_775,
	CardIds.TunnelBlasterBattlegrounds,
];
const ATTACK_IMMEDIATELY_IDS = [
	CardIds.Scallywag_SkyPirateToken,
	CardIds.Scallywag_SkyPirateTokenBattlegrounds,
	CardIds.Onyxia_OnyxianWhelpToken,
];
export const MEGA_WINDFURY_IDS = [
	CardIds.ZappSlywickBattlegrounds,
	CardIds.CracklingCycloneBattlegrounds,
	CardIds.BristlebackKnightBattlegrounds,
	CardIds.BonkerBattlegrounds,
];
const CANT_ATTACK_IDS = [CardIds.ArcaneCannonBattlegrounds];

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
): BoardEntity => {
	const card = allCards.getCard(cardId);
	const megaWindfury = MEGA_WINDFURY_IDS.indexOf(cardId as CardIds) !== -1;
	const attackImmediately = ATTACK_IMMEDIATELY_IDS.indexOf(cardId as CardIds) !== -1;
	const newEntity = !!entityToSpawn
		? { ...entityToSpawn, entityId: sharedState.currentEntityId++ }
		: addImpliedMechanics({
				attack: card.attack,
				attacksPerformed: 0,
				cardId: cardId,
				divineShield: hasMechanic(card, 'DIVINE_SHIELD'),
				entityId: entityId,
				health: card.health,
				maxHealth: card.health,
				taunt: hasMechanic(card, 'TAUNT') || TAUNT_IDS.includes(cardId as CardIds),
				reborn: hasMechanic(card, 'REBORN'),
				poisonous: hasMechanic(card, 'POISONOUS'),
				windfury: !megaWindfury && (hasMechanic(card, 'WINDFURY') || card.referencedTags?.includes('WINDFURY')),
				megaWindfury: megaWindfury,
				enchantments: [],
				friendly: friendly,
				attackImmediately: attackImmediately,
				avengeCurrent: cardsData.avengeValue(cardId),
				avengeDefault: cardsData.avengeValue(cardId),
		  } as BoardEntity);

	if (spawnReborn) {
		newEntity.health = 1;
		newEntity.reborn = false;
	}

	if (controllerHero?.heroPowerId === CardIds.SproutItOutBattlegrounds) {
		newEntity.taunt = true;
		modifyAttack(newEntity, 1, friendlyBoard, allCards);
		modifyHealth(newEntity, 2, friendlyBoard, allCards);
		afterStatsUpdate(newEntity, friendlyBoard, allCards);
		// spectator && spectator.registerPowerTarget(result, result, friendlyBoard);
	} else if (controllerHero?.heroPowerId === CardIds.KurtrusAshfallen_CloseThePortal) {
		modifyAttack(newEntity, 2, friendlyBoard, allCards);
		modifyHealth(newEntity, 2, friendlyBoard, allCards);
		afterStatsUpdate(newEntity, friendlyBoard, allCards);
		// spectator && spectator.registerPowerTarget(result, result, friendlyBoard);
	} else if (controllerHero?.heroPowerId === CardIds.Toki_TinkerBattlegrounds) {
		if (hasCorrectTribe(newEntity, Race.MECH, allCards)) {
			modifyAttack(newEntity, 2, friendlyBoard, allCards);
			afterStatsUpdate(newEntity, friendlyBoard, allCards);
		}
	}

	if (allCards.getCard(cardId).techLevel === controllerHero.tavernTier) {
		const statsBonus =
			4 * friendlyBoard.filter((e) => e.cardId === CardIds.BabyYshaarjBattlegrounds_TB_BaconShop_HERO_92_Buddy).length +
			8 * friendlyBoard.filter((e) => e.cardId === CardIds.BabyYshaarjBattlegrounds_TB_BaconShop_HERO_92_Buddy_G).length;
		modifyAttack(newEntity, statsBonus, friendlyBoard, allCards);
		modifyHealth(newEntity, statsBonus, friendlyBoard, allCards);
		afterStatsUpdate(newEntity, friendlyBoard, allCards);
	}

	if (newEntity.taunt) {
		const statsBonus =
			2 * friendlyBoard.filter((e) => e.cardId === CardIds.WanderingTreantBattlegrounds_TB_BaconShop_HERO_95_Buddy).length +
			4 * friendlyBoard.filter((e) => e.cardId === CardIds.WanderingTreantBattlegrounds_TB_BaconShop_HERO_95_Buddy_G).length;
		modifyAttack(newEntity, statsBonus, friendlyBoard, allCards);
		modifyHealth(newEntity, statsBonus, friendlyBoard, allCards);
		afterStatsUpdate(newEntity, friendlyBoard, allCards);
	}

	return newEntity;
};

export const modifyAttack = (entity: BoardEntity, amount: number, friendlyBoard: BoardEntity[], allCards: AllCardsService): void => {
	const realAmount = entity.cardId === CardIds.TarecgosaBattlegrounds ? 2 * amount : amount;
	entity.attack = Math.max(0, entity.attack + realAmount);
	entity.previousAttack = entity.attack;
	if (isCorrectTribe(allCards.getCard(entity.cardId).races, Race.DRAGON)) {
		const whelpSmugglers = friendlyBoard.filter((e) => e.cardId === CardIds.WhelpSmuggler);
		const whelpSmugglersBattlegrounds = friendlyBoard.filter((e) => e.cardId === CardIds.WhelpSmugglerBattlegrounds);
		whelpSmugglers.forEach((smuggler) => {
			modifyHealth(entity, 1, friendlyBoard, allCards);
		});
		whelpSmugglersBattlegrounds.forEach((smuggler) => {
			modifyHealth(entity, 2, friendlyBoard, allCards);
		});
	}
	if (
		entity.cardId === CardIds.Menagerist_AmalgamTokenBattlegrounds ||
		entity.cardId === CardIds.CuddlgamBattlegrounds_TB_BaconShop_HP_033t_SKIN_A ||
		entity.cardId === CardIds.CuddlgamBattlegrounds_TB_BaconShop_HP_033t_SKIN_A_G ||
		entity.cardId === CardIds.AbominableAmalgamBattlegrounds_TB_BaconShop_HP_033t_SKIN_D ||
		entity.cardId === CardIds.AbominableAmalgamBattlegrounds_TB_BaconShop_HP_033t_SKIN_D_G
	) {
		const mishmashes = friendlyBoard.filter(
			(e) =>
				e.cardId === CardIds.MishmashBattlegrounds_TB_BaconShop_HERO_33_Buddy ||
				e.cardId === CardIds.MishmashBattlegrounds_TB_BaconShop_HERO_33_Buddy_G,
		);
		mishmashes.forEach((mishmash) => {
			modifyAttack(
				mishmash,
				(mishmash.cardId === CardIds.MishmashBattlegrounds_TB_BaconShop_HERO_33_Buddy_G ? 2 : 1) * realAmount,
				friendlyBoard,
				allCards,
			);
		});
	}
};

export const modifyHealth = (entity: BoardEntity, amount: number, friendlyBoard: BoardEntity[], allCards: AllCardsService): void => {
	const realAmount = entity.cardId === CardIds.TarecgosaBattlegrounds ? 2 * amount : amount;
	entity.health += realAmount;
	if (realAmount > 0) {
		entity.maxHealth += realAmount;
	}
	if (
		entity.cardId === CardIds.Menagerist_AmalgamTokenBattlegrounds ||
		entity.cardId === CardIds.CuddlgamBattlegrounds_TB_BaconShop_HP_033t_SKIN_A ||
		entity.cardId === CardIds.CuddlgamBattlegrounds_TB_BaconShop_HP_033t_SKIN_A_G ||
		entity.cardId === CardIds.AbominableAmalgamBattlegrounds_TB_BaconShop_HP_033t_SKIN_D ||
		entity.cardId === CardIds.AbominableAmalgamBattlegrounds_TB_BaconShop_HP_033t_SKIN_D_G
	) {
		const mishmashes = friendlyBoard.filter(
			(e) =>
				e.cardId === CardIds.MishmashBattlegrounds_TB_BaconShop_HERO_33_Buddy ||
				e.cardId === CardIds.MishmashBattlegrounds_TB_BaconShop_HERO_33_Buddy_G,
		);
		mishmashes.forEach((mishmash) => {
			modifyHealth(
				mishmash,
				(mishmash.cardId === CardIds.MishmashBattlegrounds_TB_BaconShop_HERO_33_Buddy_G ? 2 : 1) * realAmount,
				friendlyBoard,
				allCards,
			);
		});
	}

	const titanicGuardians = friendlyBoard
		.filter((e) => e.entityId !== entity.entityId)
		.filter(
			(e) =>
				e.cardId === CardIds.TitanicGuardianBattlegrounds_TB_BaconShop_HERO_39_Buddy ||
				e.cardId === CardIds.TitanicGuardianBattlegrounds_TB_BaconShop_HERO_39_Buddy_G,
		);
	titanicGuardians.forEach((guardian) => {
		modifyHealth(
			guardian,
			(guardian.cardId === CardIds.TitanicGuardianBattlegrounds_TB_BaconShop_HERO_39_Buddy_G ? 2 : 1) * realAmount,
			friendlyBoard,
			allCards,
		);
	});
};

export const afterStatsUpdate = (entity: BoardEntity, friendlyBoard: BoardEntity[], allCards: AllCardsService): void => {
	if (hasCorrectTribe(entity, Race.ELEMENTAL, allCards)) {
		const masterOfRealities = friendlyBoard.filter(
			(e) => e.cardId === CardIds.MasterOfRealities_BG21_036 || e.cardId === CardIds.MasterOfRealitiesBattlegrounds,
		);
		masterOfRealities.forEach((master) => {
			modifyAttack(master, master.cardId === CardIds.MasterOfRealitiesBattlegrounds ? 2 : 1, friendlyBoard, allCards);
			modifyHealth(master, master.cardId === CardIds.MasterOfRealitiesBattlegrounds ? 2 : 1, friendlyBoard, allCards);
		});
	}
	const tentaclesOfCthun = friendlyBoard
		.filter((e) => e.entityId !== entity.entityId)
		.filter(
			(e) =>
				e.cardId === CardIds.TentacleOfCthunBattlegrounds_TB_BaconShop_HERO_29_Buddy ||
				e.cardId === CardIds.TentacleOfCthunBattlegrounds_TB_BaconShop_HERO_29_Buddy_G,
		);
	tentaclesOfCthun.forEach((tentacle) => {
		modifyAttack(
			tentacle,
			tentacle.cardId === CardIds.TentacleOfCthunBattlegrounds_TB_BaconShop_HERO_29_Buddy_G ? 2 : 1,
			friendlyBoard,
			allCards,
		);
		modifyHealth(
			tentacle,
			tentacle.cardId === CardIds.TentacleOfCthunBattlegrounds_TB_BaconShop_HERO_29_Buddy_G ? 2 : 1,
			friendlyBoard,
			allCards,
		);
	});
};

export const makeMinionGolden = (
	target: BoardEntity,
	source: BoardEntity | BgsPlayerEntity,
	sourceBoard: BoardEntity[],
	allCards: AllCardsService,
	spectator: Spectator,
): void => {
	const refCard = allCards.getCard(target.cardId);
	// Typically, we are already golden
	if (!refCard.battlegroundsPremiumDbfId) {
		return;
	}

	const goldenCard = allCards.getCardFromDbfId(refCard.battlegroundsPremiumDbfId);
	target.cardId = goldenCard.id;
	// A minion becoming golden ignore the current death.
	// This way of handling it is not ideal, since it will still trigger if both avenges trigger at the same time, but
	// should solve the other cases
	target.avengeCurrent = Math.min(target.avengeDefault, target.avengeCurrent + 1);
	modifyAttack(target, refCard.attack, sourceBoard, allCards);
	modifyHealth(target, refCard.health, sourceBoard, allCards);
	afterStatsUpdate(target, sourceBoard, allCards);
	spectator.registerPowerTarget(source, target, sourceBoard);
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
		spectator.registerPowerTarget(source, target, board);
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
		spectator.registerPowerTarget(source, target, board);
	}
};

export const grantRandomStats = (
	source: BoardEntity,
	board: BoardEntity[],
	attack: number,
	health: number,
	race: Race,
	allCards: AllCardsService,
	spectator: Spectator,
): BoardEntity => {
	if (board.length > 0) {
		const validBeast: BoardEntity = getRandomAliveMinion(
			board.filter((e) => e.entityId !== source.entityId),
			race,
			allCards,
		);
		//tmp fix for PalescaleCrocolisk, PalescaleCrocolisk won't apply avenge and dethrattle effect on itself.
		//const validBeast: BoardEntity = getRandomAliveMinion(board, race, allCards);
		if (validBeast) {
			modifyAttack(validBeast, attack, board, allCards);
			modifyHealth(validBeast, health, board, allCards);
			afterStatsUpdate(validBeast, board, allCards);
			spectator.registerPowerTarget(source, validBeast, board);
			return validBeast;
		}
	}
	return null;
};

export const addCardsInHand = (
	playerEntity: BgsPlayerEntity,
	cards: number,
	board: BoardEntity[],
	allCards: AllCardsService,
	spectator: Spectator,
	cardAdded: CardIds = null,
): void => {
	const sages = board.filter((e) => e.cardId === CardIds.DeathsHeadSage);
	const sagesGolden = board.filter((e) => e.cardId === CardIds.DeathsHeadSageBattlegrounds);
	const multiplier = 1 + (cardAdded === CardIds.BloodGem ? sages.length + 2 * sagesGolden.length : 0);
	const newCardsInHand = Math.min(10, (playerEntity.cardsInHand ?? 0) + multiplier * cards);
	if (newCardsInHand <= playerEntity.cardsInHand) {
		return;
	}

	playerEntity.cardsInHand = newCardsInHand;

	const peggys = board.filter((e) => e.cardId === CardIds.PeggySturdybone || e.cardId === CardIds.PeggySturdyboneBattlegrounds);
	peggys.forEach((peggy) => {
		const pirate = getRandomAliveMinion(
			board.filter((e) => e.entityId !== peggy.entityId),
			Race.PIRATE,
			allCards,
		);
		if (pirate) {
			modifyAttack(pirate, peggy.cardId === CardIds.PeggySturdyboneBattlegrounds ? 2 : 1, board, allCards);
			modifyHealth(pirate, peggy.cardId === CardIds.PeggySturdyboneBattlegrounds ? 2 : 1, board, allCards);
			afterStatsUpdate(pirate, board, allCards);
			spectator.registerPowerTarget(peggy, pirate, board);
		}
	});

	const thornCaptains = board.filter((e) => e.cardId === CardIds.ThornCaptain || e.cardId === CardIds.ThornCaptainBattlegrounds);
	thornCaptains.forEach((captain) => {
		modifyHealth(captain, captain.cardId === CardIds.ThornCaptainBattlegrounds ? 2 : 1, board, allCards);
		afterStatsUpdate(captain, board, allCards);
		spectator.registerPowerTarget(captain, captain, board);
	});
};

export const grantRandomDivineShield = (source: BoardEntity, board: BoardEntity[], spectator: Spectator): void => {
	const elligibleEntities = board
		.filter((entity) => !entity.divineShield)
		.filter((entity) => entity.health > 0 && !entity.definitelyDead);
	if (elligibleEntities.length > 0) {
		const chosen = elligibleEntities[Math.floor(Math.random() * elligibleEntities.length)];
		chosen.divineShield = true;
		spectator.registerPowerTarget(source, chosen, board);
	}
	// return board;
};

export const grantAllDivineShield = (board: BoardEntity[], tribe: string, cards: AllCardsService): void => {
	const elligibleEntities = board
		.filter((entity) => !entity.divineShield)
		.filter((entity) => isCorrectTribe(cards.getCard(entity.cardId).races, getRaceEnum(tribe)));
	for (const entity of elligibleEntities) {
		entity.divineShield = true;
	}
	// return board;
};

export const getRandomAliveMinion = (board: BoardEntity[], race: Race, allCards: AllCardsService): BoardEntity => {
	const validTribes = board
		.filter((e) => !race || isCorrectTribe(allCards.getCard(e.cardId).races, race))
		.filter((e) => e.health > 0 && !e.definitelyDead);
	if (!validTribes.length) {
		return null;
	}
	return validTribes[Math.floor(Math.random() * validTribes.length)];
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
		if (!tribe || isCorrectTribe(allCards.getCard(entity.cardId).races, Race[tribe])) {
			modifyAttack(entity, attack, board, allCards);
			modifyHealth(entity, health, board, allCards);
			afterStatsUpdate(entity, board, allCards);
			spectator.registerPowerTarget(sourceEntity, entity, board);
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
): void => {
	if (board.length > 0) {
		let boardCopy = [...board];
		for (const tribe of ALL_BG_RACES) {
			const validMinion: BoardEntity = getRandomAliveMinion(boardCopy, tribe, allCards);
			if (validMinion) {
				modifyAttack(validMinion, attack, board, allCards);
				modifyHealth(validMinion, health, board, allCards);
				afterStatsUpdate(validMinion, board, allCards);
				spectator.registerPowerTarget(source, validMinion, board);
				boardCopy = boardCopy.filter((e) => e !== validMinion);
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
	return cardRaces.map((cardRace) => getRaceEnum(cardRace)).some((raceEnum) => raceEnum === Race.ALL || raceEnum === targetTribe);
};

export const getRaceEnum = (race: string): Race => {
	return Race[race];
};

export const addImpliedMechanics = (entity: BoardEntity): BoardEntity => {
	const cleave = CLEAVE_IDS.indexOf(entity.cardId as CardIds) !== -1;
	const cantAttack = CANT_ATTACK_IDS.indexOf(entity.cardId as CardIds) !== -1;
	// Avoid creating a new object if not necessary
	if (!cleave && !cantAttack) {
		return entity;
	}
	return {
		...entity,
		cleave: cleave,
		cantAttack: cantAttack,
	} as BoardEntity;
};

export const normalizeCardIdForSkin = (cardId: string): string => {
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
		? `${entity.cardId}/${entity.entityId}/${allCards?.getCard(entity.cardId)?.name ?? ''}/atk=${entity.attack}/hp=${
				entity.health
		  }/ds=${entity.divineShield}/taunt=${entity.taunt}/stealth=${entity.stealth}}`
		: null;
};

export const isFish = (cardId: string): boolean => {
	return cardId.startsWith(CardIds.AvatarOfNzoth_FishOfNzothTokenBattlegrounds) || cardId.startsWith(CardIds.FishOfNzothBattlegrounds);
};

export const isGolden = (cardId: string, allCards: AllCardsService): boolean => {
	return !!allCards.getCard(cardId).battlegroundsNormalDbfId;
};
