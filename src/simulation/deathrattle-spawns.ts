import { CardType, GameTag, Race } from '@firestone-hs/reference-data';
import { BgsPlayerEntity } from '../bgs-player-entity';
import { BoardEnchantment, BoardEntity } from '../board-entity';
import { hasDeathrattleSpawn, hasDeathrattleSpawnEnchantment } from '../cards/card.interface';
import { cardMappings } from '../cards/impl/_card-mappings';
import { updateDivineShield } from '../keywords/divine-shield';
import { CardIds } from '../services/card-ids';
import { pickRandom, pickRandomAlive, pickRandomLowestHealth } from '../services/utils';
import {
	addStatsToBoard,
	buildSingleBoardEntity,
	getTeammateInitialState,
	grantRandomAttack,
	grantRandomStats,
	grantStatsToMinionsOfEachType,
	hasCorrectTribe,
	hasEntityMechanic,
	hasMechanic,
	stringifySimple,
} from '../utils';
import { dealDamageToMinion, dealDamageToRandomEnemy, findNearestEnemies } from './attack';
import { addCardsInHand } from './cards-in-hand';
import {
	applyEarthInvocationEnchantment,
	applyFireInvocationEnchantment,
	applyLeapFroggerEffect,
	applyLightningInvocationEnchantment,
	applyWaterInvocationEnchantment,
	computeDeathrattleMultiplier,
} from './deathrattle-effects';
import { DeathrattleTriggeredInput, onDeathrattleTriggered } from './deathrattle-on-trigger';
import { FullGameState } from './internal-game-state';
import { performEntitySpawns } from './spawns';
import { modifyStats } from './stats';
import { makeMinionGolden } from './utils/golden';

export const simplifiedSpawnEntities = (
	cardId: string,
	quantity: number,
	input: DeathrattleTriggeredInput,
	boardEntityToSpawn: BoardEntity = null,
): readonly BoardEntity[] => {
	return spawnEntities(
		cardId,
		quantity,
		input.boardWithDeadEntity,
		input.boardWithDeadEntityHero,
		input.otherBoard,
		input.otherBoardHero,
		input.gameState,
		input.deadEntity.friendly,
		false,
		false,
		false,
		boardEntityToSpawn,
	);
};

export const simplifiedSpawnEntitiesWithAddToBoard = (
	cardId: string,
	quantity: number,
	input: DeathrattleTriggeredInput,
	source: BoardEntity,
	indexFromRight: number,
	boardEntityToSpawn: BoardEntity = null,
): void => {
	const spawns = spawnEntities(
		cardId,
		quantity,
		input.boardWithDeadEntity,
		input.boardWithDeadEntityHero,
		input.otherBoard,
		input.otherBoardHero,
		input.gameState,
		input.deadEntity.friendly,
		false,
		false,
		false,
		boardEntityToSpawn,
	);
	performEntitySpawns(
		spawns,
		input.boardWithDeadEntity,
		input.boardWithDeadEntityHero,
		source,
		indexFromRight,
		input.otherBoard,
		input.otherBoardHero,
		input.gameState,
	);
};

export const spawnEntities = (
	cardId: string,
	quantity: number,
	boardToSpawnInto: BoardEntity[],
	boardToSpawnIntoHero: BgsPlayerEntity,
	otherBoard: BoardEntity[],
	otherHero: BgsPlayerEntity,
	gameState: FullGameState,
	friendly: boolean,
	// In most cases the business of knowing the number of minions to handle is left to the caller
	// Bascially, use limitSpawns = true only if the source does not trigger if there is not enough room,
	// e.g. Toxic Tumbleweed. Otherwise, it will prevent the "spawn failed" event.
	limitSpawns: boolean,
	spawnReborn = false,
	useKhadgar = true,
	boardEntityToSpawn: BoardEntity = null,
	originalEntity: BoardEntity = null,
): readonly BoardEntity[] => {
	if (!cardId) {
		console.error(
			'Cannot spawn a minion without any cardId defined',
			stringifySimple(boardToSpawnInto, gameState.allCards),
			new Error().stack,
		);
	}
	if (gameState.anomalies?.includes(CardIds.TheGoldenArena_BG27_Anomaly_801)) {
		if (!gameState.allCards.getCard(cardId).premium) {
			const premiumDbfId = gameState.allCards.getCard(cardId).battlegroundsPremiumDbfId;
			cardId = gameState.allCards.getCard(premiumDbfId).id;
		}
	}
	const spawnMultiplier = useKhadgar
		? 2 * boardToSpawnInto.filter((entity) => entity.cardId === CardIds.Khadgar_BG_DAL_575).length || 1
		: 1;
	const spawnMultiplierGolden = useKhadgar
		? 3 * boardToSpawnInto.filter((entity) => entity.cardId === CardIds.Khadgar_TB_BaconUps_034).length || 1
		: 1;
	const minionsToSpawn = limitSpawns
		? Math.min(quantity * spawnMultiplier * spawnMultiplierGolden, 7 - boardToSpawnInto.length)
		: quantity * spawnMultiplier * spawnMultiplierGolden;
	const result: BoardEntity[] = [];
	for (let i = 0; i < minionsToSpawn; i++) {
		const newMinion = buildSingleBoardEntity(
			cardId,
			boardToSpawnIntoHero,
			boardToSpawnInto,
			gameState.allCards,
			friendly,
			gameState.sharedState.currentEntityId++,
			spawnReborn,
			gameState.cardsData,
			gameState.sharedState,
			boardEntityToSpawn,
			originalEntity,
		);
		if (!newMinion.cardId) {
			console.warn('Invalid spawn', newMinion, cardId);
		}
		result.push(newMinion);
	}

	return result;
};

