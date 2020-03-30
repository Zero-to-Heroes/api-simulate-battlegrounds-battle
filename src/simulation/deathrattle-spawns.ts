import { AllCardsService, CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../board-entity';
import { CardsData } from '../cards/cards-data';
import { buildSingleBoardEntity } from '../utils';
import { SharedState } from './shared-state';

export const spawnEntities = (
	cardId: string,
	quantity: number,
	boardToSpawnInto: BoardEntity[],
	allCards: AllCardsService,
	sharedState: SharedState,
	// In most cases the business of knowing the number of minions to handle is left to the caller
	limitSpawns = false,
): readonly BoardEntity[] => {
	const spawnMultiplier =
		2 * boardToSpawnInto.filter(entity => entity.cardId === CardIds.Collectible.Mage.Khadgar).length || 1;
	const spawnMultiplierGolden =
		3 *
			boardToSpawnInto.filter(entity => entity.cardId === CardIds.NonCollectible.Mage.KhadgarTavernBrawl)
				.length || 1;
	const minionsToSpawn = limitSpawns
		? Math.min(quantity * spawnMultiplier * spawnMultiplierGolden, 7 - boardToSpawnInto.length)
		: quantity * spawnMultiplier * spawnMultiplierGolden;
	// console.log('will spawn entities', cardId, minionsToSpawn, boardToSpawnInto);
	const result: BoardEntity[] = [];
	for (let i = 0; i < minionsToSpawn; i++) {
		const newMinion = buildSingleBoardEntity(cardId, allCards, sharedState.currentEntityId++);
		const attackBuff =
			allCards.getCard(newMinion.cardId).race === 'BEAST'
				? 3 *
						boardToSpawnInto.filter(entity => entity.cardId === CardIds.NonCollectible.Neutral.PackLeader)
							.length +
				  6 *
						boardToSpawnInto.filter(
							entity => entity.cardId === CardIds.NonCollectible.Neutral.PackLeaderTavernBrawl,
						).length +
				  5 *
						boardToSpawnInto.filter(entity => entity.cardId === CardIds.NonCollectible.Neutral.MamaBear)
							.length +
				  10 *
						boardToSpawnInto.filter(
							entity => entity.cardId === CardIds.NonCollectible.Neutral.MamaBearTavernBrawl,
						).length
				: 0;
		const healthBuff =
			allCards.getCard(newMinion.cardId).race === 'BEAST'
				? 5 *
						boardToSpawnInto.filter(entity => entity.cardId === CardIds.NonCollectible.Neutral.MamaBear)
							.length +
				  10 *
						boardToSpawnInto.filter(
							entity => entity.cardId === CardIds.NonCollectible.Neutral.MamaBearTavernBrawl,
						).length
				: 0;
		// console.log('buffs', attackBuff, healthBuff, newMinion, boardToSpawnInto);
		newMinion.attack += attackBuff;
		newMinion.health += healthBuff;
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
	allCards: AllCardsService,
	spawns: CardsData,
	sharedState: SharedState,
): readonly BoardEntity[] => {
	const rivendare = boardWithDeadEntity.find(entity => entity.cardId === CardIds.Collectible.Neutral.BaronRivendare);
	const goldenRivendare = boardWithDeadEntity.find(
		entity => entity.cardId === CardIds.NonCollectible.Neutral.BaronRivendareTavernBrawl,
	);
	const multiplier = goldenRivendare ? 3 : rivendare ? 2 : 1;
	const spawnedEntities: BoardEntity[] = [];
	for (let i = 0; i < multiplier; i++) {
		switch (deadEntity.cardId) {
			case CardIds.Collectible.Neutral.Mecharoo:
				spawnedEntities.push(
					...spawnEntities(
						CardIds.NonCollectible.Neutral.Mecharoo_JoEBotToken,
						1,
						boardWithDeadEntity,
						allCards,
						sharedState,
					),
				);
				break;
			case CardIds.NonCollectible.Neutral.MecharooTavernBrawl:
				spawnedEntities.push(
					...spawnEntities(
						CardIds.NonCollectible.Neutral.Mecharoo_JoEBotTokenTavernBrawl,
						1,
						boardWithDeadEntity,
						allCards,
						sharedState,
					),
				);
				break;
			case CardIds.Collectible.Neutral.HarvestGolem:
				spawnedEntities.push(
					...spawnEntities(
						CardIds.NonCollectible.Neutral.DamagedGolemClassic,
						1,
						boardWithDeadEntity,
						allCards,
						sharedState,
					),
				);
				break;
			case CardIds.NonCollectible.Neutral.HarvestGolemTavernBrawl:
				spawnedEntities.push(
					...spawnEntities(
						CardIds.NonCollectible.Neutral.HarvestGolem_DamagedGolemTokenTavernBrawl,
						1,
						boardWithDeadEntity,
						allCards,
						sharedState,
					),
				);
				break;
			case CardIds.Collectible.Hunter.KindlyGrandmother:
				spawnedEntities.push(
					...spawnEntities(
						CardIds.NonCollectible.Hunter.KindlyGrandmother_BigBadWolf,
						1,
						boardWithDeadEntity,
						allCards,
						sharedState,
					),
				);
				break;
			case CardIds.NonCollectible.Hunter.KindlyGrandmotherTavernBrawl:
				spawnedEntities.push(
					...spawnEntities(
						CardIds.NonCollectible.Hunter.KindlyGrandmother_BigBadWolfTokenTavernBrawl,
						1,
						boardWithDeadEntity,
						allCards,
						sharedState,
					),
				);
				break;
			case CardIds.Collectible.Hunter.RatPack:
				spawnedEntities.push(
					...spawnEntities(
						CardIds.NonCollectible.Hunter.RatPack_RatToken,
						deadEntity.attack,
						boardWithDeadEntity,
						allCards,
						sharedState,
					),
				);
				break;
			case CardIds.NonCollectible.Hunter.RatPackTavernBrawl:
				spawnedEntities.push(
					...spawnEntities(
						CardIds.NonCollectible.Hunter.RatPack_RatTokenTavernBrawl,
						deadEntity.attack,
						boardWithDeadEntity,
						allCards,
						sharedState,
					),
				);
				break;
			case CardIds.NonCollectible.Neutral.Imprisoner:
				spawnedEntities.push(
					...spawnEntities(
						CardIds.NonCollectible.Warlock.ImpGangBoss_ImpToken,
						1,
						boardWithDeadEntity,
						allCards,
						sharedState,
					),
				);
				break;
			case CardIds.NonCollectible.Neutral.ImprisonerTavernBrawl:
				spawnedEntities.push(
					...spawnEntities(
						CardIds.NonCollectible.Warlock.ImpGangBoss_ImpTokenTavernBrawl,
						1,
						boardWithDeadEntity,
						allCards,
						sharedState,
					),
				);
				break;
			case CardIds.Collectible.Hunter.InfestedWolf:
				spawnedEntities.push(
					...spawnEntities(
						CardIds.NonCollectible.Hunter.InfestedWolf_Spider,
						2,
						boardWithDeadEntity,
						allCards,
						sharedState,
					),
				);
				break;
			case CardIds.NonCollectible.Hunter.InfestedWolfTavernBrawl:
				spawnedEntities.push(
					...spawnEntities(
						CardIds.NonCollectible.Hunter.InfestedWolf_SpiderTokenTavernBrawl,
						2,
						boardWithDeadEntity,
						allCards,
						sharedState,
					),
				);
				break;
			case CardIds.Collectible.Neutral.PilotedShredder:
				spawnedEntities.push(
					...spawnEntities(
						spawns.shredderSpawns[Math.floor(Math.random() * spawns.shredderSpawns.length)],
						1,
						boardWithDeadEntity,
						allCards,
						sharedState,
					),
				);
				break;
			case CardIds.NonCollectible.Neutral.PilotedShredderTavernBrawl:
				spawnedEntities.push(
					...[
						...spawnEntities(
							spawns.shredderSpawns[Math.floor(Math.random() * spawns.shredderSpawns.length)],
							1,
							boardWithDeadEntity,
							allCards,
							sharedState,
						),
						...spawnEntities(
							spawns.shredderSpawns[Math.floor(Math.random() * spawns.shredderSpawns.length)],
							1,
							boardWithDeadEntity,
							allCards,
							sharedState,
						),
					],
				);
				break;
			case CardIds.Collectible.Neutral.ReplicatingMenace:
				spawnedEntities.push(
					...spawnEntities(
						CardIds.NonCollectible.Neutral.ReplicatingMenace_MicrobotToken,
						3,
						boardWithDeadEntity,
						allCards,
						sharedState,
					),
				);
				break;
			case CardIds.NonCollectible.Neutral.ReplicatingMenaceTavernBrawl:
				spawnedEntities.push(
					...spawnEntities(
						CardIds.NonCollectible.Neutral.ReplicatingMenace_MicrobotTokenTavernBrawl,
						3,
						boardWithDeadEntity,
						allCards,
						sharedState,
					),
				);
				break;
			case CardIds.Collectible.Paladin.MechanoEgg:
				spawnedEntities.push(
					...spawnEntities(
						CardIds.NonCollectible.Paladin.MechanoEgg_RobosaurToken,
						1,
						boardWithDeadEntity,
						allCards,
						sharedState,
					),
				);
				break;
			case CardIds.NonCollectible.Paladin.MechanoEggTavernBrawl:
				spawnedEntities.push(
					...spawnEntities(
						CardIds.NonCollectible.Paladin.MechanoEgg_RobosaurTokenTavernBrawl,
						1,
						boardWithDeadEntity,
						allCards,
						sharedState,
					),
				);
				break;
			case CardIds.Collectible.Hunter.SavannahHighmane:
				spawnedEntities.push(
					...spawnEntities(
						CardIds.NonCollectible.Hunter.SavannahHighmane_HyenaToken,
						2,
						boardWithDeadEntity,
						allCards,
						sharedState,
					),
				);
				break;
			case CardIds.NonCollectible.Hunter.SavannahHighmaneTavernBrawl:
				spawnedEntities.push(
					...spawnEntities(
						CardIds.NonCollectible.Hunter.SavannahHighmane_HyenaTokenTavernBrawl,
						2,
						boardWithDeadEntity,
						allCards,
						sharedState,
					),
				);
				break;
			case CardIds.Collectible.Neutral.SatedThreshadon:
				spawnedEntities.push(
					...spawnEntities(
						CardIds.NonCollectible.Neutral.PrimalfinTotem_PrimalfinToken,
						3,
						boardWithDeadEntity,
						allCards,
						sharedState,
					),
				);
				break;
			case CardIds.NonCollectible.Neutral.SatedThreshadonTavernBrawl:
				spawnedEntities.push(
					...spawnEntities(
						CardIds.NonCollectible.Neutral.SatedThreshadon_PrimalfinTokenTavernBrawl,
						3,
						boardWithDeadEntity,
						allCards,
						sharedState,
					),
				);
				break;
			case CardIds.NonCollectible.Priest.GhastcoilerBATTLEGROUNDS:
				spawnedEntities.push(
					...[
						...spawnEntities(
							spawns.ghastcoilerSpawns[Math.floor(Math.random() * spawns.ghastcoilerSpawns.length)],
							1,
							boardWithDeadEntity,
							allCards,
							sharedState,
						),
						...spawnEntities(
							spawns.ghastcoilerSpawns[Math.floor(Math.random() * spawns.ghastcoilerSpawns.length)],
							1,
							boardWithDeadEntity,
							allCards,
							sharedState,
						),
					],
				);
				break;
			case CardIds.NonCollectible.Priest.GhastcoilerTavernBrawl:
				spawnedEntities.push(
					...[
						...spawnEntities(
							spawns.ghastcoilerSpawns[Math.floor(Math.random() * spawns.ghastcoilerSpawns.length)],
							1,
							boardWithDeadEntity,
							allCards,
							sharedState,
						),
						...spawnEntities(
							spawns.ghastcoilerSpawns[Math.floor(Math.random() * spawns.ghastcoilerSpawns.length)],
							1,
							boardWithDeadEntity,
							allCards,
							sharedState,
						),
						...spawnEntities(
							spawns.ghastcoilerSpawns[Math.floor(Math.random() * spawns.ghastcoilerSpawns.length)],
							1,
							boardWithDeadEntity,
							allCards,
							sharedState,
						),
						...spawnEntities(
							spawns.ghastcoilerSpawns[Math.floor(Math.random() * spawns.ghastcoilerSpawns.length)],
							1,
							boardWithDeadEntity,
							allCards,
							sharedState,
						),
					],
				);
				break;
			case CardIds.Collectible.Neutral.SneedsOldShredder:
				spawnedEntities.push(
					...spawnEntities(
						spawns.sneedsSpawns[Math.floor(Math.random() * spawns.sneedsSpawns.length)],
						1,
						boardWithDeadEntity,
						allCards,
						sharedState,
					),
				);
				break;
			case CardIds.NonCollectible.Neutral.SneedsOldShredderTavernBrawl:
				spawnedEntities.push(
					...[
						...spawnEntities(
							spawns.sneedsSpawns[Math.floor(Math.random() * spawns.sneedsSpawns.length)],
							1,
							boardWithDeadEntity,
							allCards,
							sharedState,
						),
						...spawnEntities(
							spawns.sneedsSpawns[Math.floor(Math.random() * spawns.sneedsSpawns.length)],
							1,
							boardWithDeadEntity,
							allCards,
							sharedState,
						),
					],
				);
				break;
			case CardIds.Collectible.Warlock.Voidlord:
				spawnedEntities.push(
					...spawnEntities(
						CardIds.Collectible.Warlock.Voidwalker,
						3,
						boardWithDeadEntity,
						allCards,
						sharedState,
					),
				);
				break;
			case CardIds.NonCollectible.Warlock.VoidlordTavernBrawl:
				spawnedEntities.push(
					...spawnEntities(
						CardIds.NonCollectible.Warlock.Voidlord_VoidwalkerTokenTavernBrawl,
						3,
						boardWithDeadEntity,
						allCards,
						sharedState,
					),
				);
				break;
			default:
			// spawnedEntities.push(...[]);
		}
	}
	return spawnedEntities;
};

export const spawnEntitiesFromEnchantments = (
	deadEntity: BoardEntity,
	boardWithDeadEntity: BoardEntity[],
	allCards: AllCardsService,
	spawns: CardsData,
	sharedState: SharedState,
): readonly BoardEntity[] => {
	const rivendare = boardWithDeadEntity.find(entity => entity.cardId === CardIds.Collectible.Neutral.BaronRivendare);
	const goldenRivendare = boardWithDeadEntity.find(
		entity => entity.cardId === CardIds.NonCollectible.Neutral.BaronRivendareTavernBrawl,
	);
	const multiplier = goldenRivendare ? 3 : rivendare ? 2 : 1;
	const spawnedEntities: BoardEntity[] = [];
	for (let i = 0; i < multiplier; i++) {
		switch (deadEntity.cardId) {
			// Replicating Menace
			case CardIds.NonCollectible.Neutral.ReplicatingMenace_ReplicatingMenaceEnchantment:
				spawnedEntities.push(
					...spawnEntities(
						CardIds.NonCollectible.Neutral.ReplicatingMenace_MicrobotToken,
						3,
						boardWithDeadEntity,
						allCards,
						sharedState,
					),
				);
				break;
			case CardIds.NonCollectible.Neutral.ReplicatingMenace_ReplicatingMenaceEnchantmentTavernBrawl:
				spawnedEntities.push(
					...spawnEntities(
						CardIds.NonCollectible.Neutral.ReplicatingMenace_MicrobotTokenTavernBrawl,
						3,
						boardWithDeadEntity,
						allCards,
						sharedState,
					),
				);
				break;
		}
	}
	return spawnedEntities;
};
