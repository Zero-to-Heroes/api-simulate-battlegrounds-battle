/* eslint-disable @typescript-eslint/no-use-before-define */
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
	board = applyMinionDeathEffect(deadEntity, board, allCards);
	switch (deadEntity.cardId) {
		case CardIds.Collectible.Paladin.SelflessHero:
			board = grantRandomDivineShield(board);
			return [board, opponentBoard];
		case CardIds.NonCollectible.Paladin.SelflessHeroTavernBrawl:
			board = grantRandomDivineShield(board);
			board = grantRandomDivineShield(board);
			return [board, opponentBoard];
		case CardIds.Collectible.Neutral.SpawnOfNzoth:
			board = addStatsToBoard(board, 1, 1);
			return [board, opponentBoard];
		case CardIds.NonCollectible.Neutral.SpawnOfNzothTavernBrawl:
			board = addStatsToBoard(board, 2, 2);
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

const addStatsToBoard = (board: readonly BoardEntity[], attack: number, health: number): readonly BoardEntity[] => {
	return board.map(entity => ({
		...entity,
		attack: entity.attack + attack,
		health: entity.health + health,
	}));
};

const applyMinionDeathEffect = (
	deadEntity: BoardEntity,
	board: readonly BoardEntity[],
	allCards: AllCardsService,
): readonly BoardEntity[] => {
	if (allCards.getCard(deadEntity.cardId).race === 'BEAST') {
		board = applyScavengingHyenaEffect(board);
	}
	return board;
};

const applyScavengingHyenaEffect = (board: readonly BoardEntity[]): readonly BoardEntity[] => {
	const copy = [...board];
	for (let i = 0; i < copy.length; i++) {
		if (copy[i].cardId === CardIds.Collectible.Hunter.ScavengingHyena) {
			copy[i] = {
				...copy[i],
				attack: copy[i].attack + 2,
				health: copy[i].health + 1,
			};
		} else if (copy[i].cardId === CardIds.NonCollectible.Hunter.ScavengingHyenaTavernBrawl) {
			copy[i] = {
				...copy[i],
				attack: copy[i].attack + 4,
				health: copy[i].health + 2,
			};
		}
	}
	return copy;
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
