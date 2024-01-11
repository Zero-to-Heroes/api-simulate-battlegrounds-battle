import { AllCardsService, CardIds, Race } from '@firestone-hs/reference-data';
import { BgsPlayerEntity } from '../bgs-player-entity';
import { BoardEntity } from '../board-entity';
import { CardsData } from '../cards/cards-data';
import { pickRandom } from '../services/utils';
import {
	addCardsInHand,
	addStatsToBoard,
	buildRandomUndeadCreation,
	buildSingleBoardEntity,
	hasCorrectTribe,
	isCorrectTribe,
	stringifySimple,
} from '../utils';
import { computeDeathrattleMultiplier } from './deathrattle-effects';
import { SharedState } from './shared-state';
import { Spectator } from './spectator/spectator';

export const spawnEntities = (
	cardId: string,
	quantity: number,
	boardToSpawnInto: BoardEntity[],
	boardToSpawnIntoHero: BgsPlayerEntity,
	otherBoard: BoardEntity[],
	otherHero: BgsPlayerEntity,
	allCards: AllCardsService,
	cardsData: CardsData,
	sharedState: SharedState,
	spectator: Spectator,
	friendly: boolean,
	// In most cases the business of knowing the number of minions to handle is left to the caller
	limitSpawns: boolean,
	spawnReborn = false,
	useKhadgar = true,
	boardEntityToSpawn: BoardEntity = null,
	originalEntity: BoardEntity = null,
): readonly BoardEntity[] => {
	if (!cardId) {
		console.error(
			'Cannot spawn a minion without any cardId defined',
			stringifySimple(boardToSpawnInto, allCards),
			new Error().stack,
		);
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
			allCards,
			friendly,
			sharedState.currentEntityId++,
			spawnReborn,
			cardsData,
			sharedState,
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
	allCards: AllCardsService,
	spawns: CardsData,
	sharedState: SharedState,
	spectator: Spectator,
): readonly BoardEntity[] => {
	// Because if the baron dies because of a cleave, it still applies its effect to the other entities that died this turn
	const multiplier = computeDeathrattleMultiplier(
		[...boardWithDeadEntity, ...entitiesDeadThisAttack],
		boardWithDeadEntityHero,
		deadEntity,
		sharedState,
	);
	const spawnedEntities: BoardEntity[] = [];
	// const otherBoardSpawnedEntities: BoardEntity[] = [];
	for (let i = 0; i < multiplier; i++) {
		const cardIds = [deadEntity.cardId, ...(deadEntity.additionalCards ?? [])];
		for (const deadEntityCardId of cardIds) {
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
							allCards,
							spawns,
							sharedState,
							spectator,
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
							allCards,
							spawns,
							sharedState,
							spectator,
							deadEntity.friendly,
							false,
						),
					);
					break;
				case CardIds.Manasaber_BG26_800:
				case CardIds.Manasaber_BG26_800_G:
					const cublingId =
						deadEntity.cardId === CardIds.Manasaber_BG26_800_G
							? CardIds.Manasaber_CublingToken_BG26_800_Gt
							: CardIds.Manasaber_CublingToken_BG26_800t;
					spawnedEntities.push(
						...spawnEntities(
							cublingId,
							2,
							boardWithDeadEntity,
							boardWithDeadEntityHero,
							otherBoard,
							otherBoardHero,
							allCards,
							spawns,
							sharedState,
							spectator,
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
							allCards,
							spawns,
							sharedState,
							spectator,
							deadEntity.friendly,
							false,
						),
					);
					break;
				case CardIds.HandlessForsaken_BG25_010:
				case CardIds.HandlessForsaken_BG25_010_G:
					spawnedEntities.push(
						...spawnEntities(
							deadEntityCardId === CardIds.HandlessForsaken_BG25_010_G
								? CardIds.HandlessForsaken_HelpingHandToken_BG25_010_Gt
								: CardIds.HandlessForsaken_HelpingHandToken_BG25_010t,
							1,
							boardWithDeadEntity,
							boardWithDeadEntityHero,
							otherBoard,
							otherBoardHero,
							allCards,
							spawns,
							sharedState,
							spectator,
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
							allCards,
							spawns,
							sharedState,
							spectator,
							deadEntity.friendly,
							false,
						),
					);
					break;
				case CardIds.Scallywag_BGS_061:
					spawnedEntities.push(
						...spawnEntities(
							CardIds.Scallywag_SkyPirateToken_BGS_061t,
							1,
							boardWithDeadEntity,
							boardWithDeadEntityHero,
							otherBoard,
							otherBoardHero,
							allCards,
							spawns,
							sharedState,
							spectator,
							deadEntity.friendly,
							false,
						),
					);
					break;
				case CardIds.Scallywag_TB_BaconUps_141:
					spawnedEntities.push(
						...spawnEntities(
							CardIds.Scallywag_SkyPirateToken_TB_BaconUps_141t,
							1,
							boardWithDeadEntity,
							boardWithDeadEntityHero,
							otherBoard,
							otherBoardHero,
							allCards,
							spawns,
							sharedState,
							spectator,
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
							allCards,
							spawns,
							sharedState,
							spectator,
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
							allCards,
							spawns,
							sharedState,
							spectator,
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
							allCards,
							spawns,
							sharedState,
							spectator,
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
							allCards,
							spawns,
							sharedState,
							spectator,
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
							allCards,
							spawns,
							sharedState,
							spectator,
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
							allCards,
							spawns,
							sharedState,
							spectator,
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
						const minionCardId = spawns.getRandomMinionForTavernTier(1);
						spawnedEntities.push(
							...spawnEntities(
								minionCardId,
								1,
								boardWithDeadEntity,
								boardWithDeadEntityHero,
								otherBoard,
								otherBoardHero,
								allCards,
								spawns,
								sharedState,
								spectator,
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
							allCards,
							deadEntity.friendly,
							spawns,
							sharedState,
						);
						spawnedEntities.push(
							...spawnEntities(
								randomUndeadCreation.cardId,
								1,
								boardWithDeadEntity,
								boardWithDeadEntityHero,
								otherBoard,
								otherBoardHero,
								allCards,
								spawns,
								sharedState,
								spectator,
								deadEntity.friendly,
								false,
								false,
								true,
								randomUndeadCreation,
							),
						);
					}
					break;
				case CardIds.KindlyGrandmother_KAR_005:
					spawnedEntities.push(
						...spawnEntities(
							CardIds.KindlyGrandmother_BigBadWolf,
							1,
							boardWithDeadEntity,
							boardWithDeadEntityHero,
							otherBoard,
							otherBoardHero,
							allCards,
							spawns,
							sharedState,
							spectator,
							deadEntity.friendly,
							false,
						),
					);
					break;
				case CardIds.KindlyGrandmother_TB_BaconUps_004:
					spawnedEntities.push(
						...spawnEntities(
							CardIds.KindlyGrandmother_BigBadWolf,
							1,
							boardWithDeadEntity,
							boardWithDeadEntityHero,
							otherBoard,
							otherBoardHero,
							allCards,
							spawns,
							sharedState,
							spectator,
							deadEntity.friendly,
							false,
						),
					);
					break;
				case CardIds.RatPack_BG_CFM_316:
					spawnedEntities.push(
						...spawnEntities(
							CardIds.RatPack_RatToken_BG_CFM_316t,
							deadEntity.attack,
							boardWithDeadEntity,
							boardWithDeadEntityHero,
							otherBoard,
							otherBoardHero,
							allCards,
							spawns,
							sharedState,
							spectator,
							deadEntity.friendly,
							false,
						),
					);
					break;
				case CardIds.RatPack_TB_BaconUps_027:
					spawnedEntities.push(
						...spawnEntities(
							CardIds.RatPack_RatToken_TB_BaconUps_027t,
							deadEntity.attack,
							boardWithDeadEntity,
							boardWithDeadEntityHero,
							otherBoard,
							otherBoardHero,
							allCards,
							spawns,
							sharedState,
							spectator,
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
							allCards,
							spawns,
							sharedState,
							spectator,
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
							allCards,
							spawns,
							sharedState,
							spectator,
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
							allCards,
							spawns,
							sharedState,
							spectator,
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
							allCards,
							spawns,
							sharedState,
							spectator,
							deadEntity.friendly,
							false,
						),
					);
					break;
				// case CardIds.TheBeastLegacy:
				// case CardIds.TheBeastBattlegrounds:
				// 	otherBoardSpawnedEntities.push(
				// 		...spawnEntities(
				// 			CardIds.FinkleEinhornLegacy,
				// 			1,
				// 			otherBoard,
				// 			otherBoardHero,
				// 			boardWithDeadEntity,
				// 			boardWithDeadEntityHero,
				// 			allCards,
				// 			spawns,
				// 			sharedState,
				// 			spectator,
				// 			!deadEntity.friendly,
				// 			false,
				// 		),
				// 	);
				// 	break;
				case CardIds.ReplicatingMenace_BG_BOT_312:
					spawnedEntities.push(
						...spawnEntities(
							CardIds.ReplicatingMenace_MicrobotToken_BG_BOT_312t,
							3,
							boardWithDeadEntity,
							boardWithDeadEntityHero,
							otherBoard,
							otherBoardHero,
							allCards,
							spawns,
							sharedState,
							spectator,
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
							allCards,
							spawns,
							sharedState,
							spectator,
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
							allCards,
							spawns,
							sharedState,
							spectator,
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
							allCards,
							spawns,
							sharedState,
							spectator,
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
							allCards,
							spawns,
							sharedState,
							spectator,
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
							allCards,
							spawns,
							sharedState,
							spectator,
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
							allCards,
							spawns,
							sharedState,
							spectator,
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
							allCards,
							spawns,
							sharedState,
							spectator,
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
							allCards,
							spawns,
							sharedState,
							spectator,
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
							allCards,
							spawns,
							sharedState,
							spectator,
							deadEntity.friendly,
							false,
						),
					);
					break;
				case CardIds.Ghastcoiler_BGS_008:
					spawnedEntities.push(
						...[
							...spawnEntities(
								spawns.ghastcoilerSpawns[Math.floor(Math.random() * spawns.ghastcoilerSpawns.length)],
								1,
								boardWithDeadEntity,
								boardWithDeadEntityHero,
								otherBoard,
								otherBoardHero,
								allCards,
								spawns,
								sharedState,
								spectator,
								deadEntity.friendly,
								false,
							),
							...spawnEntities(
								spawns.ghastcoilerSpawns[Math.floor(Math.random() * spawns.ghastcoilerSpawns.length)],
								1,
								boardWithDeadEntity,
								boardWithDeadEntityHero,
								otherBoard,
								otherBoardHero,
								allCards,
								spawns,
								sharedState,
								spectator,
								deadEntity.friendly,
								false,
							),
						],
					);
					break;
				case CardIds.GentleDjinni_BGS_121:
				case CardIds.GentleDjinni_TB_BaconUps_165:
					const djinniSpawns = [];
					const djinniToSpawnQuandtity = deadEntity.cardId === CardIds.GentleDjinni_TB_BaconUps_165 ? 2 : 1;
					for (let i = 0; i < djinniToSpawnQuandtity; i++) {
						djinniSpawns.push(pickRandom(spawns.gentleDjinniSpawns));
					}
					for (const djinniSpawn of djinniSpawns) {
						spawnedEntities.push(
							...spawnEntities(
								djinniSpawn,
								1,
								boardWithDeadEntity,
								boardWithDeadEntityHero,
								otherBoard,
								otherBoardHero,
								allCards,
								spawns,
								sharedState,
								spectator,
								deadEntity.friendly,
								false,
							),
						);
					}
					addCardsInHand(boardWithDeadEntityHero, boardWithDeadEntity, allCards, spectator, djinniSpawns);
					break;

				case CardIds.Kilrek_TB_BaconShop_HERO_37_Buddy:
				case CardIds.Kilrek_TB_BaconShop_HERO_37_Buddy_G:
					const kilrekCardsToAddQuantity =
						deadEntity.cardId === CardIds.Kilrek_TB_BaconShop_HERO_37_Buddy_G ? 2 : 1;
					const kilrekCardsToAdd = [];
					for (let i = 0; i < kilrekCardsToAddQuantity; i++) {
						kilrekCardsToAdd.push(pickRandom(spawns.demonSpawns));
					}
					addCardsInHand(boardWithDeadEntityHero, boardWithDeadEntity, allCards, spectator, kilrekCardsToAdd);
					break;

				case CardIds.BrannsEpicEgg_TB_BaconShop_HERO_43_Buddy:
				case CardIds.BrannsEpicEgg_TB_BaconShop_HERO_43_Buddy_G:
					const brannSpawns = [];
					const brannToSpawnQuandtity =
						deadEntity.cardId === CardIds.BrannsEpicEgg_TB_BaconShop_HERO_43_Buddy_G ? 2 : 1;
					for (let i = 0; i < brannToSpawnQuandtity; i++) {
						brannSpawns.push(pickRandom(spawns.brannEpicEggSpawns));
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
								allCards,
								spawns,
								sharedState,
								spectator,
								deadEntity.friendly,
								false,
							),
						);
					}
					addCardsInHand(boardWithDeadEntityHero, boardWithDeadEntity, allCards, spectator, brannSpawns);
					break;

				case CardIds.Ghastcoiler_TRLA_149:
				case CardIds.Ghastcoiler_TB_BaconUps_057:
					const ghastcoilerLoop = deadEntity.cardId === CardIds.Ghastcoiler_TB_BaconUps_057 ? 4 : 2;
					for (let i = 0; i < ghastcoilerLoop; i++) {
						spawnedEntities.push(
							...[
								...spawnEntities(
									spawns.ghastcoilerSpawns[
										Math.floor(Math.random() * spawns.ghastcoilerSpawns.length)
									],
									1,
									boardWithDeadEntity,
									boardWithDeadEntityHero,
									otherBoard,
									otherBoardHero,
									allCards,
									spawns,
									sharedState,
									spectator,
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
							allCards,
							spawns,
							sharedState,
							spectator,
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
							allCards,
							spawns,
							sharedState,
							spectator,
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
							allCards,
							spawns,
							sharedState,
							spectator,
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
						(deadEntityCardId === CardIds.OmegaBuster_BG21_025_G ? 2 : 1) * (cardParam - entitiesToSpawn);
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
							allCards,
							spawns,
							sharedState,
							spectator,
							deadEntity.friendly,
							true,
						),
					);
					addStatsToBoard(
						deadEntity,
						boardWithDeadEntity,
						buffAmount,
						buffAmount,
						allCards,
						spectator,
						Race[Race.MECH],
					);
					// when the buster triggers multiple times because of Baron for instance
					addStatsToBoard(
						deadEntity,
						spawnedEntities,
						buffAmount,
						buffAmount,
						allCards,
						spectator,
						Race[Race.MECH],
					);
					break;
				// case CardIds.OmegaBusterBattlegrounds:
				// 	const entitiesToSpawn2 = Math.min(6, 7 - boardWithDeadEntity.length);
				// 	const buffAmount2 = 6 - entitiesToSpawn2;
				// 	spawnedEntities.push(
				// 		...spawnEntities(
				// 			CardIds.ReplicatingMenace_MicrobotTokenBattlegrounds,
				// 			entitiesToSpawn2,
				// 			boardWithDeadEntity,
				// 			boardWithDeadEntityHero,
				// 			otherBoard,
				// 			otherBoardHero,
				// 			allCards,
				// 			spawns,
				// 			sharedState,
				// 			spectator,
				// 			deadEntity.friendly,
				// 			false,
				// 		),
				// 	);
				// 	addStatsToBoard(deadEntity, boardWithDeadEntity, 2 * buffAmount2, 2 * buffAmount2, allCards, spectator, Race[Race.MECH]);
				// 	// when the buster triggers multiple times because of Baron for instance
				// 	addStatsToBoard(deadEntity, spawnedEntities, 2 * buffAmount2, 2 * buffAmount2, allCards, spectator, Race[Race.MECH]);
				// 	break;
				case CardIds.KangorsApprentice_BGS_012:
					const cardIdsToSpawn = sharedState.deaths
						.filter((entity) => entity.friendly === deadEntity.friendly)
						// eslint-disable-next-line prettier/prettier
						.filter((entity) => isCorrectTribe(allCards.getCard(entity.cardId)?.races, Race.MECH))
						.slice(0, 2)
						.map((entity) => entity.cardId);
					cardIdsToSpawn.forEach((cardId) =>
						spawnedEntities.push(
							...spawnEntities(
								cardId,
								1,
								boardWithDeadEntity,
								boardWithDeadEntityHero,
								otherBoard,
								otherBoardHero,
								allCards,
								spawns,
								sharedState,
								spectator,
								deadEntity.friendly,
								false,
							),
						),
					);
					break;
				case CardIds.KangorsApprentice_TB_BaconUps_087:
					const cardIdsToSpawn2 = sharedState.deaths
						.filter((entity) => entity.friendly === deadEntity.friendly)
						.filter((entity) => isCorrectTribe(allCards.getCard(entity.cardId)?.races, Race.MECH))
						.slice(0, 4)
						.map((entity) => entity.cardId);
					cardIdsToSpawn2.forEach((cardId) =>
						spawnedEntities.push(
							...spawnEntities(
								cardId,
								1,
								boardWithDeadEntity,
								boardWithDeadEntityHero,
								otherBoard,
								otherBoardHero,
								allCards,
								spawns,
								sharedState,
								spectator,
								deadEntity.friendly,
								false,
							),
						),
					);
					break;
				case CardIds.TheTideRazor_BGS_079:
					spawnedEntities.push(
						...[
							...spawnEntities(
								spawns.pirateSpawns[Math.floor(Math.random() * spawns.pirateSpawns.length)],
								1,
								boardWithDeadEntity,
								boardWithDeadEntityHero,
								otherBoard,
								otherBoardHero,
								allCards,
								spawns,
								sharedState,
								spectator,
								deadEntity.friendly,
								false,
							),
							...spawnEntities(
								spawns.pirateSpawns[Math.floor(Math.random() * spawns.pirateSpawns.length)],
								1,
								boardWithDeadEntity,
								boardWithDeadEntityHero,
								otherBoard,
								otherBoardHero,
								allCards,
								spawns,
								sharedState,
								spectator,
								deadEntity.friendly,
								false,
							),
							...spawnEntities(
								spawns.pirateSpawns[Math.floor(Math.random() * spawns.pirateSpawns.length)],
								1,
								boardWithDeadEntity,
								boardWithDeadEntityHero,
								otherBoard,
								otherBoardHero,
								allCards,
								spawns,
								sharedState,
								spectator,
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
								spawns.pirateSpawns[Math.floor(Math.random() * spawns.pirateSpawns.length)],
								1,
								boardWithDeadEntity,
								boardWithDeadEntityHero,
								otherBoard,
								otherBoardHero,
								allCards,
								spawns,
								sharedState,
								spectator,
								deadEntity.friendly,
								false,
							),
							...spawnEntities(
								spawns.pirateSpawns[Math.floor(Math.random() * spawns.pirateSpawns.length)],
								1,
								boardWithDeadEntity,
								boardWithDeadEntityHero,
								otherBoard,
								otherBoardHero,
								allCards,
								spawns,
								sharedState,
								spectator,
								deadEntity.friendly,
								false,
							),
							...spawnEntities(
								spawns.pirateSpawns[Math.floor(Math.random() * spawns.pirateSpawns.length)],
								1,
								boardWithDeadEntity,
								boardWithDeadEntityHero,
								otherBoard,
								otherBoardHero,
								allCards,
								spawns,
								sharedState,
								spectator,
								deadEntity.friendly,
								false,
							),
							...spawnEntities(
								spawns.pirateSpawns[Math.floor(Math.random() * spawns.pirateSpawns.length)],
								1,
								boardWithDeadEntity,
								boardWithDeadEntityHero,
								otherBoard,
								otherBoardHero,
								allCards,
								spawns,
								sharedState,
								spectator,
								deadEntity.friendly,
								false,
							),
							...spawnEntities(
								spawns.pirateSpawns[Math.floor(Math.random() * spawns.pirateSpawns.length)],
								1,
								boardWithDeadEntity,
								boardWithDeadEntityHero,
								otherBoard,
								otherBoardHero,
								allCards,
								spawns,
								sharedState,
								spectator,
								deadEntity.friendly,
								false,
							),
							...spawnEntities(
								spawns.pirateSpawns[Math.floor(Math.random() * spawns.pirateSpawns.length)],
								1,
								boardWithDeadEntity,
								boardWithDeadEntityHero,
								otherBoard,
								otherBoardHero,
								allCards,
								spawns,
								sharedState,
								spectator,
								deadEntity.friendly,
								false,
							),
						],
					);
					break;
				case CardIds.SlyRaptor_BG25_806:
				case CardIds.SlyRaptor_BG25_806_G:
					const raptorStat = deadEntity.cardId === CardIds.SlyRaptor_BG25_806_G ? 14 : 7;
					const beastPool = spawns.beastSpawns.filter((id) => id !== CardIds.SlyRaptor_BG25_806);
					const beastsFromRaptor = spawnEntities(
						beastPool[Math.floor(Math.random() * beastPool.length)],
						1,
						boardWithDeadEntity,
						boardWithDeadEntityHero,
						otherBoard,
						otherBoardHero,
						allCards,
						spawns,
						sharedState,
						spectator,
						deadEntity.friendly,
						false,
					);
					beastsFromRaptor.forEach((b) => {
						b.attack = raptorStat;
						b.health = raptorStat;
					});
					spawnedEntities.push(...beastsFromRaptor);
					break;
				case CardIds.OctosariWrapGod_BG26_804:
				case CardIds.OctosariWrapGod_BG26_804_G:
					const stats = deadEntity.scriptDataNum1;
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
						allCards,
						spawns,
						sharedState,
						spectator,
						deadEntity.friendly,
						false,
					);
					octoSpawns.forEach((b) => {
						b.attack += stats;
						b.health += stats;
					});
					spawnedEntities.push(...octoSpawns);
					break;
				case CardIds.Bassgill_BG26_350:
				case CardIds.Bassgill_BG26_350_G:
					const bassgillIterations = deadEntity.cardId === CardIds.Bassgill_BG26_350_G ? 2 : 1;
					for (let i = 0; i < bassgillIterations; i++) {
						const hand =
							boardWithDeadEntityHero.hand
								?.filter((e) => hasCorrectTribe(e, Race.MURLOC, allCards))
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
								allCards,
								spawns,
								sharedState,
								spectator,
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
				case CardIds.MechanizedGiftHorse_BG27_008:
				case CardIds.MechanizedGiftHorse_BG27_008_G:
					spawnedEntities.push(
						...spawnEntities(
							deadEntity.cardId === CardIds.MechanizedGiftHorse_BG27_008_G
								? CardIds.MechanizedGiftHorse_MechorseToken_BG27_008_Gt
								: CardIds.MechanizedGiftHorse_MechorseToken_BG27_008t,
							2,
							boardWithDeadEntity,
							boardWithDeadEntityHero,
							otherBoard,
							otherBoardHero,
							allCards,
							spawns,
							sharedState,
							spectator,
							deadEntity.friendly,
							false,
						),
					);
					break;
				case CardIds.MechanizedGiftHorse_MechorseToken_BG27_008t:
				case CardIds.MechanizedGiftHorse_MechorseToken_BG27_008_Gt:
					spawnedEntities.push(
						...spawnEntities(
							deadEntity.cardId === CardIds.MechanizedGiftHorse_MechorseToken_BG27_008_Gt
								? CardIds.MechanizedGiftHorse_MechaponyToken_BG27_008_Gt2
								: CardIds.MechanizedGiftHorse_MechaponyToken_BG27_008t2,
							1,
							boardWithDeadEntity,
							boardWithDeadEntityHero,
							otherBoard,
							otherBoardHero,
							allCards,
							spawns,
							sharedState,
							spectator,
							deadEntity.friendly,
							false,
						),
					);
					break;
				case CardIds.PapaBear_BG27_509:
				case CardIds.PapaBear_BG27_509_G:
					spawnedEntities.push(
						...spawnEntities(
							deadEntity.cardId === CardIds.PapaBear_BG27_509_G
								? CardIds.MamaBear_TB_BaconUps_090
								: CardIds.MamaBear_BGS_021,
							3,
							boardWithDeadEntity,
							boardWithDeadEntityHero,
							otherBoard,
							otherBoardHero,
							allCards,
							spawns,
							sharedState,
							spectator,
							deadEntity.friendly,
							false,
						),
					);
					break;
				case CardIds.RapscallionRecruiter_BG26_018:
				case CardIds.RapscallionRecruiter_BG26_018_G:
					spawnedEntities.push(
						...spawnEntities(
							deadEntity.cardId === CardIds.RapscallionRecruiter_BG26_018_G
								? CardIds.Scallywag_TB_BaconUps_141
								: CardIds.Scallywag_BGS_061,
							3,
							boardWithDeadEntity,
							boardWithDeadEntityHero,
							otherBoard,
							otherBoardHero,
							allCards,
							spawns,
							sharedState,
							spectator,
							deadEntity.friendly,
							false,
						),
					);
					break;
				case CardIds.CultistSthara_BG27_081:
				case CardIds.CultistSthara_BG27_081_G:
					const cultistStharaSpawnNumber = deadEntity.cardId === CardIds.CultistSthara_BG27_081_G ? 2 : 1;
					const cultistStharaSpawnCandidates = sharedState.deaths
						.filter((entity) => entity.friendly === deadEntity.friendly)
						.filter((entity) => isCorrectTribe(allCards.getCard(entity.cardId)?.races, Race.DEMON))
						.slice(0, cultistStharaSpawnNumber);
					cultistStharaSpawnCandidates.forEach((candidate) =>
						spawnedEntities.push(
							...spawnEntities(
								candidate.cardId,
								1,
								boardWithDeadEntity,
								boardWithDeadEntityHero,
								otherBoard,
								otherBoardHero,
								allCards,
								spawns,
								sharedState,
								spectator,
								deadEntity.friendly,
								false,
								false,
								true,
								{ ...candidate } as BoardEntity,
							),
						),
					);
					break;
				case CardIds.HarmlessBonehead_BG28_300:
				case CardIds.HarmlessBonehead_BG28_300_G:
					const harmlessBoneheadStats = deadEntity.cardId === CardIds.HarmlessBonehead_BG28_300_G ? 2 : 1;
					spawnedEntities.push(
						...spawnEntities(
							CardIds.SkeletonToken,
							2,
							boardWithDeadEntity,
							boardWithDeadEntityHero,
							otherBoard,
							otherBoardHero,
							allCards,
							spawns,
							sharedState,
							spectator,
							deadEntity.friendly,
							false,
							false,
							true,
						).map((e) => ({ ...e, attack: harmlessBoneheadStats, health: harmlessBoneheadStats })),
					);
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
							allCards,
							spawns,
							sharedState,
							spectator,
							deadEntity.friendly,
							false,
						),
					);
					break;
				// case CardIds.SplittingFesteroot_BG26_GIL_616:
				// 	spawnedEntities.push(
				// 		...spawnEntities(
				// 			CardIds.SplittingFesteroot_SplittingSaplingToken,
				// 			2,
				// 			boardWithDeadEntity,
				// 			boardWithDeadEntityHero,
				// 			otherBoard,
				// 			otherBoardHero,
				// 			allCards,
				// 			spawns,
				// 			sharedState,
				// 			spectator,
				// 			deadEntity.friendly,
				// 			false,
				// 		),
				// 	);
				// 	break;
				default:
					break;
			}
		}
	}
	// For minion token attack order
	spawnedEntities.forEach((e) => {
		e.attacksPerformed = (deadEntity.attacksPerformed ?? 1) - 1;
	});
	return spawnedEntities;
};

