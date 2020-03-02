import { CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../board-entity';

export const handleDeathrattleEffects = (
	board: readonly BoardEntity[],
	deadEntity: BoardEntity,
	deadMinionIndex: number,
): readonly BoardEntity[] => {
	switch (deadEntity.cardId) {
		case CardIds.Collectible.Paladin.SelflessHero:
			return grantRandomDivineShield(board, 1);
		case CardIds.NonCollectible.Paladin.SelflessHeroTavernBrawl:
			return grantRandomDivineShield(board, 2);
	}
	return board;
};

const grantRandomDivineShield = (
	board: readonly BoardEntity[],
	numberOfDivineShields: number,
): readonly BoardEntity[] => {
	for (let i = 0; i < numberOfDivineShields; i++) {
		const elligibleEntities = board.filter(entity => !entity.divineShield);
		if (elligibleEntities.length > 0) {
			const chosen = elligibleEntities[Math.floor(Math.random() * elligibleEntities.length)];
			board = board.map(entity =>
				entity.entityId === chosen.entityId
					? {
							...entity,
							divineShield: true,
					  }
					: entity,
			);
		}
	}
	return board;
};
