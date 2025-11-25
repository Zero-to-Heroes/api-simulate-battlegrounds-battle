/* eslint-disable @typescript-eslint/no-use-before-define */
import { ALL_BG_RACES, AllCardsService, GameTag, Race, ReferenceCard } from '@firestone-hs/reference-data';
import { BgsPlayerEntity, BoardTrinket } from './bgs-player-entity';
import { BoardEnchantment, BoardEntity } from './board-entity';
import { BoardSecret } from './board-secret';
import { hasDefaultCharges } from './cards/card.interface';
import { CardsData } from './cards/cards-data';
import { cardMappings } from './cards/impl/_card-mappings';
import { CardIds } from './services/card-ids';
import { pickRandom, shuffleArray } from './services/utils';
import { FullGameState, GameState, PlayerState } from './simulation/internal-game-state';
import { SharedState } from './simulation/shared-state';
import { modifyStats } from './simulation/stats';
import { TempCardIds } from './temp-card-ids';

const CLEAVE_IDS = [
	CardIds.CaveHydra_BG_LOOT_078,
	CardIds.CaveHydra_TB_BaconUps_151,
	CardIds.FoeReaper4000_BG_GVG_113,
	CardIds.FoeReaper4000_TB_BaconUps_153,
	CardIds.BladeCollector_BG26_817,
	CardIds.BladeCollector_BG26_817_G,
	CardIds.KerriganQueenOfBlades_UltraliskToken_BG31_HERO_811t10,
	CardIds.Ultralisk_BG31_HERO_811t10_G,
	TempCardIds.TimewarpedUltralisk,
	TempCardIds.TimewarpedUltralisk_G,
];
const ATTACK_IMMEDIATELY_IDS = [
	CardIds.Scallywag_SkyPirateToken_BGS_061t,
	CardIds.Scallywag_SkyPirateToken_TB_BaconUps_141t,
	CardIds.Onyxia_OnyxianWhelpToken,
	// CardIds.Carrier_InterceptorToken_BG31_HERO_802pt1t,
	// CardIds.Interceptor_BG31_HERO_802pt1t_G,
	// The token doesn't attack immediately natively, only when spawned by the spell
	// See http://replays.firestoneapp.com/?reviewId=8924452a-540a-4324-8306-46900c3f9f35&turn=22&action=38
	// CardIds.ToxicTumbleweed_TumblingAssassinToken_BG28_641t,
];
const CANT_ATTACK_IDS = [
	// CardIds.ArcaneCannon_BGS_077, CardIds.ArcaneCannon_TB_BaconUps_128
];

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
				// attacking: false,
				damageMultiplier: 1,
				frenzyChargesLeft: 1,
				friendly: friendly,
				hasAttacked: 0,
		  } as BoardEntity)
		: addImpliedMechanics(
				{
					entityId: entityId,
					attack: card.attack,
					hasAttacked: 0,
					cardId: cardId,
					divineShield: hasMechanic(card, GameTag.DIVINE_SHIELD),
					health: card.health,
					maxHealth: card.health,
					taunt: hasMechanic(card, GameTag.TAUNT),
					reborn: hasMechanic(card, GameTag.REBORN),
					poisonous: hasMechanic(card, GameTag.POISONOUS),
					venomous: hasMechanic(card, GameTag.VENOMOUS),
					stealth: hasMechanic(card, GameTag.STEALTH),
					windfury: hasMechanic(card, GameTag.WINDFURY),
					enchantments: [],
					pendingAttackBuffs: [],
					friendly: friendly,
					attackImmediately: attackImmediately,
					avengeCurrent: cardsData.avengeValue(cardId),
					avengeDefault: cardsData.avengeValue(cardId),
					scriptDataNum1: originalEntity?.scriptDataNum1 ?? 0,
					// This is useful for Showy Cycilst, but I wonder if this could cause some issues otherwise
					scriptDataNum2: originalEntity?.scriptDataNum2 ?? 0,
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
				newEntity.taunt = newEntity.taunt || hasMechanic(stitchedCard, GameTag.TAUNT);
				newEntity.divineShield = newEntity.divineShield || hasMechanic(stitchedCard, GameTag.DIVINE_SHIELD);
				newEntity.hadDivineShield = newEntity.hadDivineShield || newEntity.divineShield;
				newEntity.poisonous = newEntity.poisonous || hasMechanic(stitchedCard, GameTag.POISONOUS);
				newEntity.venomous = newEntity.venomous || hasMechanic(stitchedCard, GameTag.VENOMOUS);
				newEntity.windfury = newEntity.windfury || hasMechanic(stitchedCard, GameTag.WINDFURY);
				newEntity.avengeCurrent = newEntity.avengeCurrent || cardsData.avengeValue(stitchedCardId);
				newEntity.avengeDefault = newEntity.avengeDefault || cardsData.avengeValue(stitchedCardId);
			}
		} else if (
			cardId === CardIds.ZilliaxAssembled_BG29_100_G &&
			!!originalEntity.additionalCards?.filter((c) => !!c).length
		) {
			// In this case, the base stats are still correct (the golden stats of Zilliax), but the keywords
			// can change
			for (const moduleCardId of originalEntity.additionalCards) {
				const moduleCard = allCards.getCard(moduleCardId);
				newEntity.taunt = newEntity.taunt || hasMechanic(moduleCard, GameTag.TAUNT);
				newEntity.divineShield = newEntity.divineShield || hasMechanic(moduleCard, GameTag.DIVINE_SHIELD);
				newEntity.hadDivineShield = newEntity.hadDivineShield || newEntity.divineShield;
				newEntity.poisonous = newEntity.poisonous || hasMechanic(moduleCard, GameTag.POISONOUS);
				newEntity.venomous = newEntity.venomous || hasMechanic(moduleCard, GameTag.VENOMOUS);
				newEntity.windfury = newEntity.windfury || hasMechanic(moduleCard, GameTag.WINDFURY);
				newEntity.stealth = newEntity.stealth || hasMechanic(moduleCard, GameTag.STEALTH);
			}
		}
		newEntity.health = 1;
		newEntity.reborn = false;
		newEntity.scriptDataNum1 = getScriptDataNum1(cardId, originalEntity);

		// For ghoul-acabra + reborn
		// newEntity.attack += originalEntity.permanentAttack ?? 0;
		// newEntity.health += originalEntity.permanentHealth ?? 0;
	}

	newEntity.hadDivineShield = newEntity.divineShield || newEntity.hadDivineShield;
	return newEntity;
};

