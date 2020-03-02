import { CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../board-entity';

export const handleDeathrattleEffects = (
	board: readonly BoardEntity[],
	deadEntity: BoardEntity,
	deadMinionIndex: number,
): readonly BoardEntity[] => {
	switch (deadEntity.cardId) {
		case CardIds.Collectible.Paladin.SelflessHero:
			board = grantRandomDivineShield(board);
			return board;
		case CardIds.NonCollectible.Paladin.SelflessHeroTavernBrawl:
			board = grantRandomDivineShield(board);
			board = grantRandomDivineShield(board);
			return board;
		case CardIds.Collectible.Warlock.FiendishServant:
			return grantRandomAttack(board, deadEntity.attack);
		case CardIds.NonCollectible.Warlock.FiendishServantTavernBrawl:
			board = grantRandomAttack(board, deadEntity.attack);
			board = grantRandomAttack(board, deadEntity.attack);
			return board;
	}
	return board;
};

const grantRandomAttack = (board: readonly BoardEntity[], additionalAttack: number): readonly BoardEntity[] => {
	const elligibleEntities = board;
	if (elligibleEntities.length > 0) {
		const chosen = elligibleEntities[Math.floor(Math.random() * elligibleEntities.length)];
		board = board.map(entity =>
			entity.entityId === chosen.entityId
				? {
						...entity,
						attack: entity.attack + additionalAttack,
				  }
				: entity,
		);
	}
	return board;
};

const grantRandomDivineShield = (board: readonly BoardEntity[]): readonly BoardEntity[] => {
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
	return board;
};
