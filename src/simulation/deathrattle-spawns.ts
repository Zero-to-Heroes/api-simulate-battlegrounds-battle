import { CardIds, Race } from '@firestone-hs/reference-data';
import { BgsPlayerEntity } from '../bgs-player-entity';
import { BoardEntity } from '../board-entity';
import { hasDeathrattleSpawn, hasDeathrattleSpawnEnchantment } from '../cards/card.interface';
import { cardMappings } from '../cards/impl/_card-mappings';
import { pickRandom } from '../services/utils';
import {
	addStatsToBoard,
	buildRandomUndeadCreation,
	buildSingleBoardEntity,
	getTeammateInitialState,
	hasCorrectTribe,
	stringifySimple,
} from '../utils';
import { addCardsInHand } from './cards-in-hand';
import { computeDeathrattleMultiplier } from './deathrattle-effects';
import { DeathrattleTriggeredInput, onDeathrattleTriggered } from './deathrattle-on-trigger';
import { FullGameState } from './internal-game-state';
import { performEntitySpawns } from './spawns';

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
	boardWithDeadEntity: BoardEntity[],
	boardWithDeadEntityHero: BgsPlayerEntity,
	otherBoard: BoardEntity[],
	otherBoardHero: BgsPlayerEntity,
	entitiesDeadThisAttack: readonly BoardEntity[],
	gameState: FullGameState,
): readonly BoardEntity[] => {
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
		otherBoard,
		otherBoardHero,
		gameState,
	};

	const spawnedEntities: BoardEntity[] = [];
	// const otherBoardSpawnedEntities: BoardEntity[] = [];
	for (let i = 0; i < multiplier; i++) {
		const cardIds = [deadEntity.cardId, ...(deadEntity.additionalCards ?? [])];
		// console.debug(
		// 	'spawn triggers',
		// 	gameState.allCards.getCard(deadEntity.cardId).name,
		// 	cardIds.map((c) => gameState.allCards.getCard(c).name),
		// 	cardIds,
		// );
		for (const deadEntityCardId of cardIds) {
			let hasTriggered = true;
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
								deadEntityCardId === CardIds.PiggybackImp_BG_AV_309_G
									? CardIds.PiggybackImp_BackpiggyImpToken_BG_AV_309t
									: CardIds.PiggybackImp_BackpiggyImpToken_AV_309t,
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
								CardIds.ImpGangBoss_ImpToken_TB_BaconUps_030t,
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
							deadEntityCardId === CardIds.MawswornSoulkeeper_TB_BaconShop_HERO_702_Buddy_G ? 6 : 3;
						for (let i = 0; i < minionsToSpawnMawsworn; i++) {
							const minionCardId = gameState.cardsData.getRandomMinionForTavernTier(1);
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
					case CardIds.Festergut_BG25_HERO_100_Buddy:
					case CardIds.Festergut_BG25_HERO_100_Buddy_G:
						const minionsToSpawnFestergut =
							deadEntityCardId === CardIds.Festergut_BG25_HERO_100_Buddy_G ? 2 : 1;
						for (let i = 0; i < minionsToSpawnFestergut; i++) {
							const randomUndeadCreation = buildRandomUndeadCreation(
								boardWithDeadEntityHero,
								boardWithDeadEntity,
								gameState.allCards,
								deadEntity.friendly,
								gameState.cardsData,
								gameState.sharedState,
							);
							spawnedEntities.push(
								...spawnEntities(
									randomUndeadCreation.cardId,
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
									randomUndeadCreation,
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
					case CardIds.InfestedWolf_TB_BaconUps_026:
						spawnedEntities.push(
							...spawnEntities(
								CardIds.InfestedWolf_SpiderToken,
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
					case CardIds.SatedThreshadon_TB_BaconUps_052:
						spawnedEntities.push(
							...spawnEntities(
								CardIds.SatedThreshadon_PrimalfinToken,
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
						addCardsInHand(boardWithDeadEntityHero, boardWithDeadEntity, kilrekCardsToAdd, gameState);
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
						const ghastcoilerLoop = deadEntity.cardId === CardIds.Ghastcoiler_TB_BaconUps_057 ? 4 : 2;
						for (let i = 0; i < ghastcoilerLoop; i++) {
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
					case CardIds.TheTideRazor_BGS_079:
						spawnedEntities.push(
							...[
								...spawnEntities(
									gameState.cardsData.pirateSpawns[
										Math.floor(Math.random() * gameState.cardsData.pirateSpawns.length)
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
									gameState.cardsData.pirateSpawns[
										Math.floor(Math.random() * gameState.cardsData.pirateSpawns.length)
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
									gameState.cardsData.pirateSpawns[
										Math.floor(Math.random() * gameState.cardsData.pirateSpawns.length)
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
					case CardIds.TheTideRazor_TB_BaconUps_137:
						spawnedEntities.push(
							...[
								...spawnEntities(
									gameState.cardsData.pirateSpawns[
										Math.floor(Math.random() * gameState.cardsData.pirateSpawns.length)
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
									gameState.cardsData.pirateSpawns[
										Math.floor(Math.random() * gameState.cardsData.pirateSpawns.length)
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
									gameState.cardsData.pirateSpawns[
										Math.floor(Math.random() * gameState.cardsData.pirateSpawns.length)
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
									gameState.cardsData.pirateSpawns[
										Math.floor(Math.random() * gameState.cardsData.pirateSpawns.length)
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
									gameState.cardsData.pirateSpawns[
										Math.floor(Math.random() * gameState.cardsData.pirateSpawns.length)
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
									gameState.cardsData.pirateSpawns[
										Math.floor(Math.random() * gameState.cardsData.pirateSpawns.length)
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
					case CardIds.Bassgill_BG26_350:
					case CardIds.Bassgill_BG26_350_G:
						const bassgillIterations = deadEntity.cardId === CardIds.Bassgill_BG26_350_G ? 2 : 1;
						for (let i = 0; i < bassgillIterations; i++) {
							const hand =
								boardWithDeadEntityHero.hand
									?.filter((e) =>
										hasCorrectTribe(
											e,
											boardWithDeadEntityHero,
											Race.MURLOC,
											gameState.anomalies,
											gameState.allCards,
										),
									)
									.filter((e) => !!e?.cardId)
									.filter((e) => !e.locked) ?? [];
							const highestHealth = Math.max(...hand.filter((c) => c.health).map((c) => c.health));
							const highestHealthMinions = highestHealth
								? hand.filter((c) => c.health === highestHealth)
								: null;
							const spawn = !!highestHealthMinions?.length
								? pickRandom(highestHealthMinions)
								: hand.filter((c) => c.cardId).length
								? pickRandom(hand.filter((c) => c.cardId))
								: null;
							if (spawn) {
								spawn.locked = true;
								// Technically it should not be removed from hand, but rather flagged
								// Probably very low impact doing it like this
								// spawn.locked = true;
								// removeCardFromHand(boardWithDeadEntityHero, spawn);
								const bassgillSpawns = spawnEntities(
									spawn.cardId,
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
									{ ...spawn } as BoardEntity,
								);
								for (const s of bassgillSpawns) {
									s.onCanceledSummon = () => (spawn.locked = false);
									// s.backRef = spawn;
								}
								spawnedEntities.push(...bassgillSpawns);
							}
						}
						break;
					case CardIds.CultistSthara_BG27_081:
					case CardIds.CultistSthara_BG27_081_G:
						const cultistStharaSpawnNumber = deadEntity.cardId === CardIds.CultistSthara_BG27_081_G ? 2 : 1;
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
						const magnanimooseCopies = deadEntity.cardId === CardIds.Magnanimoose_BGDUO_105_G ? 2 : 1;
						for (let i = 0; i < magnanimooseCopies; i++) {
							const teammateState = getTeammateInitialState(gameState.gameState, boardWithDeadEntityHero);
							const teammateBoard = teammateState?.board ?? [];
							const copied: number[] = [];
							const minionToCopy = pickRandom(teammateBoard.filter((e) => !copied.includes(e.entityId)));
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
					default:
						hasTriggered = false;
						break;
				}
			}

			if (hasTriggered) {
				onDeathrattleTriggered(deathrattleTriggeredInput);
			}
		}
	}
	return spawnedEntities;
};

export const spawnEntitiesFromEnchantments = (
	deadEntity: BoardEntity,
	boardWithDeadEntity: BoardEntity[],
	boardWithDeadEntityHero: BgsPlayerEntity,
	otherBoard: BoardEntity[],
	otherBoardHero: BgsPlayerEntity,
	gameState: FullGameState,
): readonly BoardEntity[] => {
	const multiplier = computeDeathrattleMultiplier(
		boardWithDeadEntity,
		boardWithDeadEntityHero,
		deadEntity,
		gameState.sharedState,
	);

	const deathrattleTriggeredInput: DeathrattleTriggeredInput = {
		boardWithDeadEntity,
		boardWithDeadEntityHero,
		deadEntity,
		otherBoard,
		otherBoardHero,
		gameState,
	};

	const spawnedEntities: BoardEntity[] = [];
	for (const enchantment of deadEntity.enchantments || []) {
		const deathrattleImpl = cardMappings[enchantment.cardId];
		if (hasDeathrattleSpawnEnchantment(deathrattleImpl)) {
			for (let i = 0; i < multiplier; i++) {
				const spawns = deathrattleImpl.deathrattleSpawnEnchantmentEffect(
					enchantment,
					deathrattleTriggeredInput,
				);
				if (!!spawns?.length) {
					spawnedEntities.push(...spawns);
				}
				onDeathrattleTriggered(deathrattleTriggeredInput);
			}
		}

		for (let i = 0; i < multiplier; i++) {
			let deathrattleTriggered = true;
			switch (enchantment.cardId) {
				case CardIds.RecurringNightmare_NightmareInsideEnchantment_BG26_055e:
				case CardIds.RecurringNightmare_NightmareInsideEnchantment_BG26_055_Ge:
					spawnedEntities.push(
						...spawnEntities(
							enchantment.cardId === CardIds.RecurringNightmare_NightmareInsideEnchantment_BG26_055e
								? CardIds.RecurringNightmare_BG26_055
								: CardIds.RecurringNightmare_BG26_055_G,
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
					const tavernTier = deadEntity.tavernTier ?? gameState.cardsData.getTavernLevel(deadEntity.cardId);
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
				case CardIds.SurfNSurf_CrabRidingEnchantment_BG27_004e:
				case CardIds.SurfNSurf_CrabRidingEnchantment_BG27_004_Ge:
					spawnedEntities.push(
						...spawnEntities(
							enchantment.cardId === CardIds.SurfNSurf_CrabRidingEnchantment_BG27_004_Ge
								? CardIds.SurfNSurf_CrabToken_BG27_004_Gt2
								: CardIds.SurfNSurf_CrabToken_BG27_004t2,
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
				default:
					deathrattleTriggered = false;
					break;
			}
			if (deathrattleTriggered) {
				onDeathrattleTriggered({
					boardWithDeadEntity: boardWithDeadEntity,
					boardWithDeadEntityHero: boardWithDeadEntityHero,
					deadEntity: deadEntity,
					otherBoard: otherBoard,
					otherBoardHero: otherBoardHero,
					gameState: gameState,
				});
			}
		}
	}
	return spawnedEntities;
};
