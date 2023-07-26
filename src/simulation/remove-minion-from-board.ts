import { AllCardsService, CardIds, Race } from '@firestone-hs/reference-data';
import { BoardEntity } from '../board-entity';
import { hasCorrectTribe } from '../utils';
import { Spectator } from './spectator/spectator';

export const removeMinionFromBoard = (
	board: BoardEntity[],
	index: number,
	allCards: AllCardsService,
	spectator: Spectator,
): void => {
	const removedEntity = board.splice(index, 1)[0];
	handleMinionRemovedEffect(board, removedEntity, allCards, spectator);
};

const handleMinionRemovedEffect = (
	board: BoardEntity[],
	removed: BoardEntity,
	allCards: AllCardsService,
	spectator: Spectator,
): void => {
	switch (removed.cardId) {
		case CardIds.MurlocWarleaderLegacy_BG_EX1_507:
		case CardIds.MurlocWarleaderLegacy_TB_BaconUps_008:
			board
				.filter((e) => hasCorrectTribe(e, Race.MURLOC, allCards))
				.forEach((e) => {
					const diff = removed.cardId === CardIds.MurlocWarleaderLegacy_TB_BaconUps_008 ? 4 : 2;
					e.attack = Math.max(0, e.attack - diff);
				});
			break;
		case CardIds.HummingBird_BG26_805:
		case CardIds.HummingBird_BG26_805_G:
			board
				.filter((e) => hasCorrectTribe(e, Race.BEAST, allCards))
				.forEach((e) => {
					const diff = removed.cardId === CardIds.HummingBird_BG26_805_G ? 4 : 2;
					e.attack = Math.max(0, e.attack - diff);
				});
			break;
		case CardIds.LadySinestra_TB_BaconShop_HERO_52_Buddy:
		case CardIds.LadySinestra_TB_BaconShop_HERO_52_Buddy_G:
			board.forEach((e) => {
				const diff = removed.cardId === CardIds.LadySinestra_TB_BaconShop_HERO_52_Buddy_G ? 6 : 3;
				e.attack = Math.max(0, e.attack - diff);
			});
			break;
		case CardIds.SouthseaCaptainLegacy_BG_NEW1_027:
		case CardIds.SouthseaCaptainLegacy_TB_BaconUps_136:
			// console.debug('removing southsea captain', stringifySimpleCard(removed, allCards), stringifySimple(board, allCards));
			board
				.filter((e) => hasCorrectTribe(e, Race.PIRATE, allCards))
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
				.filter((e) => hasCorrectTribe(e, Race.DEMON, allCards))
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
	}
};
