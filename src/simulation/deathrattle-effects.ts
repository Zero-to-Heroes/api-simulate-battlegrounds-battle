import { CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../board-entity';
import { AllCardsService } from '../cards/cards';
import { CardsData } from '../cards/cards-data';
import { dealDamageToRandomEnemy } from './attack';
import { SharedState } from './shared-state';

export const handleDeathrattleEffects = (
	board: readonly BoardEntity[],
	deadEntity: BoardEntity,
	deadMinionIndex: number,
	opponentBoard: readonly BoardEntity[],
	allCards: AllCardsService,
	cardsData: CardsData,
	sharedState: SharedState,
): [readonly BoardEntity[], readonly BoardEntity[]] => {
	switch (deadEntity.cardId) {
		case CardIds.Collectible.Paladin.SelflessHero:
			board = grantRandomDivineShield(board);
			return [board, opponentBoard];
		case CardIds.NonCollectible.Paladin.SelflessHeroTavernBrawl:
			board = grantRandomDivineShield(board);
			board = grantRandomDivineShield(board);
			return [board, opponentBoard];
		case CardIds.Collectible.Warlock.FiendishServant:
			return [grantRandomAttack(board, deadEntity.attack), opponentBoard];
		case CardIds.NonCollectible.Warlock.FiendishServantTavernBrawl:
			board = grantRandomAttack(board, deadEntity.attack);
			board = grantRandomAttack(board, deadEntity.attack);
			return [board, opponentBoard];
		case CardIds.Collectible.Neutral.KaboomBot:
			console.log('dealing damage to opponent board from bot', opponentBoard, board);
			[opponentBoard, board] = dealDamageToRandomEnemy(opponentBoard, 4, board, allCards, cardsData, sharedState);
			console.log('after damage from bot', opponentBoard, board);
			return [board, opponentBoard];
		case CardIds.NonCollectible.Neutral.KaboomBotTavernBrawl:
			[opponentBoard, board] = dealDamageToRandomEnemy(opponentBoard, 4, board, allCards, cardsData, sharedState);
			[opponentBoard, board] = dealDamageToRandomEnemy(opponentBoard, 4, board, allCards, cardsData, sharedState);
			return [board, opponentBoard];
	}
	return [board, opponentBoard];
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
