import { CardIds } from '@firestone-hs/reference-data';
import { BgsPlayerEntity } from '../bgs-player-entity';
import { BoardEntity } from '../board-entity';
import { hasOnVenomousUpdated } from '../cards/card.interface';
import { cardMappings } from '../cards/impl/_card-mappings';
import { FullGameState } from '../simulation/internal-game-state';
import { modifyStats } from '../simulation/stats';

export const updateVenomous = (
	entity: BoardEntity,
	newValue: boolean,
	board: BoardEntity[],
	hero: BgsPlayerEntity,
	otherHero: BgsPlayerEntity,
	gameState: FullGameState,
): void => {
	const previousValue = entity.venomous;
	const lostVenomous = entity.venomous && !newValue;
	entity.venomous = newValue;
	if (lostVenomous) {
		const belcherPortraits = hero.trinkets.filter(
			(t) =>
				t.cardId === CardIds.BelcherPortrait_BG30_MagicItem_432 ||
				t.cardId === CardIds.BelcherPortrait_BelcherPortraitToken_BG30_MagicItem_432t,
		);
		belcherPortraits.forEach((p) => {
			const buff = p.cardId === CardIds.BelcherPortrait_BelcherPortraitToken_BG30_MagicItem_432t ? 14 : 4;
			modifyStats(entity, buff, buff, board, hero, gameState);
			gameState.spectator.registerPowerTarget(p, entity, board, null, null);
		});
	}

	for (const boardEntity of board) {
		const onVenomousUpdatedImpl = cardMappings[boardEntity.cardId];
		if (hasOnVenomousUpdated(onVenomousUpdatedImpl)) {
			onVenomousUpdatedImpl.onVenomousUpdated(boardEntity, entity, previousValue, {
				board: board,
				hero: hero,
				otherHero: otherHero,
				gameState: gameState,
			});
		}
	}
};

export interface OnVenomousUpdatedInput {
	board: BoardEntity[];
	hero: BgsPlayerEntity;
	otherHero: BgsPlayerEntity;
	gameState: FullGameState;
}
