import { AllCardsService, CardIds, Race } from '@firestone-hs/reference-data';
import { BgsPlayerEntity } from '../bgs-player-entity';
import { BoardEntity } from '../board-entity';
import { hasCorrectTribe } from '../utils';
import { updateBoardwideAuras } from './auras';
import { FullGameState } from './internal-game-state';
import { Spectator } from './spectator/spectator';

export const removeMinionFromBoard = (
	board: BoardEntity[],
	boardHero: BgsPlayerEntity,
	index: number,
	gameState: FullGameState,
): void => {
	const removedEntity = board.splice(index, 1)[0];
	handleMinionRemovedAuraEffect(board, removedEntity, boardHero, gameState.allCards, gameState.spectator);
	updateBoardwideAuras(board, boardHero, gameState);
};

export const handleMinionRemovedAuraEffect = (
	board: BoardEntity[],
	removed: BoardEntity,
	boardHero: BgsPlayerEntity,
	allCards: AllCardsService,
	spectator: Spectator,
): void => {
	switch (removed.cardId) {
		case CardIds.MurlocWarleaderLegacy_BG_EX1_507:
		case CardIds.MurlocWarleaderLegacy_TB_BaconUps_008:
			board
				.filter((e) => hasCorrectTribe(e, boardHero, Race.MURLOC, allCards))
				.forEach((e) => {
					const diff = removed.cardId === CardIds.MurlocWarleaderLegacy_TB_BaconUps_008 ? 4 : 2;
					e.attack = Math.max(0, e.attack - diff);
				});
			break;
		case CardIds.HummingBird_BG26_805:
		case CardIds.HummingBird_BG26_805_G:
			board
				.filter((e) => hasCorrectTribe(e, boardHero, Race.BEAST, allCards))
				.filter((e) => e.entityId !== removed.entityId)
				.forEach((e) => {
					const diff = removed.cardId === CardIds.HummingBird_BG26_805_G ? 4 : 2;
					e.attack = Math.max(0, e.attack - diff);
				});
			break;
		case CardIds.SouthseaCaptainLegacy_BG_NEW1_027:
		case CardIds.SouthseaCaptainLegacy_TB_BaconUps_136:
			// console.debug('removing southsea captain', stringifySimpleCard(removed, allCards), stringifySimple(board, allCards));
			board
				.filter((e) => hasCorrectTribe(e, boardHero, Race.PIRATE, allCards))
				.forEach((e) => {
					const diff = removed.cardId === CardIds.SouthseaCaptainLegacy_TB_BaconUps_136 ? 2 : 1;
					e.attack = Math.max(0, e.attack - diff);
					e.health = Math.max(1, e.health - diff);
				});
			// console.debug('after removing southsea captain', stringifySimpleCard(removed, allCards), stringifySimple(board, allCards));
			break;
		case CardIds.Kathranatir_BG21_039:
		case CardIds.Kathranatir_BG21_039_G:
			board
				.filter((e) => hasCorrectTribe(e, boardHero, Race.DEMON, allCards))
				.forEach((e) => {
					const diff = removed.cardId === CardIds.Kathranatir_BG21_039_G ? 4 : 2;
					e.attack = Math.max(0, e.attack - diff);
				});
			break;
		case CardIds.CyborgDrake_BG25_043:
		case CardIds.CyborgDrake_BG25_043_G:
			board
				.filter((e) => e.divineShield)
				.forEach((e) => {
					const diff = removed.cardId === CardIds.CyborgDrake_BG25_043_G ? 12 : 6;
					e.attack = Math.max(0, e.attack - diff);
				});
			break;
		case CardIds.SoreLoser_BG27_030:
		case CardIds.SoreLoser_BG27_030_G:
			board
				.filter((e) => hasCorrectTribe(e, boardHero, Race.UNDEAD, allCards))
				.forEach((e) => {
					const diff = (removed.cardId === CardIds.SoreLoser_BG27_030_G ? 2 : 1) * boardHero.tavernTier;
					e.attack = Math.max(0, e.attack - diff);
				});
			break;
	}
};
