import { CardIds } from '../services/card-ids';
import { BgsPlayerEntity } from '../bgs-player-entity';
import { BoardEntity } from '../board-entity';
import { hasOnCardAddedToHand } from '../cards/card.interface';
import { cardMappings } from '../cards/impl/_card-mappings';
import { pickRandom } from '../services/utils';
import { buildSingleBoardEntity } from '../utils';
import { FullGameState } from './internal-game-state';
import { onQuestProgressUpdated } from './quest';
import { modifyStats } from './stats';

export const addCardsInHand = (
	playerEntity: BgsPlayerEntity,
	board: BoardEntity[],
	cardsAdded: readonly any[],
	gameState: FullGameState,
): BoardEntity[] => {
	const previousCardsInHand = playerEntity.hand?.length ?? 0;
	const sages = board.filter((e) => e.cardId === CardIds.DeathsHeadSage_BG20_HERO_103_Buddy);
	const sagesGolden = board.filter((e) => e.cardId === CardIds.DeathsHeadSage_BG20_HERO_103_Buddy_G);
	const multiplier = sages.length + 2 * sagesGolden.length;

	const cardsThatWillBeAdded: BoardEntity[] = [];
	for (const cardAdded of cardsAdded) {
		const cardToAdd: BoardEntity = (cardAdded as BoardEntity)?.cardId
			? buildSingleBoardEntity(
					cardAdded as string,
					playerEntity,
					board,
					gameState.allCards,
					playerEntity.friendly,
					gameState.sharedState.currentEntityId++,
					false,
					gameState.cardsData,
					gameState.sharedState,
					cardAdded,
			  )
			: buildSingleBoardEntity(
					cardAdded as string,
					playerEntity,
					board,
					gameState.allCards,
					playerEntity.friendly,
					gameState.sharedState.currentEntityId++,
					false,
					gameState.cardsData,
					gameState.sharedState,
					null,
			  );
		cardsThatWillBeAdded.push(cardToAdd);
		if (cardToAdd.cardId === CardIds.BloodGem) {
			for (let i = 0; i < multiplier; i++) {
				cardsThatWillBeAdded.push({ ...cardToAdd });
			}
		}
	}

	for (let i = 0; i < cardsThatWillBeAdded.length; i++) {
		if (playerEntity.hand.length >= 10) {
			break;
		}
		playerEntity.hand.push(cardsThatWillBeAdded[i]);
		onCardAddedToHand(playerEntity, cardsThatWillBeAdded[i], board, gameState);
	}

	return cardsThatWillBeAdded;
};

const onCardAddedToHand = (
	playerEntity: BgsPlayerEntity,
	card: BoardEntity,
	board: BoardEntity[],
	gameState: FullGameState,
) => {
	onCardAddedToHandMinion(playerEntity, card, board, gameState);
	onCardAddedToHandQuest(playerEntity, card, board, gameState);
};

const onCardAddedToHandQuest = (
	playerEntity: BgsPlayerEntity,
	card: BoardEntity,
	board: BoardEntity[],
	gameState: FullGameState,
) => {
	const quests = playerEntity.questEntities ?? [];
	for (const quest of quests) {
		switch (quest.CardId) {
			case CardIds.DustForPrints:
				onQuestProgressUpdated(playerEntity, quest, board, gameState);
				break;
		}
	}
};

const onCardAddedToHandMinion = (
	playerEntity: BgsPlayerEntity,
	card: BoardEntity,
	board: BoardEntity[],
	gameState: FullGameState,
) => {
	for (const entity of board) {
		const onCardAddedToHandImpl = cardMappings[entity.cardId];
		if (hasOnCardAddedToHand(onCardAddedToHandImpl)) {
			onCardAddedToHandImpl.onCardAddedToHand(entity, {
				addedCard: card,
				board: board,
				hero: playerEntity,
				gameState: gameState,
			});
		}
	}
	const thornCaptains = board.filter(
		(e) => e.cardId === CardIds.Thorncaptain_BG25_045 || e.cardId === CardIds.Thorncaptain_BG25_045_G,
	);
	thornCaptains.forEach((captain) => {
		modifyStats(
			captain,
			captain,
			0,
			captain.cardId === CardIds.Thorncaptain_BG25_045_G ? 2 : 1,
			board,
			playerEntity,
			gameState,
		);
	});
};

export const removeCardFromHand = (playerEntity: BgsPlayerEntity, card: BoardEntity): void => {
	let cardToRemove: BoardEntity;
	if (card?.entityId) {
		cardToRemove = playerEntity.hand.find((c) => c?.entityId !== card.entityId);
	} else if (card?.cardId) {
		cardToRemove = playerEntity.hand.find((c) => c?.cardId === card.cardId);
	} else {
		// Remove a single random card in hand that doesn't have an entityId
		cardToRemove =
			pickRandom(playerEntity.hand.filter((c) => !c?.entityId && !c?.cardId)) ?? pickRandom(playerEntity.hand);
	}
	// Remove the first occurrence of the card from playerEntity.cardsInHand, even if it is null
	const index = playerEntity.hand.indexOf(cardToRemove);
	if (index !== -1) {
		playerEntity.hand.splice(index, 1);
	}
};

export interface OnCardAddedToHandInput {
	addedCard: BoardEntity;
	board: BoardEntity[];
	hero: BgsPlayerEntity;
	gameState: FullGameState;
}