const getScriptDataNum1 = (cardId: string, originalEntity: BoardEntity): number => {
	switch (cardId) {
		case CardIds.OctosariWrapGod_BG26_804:
			return 8;
		case CardIds.OctosariWrapGod_BG26_804_G:
			return 16;
		default:
			return 0;
	}
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

	const stitchedCardId =
		baseCard === CardIds.EternalSummoner_BG25_009
			? pickRandom(cardsData.putridicePool2ForEternalSummoner)
			: pickRandom(cardsData.putricidePool2);
	const stitchedCard = allCards.getCard(stitchedCardId);
	newEntity.attack += stitchedCard.attack;
	newEntity.health += stitchedCard.health;
	newEntity.taunt = newEntity.taunt || hasMechanic(stitchedCard, GameTag.TAUNT);
	newEntity.divineShield = newEntity.divineShield || hasMechanic(stitchedCard, GameTag.DIVINE_SHIELD);
	newEntity.poisonous = newEntity.poisonous || hasMechanic(stitchedCard, GameTag.POISONOUS);
	newEntity.venomous = newEntity.venomous || hasMechanic(stitchedCard, GameTag.VENOMOUS);
	newEntity.windfury = newEntity.windfury || hasMechanic(stitchedCard, GameTag.WINDFURY);
	newEntity.reborn = newEntity.reborn || hasMechanic(stitchedCard, GameTag.REBORN);
	newEntity.avengeCurrent = newEntity.avengeCurrent || cardsData.avengeValue(stitchedCardId);
	newEntity.avengeDefault = newEntity.avengeDefault || cardsData.avengeValue(stitchedCardId);
	return newEntity;
};

