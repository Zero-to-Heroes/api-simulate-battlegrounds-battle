import { CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../board-entity';
import { AllCardsService } from '../cards/cards';
import { CardsData } from '../cards/cards-data';
import { buildSingleBoardEntity } from '../utils';
import { SharedState } from './shared-state';

export const spawnEntities = (
	cardId: string,
	quantity: number,
	boardToSpawnInto: readonly BoardEntity[],
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
		result.push({
			...newMinion,
			attack: newMinion.attack + attackBuff,
			health: newMinion.health + healthBuff,
		});
	}
	return result;
};

export const spawnEntitiesFromDeathrattle = (
	deadEntity: BoardEntity,
	boardToSpawnInto: readonly BoardEntity[],
	allCards: AllCardsService,
	spawns: CardsData,
	sharedState: SharedState,
): readonly BoardEntity[] => {
	switch (deadEntity.cardId) {
		case CardIds.Collectible.Neutral.Mecharoo:
			return spawnEntities(
				CardIds.NonCollectible.Neutral.Mecharoo_JoEBotToken,
				1,
				boardToSpawnInto,
				allCards,
				sharedState,
			);
		case CardIds.NonCollectible.Neutral.MecharooTavernBrawl:
			return spawnEntities(
				CardIds.NonCollectible.Neutral.Mecharoo_JoEBotTokenTavernBrawl,
				1,
				boardToSpawnInto,
				allCards,
				sharedState,
			);
		case CardIds.Collectible.Neutral.HarvestGolem:
			return spawnEntities(
				CardIds.NonCollectible.Neutral.DamagedGolemClassic,
				1,
				boardToSpawnInto,
				allCards,
				sharedState,
			);
		case CardIds.NonCollectible.Neutral.HarvestGolemTavernBrawl:
			return spawnEntities(
				CardIds.NonCollectible.Neutral.HarvestGolem_DamagedGolemTokenTavernBrawl,
				1,
				boardToSpawnInto,
				allCards,
				sharedState,
			);
		case CardIds.Collectible.Hunter.KindlyGrandmother:
			return spawnEntities(
				CardIds.NonCollectible.Hunter.KindlyGrandmother_BigBadWolf,
				1,
				boardToSpawnInto,
				allCards,
				sharedState,
			);
		case CardIds.NonCollectible.Hunter.KindlyGrandmotherTavernBrawl:
			return spawnEntities(
				CardIds.NonCollectible.Hunter.KindlyGrandmother_BigBadWolfTokenTavernBrawl,
				1,
				boardToSpawnInto,
				allCards,
				sharedState,
			);
		case CardIds.Collectible.Hunter.RatPack:
			return spawnEntities(
				CardIds.NonCollectible.Hunter.RatPack_RatToken,
				deadEntity.attack,
				boardToSpawnInto,
				allCards,
				sharedState,
			);
		case CardIds.NonCollectible.Hunter.RatPackTavernBrawl:
			return spawnEntities(
				CardIds.NonCollectible.Hunter.RatPack_RatTokenTavernBrawl,
				deadEntity.attack,
				boardToSpawnInto,
				allCards,
				sharedState,
			);
		case CardIds.NonCollectible.Neutral.Imprisoner:
			return spawnEntities(
				CardIds.NonCollectible.Warlock.ImpGangBoss_ImpToken,
				1,
				boardToSpawnInto,
				allCards,
				sharedState,
			);
		case CardIds.NonCollectible.Neutral.ImprisonerTavernBrawl:
			return spawnEntities(
				CardIds.NonCollectible.Warlock.ImpGangBoss_ImpTokenTavernBrawl,
				1,
				boardToSpawnInto,
				allCards,
				sharedState,
			);
		case CardIds.Collectible.Hunter.InfestedWolf:
			return spawnEntities(
				CardIds.NonCollectible.Hunter.InfestedWolf_Spider,
				2,
				boardToSpawnInto,
				allCards,
				sharedState,
			);
		case CardIds.NonCollectible.Hunter.InfestedWolfTavernBrawl:
			return spawnEntities(
				CardIds.NonCollectible.Hunter.InfestedWolf_SpiderTokenTavernBrawl,
				2,
				boardToSpawnInto,
				allCards,
				sharedState,
			);
		case CardIds.Collectible.Neutral.PilotedShredder:
			return spawnEntities(
				spawns.shredderSpawns[Math.floor(Math.random() * spawns.shredderSpawns.length)],
				1,
				boardToSpawnInto,
				allCards,
				sharedState,
			);
		case CardIds.NonCollectible.Neutral.PilotedShredderTavernBrawl:
			return [
				...spawnEntities(
					spawns.shredderSpawns[Math.floor(Math.random() * spawns.shredderSpawns.length)],
					1,
					boardToSpawnInto,
					allCards,
					sharedState,
				),
				...spawnEntities(
					spawns.shredderSpawns[Math.floor(Math.random() * spawns.shredderSpawns.length)],
					1,
					boardToSpawnInto,
					allCards,
					sharedState,
				),
			];
		case CardIds.Collectible.Neutral.ReplicatingMenace:
			return spawnEntities(
				CardIds.NonCollectible.Neutral.ReplicatingMenace_MicrobotToken,
				3,
				boardToSpawnInto,
				allCards,
				sharedState,
			);
		case CardIds.NonCollectible.Neutral.ReplicatingMenaceTavernBrawl:
			return spawnEntities(
				CardIds.NonCollectible.Neutral.ReplicatingMenace_MicrobotTokenTavernBrawl,
				3,
				boardToSpawnInto,
				allCards,
				sharedState,
			);
		case CardIds.Collectible.Paladin.MechanoEgg:
			return spawnEntities(
				CardIds.NonCollectible.Paladin.MechanoEgg_RobosaurToken,
				1,
				boardToSpawnInto,
				allCards,
				sharedState,
			);
		case CardIds.NonCollectible.Paladin.MechanoEggTavernBrawl:
			return spawnEntities(
				CardIds.NonCollectible.Paladin.MechanoEgg_RobosaurTokenTavernBrawl,
				1,
				boardToSpawnInto,
				allCards,
				sharedState,
			);
		case CardIds.Collectible.Hunter.SavannahHighmane:
			return spawnEntities(
				CardIds.NonCollectible.Hunter.SavannahHighmane_HyenaToken,
				2,
				boardToSpawnInto,
				allCards,
				sharedState,
			);
		case CardIds.NonCollectible.Hunter.SavannahHighmaneTavernBrawl:
			return spawnEntities(
				CardIds.NonCollectible.Hunter.SavannahHighmane_HyenaTokenTavernBrawl,
				2,
				boardToSpawnInto,
				allCards,
				sharedState,
			);
		case CardIds.Collectible.Neutral.SatedThreshadon:
			return spawnEntities(
				CardIds.NonCollectible.Neutral.PrimalfinTotem_PrimalfinToken,
				3,
				boardToSpawnInto,
				allCards,
				sharedState,
			);
		case CardIds.NonCollectible.Neutral.SatedThreshadonTavernBrawl:
			return spawnEntities(
				CardIds.NonCollectible.Neutral.SatedThreshadon_PrimalfinTokenTavernBrawl,
				3,
				boardToSpawnInto,
				allCards,
				sharedState,
			);
		case CardIds.NonCollectible.Priest.GhastcoilerBATTLEGROUNDS:
			return [
				...spawnEntities(
					spawns.ghastcoilerSpawns[Math.floor(Math.random() * spawns.ghastcoilerSpawns.length)],
					1,
					boardToSpawnInto,
					allCards,
					sharedState,
				),
				...spawnEntities(
					spawns.ghastcoilerSpawns[Math.floor(Math.random() * spawns.ghastcoilerSpawns.length)],
					1,
					boardToSpawnInto,
					allCards,
					sharedState,
				),
			];
		case CardIds.NonCollectible.Priest.GhastcoilerTavernBrawl:
			return [
				...spawnEntities(
					spawns.ghastcoilerSpawns[Math.floor(Math.random() * spawns.ghastcoilerSpawns.length)],
					1,
					boardToSpawnInto,
					allCards,
					sharedState,
				),
				...spawnEntities(
					spawns.ghastcoilerSpawns[Math.floor(Math.random() * spawns.ghastcoilerSpawns.length)],
					1,
					boardToSpawnInto,
					allCards,
					sharedState,
				),
				...spawnEntities(
					spawns.ghastcoilerSpawns[Math.floor(Math.random() * spawns.ghastcoilerSpawns.length)],
					1,
					boardToSpawnInto,
					allCards,
					sharedState,
				),
				...spawnEntities(
					spawns.ghastcoilerSpawns[Math.floor(Math.random() * spawns.ghastcoilerSpawns.length)],
					1,
					boardToSpawnInto,
					allCards,
					sharedState,
				),
			];
		case CardIds.Collectible.Neutral.SneedsOldShredder:
			return spawnEntities(
				spawns.sneedsSpawns[Math.floor(Math.random() * spawns.sneedsSpawns.length)],
				1,
				boardToSpawnInto,
				allCards,
				sharedState,
			);
		case CardIds.NonCollectible.Neutral.SneedsOldShredderTavernBrawl:
			return [
				...spawnEntities(
					spawns.sneedsSpawns[Math.floor(Math.random() * spawns.sneedsSpawns.length)],
					1,
					boardToSpawnInto,
					allCards,
					sharedState,
				),
				...spawnEntities(
					spawns.sneedsSpawns[Math.floor(Math.random() * spawns.sneedsSpawns.length)],
					1,
					boardToSpawnInto,
					allCards,
					sharedState,
				),
			];
		case CardIds.Collectible.Warlock.Voidlord:
			return spawnEntities(CardIds.Collectible.Warlock.Voidwalker, 3, boardToSpawnInto, allCards, sharedState);
		case CardIds.NonCollectible.Warlock.VoidlordTavernBrawl:
			return spawnEntities(
				CardIds.NonCollectible.Warlock.Voidlord_VoidwalkerTokenTavernBrawl,
				3,
				boardToSpawnInto,
				allCards,
				sharedState,
			);
		default:
			return [];
	}
};

export const spawnEntitiesFromEnchantments = (
	deadEntity: BoardEntity,
	boardToSpawnInto: readonly BoardEntity[],
	allCards: AllCardsService,
	spawns: CardsData,
	sharedState: SharedState,
): readonly BoardEntity[] => {
	switch (deadEntity.cardId) {
		// Replicating Menace
		case CardIds.NonCollectible.Neutral.ReplicatingMenace_ReplicatingMenaceEnchantment:
			return spawnEntities(
				CardIds.NonCollectible.Neutral.ReplicatingMenace_MicrobotToken,
				3,
				boardToSpawnInto,
				allCards,
				sharedState,
			);
		case CardIds.NonCollectible.Neutral.ReplicatingMenace_ReplicatingMenaceEnchantmentTavernBrawl:
			return spawnEntities(
				CardIds.NonCollectible.Neutral.ReplicatingMenace_MicrobotTokenTavernBrawl,
				3,
				boardToSpawnInto,
				allCards,
				sharedState,
			);
		default:
			return [];
	}
};
