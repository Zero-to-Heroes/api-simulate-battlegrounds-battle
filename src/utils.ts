/* eslint-disable @typescript-eslint/no-use-before-define */
import { ALL_BG_RACES, AllCardsService, CardIds, GameTag, Race, ReferenceCard } from '@firestone-hs/reference-data';
import { BgsPlayerEntity } from './bgs-player-entity';
import { BoardEntity } from './board-entity';
import { BoardSecret } from './board-secret';
import { CardsData } from './cards/cards-data';
import { pickRandom, shuffleArray } from './services/utils';
import { handleAddedMinionAuraEffect } from './simulation/add-minion-to-board';
import { FullGameState, GameState, PlayerState } from './simulation/internal-game-state';
import { handleMinionRemovedAuraEffect } from './simulation/remove-minion-from-board';
import { SharedState } from './simulation/shared-state';
import { Spectator } from './simulation/spectator/spectator';
import { modifyStats } from './simulation/stats';

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
	// The token doesn't attack immediately natively, only when spawned by the spell
	// See http://replays.firestoneapp.com/?reviewId=8924452a-540a-4324-8306-46900c3f9f35&turn=22&action=38
	// CardIds.ToxicTumbleweed_TumblingAssassinToken_BG28_641t,
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
				hasAttacked: 0,
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
					pendingAttackBuffs: [],
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
		} else if (
			cardId === CardIds.ZilliaxAssembled_BG29_100_G &&
			!!originalEntity.additionalCards?.filter((c) => !!c).length
		) {
			// In this case, the base stats are still correct (the golden stats of Zilliax), but the keywords
			// can change
			for (const moduleCardId of originalEntity.additionalCards) {
				const moduleCard = allCards.getCard(moduleCardId);
				newEntity.taunt = newEntity.taunt || hasMechanic(moduleCard, GameTag[GameTag.TAUNT]);
				newEntity.divineShield =
					newEntity.divineShield || hasMechanic(moduleCard, GameTag[GameTag.DIVINE_SHIELD]);
				newEntity.hadDivineShield = newEntity.hadDivineShield || newEntity.divineShield;
				newEntity.poisonous = newEntity.poisonous || hasMechanic(moduleCard, GameTag[GameTag.POISONOUS]);
				newEntity.venomous = newEntity.venomous || hasMechanic(moduleCard, GameTag[GameTag.VENOMOUS]);
				newEntity.windfury = newEntity.windfury || hasMechanic(moduleCard, GameTag[GameTag.WINDFURY]);
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

export const makeMinionGolden = (
	target: BoardEntity,
	source: BoardEntity | BgsPlayerEntity,
	targetBoard: BoardEntity[],
	targetBoardHero: BgsPlayerEntity,
	gameState: FullGameState,
): void => {
	// Typically, we are already golden
	if (isMinionGolden(target, gameState.allCards)) {
		return;
	}

	gameState.spectator.registerPowerTarget(source, target, targetBoard, null, null);

	// console.log('before transforming minion', stringifySimple(targetBoard, allCards));
	handleMinionRemovedAuraEffect(targetBoard, target, targetBoardHero, gameState.allCards, gameState.spectator);
	// console.log('after removed effect', stringifySimple(targetBoard, allCards));
	const refCard = gameState.allCards.getCard(target.cardId);
	let goldenCard = gameState.allCards.getCardFromDbfId(refCard.battlegroundsPremiumDbfId);
	// Happens when there is no dedicated golden card, like for the Bettle token from Boon of Beetles
	if (!goldenCard?.id) {
		goldenCard = refCard;
	}

	// A minion becoming golden ignore the current death.
	// This way of handling it is not ideal, since it will still trigger if both avenges trigger at the same time, but
	// should solve the other cases
	// Update 2024-06-21: I'm not sure what this is about exactly. See
	// http://replays.firestoneapp.com/?reviewId=5d94ebeb-3691-4509-88de-5d5418b20597&turn=11&action=2
	// The Sr. Tomb Diver dies, thus gilding the Phaerix. Two other deaths later, the avenge procs
	// This means the death of the diver counted normally
	// target.avengeCurrent = Math.min(target.avengeDefault, target.avengeCurrent + 1);

	// The rule for golden minions is to add the base stats
	// TO CHECK: not sure that this is what actually happens (i.e. do minions that trigger on stats modifications
	// trigger?)
	// UPDATE 2024-06-20: Defiant Shipwright (2/5) going golden (4/10) actually ends up at 4/12 because
	// of the +2 health bonus
	// http://replays.firestoneapp.com/?reviewId=283dc44c-5fc8-40fb-af89-7d752a39f9b9&turn=7&action=1
	modifyStats(target, refCard.attack, refCard.health, targetBoard, targetBoardHero, gameState);

	// Only change the card ID after modifying the stats, so that some effects (like Tarecgosa) won't trigger
	// too early
	const refGoldenCard = gameState.allCards.getCard(target.cardId);
	target.cardId = goldenCard.id;

	// console.log('before adding new effect', stringifySimple(targetBoard, allCards));
	handleAddedMinionAuraEffect(targetBoard, targetBoardHero, target, gameState);
	const hasDivineShield = target.divineShield;
	const hasReborn = target.reborn;
	const avengeCurrent = target.avengeCurrent;
	addImpliedMechanics(target, gameState.cardsData);

	// addImpliedMechanics grants divine shield if the card has divine shield, or if the entity had
	// it at some point. That means that when we gild Zilliax: Defense Module (with Divine Shield) into
	// Zilliaw: Assembled, we restore the divine shield, while we shouldn't
	target.divineShield = hasDivineShield;
	// Update 2024-06-19: Hat tested on one of their build, and gilding a zilliax module should NOT
	// remove its divine shield / reborn status
	// Gilding a reborn Risen Rider results into a golden Risen Rider with reborn
	// http://replays.firestoneapp.com/?reviewId=c553c3e7-01e2-494d-80f8-69f33c08fb39&turn=7&action=4
	target.reborn = hasReborn || refGoldenCard.mechanics?.includes(GameTag[GameTag.REBORN]);
	// target.windfury = refGoldenCard.mechanics?.includes(GameTag[GameTag.WINDFURY]);
	// target.taunt = refGoldenCard.mechanics?.includes(GameTag[GameTag.TAUNT]);
	// target.stealth = refGoldenCard.mechanics?.includes(GameTag[GameTag.STEALTH]);
	target.avengeCurrent = avengeCurrent;

	// console.log('after adding new effect', stringifySimple(targetBoard, allCards));
};

export const isMinionGolden = (entity: BoardEntity, allCards: AllCardsService): boolean => {
	const ref = allCards.getCard(entity.cardId);
	// Some cards (like the Bettle token from Boon of Beetles) don't have a premium dbf id. However, we can still
	// gild it
	return !!ref.battlegroundsNormalDbfId;
	// Why this condition?
	// || !allCards.getCardFromDbfId(ref.battlegroundsPremiumDbfId).id
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
		modifyStats(target, additionalAttack, 0, candidateBoard, hero, gameState);
		gameState.spectator.registerPowerTarget(source, target, board, null, null);
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
		const target = candidateBoard[Math.floor(Math.random() * candidateBoard.length)];
		modifyStats(target, 0, health, board, hero, gameState);
		gameState.spectator.registerPowerTarget(source, target, board, null, null);
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
			race,
			gameState.allCards,
		);
		if (target) {
			modifyStats(target, attack, health, board, hero, gameState);
			if (gameState.spectator) {
				gameState.spectator.registerPowerTarget(source, target, board, null, null);
			}
			return target;
		}
	}
	return null;
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
		const chosen = pickRandom(elligibleEntities);
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

export const getRandomRevivableMinion = (board: BoardEntity[], race: Race, allCards: AllCardsService): BoardEntity => {
	const validTribes = board
		.filter((e) => !race || isCorrectTribe(allCards.getCard(e?.cardId).races, race))
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

export const addStatsToBoard = (
	sourceEntity: BoardEntity | BgsPlayerEntity | BoardSecret,
	board: BoardEntity[],
	hero: BgsPlayerEntity,
	attack: number,
	health: number,
	gameState: FullGameState,
	tribe?: string,
	// permanentUpgrade = false,
): void => {
	for (const entity of board) {
		if (!tribe || hasCorrectTribe(entity, Race[tribe], gameState.allCards)) {
			modifyStats(entity, attack, health, board, hero, gameState);
			gameState.spectator?.registerPowerTarget(sourceEntity, entity, board, null, null);
			// if (permanentUpgrade) {
			// 	entity.permanentAttack = (entity.permanentAttack ?? 0) + attack;
			// 	entity.permanentHealth = (entity.permanentHealth ?? 0) + health;
			// }
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
	const minionsToBuff = getMinionsOfDifferentTypes(board, gameState, canRevive, numberOfDifferentTypes);
	for (const entity of minionsToBuff) {
		modifyStats(entity, attack, health, board, hero, gameState);
		gameState.spectator.registerPowerTarget(source, entity, board, null, null);
	}
};

export const getMinionsOfDifferentTypes = (
	board: BoardEntity[],
	gameState: FullGameState,
	canRevive = true,
	numberOfDifferentTypes = 99,
): BoardEntity[] => {
	const result: BoardEntity[] = [];
	if (board.length > 0) {
		let boardCopy = board.filter((e) => !gameState.allCards.getCard(e.cardId).races?.includes(Race[Race.ALL]));
		const allRaces = shuffleArray(ALL_BG_RACES);
		let typesBuffed = 0;
		for (let i = 1; i <= 2; i++) {
			for (const tribe of allRaces) {
				const minionsWithRaces = boardCopy.filter(
					(e) => gameState.allCards.getCard(e.cardId).races?.length === i,
				);
				if (typesBuffed >= numberOfDifferentTypes) {
					return result;
				}
				// const tribeStr = Race[tribe];
				// const minionWithRevive = getRandomRevivableMinion(boardCopy, tribe, gameState.allCards);
				// const boardDebug = minionsWithRaces.map((e) => ({
				// 	name: gameState.allCards.getCard(e.cardId).name,
				// 	races: gameState.allCards.getCard(e.cardId).races?.join(','),
				// }));
				const validMinion: BoardEntity = canRevive
					? getRandomRevivableMinion(minionsWithRaces, tribe, gameState.allCards)
					: getRandomAliveMinion(minionsWithRaces, tribe, gameState.allCards);
				if (validMinion) {
					result.push(validMinion);
					boardCopy = boardCopy.filter((e) => e !== validMinion);
					typesBuffed++;
				}
			}
		}
		result.push(...board.filter((e) => gameState.allCards.getCard(e.cardId).races?.includes(Race[Race.ALL])));
	}
	return result;
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
	entity.cleave = cleave;
	entity.cantAttack = cantAttack;
	entity.divineShield = entity.divineShield || entity.hadDivineShield;
	entity.immuneWhenAttackCharges =
		entity.cardId === CardIds.Warpwing_BG24_004 || entity.cardId === CardIds.Warpwing_BG24_004_G ? 99999 : null;
	entity.frenzyChargesLeft =
		entity.cardId === CardIds.BristlebackKnight_BG20_204_G
			? 2
			: entity.cardId === CardIds.BristlebackKnight_BG20_204
			? 1
			: 0;
	// It's not an issue adding a charge for entities without a special ability
	entity.abiityChargesLeft = [
		CardIds.MarineMatriarch_BG29_610,
		CardIds.MarineMatriarch_BG29_610_G,
		CardIds.SoftHeartedSiren_BG26_590,
		CardIds.SoftHeartedSiren_BG26_590_G,
		CardIds.LongJohnCopper_BG29_831,
		CardIds.LongJohnCopper_BG29_831_G,
		CardIds.BristlingBuffoon_BG29_160,
		CardIds.BristlingBuffoon_BG29_160_G,
	].includes(entity.cardId as CardIds)
		? 3
		: [
				CardIds.TransmutedBramblewitch_BG27_013_G,
				CardIds.Mannoroth_BG27_507_G,
				CardIds.EclipsionIllidari_TB_BaconShop_HERO_08_Buddy_G,
				CardIds.MadMatador_BG28_404_G,
				CardIds.WingedChimera_BG29_844,
				CardIds.WingedChimera_BG29_844_G,
		  ].includes(entity.cardId as CardIds)
		? 2
		: 1;

	return setImplicitDataForEntity(entity, cardsData);
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
	return entity ? `${allCards?.getCard(entity.cardId)?.name ?? entity.cardId}/atk=${entity.attack}` : null;
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