export const grantRandomAttack = (
	source: BoardEntity,
	board: BoardEntity[],
	hero: BgsPlayerEntity,
	additionalAttack: number,
	gameState: FullGameState,
	excludeSource = false,
): void => {
	const candidateBoard = board
		.filter((e) => !excludeSource || e.entityId !== source.entityId)
		.filter((e) => e.health > 0 && !e.definitelyDead);
	if (candidateBoard.length > 0) {
		const target = candidateBoard[Math.floor(Math.random() * candidateBoard.length)];
		modifyStats(target, source, additionalAttack, 0, candidateBoard, hero, gameState);
	}
};

export const grantRandomHealth = (
	source: BoardEntity,
	board: BoardEntity[],
	hero: BgsPlayerEntity,
	health: number,
	gameState: FullGameState,
	excludeSource = false,
): void => {
	const candidateBoard = board
		.filter((e) => !excludeSource || e.entityId !== source.entityId)
		.filter((e) => e.health > 0 && !e.definitelyDead);
	if (candidateBoard.length > 0) {
		const target = pickRandom(candidateBoard);
		modifyStats(target, source, 0, health, board, hero, gameState);
	}
};

export const grantRandomStats = (
	source: BoardEntity,
	board: BoardEntity[],
	hero: BgsPlayerEntity,
	attack: number,
	health: number,
	race: Race,
	excludeSource: boolean,
	gameState: FullGameState,
): BoardEntity => {
	if (board.length > 0) {
		const target: BoardEntity = getRandomAliveMinion(
			board.filter((e) => !!e.cardId).filter((e) => (excludeSource ? e.entityId !== source.entityId : true)),
			hero,
			race,
			gameState,
		);
		if (target) {
			modifyStats(target, source, attack, health, board, hero, gameState);
			return target;
		}
	}
	return null;
};

export const getRandomAliveMinion = (
	board: BoardEntity[],
	hero: BgsPlayerEntity,
	race: Race,
	gameState: FullGameState,
): BoardEntity => {
	const validTribes = board
		.filter((e) => !race || hasCorrectTribe(e, hero, race, gameState.anomalies, gameState.allCards))
		.filter((e) => e?.health > 0 && !e.definitelyDead);
	if (!validTribes.length) {
		return null;
	}
	const randomIndex = Math.floor(Math.random() * validTribes.length);
	return validTribes[randomIndex];
};

