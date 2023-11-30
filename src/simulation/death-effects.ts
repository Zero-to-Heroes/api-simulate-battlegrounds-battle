import { AllCardsService, CardIds, Race } from '@firestone-hs/reference-data';
import { BgsPlayerEntity } from '../bgs-player-entity';
import { BoardEntity } from '../board-entity';
import { CardsData } from '../cards/cards-data';
import { hasCorrectTribe } from '../utils';
import { performEntitySpawns } from './attack';
import { spawnEntities } from './deathrattle-spawns';
import { SharedState } from './shared-state';
import { Spectator } from './spectator/spectator';

export const applyAfterDeathEffects = (
	deadEntity: BoardEntity,
	deadEntityIndexFromRight: number,
	boardWithDeadEntity: BoardEntity[],
	boardWithDeadEntityHero: BgsPlayerEntity,
	otherBoard: BoardEntity[],
	otherBoardHero: BgsPlayerEntity,
	allCards: AllCardsService,
	cardsData: CardsData,
	sharedState: SharedState,
	spectator: Spectator,
) => {
	const maxSpawns = 7 - boardWithDeadEntity.length;
	const allSpawns = [];
	if (hasCorrectTribe(deadEntity, Race.BEAST, allCards)) {
		const feathermanes =
			boardWithDeadEntityHero.hand
				?.filter((e) => !e.summonedFromHand)
				.filter(
					(e) =>
						e.cardId === CardIds.FreeFlyingFeathermane_BG27_014 ||
						e.cardId === CardIds.FreeFlyingFeathermane_BG27_014_G,
				) ?? [];
		// removeCardFromHand(boardWithDeadEntityHero, spawn);
		for (const feathermaneSpawn of feathermanes) {
			if (allSpawns.length >= maxSpawns) {
				break;
			}
			feathermaneSpawn.summonedFromHand = true;
			const spawns = spawnEntities(
				feathermaneSpawn.cardId,
				1,
				boardWithDeadEntity,
				boardWithDeadEntityHero,
				otherBoard,
				otherBoardHero,
				allCards,
				cardsData,
				sharedState,
				spectator,
				deadEntity.friendly,
				false,
				false,
				true,
				{ ...feathermaneSpawn } as BoardEntity,
			);

			// So that it can be flagged as "unspawned" if it is not spawned in the end
			for (const spawn of spawns) {
				spawn.onCanceledSummon = () => (feathermaneSpawn.summonedFromHand = false);
				// spawn.backRef = feathermaneSpawn;
			}
			// console.log(
			// 	'\tspawning feathermane',
			// 	stringifySimpleCard(feathermaneSpawn, allCards),
			// 	stringifySimple(spawns, allCards),
			// );
			allSpawns.push(...spawns);
		}
	}

	performEntitySpawns(
		allSpawns,
		boardWithDeadEntity,
		boardWithDeadEntityHero,
		deadEntity,
		deadEntityIndexFromRight,
		otherBoard,
		otherBoardHero,
		allCards,
		cardsData,
		sharedState,
		spectator,
	);
};

export const applyOnDeathEffects = (
	deadEntity: BoardEntity,
	deadEntityIndexFromRight: number,
	boardWithDeadEntity: BoardEntity[],
	boardWithDeadEntityHero: BgsPlayerEntity,
	otherBoard: BoardEntity[],
	otherBoardHero: BgsPlayerEntity,
	allCards: AllCardsService,
	cardsData: CardsData,
	sharedState: SharedState,
	spectator: Spectator,
) => {
	// Nothing yet
	return [];
};
