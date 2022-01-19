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
	CardIds.BrannsEpicEggBattlegrounds,
	CardIds.BrannsEpicEggBattlegrounds2,
	CardIds.KilrekBattlegrounds1,
	CardIds.KilrekBattlegrounds2,
];
const ATTACK_IMMEDIATELY_IDS = [CardIds.Scallywag_SkyPirateToken, CardIds.Scallywag_SkyPirateTokenBattlegrounds];
export const MEGA_WINDFURY_IDS = [
	CardIds.ZappSlywickBattlegrounds,
	CardIds.CracklingCycloneBattlegrounds,
	CardIds.BristlebackKnight2,
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
			4 * friendlyBoard.filter((e) => e.cardId === CardIds.BabyYshaarj).length +
			8 * friendlyBoard.filter((e) => e.cardId === CardIds.BabyYshaarjBattlegrounds).length;
		modifyAttack(newEntity, statsBonus, friendlyBoard, allCards);
		modifyHealth(newEntity, statsBonus, friendlyBoard, allCards);
		afterStatsUpdate(newEntity, friendlyBoard, allCards);
	}

	if (newEntity.taunt) {
		const statsBonus =
			2 * friendlyBoard.filter((e) => e.cardId === CardIds.WanderingTreant).length +
			4 * friendlyBoard.filter((e) => e.cardId === CardIds.WanderingTreantBattlegrounds).length;
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
		const mishmashes = friendlyBoard.filter((e) => e.cardId === CardIds.Mishmash || e.cardId === CardIds.MishmashBattlegrounds);
		mishmashes.forEach((mishmash) => {
			modifyAttack(entity, (mishmash.cardId === CardIds.MishmashBattlegrounds ? 2 : 1) * amount, friendlyBoard, allCards);
		});
	}
};

export const modifyHealth = (entity: BoardEntity, amount: number, friendlyBoard: BoardEntity[], allCards: AllCardsService): void => {
	entity.health += amount;
	if (amount > 0) {
		entity.maxHealth += amount;
	}
	if (entity.cardId === CardIds.Menagerist_AmalgamTokenBattlegrounds || entity.cardId === CardIds.CuddlgamBattlegrounds) {
		const mishmashes = friendlyBoard.filter((e) => e.cardId === CardIds.Mishmash || e.cardId === CardIds.MishmashBattlegrounds);
		mishmashes.forEach((mishmash) => {
			modifyHealth(entity, (mishmash.cardId === CardIds.MishmashBattlegrounds ? 2 : 1) * amount, friendlyBoard, allCards);
		});
	}

	const titanicGuardians = friendlyBoard
		.filter((e) => e.entityId !== entity.entityId)
		.filter((e) => e.cardId === CardIds.TitanicGuardian || e.cardId === CardIds.TitanicGuardianBattlegrounds);
	titanicGuardians.forEach((tentacle) => {
		modifyHealth(entity, (tentacle.cardId === CardIds.TitanicGuardianBattlegrounds ? 2 : 1) * amount, friendlyBoard, allCards);
	});
};

export const afterStatsUpdate = (entity: BoardEntity, friendlyBoard: BoardEntity[], allCards: AllCardsService): void => {
	if (hasCorrectTribe(entity, Race.ELEMENTAL, allCards)) {
		const masterOfRealities = friendlyBoard.filter(
			(e) => e.cardId === CardIds.MasterOfRealities2 || e.cardId === CardIds.MasterOfRealitiesBattlegrounds,
		);
		masterOfRealities.forEach((master) => {
			modifyAttack(entity, master.cardId === CardIds.MasterOfRealitiesBattlegrounds ? 2 : 1, friendlyBoard, allCards);
			modifyHealth(entity, master.cardId === CardIds.MasterOfRealitiesBattlegrounds ? 2 : 1, friendlyBoard, allCards);
		});
	}
	const tentaclesOfCthun = friendlyBoard
		.filter((e) => e.entityId !== entity.entityId)
		.filter((e) => e.cardId === CardIds.TentaclesOfCthun || e.cardId === CardIds.TentaclesOfCthunBattlegrounds);
	tentaclesOfCthun.forEach((tentacle) => {
		modifyAttack(entity, tentacle.cardId === CardIds.TentaclesOfCthunBattlegrounds ? 2 : 1, friendlyBoard, allCards);
		modifyHealth(entity, tentacle.cardId === CardIds.TentaclesOfCthunBattlegrounds ? 2 : 1, friendlyBoard, allCards);
	});
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

export const stringifySimple = (board: readonly BoardEntity[], allCards: AllCardsService = null): string => {
	return '[' + board.map((entity) => stringifySimpleCard(entity, allCards)).join(', ') + ']';
};

export const stringifySimpleCard = (entity: BoardEntity, allCards: AllCardsService = null): string => {
	return entity
		? `${entity.cardId}/${allCards?.getCard(entity.cardId)?.name ?? ''}/${entity.attack}/${entity.health}/${entity.entityId}/${
				entity.enchantments?.length ?? 0
		  }`
		: null;
};

export const encode = (input: string): string => {
	// return compressToEncodedURIComponent(input);
	const buff = Buffer.from(input, 'utf-8');
	const base64 = buff.toString('base64');
	return base64;
};

export const decode = (base64: string): string => {
	const buff = Buffer.from(base64, 'base64');
	const str = buff.toString('utf-8');
	return str;
};