export const getRandomRevivableMinion = (
	board: BoardEntity[],
	hero: BgsPlayerEntity,
	race: Race,
	gameState: FullGameState,
): BoardEntity => {
	const validTribes = board
		.filter((e) => !race || hasCorrectTribe(e, hero, race, gameState.anomalies, gameState.allCards))
		.filter((e) => !e.definitelyDead);
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

/**
 * Only use if the full board gets the stats, or if you're able to filter use the tribe param.
 * Otherwise some minions will be missing when applying onStatsUpdate effects
 */
export const addStatsToBoard = (
	sourceEntity: BoardEntity | BgsPlayerEntity | BoardSecret,
	board: BoardEntity[],
	hero: BgsPlayerEntity,
	attack: number,
	health: number,
	gameState: FullGameState,
	tribe?: string,
	countsAsStatsGain = true,
): void => {
	for (const entity of board) {
		if (!tribe || hasCorrectTribe(entity, hero, Race[tribe], gameState.anomalies, gameState.allCards)) {
			if (countsAsStatsGain) {
				modifyStats(entity, sourceEntity, attack, health, board, hero, gameState);
			} else {
				entity.attack += attack;
				entity.health += health;
			}
		}
	}
};

export const addStatsToAliveBoard = (
	sourceEntity: BoardEntity | BgsPlayerEntity | BoardSecret,
	board: BoardEntity[],
	hero: BgsPlayerEntity,
	attack: number,
	health: number,
	gameState: FullGameState,
	tribe?: string,
	// permanentUpgrade = false,
): void => {
	for (const entity of board.filter((e) => e.health > 0 && !e.definitelyDead)) {
		if (!tribe || hasCorrectTribe(entity, hero, Race[tribe], gameState.anomalies, gameState.allCards)) {
			modifyStats(entity, sourceEntity, attack, health, board, hero, gameState);
		}
	}
};

export const grantStatsToMinionsOfEachType = (
	source: BoardEntity,
	board: BoardEntity[],
	hero: BgsPlayerEntity,
	attack: number,
	health: number,
	gameState: FullGameState,
	numberOfDifferentTypes = 99,
	canRevive = true,
): void => {
	const minionsToBuff = getMinionsOfDifferentTypes(board, hero, gameState, canRevive, numberOfDifferentTypes);
	for (const entity of minionsToBuff) {
		modifyStats(entity, source, attack, health, board, hero, gameState);
	}
};

export const getMinionsOfDifferentTypes = (
	board: BoardEntity[],
	hero: BgsPlayerEntity,
	gameState: FullGameState,
	canRevive = true,
	numberOfDifferentTypes = 99,
): BoardEntity[] => {
	const result: BoardEntity[] = [];
	if (board.length > 0) {
		let boardCopy = board.filter(
			(e) => !getEffectiveTribesForEntity(e, hero, gameState.anomalies, gameState.allCards)?.includes(Race.ALL),
		);
		const allRaces = shuffleArray(ALL_BG_RACES);
		let typesBuffed = 0;
		const racesProcessed = [];
		for (let i = 1; i <= 2; i++) {
			for (const tribe of allRaces) {
				const minionsWithRaces = boardCopy
					.filter(
						(e) =>
							getEffectiveTribesForEntity(e, hero, gameState.anomalies, gameState.allCards).length === i,
					)
					.filter((e) => hasCorrectTribe(e, hero, tribe, gameState.anomalies, gameState.allCards))
					.filter((e) =>
						getEffectiveTribesForEntity(e, hero, gameState.anomalies, gameState.allCards).some(
							(r) => !racesProcessed.includes(r),
						),
					);
				if (typesBuffed >= numberOfDifferentTypes) {
					return result;
				}
				const validMinion: BoardEntity = canRevive
					? getRandomRevivableMinion(minionsWithRaces, hero, tribe, gameState)
					: getRandomAliveMinion(minionsWithRaces, hero, tribe, gameState);
				if (validMinion) {
					result.push(validMinion);
					boardCopy = boardCopy.filter((e) => e !== validMinion);
					typesBuffed++;
					racesProcessed.push(tribe);
				}
			}
		}
		result.push(
			...board.filter((e) => {
				const effectiveTribes = getEffectiveTribesForEntity(e, hero, gameState.anomalies, gameState.allCards);
				return effectiveTribes?.includes(Race.ALL);
			}),
		);
	}
	return result;
};

export const hasMechanic = (card: ReferenceCard, mechanic: GameTag): boolean => {
	return card.mechanics?.includes(GameTag[mechanic]);
};

export const hasEntityMechanic = (
	entity: BoardEntity | BoardEnchantment,
	mechanic: GameTag,
	allCards: AllCardsService,
): boolean => {
	const card = allCards.getCard(entity.cardId);
	if (card.mechanics?.includes(GameTag[mechanic])) {
		return true;
	}
	// Look at the base card
	if (card.entityDbfIf) {
		return hasMechanic(allCards.getCard(card.entityDbfIf), mechanic);
	}
	for (const enchant of (entity as BoardEntity).enchantments ?? []) {
		if (hasEntityMechanic(enchant, mechanic, allCards)) {
			return true;
		}
	}
	return false;
};

export const hasCorrectTribe = (
	entity: BoardEntity,
	playerEntity: BgsPlayerEntity,
	targetTribe: Race,
	anomalies: readonly string[],
	allCards: AllCardsService,
): boolean => {
	if (entity == null) {
		return false;
	}
	const effectiveTribesForEntity = getEffectiveTribesForEntity(entity, playerEntity, anomalies, allCards);
	return (
		effectiveTribesForEntity.length > 0 &&
		(effectiveTribesForEntity.includes(targetTribe) || effectiveTribesForEntity.includes(Race.ALL))
	);
};

export const isVolumizer = (
	cardId: string,
	playerEntity: BgsPlayerEntity,
	anomalies: readonly string[],
	allCards: AllCardsService,
): boolean => {
	if (cardId == null) {
		return false;
	}

	const refCard = allCards.getCard(cardId);
	return refCard.mechanics?.includes('VOLUMIZER');
};

export const getEffectiveTribesForEntity = (
	entity: BoardEntity,
	playerEntity: BgsPlayerEntity,
	anomalies: readonly string[],
	allCards: AllCardsService,
): readonly Race[] => {
	// When we trigger a remembered deathrattle, the tribe is the tribe of the actual minion, not the remembered effect
	const cardId = entity?.originalCardId ?? entity?.cardId;
	if (!cardId) {
		return [];
	}
	const refCard = allCards.getCard(cardId);
	const nativeTribes = refCard.races?.map((r) => Race[r]) ?? [];
	if (!nativeTribes.length && anomalies?.includes(CardIds.IncubationMutation_BG31_Anomaly_112)) {
		return [Race.ALL];
	}
	if (
		refCard.mechanics?.includes(GameTag[GameTag.BACON_BUDDY]) &&
		anomalies?.includes(CardIds.ColorfulCamaraderie_BG33_Anomaly_005)
	) {
		return [Race.ALL];
	}
	return [...nativeTribes, ...getSpecialTribesForEntity(entity, playerEntity, allCards)];
};

const getSpecialTribesForEntity = (
	entity: BoardEntity,
	playerEntity: BgsPlayerEntity,
	allCards: AllCardsService,
): readonly Race[] => {
	switch (entity.cardId) {
		case CardIds.WhelpSmuggler_BG21_013:
		case CardIds.WhelpSmuggler_BG21_013_G:
			return playerEntity.trinkets.some((t) => t.cardId === CardIds.SmugglerPortrait_BG30_MagicItem_825)
				? [Race.DRAGON]
				: [];
		case CardIds.LightfangEnforcer_BGS_009:
		case CardIds.LightfangEnforcer_TB_BaconUps_082:
			return playerEntity.trinkets.some((t) => t.cardId === CardIds.EnforcerPortrait_BG30_MagicItem_971)
				? [Race.ALL]
				: [];
		case CardIds.BrannBronzebeard_BG_LOE_077:
		case CardIds.BrannBronzebeard_TB_BaconUps_045:
			return playerEntity.trinkets.some((t) => t.cardId === CardIds.BronzebeardPortrait_BG30_MagicItem_418)
				? [Race.DRAGON, Race.MURLOC]
				: [];
		case CardIds.DrakkariEnchanter_BG26_ICC_901:
		case CardIds.DrakkariEnchanter_BG26_ICC_901_G:
			return playerEntity.trinkets.some((t) => t.cardId === CardIds.DrakkariPortrait_BG32_MagicItem_179)
				? [Race.MECH, Race.ELEMENTAL]
				: [];
	}
	return [];
};

/** @deprecated use hasCorreectTribe instead */
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
	entity.cleave = cleave;
	entity.cantAttack = cantAttack;
	entity.divineShield = entity.divineShield || entity.hadDivineShield;
	entity.immuneWhenAttackCharges = [
		CardIds.Warpwing_BG24_004,
		CardIds.Warpwing_BG24_004_G,
		CardIds.KerriganQueenOfBlades_ViperToken_BG31_HERO_811t8,
		CardIds.Viper_BG31_HERO_811t8_G,
		TempCardIds.TimewarpedViper,
		TempCardIds.TimewarpedViper_G,
	].includes(entity.cardId as CardIds)
		? 99999
		: null;
	entity.frenzyChargesLeft =
		entity.cardId === CardIds.BristlebackKnight_BG20_204_G
			? 2
			: entity.cardId === CardIds.BristlebackKnight_BG20_204
			? 1
			: 0;
	// It's not an issue adding a charge for entities without a special ability
	const defaultChargesImpl = cardMappings[entity.cardId];
	if (hasDefaultCharges(defaultChargesImpl)) {
		entity.abiityChargesLeft = defaultChargesImpl.defaultCharges(entity);
	} else {
		entity.abiityChargesLeft = [
			// CardIds.MarineMatriarch_BG29_610,
			// CardIds.MarineMatriarch_BG29_610_G,
			// CardIds.SoftHeartedSiren_BG26_590,
			// CardIds.SoftHeartedSiren_BG26_590_G,
			// CardIds.LongJohnCopper_BG29_831,
			// CardIds.LongJohnCopper_BG29_831_G,
			// CardIds.BristlingBuffoon_BG29_160,
			// CardIds.BristlingBuffoon_BG29_160_G,
		].includes(entity.cardId as CardIds)
			? 3
			: [
					CardIds.Mannoroth_BG27_507_G,
					CardIds.EclipsionIllidari_TB_BaconShop_HERO_08_Buddy_G,
					CardIds.MadMatador_BG28_404_G,
					CardIds.WingedChimera_BG29_844,
					CardIds.WingedChimera_BG29_844_G,
					CardIds.MossOfTheSchloss_BG30_111_G,
			  ].includes(entity.cardId as CardIds)
			? 2
			: 1;
	}

	return setImplicitDataForEntity(entity, cardsData);
};

