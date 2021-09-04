/* eslint-disable @typescript-eslint/no-use-before-define */
import { AllCardsService, CardIds, Race, ReferenceCard } from '@firestone-hs/reference-data';
import { BgsPlayerEntity } from './bgs-player-entity';
import { BoardEntity } from './board-entity';
import { CardsData } from './cards/cards-data';
import { Spectator } from './simulation/spectator/spectator';

const CLEAVE_IDS = [
	CardIds.Collectible.Hunter.CaveHydra,
	CardIds.NonCollectible.Hunter.CaveHydraBattlegrounds,
	CardIds.Collectible.Neutral.FoeReaper4000,
	CardIds.NonCollectible.Neutral.FoeReaper4000Battlegrounds,
];
// Because for some reason, the Taunt keyword is only a referenced tag,
// so we have to know when a taunt minion is spawned (the taunt tag
// is passed in input properly, so it's not an issue there)
const TAUNT_IDS = [
	CardIds.NonCollectible.Neutral.YoHoOgre,
	CardIds.NonCollectible.Neutral.YoHoOgreBattlegrounds,
	CardIds.NonCollectible.Warrior.SecurityRover_GuardBotToken,
	CardIds.NonCollectible.Warrior.SecurityRover_GuardBotTokenBattlegrounds,
	CardIds.NonCollectible.Neutral.MoltenRock,
	CardIds.NonCollectible.Neutral.MoltenRockBattlegrounds,
	CardIds.NonCollectible.Neutral.LieutenantGarr,
	CardIds.NonCollectible.Neutral.LieutenantGarrBattlegrounds,
	CardIds.NonCollectible.Neutral.GentleDjinni,
	CardIds.NonCollectible.Neutral.GentleDjinniBattlegrounds,
	CardIds.NonCollectible.Neutral.AcolyteOfCthun,
	CardIds.NonCollectible.Neutral.AcolyteOfCthunBattlegrounds,
	CardIds.Collectible.Warlock.RingMatron,
	CardIds.NonCollectible.Warlock.RingMatronBattlegrounds,
	CardIds.NonCollectible.Neutral.DynamicDuo,
	CardIds.NonCollectible.Neutral.DynamicDuoBattlegrounds,
	CardIds.NonCollectible.Neutral.InsatiableUrzul,
	CardIds.NonCollectible.Neutral.InsatiableUrzulBattlegrounds,
	CardIds.NonCollectible.Neutral.MasterOfRealities2,
	CardIds.NonCollectible.Neutral.MasterOfRealitiesBattlegrounds,
];
const ATTACK_IMMEDIATELY_IDS = [
	CardIds.NonCollectible.Rogue.Scallywag_SkyPirateToken,
	CardIds.NonCollectible.Rogue.Scallywag_SkyPirateTokenBattlegrounds,
];
export const MEGA_WINDFURY_IDS = [
	CardIds.NonCollectible.Neutral.ZappSlywickBattlegrounds,
	CardIds.NonCollectible.Neutral.CracklingCycloneBattlegrounds,
	CardIds.NonCollectible.Neutral.BristlebackKnight,
	CardIds.NonCollectible.Neutral.BonkerBattlegrounds,
];
const CANT_ATTACK_IDS = [CardIds.NonCollectible.Neutral.ArcaneCannon, CardIds.NonCollectible.Neutral.ArcaneCannonBattlegrounds];

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
	const megaWindfury = MEGA_WINDFURY_IDS.indexOf(cardId) !== -1;
	const attackImmediately = ATTACK_IMMEDIATELY_IDS.indexOf(cardId) !== -1;
	const result = addImpliedMechanics({
		attack: card.attack,
		attacksPerformed: 0,
		cardId: cardId,
		divineShield: hasMechanic(card, 'DIVINE_SHIELD'),
		entityId: entityId,
		health: card.health,
		taunt: hasMechanic(card, 'TAUNT') || TAUNT_IDS.includes(cardId),
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
		result.health = 1;
		result.reborn = false;
	}

	if (controllerHero?.heroPowerId === CardIds.NonCollectible.Neutral.SproutItOutBattlegrounds) {
		result.taunt = true;
		modifyAttack(result, 1, friendlyBoard, allCards);
		modifyHealth(result, 2);
		afterStatsUpdate(result, friendlyBoard, allCards);
		spectator && spectator.registerPowerTarget(result, result, friendlyBoard);
	} else if (controllerHero?.heroPowerId === CardIds.NonCollectible.Demonhunter.KurtrusAshfallen_CloseThePortal) {
		modifyAttack(result, 2, friendlyBoard, allCards);
		modifyHealth(result, 2);
		afterStatsUpdate(result, friendlyBoard, allCards);
		spectator && spectator.registerPowerTarget(result, result, friendlyBoard);
	}

	return result;
};

export const modifyAttack = (entity: BoardEntity, amount: number, friendlyBoard: BoardEntity[], allCards: AllCardsService): void => {
	entity.attack = Math.max(0, entity.attack + amount);
	entity.previousAttack = entity.attack;
	if (isCorrectTribe(allCards.getCard(entity.cardId).race, Race.DRAGON)) {
		const whelpSmugglers = friendlyBoard.filter((e) => e.cardId === CardIds.NonCollectible.Neutral.WhelpSmuggler);
		const whelpSmugglersBattlegrounds = friendlyBoard.filter(
			(e) => e.cardId === CardIds.NonCollectible.Neutral.WhelpSmugglerBattlegrounds,
		);
		whelpSmugglers.forEach((smuggler) => {
			modifyHealth(entity, 2);
		});
		whelpSmugglersBattlegrounds.forEach((smuggler) => {
			modifyHealth(entity, 4);
		});
	}
};

export const afterStatsUpdate = (entity: BoardEntity, friendlyBoard: BoardEntity[], allCards: AllCardsService): void => {
	if (hasCorrectTribe(entity, Race.ELEMENTAL, allCards)) {
		const masterOfRealities = friendlyBoard.filter(
			(e) =>
				e.cardId === CardIds.NonCollectible.Neutral.MasterOfRealities2 ||
				e.cardId === CardIds.NonCollectible.Neutral.MasterOfRealitiesBattlegrounds,
		);
		masterOfRealities.forEach((master) => {
			modifyAttack(
				entity,
				master.cardId === CardIds.NonCollectible.Neutral.MasterOfRealitiesBattlegrounds ? 2 : 1,
				friendlyBoard,
				allCards,
			);
			modifyHealth(entity, master.cardId === CardIds.NonCollectible.Neutral.MasterOfRealitiesBattlegrounds ? 2 : 1);
		});
	}
};

export const modifyHealth = (entity: BoardEntity, amount: number): void => {
	entity.health += amount;
	if (amount > 0) {
		entity.maxHealth += amount;
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
	return {
		...entity,
		cleave: CLEAVE_IDS.indexOf(entity.cardId) !== -1,
		cantAttack: CANT_ATTACK_IDS.indexOf(entity.cardId) !== -1,
	} as BoardEntity;
};

export const stringifySimple = (board: readonly BoardEntity[]): string => {
	return '[' + board.map((entity) => stringifySimpleCard(entity)).join(', ') + ']';
};

export const stringifySimpleCard = (entity: BoardEntity): string => {
	return entity
		? `${entity.cardId}/${entity.attack}/${entity.health}/${entity.entityId}/${entity.divineShield}/${entity.previousAttack ?? null}`
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
