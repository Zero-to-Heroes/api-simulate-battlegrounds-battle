/* eslint-disable @typescript-eslint/no-use-before-define */
import { AllCardsService, CardIds, Race, ReferenceCard } from '@firestone-hs/reference-data';
import { BgsPlayerEntity } from './bgs-player-entity';
import { BoardEntity } from './board-entity';
import { CardsData } from './cards/cards-data';
import { Spectator } from './simulation/spectator/spectator';

const CLEAVE_IDS = [CardIds.CaveHydra, CardIds.CaveHydraBattlegrounds, CardIds.FoeReaper4000, CardIds.FoeReaper4000Battlegrounds];
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
	CardIds.RingMatron,
	CardIds.RingMatronBattlegrounds,
	CardIds.DynamicDuo,
	CardIds.DynamicDuoBattlegrounds,
	CardIds.InsatiableUrzul,
	CardIds.InsatiableUrzulBattlegrounds,
	CardIds.MasterOfRealities2,
	CardIds.MasterOfRealitiesBattlegrounds,
	CardIds.BrannsEpicEggBattlegrounds1,
	CardIds.BrannsEpicEggBattlegrounds2,
	CardIds.KilrekBattlegrounds1,
	CardIds.KilrekBattlegrounds2,
	CardIds.Glowscale,
	CardIds.GlowscaleBattlegrounds,
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
	spectator: Spectator,
): BoardEntity => {
	const card = allCards.getCard(cardId);
	const megaWindfury = MEGA_WINDFURY_IDS.indexOf(cardId as CardIds) !== -1;
	const attackImmediately = ATTACK_IMMEDIATELY_IDS.indexOf(cardId as CardIds) !== -1;
	const newEntity = addImpliedMechanics({
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
	}

	if (allCards.getCard(cardId).techLevel === controllerHero.tavernTier) {
		const statsBonus =
			4 * friendlyBoard.filter((e) => e.cardId === CardIds.BabyYshaarjBattlegrounds1).length +
			8 * friendlyBoard.filter((e) => e.cardId === CardIds.BabyYshaarjBattlegrounds2).length;
		modifyAttack(newEntity, statsBonus, friendlyBoard, allCards);
		modifyHealth(newEntity, statsBonus, friendlyBoard, allCards);
		afterStatsUpdate(newEntity, friendlyBoard, allCards);
	}

	if (newEntity.taunt) {
		const statsBonus =
			2 * friendlyBoard.filter((e) => e.cardId === CardIds.WanderingTreantBattlegrounds1).length +
			4 * friendlyBoard.filter((e) => e.cardId === CardIds.WanderingTreantBattlegrounds2).length;
		modifyAttack(newEntity, statsBonus, friendlyBoard, allCards);
		modifyHealth(newEntity, statsBonus, friendlyBoard, allCards);
		afterStatsUpdate(newEntity, friendlyBoard, allCards);
	}

	return newEntity;
};

export const modifyAttack = (entity: BoardEntity, amount: number, friendlyBoard: BoardEntity[], allCards: AllCardsService): void => {
	// console.log('modifying attack', amount, stringifySimpleCard(entity, allCards), entity.attack);
	entity.attack = Math.max(0, entity.attack + amount);
	// console.log('modified attack', amount, stringifySimpleCard(entity, allCards), entity.attack);
	entity.previousAttack = entity.attack;
	if (isCorrectTribe(allCards.getCard(entity.cardId).race, Race.DRAGON)) {
		const whelpSmugglers = friendlyBoard.filter((e) => e.cardId === CardIds.WhelpSmuggler);
		const whelpSmugglersBattlegrounds = friendlyBoard.filter((e) => e.cardId === CardIds.WhelpSmugglerBattlegrounds);
		whelpSmugglers.forEach((smuggler) => {
			modifyHealth(entity, 1, friendlyBoard, allCards);
		});
		whelpSmugglersBattlegrounds.forEach((smuggler) => {
			modifyHealth(entity, 2, friendlyBoard, allCards);
		});
	}
	if (entity.cardId === CardIds.Menagerist_AmalgamTokenBattlegrounds || entity.cardId === CardIds.CuddlgamBattlegrounds) {
		const mishmashes = friendlyBoard.filter(
			(e) => e.cardId === CardIds.MishmashBattlegrounds1 || e.cardId === CardIds.MishmashBattlegrounds2,
		);
		mishmashes.forEach((mishmash) => {
			modifyAttack(mishmash, (mishmash.cardId === CardIds.MishmashBattlegrounds2 ? 2 : 1) * amount, friendlyBoard, allCards);
		});
	}
};

export const modifyHealth = (entity: BoardEntity, amount: number, friendlyBoard: BoardEntity[], allCards: AllCardsService): void => {
	entity.health += amount;
	if (amount > 0) {
		entity.maxHealth += amount;
	}
	if (entity.cardId === CardIds.Menagerist_AmalgamTokenBattlegrounds || entity.cardId === CardIds.CuddlgamBattlegrounds) {
		const mishmashes = friendlyBoard.filter(
			(e) => e.cardId === CardIds.MishmashBattlegrounds1 || e.cardId === CardIds.MishmashBattlegrounds2,
		);
		mishmashes.forEach((mishmash) => {
			modifyHealth(mishmash, (mishmash.cardId === CardIds.MishmashBattlegrounds2 ? 2 : 1) * amount, friendlyBoard, allCards);
		});
	}

	const titanicGuardians = friendlyBoard
		.filter((e) => e.entityId !== entity.entityId)
		.filter((e) => e.cardId === CardIds.TitanicGuardianBattlegrounds1 || e.cardId === CardIds.TitanicGuardianBattlegrounds2);
	titanicGuardians.forEach((guardian) => {
		modifyHealth(guardian, (guardian.cardId === CardIds.TitanicGuardianBattlegrounds2 ? 2 : 1) * amount, friendlyBoard, allCards);
	});
};

export const afterStatsUpdate = (entity: BoardEntity, friendlyBoard: BoardEntity[], allCards: AllCardsService): void => {
	if (hasCorrectTribe(entity, Race.ELEMENTAL, allCards)) {
		const masterOfRealities = friendlyBoard.filter(
			(e) => e.cardId === CardIds.MasterOfRealities2 || e.cardId === CardIds.MasterOfRealitiesBattlegrounds,
		);
		masterOfRealities.forEach((master) => {
			modifyAttack(master, master.cardId === CardIds.MasterOfRealitiesBattlegrounds ? 2 : 1, friendlyBoard, allCards);
			modifyHealth(master, master.cardId === CardIds.MasterOfRealitiesBattlegrounds ? 2 : 1, friendlyBoard, allCards);
		});
	}
	const tentaclesOfCthun = friendlyBoard
		.filter((e) => e.entityId !== entity.entityId)
		.filter((e) => e.cardId === CardIds.TentacleOfCthunBattlegrounds1 || e.cardId === CardIds.TentacleOfCthunBattlegrounds2);
	tentaclesOfCthun.forEach((tentacle) => {
		modifyAttack(tentacle, tentacle.cardId === CardIds.TentacleOfCthunBattlegrounds2 ? 2 : 1, friendlyBoard, allCards);
		modifyHealth(tentacle, tentacle.cardId === CardIds.TentacleOfCthunBattlegrounds2 ? 2 : 1, friendlyBoard, allCards);
	});
};

export const makeMinionGolden = (
	target: BoardEntity,
	source: BoardEntity,
	sourceBoard: BoardEntity[],
	allCards: AllCardsService,
	spectator: Spectator,
): void => {
	const refCard = allCards.getCard(target.cardId);
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
): void => {
	if (board.length > 0) {
		const target = board[Math.floor(Math.random() * board.length)];
		modifyAttack(target, additionalAttack, board, allCards);
		afterStatsUpdate(target, board, allCards);
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
	const candidateBoard = board.filter((e) => !excludeSource || e.entityId !== source.entityId);
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
		const validBeast: BoardEntity = getRandomMinion(board, race, allCards);
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
	playerEntity.cardsInHand = Math.min(10, (playerEntity.cardsInHand ?? 0) + multiplier * cards);

	const peggys = board.filter((e) => e.cardId === CardIds.PeggyBrittlebone || e.cardId === CardIds.PeggyBrittleboneBattlegrounds);
	peggys.forEach((peggy) => {
		const pirate = getRandomMinion(
			board.filter((e) => e.entityId !== peggy.entityId),
			Race.PIRATE,
			allCards,
		);
		if (pirate) {
			modifyAttack(pirate, peggy.cardId === CardIds.PeggyBrittleboneBattlegrounds ? 2 : 1, board, allCards);
			modifyHealth(pirate, peggy.cardId === CardIds.PeggyBrittleboneBattlegrounds ? 2 : 1, board, allCards);
			afterStatsUpdate(pirate, board, allCards);
			spectator.registerPowerTarget(peggy, pirate, board);
		}
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
		.filter((entity) => isCorrectTribe(cards.getCard(entity.cardId).race, getRaceEnum(tribe)));
	for (const entity of elligibleEntities) {
		entity.divineShield = true;
	}
	// return board;
};

export const getRandomMinion = (board: BoardEntity[], race: Race, allCards: AllCardsService): BoardEntity => {
	const validTribes = board.filter((e) => !race || isCorrectTribe(allCards.getCard(e.cardId).race, race));
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
		if (!tribe || isCorrectTribe(allCards.getCard(entity.cardId).race, Race[tribe])) {
			modifyAttack(entity, attack, board, allCards);
			modifyHealth(entity, health, board, allCards);
			afterStatsUpdate(entity, board, allCards);
			spectator.registerPowerTarget(sourceEntity, entity, board);
		}
	}
};

export const hasMechanic = (card: ReferenceCard, mechanic: string): boolean => {
	return card.mechanics?.includes(mechanic);
};

export const hasCorrectTribe = (entity: BoardEntity, targetTribe: Race, allCards: AllCardsService): boolean => {
	return isCorrectTribe(allCards.getCard(entity.cardId).race, targetTribe);
};

export const isCorrectTribe = (cardRace: string, targetTribe: Race): boolean => {
	return getRaceEnum(cardRace) === Race.ALL || getRaceEnum(cardRace) === targetTribe;
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
		? `${entity.cardId}/${allCards?.getCard(entity.cardId)?.name ?? ''}/${entity.attack}/${entity.health}/${entity.entityId}/${
				entity.divineShield
		  }/${entity.taunt}/${entity.enchantments?.length ?? 0}`
		: null;
};