const setImplicitDataForEntity = (entity: BoardEntity, cardsData: CardsData): BoardEntity => {
	entity.cardId = normalizeCardIdForSkin(entity.cardId);
	entity.maxHealth = Math.max(0, entity.health, entity.maxHealth ?? 0);
	entity.maxAttack = Math.max(0, entity.attack, entity.maxAttack ?? 0);
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
		? `${allCards?.getCard(entity.cardId)?.name ?? entity.cardId}/entityId=${entity.entityId}/atk=${
				entity.attack
		  }/hp=${entity.health}/ench=${entity.enchantments.map((e) => e.cardId).join(',')}`
		: null;
};

export const isFish = (entity: BoardEntity): boolean => {
	return (
		entity.cardId?.startsWith(CardIds.AvatarOfNzoth_FishOfNzothToken) ||
		entity.cardId?.startsWith(CardIds.FishOfNzoth) ||
		entity.additionalCards?.includes(CardIds.DevourerOfSouls_BG_RLK_538)
	);
};

export const isPilotedWhirlOTron = (entity: BoardEntity): boolean => {
	return entity.cardId?.startsWith(CardIds.PilotedWhirlOTron_BG21_HERO_030_Buddy);
};

export const isGolden = (cardId: string, allCards: AllCardsService): boolean => {
	return allCards.getCard(cardId).premium;
};

