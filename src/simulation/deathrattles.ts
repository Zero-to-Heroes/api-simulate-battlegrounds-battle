import { BoardEntity } from '../board-entity';
import { AllCardsService } from '../cards/cards';
import { CardsSpawn } from '../cards/cards-spawn.service';
import { buildBoardEntity } from '../utils';
import { SharedState } from './shared-state';

export const spawnEntitiesFromDeathrattle = (
	deadEntity: BoardEntity,
	allCards: AllCardsService,
	spawns: CardsSpawn,
	sharedState: SharedState,
): readonly BoardEntity[] => {
	switch (deadEntity.cardId) {
		// Mecharoo
		case 'BOT_445':
			return [buildBoardEntity('BOT_445t', allCards, sharedState.currentEntityId++)];
		case 'TB_BaconUps_002':
			return [buildBoardEntity('TB_BaconUps_002t', allCards, sharedState.currentEntityId++)];
		// Harvest Golem
		case 'EX1_556':
			return [buildBoardEntity('skele21', allCards, sharedState.currentEntityId++)];
		case 'TB_BaconUps_006':
			return [buildBoardEntity('TB_BaconUps_006t', allCards, sharedState.currentEntityId++)];
		// Kindly Grandmother
		case 'KAR_005':
			return [buildBoardEntity('KAR_005a', allCards, sharedState.currentEntityId++)];
		case 'TB_BaconUps_004':
			return [buildBoardEntity('TB_BaconUps_004t', allCards, sharedState.currentEntityId++)];
		// Rat Pack
		case 'CFM_316':
			let ratPackSpawns = [];
			for (let i = 0; i < deadEntity.attack; i++) {
				ratPackSpawns.push(buildBoardEntity('CFM_316t', allCards, sharedState.currentEntityId++));
			}
			return ratPackSpawns;
		case 'TB_BaconUps_027':
			let goldenRatPackSpawns = [];
			for (let i = 0; i < deadEntity.attack; i++) {
				goldenRatPackSpawns.push(buildBoardEntity('TB_BaconUps_027t', allCards, sharedState.currentEntityId++));
			}
			return goldenRatPackSpawns;
		// Imprisoner
		case 'BGS_014':
			return [buildBoardEntity('BRM_006t', allCards, sharedState.currentEntityId++)];
		case 'TB_BaconUps_113':
			return [buildBoardEntity('TB_BaconUps_030t', allCards, sharedState.currentEntityId++)];
		// Infested Wolf
		case 'OG_216':
			return [
				buildBoardEntity('OG_216a', allCards, sharedState.currentEntityId++),
				buildBoardEntity('OG_216a', allCards, sharedState.currentEntityId++),
			];
		case 'TB_BaconUps_026':
			return [
				buildBoardEntity('TB_BaconUps_026t', allCards, sharedState.currentEntityId++),
				buildBoardEntity('TB_BaconUps_026t', allCards, sharedState.currentEntityId++),
			];
		// Piloted Shredder
		case 'BGS_014':
			return [
				buildBoardEntity(
					spawns.shredderSpawns[Math.floor(Math.random() * spawns.shredderSpawns.length)],
					allCards,
					sharedState.currentEntityId++,
				),
			];
		case 'TB_BaconUps_035':
			return [
				buildBoardEntity(
					spawns.shredderSpawns[Math.floor(Math.random() * spawns.shredderSpawns.length)],
					allCards,
					sharedState.currentEntityId++,
				),
				buildBoardEntity(
					spawns.shredderSpawns[Math.floor(Math.random() * spawns.shredderSpawns.length)],
					allCards,
					sharedState.currentEntityId++,
				),
			];
		// Replicating Menace
		case 'BOT_312':
			return [
				buildBoardEntity('BOT_312t', allCards, sharedState.currentEntityId++),
				buildBoardEntity('BOT_312t', allCards, sharedState.currentEntityId++),
				buildBoardEntity('BOT_312t', allCards, sharedState.currentEntityId++),
			];
		case 'TB_BaconUps_032':
			return [
				buildBoardEntity('TB_BaconUps_032t', allCards, sharedState.currentEntityId++),
				buildBoardEntity('TB_BaconUps_032t', allCards, sharedState.currentEntityId++),
				buildBoardEntity('TB_BaconUps_032t', allCards, sharedState.currentEntityId++),
			];
		// Mechano-Egg
		case 'BOT_537':
			return [buildBoardEntity('BOT_537t', allCards, sharedState.currentEntityId++)];
		case 'TB_BaconUps_039':
			return [buildBoardEntity('TB_BaconUps_039t', allCards, sharedState.currentEntityId++)];
		// Savannah Highmane
		case 'EX1_534':
			return [
				buildBoardEntity('EX1_534t', allCards, sharedState.currentEntityId++),
				buildBoardEntity('EX1_534t', allCards, sharedState.currentEntityId++),
			];
		case 'TB_BaconUps_049':
			return [
				buildBoardEntity('TB_BaconUps_049t', allCards, sharedState.currentEntityId++),
				buildBoardEntity('TB_BaconUps_049t', allCards, sharedState.currentEntityId++),
			];
		// Ghastcoiler
		case 'BGS_008':
			return [
				buildBoardEntity(
					spawns.ghastcoilerSpawns[Math.floor(Math.random() * spawns.ghastcoilerSpawns.length)],
					allCards,
					sharedState.currentEntityId++,
				),
				buildBoardEntity(
					spawns.ghastcoilerSpawns[Math.floor(Math.random() * spawns.ghastcoilerSpawns.length)],
					allCards,
					sharedState.currentEntityId++,
				),
			];
		case 'TB_BaconUps_057':
			return [
				buildBoardEntity(
					spawns.ghastcoilerSpawns[Math.floor(Math.random() * spawns.ghastcoilerSpawns.length)],
					allCards,
					sharedState.currentEntityId++,
				),
				buildBoardEntity(
					spawns.ghastcoilerSpawns[Math.floor(Math.random() * spawns.ghastcoilerSpawns.length)],
					allCards,
					sharedState.currentEntityId++,
				),
				buildBoardEntity(
					spawns.ghastcoilerSpawns[Math.floor(Math.random() * spawns.ghastcoilerSpawns.length)],
					allCards,
					sharedState.currentEntityId++,
				),
				buildBoardEntity(
					spawns.ghastcoilerSpawns[Math.floor(Math.random() * spawns.ghastcoilerSpawns.length)],
					allCards,
					sharedState.currentEntityId++,
				),
			];
		// Sneed's Old Shredder
		case 'GVG_114':
			return [
				buildBoardEntity(
					spawns.sneedsSpawns[Math.floor(Math.random() * spawns.sneedsSpawns.length)],
					allCards,
					sharedState.currentEntityId++,
				),
			];
		case 'TB_BaconUps_080':
			return [
				buildBoardEntity(
					spawns.sneedsSpawns[Math.floor(Math.random() * spawns.sneedsSpawns.length)],
					allCards,
					sharedState.currentEntityId++,
				),
				buildBoardEntity(
					spawns.sneedsSpawns[Math.floor(Math.random() * spawns.sneedsSpawns.length)],
					allCards,
					sharedState.currentEntityId++,
				),
			];
		// Voidlord
		case 'LOOT_368':
			return [
				buildBoardEntity('CS2_065', allCards, sharedState.currentEntityId++),
				buildBoardEntity('CS2_065', allCards, sharedState.currentEntityId++),
			];
		case 'TB_BaconUps_059':
			return [
				buildBoardEntity('TB_BaconUps_059t', allCards, sharedState.currentEntityId++),
				buildBoardEntity('TB_BaconUps_059t', allCards, sharedState.currentEntityId++),
			];
		default:
			return [];
	}
};

export const spawnEntitiesFromEnchantments = (
	deadEntity: BoardEntity,
	allCards: AllCardsService,
	spawns: CardsSpawn,
	sharedState: SharedState,
): readonly BoardEntity[] => {
	switch (deadEntity.cardId) {
		// Replicating Menace
		case 'BOT_312e':
			return [
				buildBoardEntity('BOT_312t', allCards, sharedState.currentEntityId++),
				buildBoardEntity('BOT_312t', allCards, sharedState.currentEntityId++),
				buildBoardEntity('BOT_312t', allCards, sharedState.currentEntityId++),
			];
		case 'TB_BaconUps_032e':
			return [
				buildBoardEntity('TB_BaconUps_032e', allCards, sharedState.currentEntityId++),
				buildBoardEntity('TB_BaconUps_032e', allCards, sharedState.currentEntityId++),
				buildBoardEntity('TB_BaconUps_032e', allCards, sharedState.currentEntityId++),
			];
		default:
			return [];
	}
};