export const spawnEntitiesFromDeathrattle = (
	deadEntity: BoardEntity,
	deadEntityIndexFromRight: number,
	boardWithDeadEntity: BoardEntity[],
	boardWithDeadEntityHero: BgsPlayerEntity,
	otherBoard: BoardEntity[],
	otherBoardHero: BgsPlayerEntity,
	entitiesDeadThisAttack: readonly BoardEntity[],
	gameState: FullGameState,
): readonly BoardEntity[] => {
	const finalSpawns: BoardEntity[] = [];
	// Because if the baron dies because of a cleave, it still applies its effect to the other entities that died this turn
	// TOOD: I need a replay for this
	// If the Titus dies, its effect doesn't apply to the other deathrattle effects that die at the same time
	// e.g. Tunnel Blaster + Omega Buster + Titus, if the titus dies, then the omega buster DR isn't applied multiple
	// times
	// http://replays.firestoneapp.com/?reviewId=fb739cc8-bf3b-4003-ab99-031ee1aa0ea1&turn=25&action=1
	const multiplier = computeDeathrattleMultiplier(
		// [...boardWithDeadEntity, ...entitiesDeadThisAttack],
		[...boardWithDeadEntity],
		boardWithDeadEntityHero,
		deadEntity,
		gameState.sharedState,
	);

	const deathrattleTriggeredInput: DeathrattleTriggeredInput = {
		boardWithDeadEntity,
		boardWithDeadEntityHero,
		deadEntity,
		deadEntityIndexFromRight: deadEntityIndexFromRight,
		otherBoard,
		otherBoardHero,
		gameState,
	};

	// const otherBoardSpawnedEntities: BoardEntity[] = [];
	// console.debug(
	// 	'spawn triggers',
	// 	gameState.allCards.getCard(deadEntity.cardId).name,
	// 	cardIds.map((c) => gameState.allCards.getCard(c).name),
	// 	cardIds,
	// );

	// We compute the enchantments first, so that we don't include enchantments created by the just-processed
	// deathrattles
	// It's important to first copy the enchantments, otherwise you could end up
	// in an infinite loop - since new enchants are added after each step
	const enchantments: BoardEnchantment[] = [
		...deadEntity.enchantments,
		// These seem to be first processed separately
		// ...(deadEntity.rememberedDeathrattles ?? []),
	].sort((a, b) => a.timing - b.timing);
	const cards = [deadEntity, ...enchantments]
		// Two cases that illustrate this:
		// 33.6.2 https://replays.firestoneapp.com/?reviewId=3b025701-01f5-4527-9d53-d8d67f78c5c8&turn=7&action=0
		//    The Phylactery enchantment exists before the Golden Deathrattle power so it goes first.
		// 33.6.2 https://replays.firestoneapp.com/?reviewId=e717d075-3f1b-463a-a644-cda2584eeb0e&turn=5&action=1
		//     the Deathrattle of the Manasaber exists before the Phylactery Deathrattle power is added so the Manasaber Deathrattle goes first.
		.sort(
			(a, b) =>
				((a as BoardEntity).entityId ?? (a as BoardEnchantment).timing ?? 0) -
				((b as BoardEntity).entityId ?? (b as BoardEnchantment).timing ?? 0),
		);

	for (let i = 0; i < multiplier; i++) {
		// Looks like the "on deathrattle triggered" triggers once per deathrattle effect
		// const numberOfTriggers = 0;
		for (const card of cards) {
			let hasTriggered = false;
			const spawnedEntities: BoardEntity[] = [];
			const refCard = gameState.allCards.getCard(card.cardId);

			if (
				refCard.type?.toUpperCase() === CardType[CardType.MINION] &&
				(card as BoardEntity).health !== undefined
			) {
				const cardIds = [card.cardId, ...((card as BoardEntity).additionalCards ?? [])];
				for (const deadEntityCardId of cardIds) {
					let hasTriggeredThisLoop = true;
					const spawnEntityImpl = cardMappings[deadEntityCardId];
					if (hasDeathrattleSpawn(spawnEntityImpl)) {
						const spawned = spawnEntityImpl.deathrattleSpawn(deadEntity, deathrattleTriggeredInput);
						if (spawned?.length) {
							spawnedEntities.push(...spawned);
						}
					} else {
						switch (deadEntityCardId) {
							case CardIds.Mecharoo_BOT_445:
								spawnedEntities.push(
									...spawnEntities(
										CardIds.Mecharoo_JoEBotToken_BOT_445t,
										1,
										boardWithDeadEntity,
										boardWithDeadEntityHero,
										otherBoard,
										otherBoardHero,
										gameState,
										deadEntity.friendly,
										false,
									),
								);
								break;
							case CardIds.Mecharoo_TB_BaconUps_002:
								spawnedEntities.push(
									...spawnEntities(
										CardIds.Mecharoo_JoEBotToken_TB_BaconUps_002t,
										1,
										boardWithDeadEntity,
										boardWithDeadEntityHero,
										otherBoard,
										otherBoardHero,
										gameState,
										deadEntity.friendly,
										false,
									),
								);
								break;
							case CardIds.CordPuller_BG29_611:
							case CardIds.CordPuller_BG29_611_G:
								spawnedEntities.push(
									...spawnEntities(
										deadEntity.cardId === CardIds.CordPuller_BG29_611
											? CardIds.ReplicatingMenace_MicrobotToken_BG_BOT_312t
											: CardIds.ReplicatingMenace_MicrobotToken_TB_BaconUps_032t,
										1,
										boardWithDeadEntity,
										boardWithDeadEntityHero,
										otherBoard,
										otherBoardHero,
										gameState,
										deadEntity.friendly,
										false,
									),
								);
								break;
							case CardIds.PiggybackImp_BG_AV_309:
							case CardIds.PiggybackImp_BG_AV_309_G:
								spawnedEntities.push(
									...spawnEntities(
										CardIds.PiggybackImp_BackpiggyImpToken_AV_309t,
										deadEntityCardId === CardIds.PiggybackImp_BG_AV_309_G ? 2 : 1,
										boardWithDeadEntity,
										boardWithDeadEntityHero,
										otherBoard,
										otherBoardHero,
										gameState,
										deadEntity.friendly,
										false,
									),
								);
								break;
							case CardIds.EternalSummoner_BG25_009:
							case CardIds.EternalSummoner_BG25_009_G:
								// TODO
								spawnedEntities.push(
									...spawnEntities(
										deadEntityCardId === CardIds.EternalSummoner_BG25_009_G
											? CardIds.EternalKnight_BG25_008_G
											: CardIds.EternalKnight_BG25_008,
										1,
										boardWithDeadEntity,
										boardWithDeadEntityHero,
										otherBoard,
										otherBoardHero,
										gameState,
										deadEntity.friendly,
										false,
									),
								);
								break;
							case CardIds.IckyImp_BG21_029:
								spawnedEntities.push(
									...spawnEntities(
										CardIds.ImpGangBoss_ImpToken_BRM_006t,
										2,
										boardWithDeadEntity,
										boardWithDeadEntityHero,
										otherBoard,
										otherBoardHero,
										gameState,
										deadEntity.friendly,
										false,
									),
								);
								break;
							case CardIds.IckyImp_BG21_029_G:
								spawnedEntities.push(
									...spawnEntities(
										CardIds.ImpGangBoss_ImpToken_BRM_006t,
										4,
										boardWithDeadEntity,
										boardWithDeadEntityHero,
										otherBoard,
										otherBoardHero,
										gameState,
										deadEntity.friendly,
										false,
									),
								);
								break;
							case CardIds.HarvestGolemLegacy_BG_EX1_556:
								spawnedEntities.push(
									...spawnEntities(
										CardIds.DamagedGolemLegacy,
										1,
										boardWithDeadEntity,
										boardWithDeadEntityHero,
										otherBoard,
										otherBoardHero,
										gameState,
										deadEntity.friendly,
										false,
									),
								);
								break;
							case CardIds.HarvestGolemLegacy_TB_BaconUps_006:
								spawnedEntities.push(
									...spawnEntities(
										CardIds.HarvestGolem_DamagedGolemLegacyToken_TB_BaconUps_006t,
										1,
										boardWithDeadEntity,
										boardWithDeadEntityHero,
										otherBoard,
										otherBoardHero,
										gameState,
										deadEntity.friendly,
										false,
									),
								);
								break;
							case CardIds.SewerRat_BG19_010:
								spawnedEntities.push(
									...spawnEntities(
										CardIds.SewerRat_HalfShellToken_BG19_010t,
										1,
										boardWithDeadEntity,
										boardWithDeadEntityHero,
										otherBoard,
										otherBoardHero,
										gameState,
										deadEntity.friendly,
										false,
									),
								);
								break;
							case CardIds.SewerRat_BG19_010_G:
								spawnedEntities.push(
									...spawnEntities(
										CardIds.SewerRat_HalfShellToken_BG19_010_Gt,
										1,
										boardWithDeadEntity,
										boardWithDeadEntityHero,
										otherBoard,
										otherBoardHero,
										gameState,
										deadEntity.friendly,
										false,
									),
								);
								break;
							case CardIds.MawswornSoulkeeper_TB_BaconShop_HERO_702_Buddy:
							case CardIds.MawswornSoulkeeper_TB_BaconShop_HERO_702_Buddy_G:
								const minionsToSpawnMawsworn =
									deadEntityCardId === CardIds.MawswornSoulkeeper_TB_BaconShop_HERO_702_Buddy_G
										? 4
										: 2;
								for (let i = 0; i < minionsToSpawnMawsworn; i++) {
									const minionCardId = gameState.cardsData.getRandomMinionForTribe(
										Race.UNDEAD,
										boardWithDeadEntityHero.tavernTier,
									);
									spawnedEntities.push(
										...spawnEntities(
											minionCardId,
											1,
											boardWithDeadEntity,
											boardWithDeadEntityHero,
											otherBoard,
											otherBoardHero,
											gameState,
											deadEntity.friendly,
											false,
										),
									);
								}
								break;
							case CardIds.KindlyGrandmother_BG_KAR_005:
								spawnedEntities.push(
									...spawnEntities(
										CardIds.KindlyGrandmother_BigBadWolf_BG_KAR_005a,
										1,
										boardWithDeadEntity,
										boardWithDeadEntityHero,
										otherBoard,
										otherBoardHero,
										gameState,
										deadEntity.friendly,
										false,
									),
								);
								break;
							case CardIds.KindlyGrandmother_TB_BaconUps_004:
								spawnedEntities.push(
									...spawnEntities(
										CardIds.KindlyGrandmother_BigBadWolfToken,
										1,
										boardWithDeadEntity,
										boardWithDeadEntityHero,
										otherBoard,
										otherBoardHero,
										gameState,
										deadEntity.friendly,
										false,
									),
								);
								break;
							case CardIds.RatPack_BG_CFM_316:
								spawnedEntities.push(
									...spawnEntities(
										CardIds.RatPack_RatToken_BG_CFM_316t,
										Math.min(7, deadEntity.attack),
										boardWithDeadEntity,
										boardWithDeadEntityHero,
										otherBoard,
										otherBoardHero,
										gameState,
										deadEntity.friendly,
										false,
									),
								);
								break;
							case CardIds.RatPack_TB_BaconUps_027:
								spawnedEntities.push(
									...spawnEntities(
										CardIds.RatPack_RatToken_TB_BaconUps_027t,
										Math.min(7, deadEntity.attack),
										boardWithDeadEntity,
										boardWithDeadEntityHero,
										otherBoard,
										otherBoardHero,
										gameState,
										deadEntity.friendly,
										false,
									),
								);
								break;
							case CardIds.Imprisoner_BGS_014:
								spawnedEntities.push(
									...spawnEntities(
										CardIds.ImpGangBoss_ImpToken_BRM_006t,
										1,
										boardWithDeadEntity,
										boardWithDeadEntityHero,
										otherBoard,
										otherBoardHero,
										gameState,
										deadEntity.friendly,
										false,
									),
								);
								break;
							case CardIds.Imprisoner_TB_BaconUps_113:
								spawnedEntities.push(
									...spawnEntities(
										CardIds.ImpGangBoss_ImpToken_TB_BaconUps_030t,
										1,
										boardWithDeadEntity,
										boardWithDeadEntityHero,
										otherBoard,
										otherBoardHero,
										gameState,
										deadEntity.friendly,
										false,
									),
								);
								break;
							case CardIds.InfestedWolf_OG_216:
								spawnedEntities.push(
									...spawnEntities(
										CardIds.InfestedWolf_Spider,
										2,
										boardWithDeadEntity,
										boardWithDeadEntityHero,
										otherBoard,
										otherBoardHero,
										gameState,
										deadEntity.friendly,
										false,
									),
								);
								break;
							case CardIds.ReplicatingMenace_BG_BOT_312:
								spawnedEntities.push(
									...spawnEntities(
										CardIds.ReplicatingMenace_MicrobotToken_BG_BOT_312t,
										3,
										boardWithDeadEntity,
										boardWithDeadEntityHero,
										otherBoard,
										otherBoardHero,
										gameState,
										deadEntity.friendly,
										false,
									),
								);
								break;
							case CardIds.ReplicatingMenace_TB_BaconUps_032:
								spawnedEntities.push(
									...spawnEntities(
										CardIds.ReplicatingMenace_MicrobotToken_TB_BaconUps_032t,
										3,
										boardWithDeadEntity,
										boardWithDeadEntityHero,
										otherBoard,
										otherBoardHero,
										gameState,
										deadEntity.friendly,
										false,
									),
								);
								break;
							case CardIds.MechanoEgg_BOT_537:
								spawnedEntities.push(
									...spawnEntities(
										CardIds.MechanoEgg_RobosaurToken_BOT_537t,
										1,
										boardWithDeadEntity,
										boardWithDeadEntityHero,
										otherBoard,
										otherBoardHero,
										gameState,
										deadEntity.friendly,
										false,
									),
								);
								break;
							case CardIds.MechanoEgg_TB_BaconUps_039:
								spawnedEntities.push(
									...spawnEntities(
										CardIds.MechanoEgg_RobosaurToken_TB_BaconUps_039t,
										1,
										boardWithDeadEntity,
										boardWithDeadEntityHero,
										otherBoard,
										otherBoardHero,
										gameState,
										deadEntity.friendly,
										false,
									),
								);
								break;
							case CardIds.SavannahHighmaneLegacy_BG_EX1_534:
								spawnedEntities.push(
									...spawnEntities(
										CardIds.SavannahHighmane_HyenaLegacyToken_BG_EX1_534t,
										2,
										boardWithDeadEntity,
										boardWithDeadEntityHero,
										otherBoard,
										otherBoardHero,
										gameState,
										deadEntity.friendly,
										false,
									),
								);
								break;
							case CardIds.SavannahHighmaneLegacy_TB_BaconUps_049:
								spawnedEntities.push(
									...spawnEntities(
										CardIds.SavannahHighmane_HyenaLegacyToken_TB_BaconUps_049t,
										2,
										boardWithDeadEntity,
										boardWithDeadEntityHero,
										otherBoard,
										otherBoardHero,
										gameState,
										deadEntity.friendly,
										false,
									),
								);
								break;
							case CardIds.RingMatron_BG_DMF_533:
								spawnedEntities.push(
									...spawnEntities(
										CardIds.RingMatron_FieryImpToken_BG_DMF_533t,
										2,
										boardWithDeadEntity,
										boardWithDeadEntityHero,
										otherBoard,
										otherBoardHero,
										gameState,
										deadEntity.friendly,
										false,
									),
								);
								break;
							case CardIds.RingMatron_TB_BaconUps_309:
								spawnedEntities.push(
									...spawnEntities(
										CardIds.RingMatron_FieryImpToken_TB_BaconUps_309t,
										2,
										boardWithDeadEntity,
										boardWithDeadEntityHero,
										otherBoard,
										otherBoardHero,
										gameState,
										deadEntity.friendly,
										false,
									),
								);
								break;
							case CardIds.SatedThreshadon_UNG_010:
								spawnedEntities.push(
									...spawnEntities(
										CardIds.PrimalfinTotem_PrimalfinToken,
										3,
										boardWithDeadEntity,
										boardWithDeadEntityHero,
										otherBoard,
										otherBoardHero,
										gameState,
										deadEntity.friendly,
										false,
									),
								);
								break;
							case CardIds.Ghastcoiler_BGS_008:
								spawnedEntities.push(
									...[
										...spawnEntities(
											gameState.cardsData.ghastcoilerSpawns[
												Math.floor(Math.random() * gameState.cardsData.ghastcoilerSpawns.length)
											],
											1,
											boardWithDeadEntity,
											boardWithDeadEntityHero,
											otherBoard,
											otherBoardHero,
											gameState,
											deadEntity.friendly,
											false,
										),
										...spawnEntities(
											gameState.cardsData.ghastcoilerSpawns[
												Math.floor(Math.random() * gameState.cardsData.ghastcoilerSpawns.length)
											],
											1,
											boardWithDeadEntity,
											boardWithDeadEntityHero,
											otherBoard,
											otherBoardHero,
											gameState,
											deadEntity.friendly,
											false,
										),
									],
								);
								break;
							case CardIds.Kilrek_TB_BaconShop_HERO_37_Buddy:
							case CardIds.Kilrek_TB_BaconShop_HERO_37_Buddy_G:
								const kilrekCardsToAddQuantity =
									deadEntity.cardId === CardIds.Kilrek_TB_BaconShop_HERO_37_Buddy_G ? 2 : 1;
								const kilrekCardsToAdd = [];
								for (let i = 0; i < kilrekCardsToAddQuantity; i++) {
									kilrekCardsToAdd.push(pickRandom(gameState.cardsData.demonSpawns));
								}
								addCardsInHand(
									boardWithDeadEntityHero,
									boardWithDeadEntity,
									kilrekCardsToAdd,
									gameState,
								);
								break;
							case CardIds.BrannsEpicEgg_TB_BaconShop_HERO_43_Buddy:
							case CardIds.BrannsEpicEgg_TB_BaconShop_HERO_43_Buddy_G:
								const brannSpawns = [];
								const brannToSpawnQuandtity =
									deadEntity.cardId === CardIds.BrannsEpicEgg_TB_BaconShop_HERO_43_Buddy_G ? 2 : 1;
								for (let i = 0; i < brannToSpawnQuandtity; i++) {
									brannSpawns.push(pickRandom(gameState.cardsData.battlecryMinions));
								}
								for (const brannSpawn of brannSpawns) {
									spawnedEntities.push(
										...spawnEntities(
											brannSpawn,
											1,
											boardWithDeadEntity,
											boardWithDeadEntityHero,
											otherBoard,
											otherBoardHero,
											gameState,
											deadEntity.friendly,
											false,
										),
									);
								}
								addCardsInHand(boardWithDeadEntityHero, boardWithDeadEntity, brannSpawns, gameState);
								break;
							case CardIds.Ghastcoiler_TRLA_149:
							case CardIds.Ghastcoiler_TB_BaconUps_057:
								const ghastcoilerLoop =
									deadEntity.cardId === CardIds.Ghastcoiler_TB_BaconUps_057 ? 4 : 2;
								for (let i = 0; i < ghastcoilerLoop; i++) {
									spawnedEntities.push(
										...[
											...spawnEntities(
												gameState.cardsData.ghastcoilerSpawns[
													Math.floor(
														Math.random() * gameState.cardsData.ghastcoilerSpawns.length,
													)
												],
												1,
												boardWithDeadEntity,
												boardWithDeadEntityHero,
												otherBoard,
												otherBoardHero,
												gameState,
												deadEntity.friendly,
												false,
											),
										],
									);
								}
								break;
							case CardIds.Voidlord_BG_LOOT_368:
								spawnedEntities.push(
									...spawnEntities(
										CardIds.VoidwalkerLegacy_BG_CS2_065,
										3,
										boardWithDeadEntity,
										boardWithDeadEntityHero,
										otherBoard,
										otherBoardHero,
										gameState,
										deadEntity.friendly,
										false,
									),
								);
								break;
							case CardIds.Voidlord_TB_BaconUps_059:
								spawnedEntities.push(
									...spawnEntities(
										CardIds.Voidlord_VoidwalkerLegacyToken,
										3,
										boardWithDeadEntity,
										boardWithDeadEntityHero,
										otherBoard,
										otherBoardHero,
										gameState,
										deadEntity.friendly,
										false,
									),
								);
								break;
							case CardIds.AnnoyOTroupe_BG26_ETC_321:
							case CardIds.AnnoyOTroupe_BG26_ETC_321_G:
								const annoyOTroupeSpawns =
									deadEntity.cardId === CardIds.AnnoyOTroupe_BG26_ETC_321_G
										? CardIds.AnnoyOTron_BG_GVG_085_G
										: CardIds.AnnoyOTron_BG_GVG_085;
								spawnedEntities.push(
									...spawnEntities(
										annoyOTroupeSpawns,
										3,
										boardWithDeadEntity,
										boardWithDeadEntityHero,
										otherBoard,
										otherBoardHero,
										gameState,
										deadEntity.friendly,
										false,
									),
								);
								break;
							case CardIds.OmegaBuster_BG21_025:
							case CardIds.OmegaBuster_BG21_025_G:
								// Here we have to truncate the spawned entities instead of letting the caller handle it,
								// because we need to know how many minions couldn't spawn so that we can apply the buff.
								// HOWEVER, this can cause an issue, if for instance a Scallywag token spawns, attacks right away,
								// and then Omega Buster spawns. In this case, it will not have yet processed the token's attack,
								// and will limit the spawns
								const cardParam = 6;
								const entitiesToSpawn = Math.max(
									0,
									Math.min(cardParam, 7 - boardWithDeadEntity.length - spawnedEntities.length),
								);
								const buffAmount =
									(deadEntityCardId === CardIds.OmegaBuster_BG21_025_G ? 2 : 1) *
									(cardParam - entitiesToSpawn);
								spawnedEntities.push(
									...spawnEntities(
										deadEntityCardId === CardIds.OmegaBuster_BG21_025_G
											? CardIds.ReplicatingMenace_MicrobotToken_TB_BaconUps_032t
											: CardIds.ReplicatingMenace_MicrobotToken_BG_BOT_312t,
										entitiesToSpawn,
										boardWithDeadEntity,
										boardWithDeadEntityHero,
										otherBoard,
										otherBoardHero,
										gameState,
										deadEntity.friendly,
										true,
									),
								);
								addStatsToBoard(
									deadEntity,
									boardWithDeadEntity,
									boardWithDeadEntityHero,
									buffAmount,
									buffAmount,
									gameState,
									Race[Race.MECH],
								);
								// when the buster triggers multiple times because of Baron for instance
								addStatsToBoard(
									deadEntity,
									spawnedEntities,
									boardWithDeadEntityHero,
									buffAmount,
									buffAmount,
									gameState,
									Race[Race.MECH],
								);
								break;
							case CardIds.OctosariWrapGod_BG26_804:
							case CardIds.OctosariWrapGod_BG26_804_G:
								// For remembered deathrattles
								const stats =
									deadEntity.scriptDataNum1 ||
									gameState.sharedState.deaths.find(
										(e) => e.friendly === deadEntity.friendly && e.cardId === deadEntity.cardId,
									)?.scriptDataNum1 ||
									0;
								const octosariSpawn =
									deadEntity.cardId === CardIds.OctosariWrapGod_BG26_804_G
										? CardIds.TentacleOfOctosariToken_BG26_803_Gt
										: CardIds.TentacleOfOctosariToken_BG26_803t;
								const octoSpawns = spawnEntities(
									octosariSpawn,
									1,
									boardWithDeadEntity,
									boardWithDeadEntityHero,
									otherBoard,
									otherBoardHero,
									gameState,
									deadEntity.friendly,
									false,
								);
								octoSpawns.forEach((b) => {
									b.attack = stats;
									b.health = stats;
								});
								spawnedEntities.push(...octoSpawns);
								break;
							case CardIds.CultistSthara_BG27_081:
							case CardIds.CultistSthara_BG27_081_G:
								const cultistStharaSpawnNumber =
									deadEntity.cardId === CardIds.CultistSthara_BG27_081_G ? 2 : 1;
								const cultistStharaSpawnCandidates = gameState.sharedState.deaths
									.filter((entity) => entity.friendly === deadEntity.friendly)
									.filter((entity) =>
										hasCorrectTribe(
											entity,
											boardWithDeadEntityHero,
											Race.DEMON,
											gameState.anomalies,
											gameState.allCards,
										),
									)
									.slice(0, cultistStharaSpawnNumber);
								cultistStharaSpawnCandidates.forEach((candidate) => {
									const spawns = spawnEntities(
										candidate.cardId,
										1,
										boardWithDeadEntity,
										boardWithDeadEntityHero,
										otherBoard,
										otherBoardHero,
										gameState,
										deadEntity.friendly,
										false,
										false,
										true,
									);
									spawns.forEach((spawn) => {
										spawn.attack = candidate.maxAttack ?? candidate.attack;
										spawn.health = candidate.maxHealth ?? candidate.health;
										spawn.maxHealth = spawn.health;
									});
									spawnedEntities.push(...spawns);
								});
								break;
							case CardIds.Magnanimoose_BGDUO_105:
							case CardIds.Magnanimoose_BGDUO_105_G:
								const magnanimooseCopies =
									deadEntity.cardId === CardIds.Magnanimoose_BGDUO_105_G ? 2 : 1;
								for (let i = 0; i < magnanimooseCopies; i++) {
									const teammateState = getTeammateInitialState(
										gameState.gameState,
										boardWithDeadEntityHero,
									);
									const teammateBoard = teammateState?.board ?? [];
									const copied: number[] = [];
									const minionToCopy = pickRandom(
										teammateBoard.filter((e) => !copied.includes(e.entityId)),
									);
									if (minionToCopy) {
										const copy: BoardEntity = {
											...minionToCopy,
											health: 1,
											maxHealth: 1,
											enchantments: [...minionToCopy.enchantments],
											pendingAttackBuffs: [],
										};
										spawnedEntities.push(
											...spawnEntities(
												copy.cardId,
												1,
												boardWithDeadEntity,
												boardWithDeadEntityHero,
												otherBoard,
												otherBoardHero,
												gameState,
												deadEntity.friendly,
												false,
												false,
												true,
												copy,
											),
										);
										copied.push(copy.entityId);
									}
								}
								break;
							// Putricide-only
							case CardIds.FoulEgg_BG26_RLK_833:
								spawnedEntities.push(
									...spawnEntities(
										CardIds.FoulEgg_FoulFowlToken,
										1,
										boardWithDeadEntity,
										boardWithDeadEntityHero,
										otherBoard,
										otherBoardHero,
										gameState,
										deadEntity.friendly,
										false,
									),
								);
								break;
							case CardIds.NadinaTheRed_BGS_040:
							case CardIds.NadinaTheRed_TB_BaconUps_154:
								const nadinaMultiplier =
									deadEntityCardId === CardIds.NadinaTheRed_TB_BaconUps_154 ? 6 : 3;
								for (let j = 0; j < nadinaMultiplier; j++) {
									const validTargets = boardWithDeadEntity
										.filter((e) =>
											hasCorrectTribe(
												e,
												boardWithDeadEntityHero,
												Race.DRAGON,
												gameState.anomalies,
												gameState.allCards,
											),
										)
										.filter((entity) => !entity.divineShield);
									const target = pickRandom(validTargets);
									if (target) {
										updateDivineShield(
											target,
											boardWithDeadEntity,
											boardWithDeadEntityHero,
											otherBoardHero,
											true,
											gameState,
										);
										gameState.spectator.registerPowerTarget(
											deadEntity,
											target,
											boardWithDeadEntity,
											boardWithDeadEntityHero,
											otherBoardHero,
										);
									}
								}
								break;
							case CardIds.SpawnOfNzoth_BG_OG_256:
								addStatsToBoard(
									deadEntity,
									boardWithDeadEntity,
									boardWithDeadEntityHero,
									1,
									1,
									gameState,
								);
								break;
							case CardIds.SpawnOfNzoth_TB_BaconUps_025:
								addStatsToBoard(
									deadEntity,
									boardWithDeadEntity,
									boardWithDeadEntityHero,
									2,
									2,
									gameState,
								);
								break;
							case CardIds.FiendishServant_YOD_026:
								grantRandomAttack(
									deadEntity,
									boardWithDeadEntity,
									boardWithDeadEntityHero,
									deadEntity.attack,
									gameState,
								);
								break;
							case CardIds.FiendishServant_TB_BaconUps_112:
								grantRandomAttack(
									deadEntity,
									boardWithDeadEntity,
									boardWithDeadEntityHero,
									deadEntity.attack,
									gameState,
								);
								grantRandomAttack(
									deadEntity,
									boardWithDeadEntity,
									boardWithDeadEntityHero,
									deadEntity.attack,
									gameState,
								);
								break;
							case CardIds.NightbaneIgnited_BG29_815:
							case CardIds.NightbaneIgnited_BG29_815_G:
								const nightbaneLoops = deadEntityCardId === CardIds.NightbaneIgnited_BG29_815_G ? 2 : 1;
								for (let j = 0; j < nightbaneLoops; j++) {
									const pickedTargetEntityIds = [];
									for (let k = 0; k < 2; k++) {
										const target = pickRandomAlive(
											boardWithDeadEntity
												.filter(
													(e) =>
														![
															CardIds.NightbaneIgnited_BG29_815,
															CardIds.NightbaneIgnited_BG29_815_G,
														].includes(e.cardId as CardIds),
												)
												.filter((e) => !pickedTargetEntityIds.includes(e.entityId)),
										);
										if (!!target) {
											pickedTargetEntityIds.push(target.entityId);
											modifyStats(
												target,
												deadEntity,
												deadEntity.attack,
												0,
												boardWithDeadEntity,
												boardWithDeadEntityHero,
												gameState,
											);
										}
									}
								}
								break;
							case CardIds.Leapfrogger_BG21_000:
							case CardIds.TimewarpedLeapfrogger_BG34_Giant_031:
								// console.log('\t', 'Leapfrogger from DR', deadEntity.entityId);
								applyLeapFroggerEffect(
									boardWithDeadEntity,
									boardWithDeadEntityHero,
									deadEntity,
									false,
									gameState,
									deadEntity.deathrattleRepeats,
								);
								break;
							case CardIds.Leapfrogger_BG21_000_G:
							case CardIds.TimewarpedLeapfrogger_BG34_Giant_031_G:
								applyLeapFroggerEffect(
									boardWithDeadEntity,
									boardWithDeadEntityHero,
									deadEntity,
									true,
									gameState,
									deadEntity.deathrattleRepeats,
								);
								break;
							case CardIds.PalescaleCrocolisk_BG21_001:
								const target = grantRandomStats(
									deadEntity,
									boardWithDeadEntity,
									boardWithDeadEntityHero,
									6,
									6,
									Race.BEAST,
									true,
									gameState,
								);
								if (!!target) {
									gameState.spectator.registerPowerTarget(
										deadEntity,
										target,
										boardWithDeadEntity,
										boardWithDeadEntityHero,
										otherBoardHero,
									);
								}
								break;
							case CardIds.PalescaleCrocolisk_BG21_001_G:
								const crocTarget = grantRandomStats(
									deadEntity,
									boardWithDeadEntity,
									boardWithDeadEntityHero,
									12,
									12,
									Race.BEAST,
									true,
									gameState,
								);
								if (!!crocTarget) {
									gameState.spectator.registerPowerTarget(
										deadEntity,
										crocTarget,
										boardWithDeadEntity,
										boardWithDeadEntityHero,
										otherBoardHero,
									);
								}
								break;
							case CardIds.ScarletSkull_BG25_022:
							case CardIds.ScarletSkull_BG25_022_G:
								const scarletMultiplier = deadEntityCardId === CardIds.ScarletSkull_BG25_022_G ? 2 : 1;
								const scarletTarget = grantRandomStats(
									deadEntity,
									boardWithDeadEntity,
									boardWithDeadEntityHero,
									scarletMultiplier * 1,
									scarletMultiplier * 2,
									Race.UNDEAD,
									false,
									gameState,
								);
								if (!!scarletTarget) {
									gameState.spectator.registerPowerTarget(
										deadEntity,
										scarletTarget,
										boardWithDeadEntity,
										boardWithDeadEntityHero,
										otherBoardHero,
									);
								}
								break;
							case CardIds.ElementiumSquirrelBomb_TB_BaconShop_HERO_17_Buddy:
							case CardIds.ElementiumSquirrelBomb_TB_BaconShop_HERO_17_Buddy_G:
								// FIXME: I don't think this way of doing things is really accurate (as some deathrattles
								// could be spawned between the shots firing), but let's say it's good enough for now
								const squirrelDamage =
									deadEntity.cardId === CardIds.ElementiumSquirrelBomb_TB_BaconShop_HERO_17_Buddy_G
										? 8
										: 4;
								const numberOfDeadMechsThisCombat = gameState.sharedState.deaths
									.filter((entity) => entity.friendly === deadEntity.friendly)
									// eslint-disable-next-line prettier/prettier
									.filter((entity) =>
										hasCorrectTribe(
											entity,
											boardWithDeadEntityHero,
											Race.MECH,
											gameState.anomalies,
											gameState.allCards,
										),
									).length;
								for (let j = 0; j < numberOfDeadMechsThisCombat; j++) {
									dealDamageToRandomEnemy(
										otherBoard,
										otherBoardHero,
										deadEntity,
										squirrelDamage,
										boardWithDeadEntity,
										boardWithDeadEntityHero,
										gameState,
									);
								}
								break;
							case CardIds.KaboomBot_BG_BOT_606:
							case CardIds.KaboomBot_TB_BaconUps_028:
								// FIXME: I don't think this way of doing things is really accurate (as some deathrattles
								// could be spawned between the shots firing), but let's say it's good enough for now
								const kaboomLoops = deadEntity.cardId === CardIds.KaboomBot_TB_BaconUps_028 ? 2 : 1;
								const baseDamage =
									4 +
									boardWithDeadEntityHero.trinkets.filter(
										(t) => t.cardId === CardIds.KaboomBotPortrait_BG30_MagicItem_803,
									).length *
										10;
								for (let j = 0; j < kaboomLoops; j++) {
									dealDamageToRandomEnemy(
										otherBoard,
										otherBoardHero,
										deadEntity,
										baseDamage,
										boardWithDeadEntity,
										boardWithDeadEntityHero,
										gameState,
									);
								}
								break;
							case CardIds.LighterFighter_BG28_968:
							case CardIds.LighterFighter_BG28_968_G:
								// FIXME: I don't think this way of doing things is really accurate (as some deathrattles
								// could be spawned between the shots firing), but let's say it's good enough for now
								const lighterFighterDamage =
									deadEntity.cardId === CardIds.LighterFighter_BG28_968_G ? 8 : 4;
								for (let j = 0; j < 2; j++) {
									const target = pickRandomLowestHealth(otherBoard);
									gameState.spectator.registerPowerTarget(
										deadEntity,
										target,
										otherBoard,
										boardWithDeadEntityHero,
										otherBoardHero,
									);
									dealDamageToMinion(
										target,
										otherBoard,
										otherBoardHero,
										deadEntity,
										lighterFighterDamage,
										boardWithDeadEntity,
										boardWithDeadEntityHero,
										gameState,
									);
								}
								break;
							case CardIds.DrBoombox_BG25_165:
							case CardIds.DrBoombox_BG25_165_G:
								// FIXME: I don't think this way of doing things is really accurate (as some deathrattles
								// could be spawned between the shots firing), but let's say it's good enough for now
								const boomboxDamage = deadEntity.cardId === CardIds.DrBoombox_BG25_165_G ? 14 : 7;
								// The nearest enemies use the full board info
								// const boardIncludingDeadEntityAtCorrectIndex = boardWithDeadEntity.splice(
								// 	deadEntityIndexFromRight,
								// 	0,
								// 	deadEntity,
								// );
								const targets = findNearestEnemies(
									boardWithDeadEntity,
									null,
									deadEntityIndexFromRight,
									otherBoard,
									2,
									gameState.allCards,
								);
								targets.forEach((target) => {
									// console.debug('dealing damage to', stringifySimpleCard(target));
									dealDamageToMinion(
										target,
										otherBoard,
										otherBoardHero,
										deadEntity,
										boomboxDamage,
										boardWithDeadEntity,
										boardWithDeadEntityHero,
										gameState,
									);
								});
								break;
							case CardIds.UnstableGhoul_BG_FP1_024:
								// case CardIds.UnstableGhoul_TB_BaconUps_118:
								const damage = 1; //deadEntityCardId === CardIds.UnstableGhoul_TB_BaconUps_118 ? 2 : 1;
								// In case there are spawns, don't target them
								const minionsToDamage = [...otherBoard, ...boardWithDeadEntity];
								for (const target of minionsToDamage) {
									const isSameSide = target.friendly === deadEntity.friendly;
									const board = isSameSide ? boardWithDeadEntity : otherBoard;
									const hero = isSameSide ? boardWithDeadEntityHero : otherBoardHero;
									dealDamageToMinion(
										target,
										board,
										hero,
										deadEntity,
										damage,
										isSameSide ? otherBoard : boardWithDeadEntity,
										isSameSide ? otherBoardHero : boardWithDeadEntityHero,
										gameState,
									);
								}
								break;
							case CardIds.MysticSporebat_BG28_900:
							case CardIds.MysticSporebat_BG28_900_G:
								const loops = deadEntityCardId === CardIds.MysticSporebat_BG28_900_G ? 2 : 1;
								const cardsToAdd = Array(loops).fill(null);
								addCardsInHand(boardWithDeadEntityHero, boardWithDeadEntity, cardsToAdd, gameState);
								break;
							case CardIds.SrTombDiver_TB_BaconShop_HERO_41_Buddy:
							case CardIds.SrTombDiver_TB_BaconShop_HERO_41_Buddy_G:
								const numberToGild =
									deadEntityCardId === CardIds.SrTombDiver_TB_BaconShop_HERO_41_Buddy_G ? 2 : 1;
								const targetBoard = boardWithDeadEntity.filter(
									(e) => !e.definitelyDead && e.health > 0,
								);
								// .filter((e) => !gameState.cardsData.isGolden(gameState.allCards.getCard(e.cardId)));
								for (let i = 0; i < Math.min(numberToGild, boardWithDeadEntity.length); i++) {
									const rightMostMinion = targetBoard[targetBoard.length - 1 - i];
									if (rightMostMinion) {
										makeMinionGolden(
											rightMostMinion,
											deadEntity,
											boardWithDeadEntity,
											boardWithDeadEntityHero,
											otherBoard,
											otherBoardHero,
											gameState,
										);
									}
								}
								break;
							case CardIds.SanguineChampion_BG23_017:
							case CardIds.SanguineChampion_BG23_017_G:
								const sanguineChampionStats =
									deadEntityCardId === CardIds.SanguineChampion_BG23_017 ? 1 : 2;
								boardWithDeadEntityHero.globalInfo.BloodGemAttackBonus += sanguineChampionStats;
								boardWithDeadEntityHero.globalInfo.BloodGemHealthBonus += sanguineChampionStats;
								break;
							case CardIds.PricklyPiper_BG26_160:
							case CardIds.PricklyPiper_BG26_160_G:
								const piperBuff = deadEntityCardId === CardIds.PricklyPiper_BG26_160 ? 1 : 2;
								boardWithDeadEntityHero.globalInfo.BloodGemAttackBonus += piperBuff;
								break;
							// Putricide-only
							case CardIds.Banshee_BG_RLK_957:
								addStatsToBoard(
									deadEntity,
									boardWithDeadEntity,
									boardWithDeadEntityHero,
									2,
									1,
									gameState,
									Race[Race.UNDEAD],
								);
								break;
							case CardIds.LostSpirit_BG26_GIL_513:
								addStatsToBoard(
									deadEntity,
									boardWithDeadEntity,
									boardWithDeadEntityHero,
									1,
									0,
									gameState,
									null,
								);
								break;
							case CardIds.TickingAbomination_BG_ICC_099:
								for (const entity of boardWithDeadEntity) {
									dealDamageToMinion(
										entity,
										boardWithDeadEntity,
										boardWithDeadEntityHero,
										deadEntity,
										5,
										otherBoard,
										otherBoardHero,
										gameState,
									);
								}
								break;
							case CardIds.MotleyPhalanx_BG27_080:
							case CardIds.MotleyPhalanx_BG27_080_G:
								const motleyBuff = deadEntity.cardId === CardIds.MotleyPhalanx_BG27_080_G ? 2 : 1;
								grantStatsToMinionsOfEachType(
									deadEntity,
									boardWithDeadEntity,
									boardWithDeadEntityHero,
									motleyBuff * 1,
									motleyBuff * 1,
									gameState,
								);
								break;
							case CardIds.MoroesStewardOfDeath_BG28_304:
							case CardIds.MoroesStewardOfDeath_BG28_304_G:
								const moroesBuffAtk =
									deadEntity.cardId === CardIds.MoroesStewardOfDeath_BG28_304_G ? 8 : 4;
								const moroesBuffHealth =
									deadEntity.cardId === CardIds.MoroesStewardOfDeath_BG28_304_G ? 12 : 6;
								addStatsToBoard(
									deadEntity,
									boardWithDeadEntity,
									boardWithDeadEntityHero,
									moroesBuffAtk,
									moroesBuffHealth,
									gameState,
									Race[Race.UNDEAD],
								);
								break;
							case CardIds.SteadfastSpirit_BG28_306:
							case CardIds.SteadfastSpirit_BG28_306_G:
								const steadfastSpiritBuff =
									deadEntity.cardId === CardIds.SteadfastSpirit_BG28_306_G ? 2 : 1;
								addStatsToBoard(
									deadEntity,
									boardWithDeadEntity,
									boardWithDeadEntityHero,
									steadfastSpiritBuff,
									steadfastSpiritBuff,
									gameState,
								);
								break;
							case CardIds.ScrapScraper_BG26_148:
							case CardIds.ScrapScraper_BG26_148_G:
								const scraperToAddQuantity =
									deadEntity.cardId === CardIds.ScrapScraper_BG26_148_G ? 2 : 1;
								const scraperCardsToAdd = [];
								for (let i = 0; i < scraperToAddQuantity; i++) {
									scraperCardsToAdd.push(pickRandom(gameState.cardsData.scrapScraperSpawns));
								}
								addCardsInHand(
									boardWithDeadEntityHero,
									boardWithDeadEntity,
									scraperCardsToAdd,
									gameState,
								);
								break;
							case CardIds.BarrensConjurer_BG29_862:
							case CardIds.BarrensConjurer_BG29_862_G:
								const conjurerToAddQuantity =
									deadEntity.cardId === CardIds.BarrensConjurer_BG29_862_G ? 2 : 1;
								const conjurerCardsToAdd = [];
								for (let i = 0; i < conjurerToAddQuantity; i++) {
									conjurerCardsToAdd.push(pickRandom(gameState.cardsData.battlecryMinions));
								}
								addCardsInHand(
									boardWithDeadEntityHero,
									boardWithDeadEntity,
									conjurerCardsToAdd,
									gameState,
								);
								break;
							case CardIds.SpikedSavior_BG29_808:
							case CardIds.SpikedSavior_BG29_808_G:
								const spikedSaviorLoops = deadEntity.cardId === CardIds.SpikedSavior_BG29_808_G ? 2 : 1;
								for (let j = 0; j < spikedSaviorLoops; j++) {
									const targetBoard = [...boardWithDeadEntity];
									for (const entity of targetBoard) {
										modifyStats(
											entity,
											deadEntity,
											0,
											1,
											boardWithDeadEntity,
											boardWithDeadEntityHero,
											gameState,
										);
									}
									for (const entity of targetBoard) {
										// Issue: because this can spawn a new minion, the entity indices can be incorrect
										// See sim.sample.1.txt
										// Ideally, I should probably move the minion spawn index to another paradigm: keep the dead minions
										// until there are new spawns, and delete them afterwards, so I can easily refer to their index
										// by just looking them up, and spawning to the right
										// However, since this doesn't work, maybe I can look for entity indices adjustments needed
										// by looking up the position changes of other minions?
										// Not sure how this could work without creating a giant mess, so for now it will probably
										// stay as a bug
										dealDamageToMinion(
											entity,
											boardWithDeadEntity,
											boardWithDeadEntityHero,
											deadEntity,
											1,
											otherBoard,
											otherBoardHero,
											gameState,
										);
									}
								}
								break;
							// Add all the deathrattles that don't have an effect on combat
							// case CardIds.FieryFelblood_BG29_877:
							// case CardIds.FieryFelblood_BG29_877_G:
							default:
								if (deadEntity.additionalCards?.includes(deadEntityCardId)) {
									if (
										!hasMechanic(gameState.allCards.getCard(deadEntityCardId), GameTag.DEATHRATTLE)
									) {
										hasTriggeredThisLoop = false;
									}
								} else {
									const source = [deadEntity, ...enchantments].find(
										(e) => e.cardId === deadEntityCardId,
									);
									if (!hasEntityMechanic(source, GameTag.DEATHRATTLE, gameState.allCards)) {
										hasTriggeredThisLoop = false;
									}
								}
								break;
						}
					}
					hasTriggered = hasTriggered || hasTriggeredThisLoop;
					// 33.6.2 we fully process each deathrattle before applying the next
					// The key is to find the correct order for processing, hence the sorting for enchantments and "natural" deathrattles
					if (spawnedEntities?.length > 0) {
						const actualSpawns = performEntitySpawns(
							spawnedEntities,
							boardWithDeadEntity,
							boardWithDeadEntityHero,
							deadEntity,
							deadEntityIndexFromRight,
							otherBoard,
							otherBoardHero,
							gameState,
						);
						finalSpawns.push(...actualSpawns);
					}
				}
			}
			// It's an enchantment
			else {
				const spawnedEntities: BoardEntity[] = [];
				let hasTriggeredThisLoop = true;
				const enchantment = card as BoardEnchantment;
				const deathrattleImpl = cardMappings[enchantment.cardId];
				if (hasDeathrattleSpawnEnchantment(deathrattleImpl)) {
					const spawns = deathrattleImpl.deathrattleSpawnEnchantmentEffect(
						enchantment,
						deadEntity,
						deathrattleTriggeredInput,
					);
					if (!!spawns?.length) {
						spawnedEntities.push(...spawns);
					}
				} else {
					switch (enchantment.cardId) {
						case CardIds.EarthRecollectionEnchantment:
							applyEarthInvocationEnchantment(boardWithDeadEntity, deadEntity, deadEntity, gameState);
							break;
						case CardIds.FireRecollectionEnchantment:
							applyFireInvocationEnchantment(
								boardWithDeadEntity,
								boardWithDeadEntityHero,
								deadEntity,
								deadEntity,
								gameState,
							);
							break;
						case CardIds.WaterRecollectionEnchantment:
							applyWaterInvocationEnchantment(
								boardWithDeadEntity,
								boardWithDeadEntityHero,
								otherBoardHero,
								deadEntity,
								deadEntity,
								gameState,
							);
							break;
						case CardIds.LightningRecollectionEnchantment:
							applyLightningInvocationEnchantment(
								boardWithDeadEntity,
								boardWithDeadEntityHero,
								deadEntity,
								otherBoard,
								otherBoardHero,
								gameState,
							);
							break;
						// case CardIds.RecurringNightmare_NightmareInsideEnchantment_BG26_055e:
						// case CardIds.RecurringNightmare_NightmareInsideEnchantment_BG26_055_Ge:
						// 	spawnedEntities.push(
						// 		...spawnEntities(
						// 			enchantment.cardId === CardIds.RecurringNightmare_NightmareInsideEnchantment_BG26_055e
						// 				? CardIds.RecurringNightmare_BG26_055
						// 				: CardIds.RecurringNightmare_BG26_055_G,
						// 			1,
						// 			boardWithDeadEntity,
						// 			boardWithDeadEntityHero,
						// 			otherBoard,
						// 			otherBoardHero,
						// 			gameState,
						// 			deadEntity.friendly,
						// 			false,
						// 		),
						// 	);
						// 	break;
						// Replicating Menace
						case CardIds.ReplicatingMenace_ReplicatingMenaceEnchantment_BG_BOT_312e:
							spawnedEntities.push(
								...spawnEntities(
									CardIds.ReplicatingMenace_MicrobotToken_BG_BOT_312t,
									3,
									boardWithDeadEntity,
									boardWithDeadEntityHero,
									otherBoard,
									otherBoardHero,
									gameState,
									deadEntity.friendly,
									false,
								),
							);
							break;
						case CardIds.ReplicatingMenace_ReplicatingMenaceEnchantment_TB_BaconUps_032e:
							spawnedEntities.push(
								...spawnEntities(
									CardIds.ReplicatingMenace_MicrobotToken_TB_BaconUps_032t,
									3,
									boardWithDeadEntity,
									boardWithDeadEntityHero,
									otherBoard,
									otherBoardHero,
									gameState,
									deadEntity.friendly,
									false,
								),
							);
							break;
						case CardIds.LivingSpores_LivingSporesEnchantment:
							spawnedEntities.push(
								...spawnEntities(
									CardIds.LivingSpores_PlantToken,
									2,
									boardWithDeadEntity,
									boardWithDeadEntityHero,
									otherBoard,
									otherBoardHero,
									gameState,
									deadEntity.friendly,
									false,
								),
							);
							break;
						case CardIds.EarthInvocation_ElementEarthEnchantment:
							spawnedEntities.push(
								...spawnEntities(
									CardIds.ElementEarth_StoneElementalToken,
									1,
									boardWithDeadEntity,
									boardWithDeadEntityHero,
									otherBoard,
									otherBoardHero,
									gameState,
									deadEntity.friendly,
									false,
								),
							);
							break;
						case CardIds.BoonOfBeetles_BeetleSwarmEnchantment_BG28_603e:
							spawnedEntities.push(
								...spawnEntities(
									CardIds.BoonOfBeetles_BeetleToken_BG28_603t,
									1,
									boardWithDeadEntity,
									boardWithDeadEntityHero,
									otherBoard,
									otherBoardHero,
									gameState,
									deadEntity.friendly,
									false,
								),
							);
							break;
						case CardIds.TheUninvitedGuest_UninvitedEnchantment_BG29_875e:
							spawnedEntities.push(
								...spawnEntities(
									CardIds.TheUninvitedGuest_ShadowToken_BG29_875t,
									1,
									boardWithDeadEntity,
									boardWithDeadEntityHero,
									otherBoard,
									otherBoardHero,
									gameState,
									deadEntity.friendly,
									false,
								),
							);
							break;
						case CardIds.TheUninvitedGuest_UninvitedEnchantment_BG29_875_Ge:
							spawnedEntities.push(
								...spawnEntities(
									CardIds.TheUninvitedGuest_ShadowToken_BG29_875_Gt,
									1,
									boardWithDeadEntity,
									boardWithDeadEntityHero,
									otherBoard,
									otherBoardHero,
									gameState,
									deadEntity.friendly,
									false,
								),
							);
							break;
						case CardIds.SneedsReplicator_ReplicateEnchantment:
							const tavernTier =
								deadEntity.tavernTier ?? gameState.cardsData.getTavernLevel(deadEntity.cardId);
							spawnedEntities.push(
								...spawnEntities(
									gameState.cardsData.getRandomMinionForTavernTier(Math.max(1, tavernTier - 1)),
									1,
									boardWithDeadEntity,
									boardWithDeadEntityHero,
									otherBoard,
									otherBoardHero,
									gameState,
									deadEntity.friendly,
									false,
								),
							);
							break;
						// case CardIds.SurfNSurf_CrabRidingEnchantment_BG27_004e:
						// case CardIds.SurfNSurf_CrabRidingEnchantment_BG27_004_Ge:
						// 	spawnedEntities.push(
						// 		...spawnEntities(
						// 			enchantment.cardId === CardIds.SurfNSurf_CrabRidingEnchantment_BG27_004_Ge
						// 				? CardIds.SurfNSurf_CrabToken_BG27_004_Gt2
						// 				: CardIds.SurfNSurf_CrabToken_BG27_004t2,
						// 			1,
						// 			boardWithDeadEntity,
						// 			boardWithDeadEntityHero,
						// 			otherBoard,
						// 			otherBoardHero,
						// 			gameState,
						// 			deadEntity.friendly,
						// 			false,
						// 		),
						// 	);
						// 	break;
						case CardIds.JarredFrostling_FrostyGlobeEnchantment_BG30_MagicItem_952e:
							spawnedEntities.push(
								...spawnEntities(
									CardIds.FlourishingFrostling_BG26_537,
									1,
									boardWithDeadEntity,
									boardWithDeadEntityHero,
									otherBoard,
									otherBoardHero,
									gameState,
									deadEntity.friendly,
									false,
								),
							);
							break;
						// Enchantments
						case CardIds.RustyTrident_TridentsTreasureEnchantment_BG30_MagicItem_917e:
							addCardsInHand(boardWithDeadEntityHero, boardWithDeadEntity, [null], gameState);
							break;
						case CardIds.HoggyBank_GemInTheBankEnchantment_BG30_MagicItem_411e:
							addCardsInHand(boardWithDeadEntityHero, boardWithDeadEntity, [CardIds.BloodGem], gameState);
							break;
						case CardIds.Leapfrogger_LeapfrogginEnchantment_BG21_000e:
						case CardIds.Leapfrogger_LeapfrogginEnchantment_BG21_000_Ge:
							// console.log('\t', 'Leapfrogger enchantment', enchantment.repeats);
							applyLeapFroggerEffect(
								boardWithDeadEntity,
								boardWithDeadEntityHero,
								deadEntity,
								enchantment.cardId === CardIds.Leapfrogger_LeapfrogginEnchantment_BG21_000_Ge,
								gameState,
								enchantment.repeats || 1,
							);
							break;
						default:
							hasTriggeredThisLoop = false;
							break;
					}
				}
				hasTriggered = hasTriggered || hasTriggeredThisLoop;
				if (spawnedEntities?.length > 0) {
					const actualSpawns = performEntitySpawns(
						spawnedEntities,
						boardWithDeadEntity,
						boardWithDeadEntityHero,
						deadEntity,
						deadEntityIndexFromRight,
						otherBoard,
						otherBoardHero,
						gameState,
					);
					finalSpawns.push(...actualSpawns);
				}
			}

			// 2025-12-03: this triggers at every loop
			// https://replays.firestoneapp.com/?reviewId=8a0bbb48-10f8-4d91-8008-b3b7b9c9d7ba&turn=19&action=2
			// See the first spawn getting buffed twice, and the second spawn buffed once
			if (hasTriggered) {
				onDeathrattleTriggered(deathrattleTriggeredInput);
				// numberOfTriggers++;
			}
		}

		// for (let i = 0; i < numberOfTriggers; i++) {
		// 	onDeathrattleTriggered(deathrattleTriggeredInput);
		// }
	}
	return finalSpawns;
};