export const spawnEntitiesFromEnchantments = (
	deadEntity: BoardEntity,
	boardWithDeadEntity: BoardEntity[],
	boardWithDeadEntityHero: BgsPlayerEntity,
	otherBoard: BoardEntity[],
	otherBoardHero: BgsPlayerEntity,
	allCards: AllCardsService,
	spawns: CardsData,
	sharedState: SharedState,
	spectator: Spectator,
): readonly BoardEntity[] => {
	const multiplier = computeDeathrattleMultiplier(
		boardWithDeadEntity,
		boardWithDeadEntityHero,
		deadEntity,
		sharedState,
	);
	const spawnedEntities: BoardEntity[] = [];
	for (const enchantment of deadEntity.enchantments || []) {
		for (let i = 0; i < multiplier; i++) {
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
							allCards,
							spawns,
							sharedState,
							spectator,
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
							allCards,
							spawns,
							sharedState,
							spectator,
							deadEntity.friendly,
							false,
						),
					);
					break;
				case CardIds.ReplicatingMenace_ReplicatingMenaceEnchantment_TB_BaconUps_032e:
					spawnedEntities.push(
						...spawnEntities(
							CardIds.ReplicatingMenace_ReplicatingMenaceEnchantment_TB_BaconUps_032e,
							3,
							boardWithDeadEntity,
							boardWithDeadEntityHero,
							otherBoard,
							otherBoardHero,
							allCards,
							spawns,
							sharedState,
							spectator,
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
							allCards,
							spawns,
							sharedState,
							spectator,
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
							allCards,
							spawns,
							sharedState,
							spectator,
							deadEntity.friendly,
							false,
						),
					);
					break;
				case CardIds.SneedsReplicator_ReplicateEnchantment:
					spawnedEntities.push(
						...spawnEntities(
							spawns.getRandomMinionForTavernTier(
								Math.max(1, spawns.getTavernLevel(deadEntity.cardId) - 1),
							),
							1,
							boardWithDeadEntity,
							boardWithDeadEntityHero,
							otherBoard,
							otherBoardHero,
							allCards,
							spawns,
							sharedState,
							spectator,
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
							allCards,
							spawns,
							sharedState,
							spectator,
							deadEntity.friendly,
							false,
						),
					);
					break;
			}
		}
	}
	spawnedEntities.forEach((e) => {
		e.attacksPerformed = (deadEntity.attacksPerformed ?? 1) - 1;
	});
	return spawnedEntities;
};
