/* eslint-disable @typescript-eslint/no-use-before-define */
import { CardIds } from '@firestone-hs/reference-data';
import { BgsPlayerEntity } from '../bgs-player-entity';
import { BoardEntity } from '../board-entity';
import { updateDivineShield } from '../keywords/divine-shield';
import { FullGameState } from './internal-game-state';

export const applyFrenzy = (
	entityWithFrenzy: BoardEntity,
	entityWithFrenzyBoard: BoardEntity[],
	entityWithFrenzyBoardHero: BgsPlayerEntity,
	gameState: FullGameState,
): void => {
	if (
		entityWithFrenzy.cardId === CardIds.BristlebackKnight_BG20_204 ||
		entityWithFrenzy.cardId === CardIds.BristlebackKnight_BG20_204_G
	) {
		if (!entityWithFrenzy.divineShield) {
			updateDivineShield(
				entityWithFrenzy,
				entityWithFrenzyBoard,
				entityWithFrenzyBoardHero,
				null,
				true,
				gameState,
			);
		}
	}
};