export const isBoardEntity = (entity: BoardEntity | BoardTrinket): entity is BoardEntity => {
	return entity != null && 'maxHealth' in entity;
};

export const getPlayerState = (gameState: GameState, hero: BgsPlayerEntity): PlayerState => {
	return gameState.player.player === hero
		? gameState.player
		: gameState.player.teammate?.player === hero
		? gameState.player.teammate
		: gameState.opponent.player === hero
		? gameState.opponent
		: gameState.opponent.teammate?.player === hero
		? gameState.opponent.teammate
		: null;
};

export const getTeammateInitialState = (gameState: GameState, hero: BgsPlayerEntity): PlayerState => {
	return gameState.playerInitial.player?.entityId === hero?.entityId
		? gameState.playerInitial.teammate
		: gameState.playerInitial.teammate?.player?.entityId === hero?.entityId
		? gameState.playerInitial
		: gameState.opponentInitial.player?.entityId === hero?.entityId
		? gameState.opponentInitial.teammate
		: gameState.opponentInitial.teammate?.player?.entityId === hero?.entityId
		? gameState.opponentInitial
		: null;
};

export const getTeamInitialStates = (gameState: GameState, hero: BgsPlayerEntity): PlayerState[] => {
	return gameState.playerInitial.player?.friendly === hero?.friendly
		? [gameState.playerInitial, gameState.playerInitial.teammate].filter((p) => p)
		: [gameState.opponentInitial, gameState.opponentInitial.teammate].filter((p) => p);
};

export const copyEntity = (entity: BoardEntity): BoardEntity => {
	const copy: BoardEntity = {
		...entity,
		enchantments: entity.enchantments.map((ench) => ({ ...ench })),
		pendingAttackBuffs: [],
		rememberedDeathrattles: (entity.rememberedDeathrattles ?? []).map((r) => ({ ...r })),
		additionalCards: entity.additionalCards?.map((c) => c),
		tags: entity.tags ? { ...entity.tags } : null,
		lastAffectedByEntity: null,
	};
	return copy;
};

export const isDead = (entity: BoardEntity): boolean => {
	return entity.health <= 0 || entity.definitelyDead;
};
