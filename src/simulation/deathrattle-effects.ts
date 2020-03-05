/* eslint-disable @typescript-eslint/no-use-before-define */
import { CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../board-entity';
import { AllCardsService } from '../cards/cards';
import { CardsData } from '../cards/cards-data';
import { bumpEntities, dealDamageToRandomEnemy, processMinionDeath } from './attack';
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
	[board, opponentBoard] = applyMinionDeathEffect(deadEntity, board, opponentBoard, allCards, cardsData, sharedState);
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
			// console.log('dealing damage to opponent board from bot', opponentBoard, board);
			[opponentBoard, board] = dealDamageToRandomEnemy(
				opponentBoard,
				deadEntity,
				4,
				board,
				allCards,
				cardsData,
				sharedState,
			);
			// console.log('after damage from bot', opponentBoard, board);
			return [board, opponentBoard];
		case CardIds.NonCollectible.Neutral.KaboomBotTavernBrawl:
			[opponentBoard, board] = dealDamageToRandomEnemy(
				opponentBoard,
				deadEntity,
				4,
				board,
				allCards,
				cardsData,
				sharedState,
			);
			[opponentBoard, board] = dealDamageToRandomEnemy(
				opponentBoard,
				deadEntity,
				4,
				board,
				allCards,
				cardsData,
				sharedState,
			);
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
	opponentBoard: readonly BoardEntity[],
	allCards: AllCardsService,
	cardsData: CardsData,
	sharedState: SharedState,
): [readonly BoardEntity[], readonly BoardEntity[]] => {
	if (allCards.getCard(deadEntity.cardId).race === 'BEAST') {
		board = applyScavengingHyenaEffect(board);
	}
	if (allCards.getCard(deadEntity.cardId).race === 'DEMON') {
		console.log('will apply juggler effect', deadEntity, board, opponentBoard);
		[board, opponentBoard] = applySoulJugglerEffect(board, opponentBoard, allCards, cardsData, sharedState);
	}
	if (allCards.getCard(deadEntity.cardId).race === 'MECH') {
		board = applyJunkbotEffect(board);
	}
	if (deadEntity.cardId === CardIds.Collectible.Neutral.UnstableGhoul) {
		[board, opponentBoard] = dealDamageToAllMinions(
			board,
			opponentBoard,
			deadEntity,
			1,
			allCards,
			cardsData,
			sharedState,
		);
	} else if (deadEntity.cardId === CardIds.NonCollectible.Neutral.UnstableGhoulTavernBrawl) {
		[board, opponentBoard] = dealDamageToAllMinions(
			board,
			opponentBoard,
			deadEntity,
			2,
			allCards,
			cardsData,
			sharedState,
		);
	}
	return [board, opponentBoard];
};

const dealDamageToAllMinions = (
	board1: readonly BoardEntity[],
	board2: readonly BoardEntity[],
	damageSource: BoardEntity,
	damageDealt: number,
	allCards: AllCardsService,
	cardsData: CardsData,
	sharedState: SharedState,
): [readonly BoardEntity[], readonly BoardEntity[]] => {
	if (board1.length === 0 && board2.length === 0) {
		return [board1, board2];
	}
	let updatedBoard1 = [...board1];
	let updatedBoard2 = [...board2];
	const fakeAttacker = {
		...damageSource,
		attack: damageDealt,
	} as BoardEntity;
	for (let i = 0; i < updatedBoard1.length; i++) {
		const [entity, boardResult] = bumpEntities(
			updatedBoard1[i],
			fakeAttacker,
			updatedBoard1,
			allCards,
			sharedState,
		);
		updatedBoard1 = [...boardResult];
		updatedBoard1[i] = entity;
	}
	for (let i = 0; i < updatedBoard2.length; i++) {
		const [entity, boardResult] = bumpEntities(
			updatedBoard2[i],
			fakeAttacker,
			updatedBoard2,
			allCards,
			sharedState,
		);
		updatedBoard2 = [...boardResult];
		updatedBoard2[i] = entity;
	}
	return processMinionDeath(updatedBoard1, updatedBoard2, allCards, cardsData, sharedState);
};

const applySoulJugglerEffect = (
	boardWithJugglers: readonly BoardEntity[],
	boardToAttack: readonly BoardEntity[],
	allCards: AllCardsService,
	cardsData: CardsData,
	sharedState: SharedState,
): [readonly BoardEntity[], readonly BoardEntity[]] => {
	if (boardWithJugglers.length === 0 && boardToAttack.length === 0) {
		return [boardWithJugglers, boardToAttack];
	}
	const jugglers = boardWithJugglers.filter(entity => entity.cardId === CardIds.NonCollectible.Neutral.SoulJuggler);
	console.log('jugglers in board', boardWithJugglers);
	for (const juggler of jugglers) {
		[boardToAttack, boardWithJugglers] = dealDamageToRandomEnemy(
			boardToAttack,
			juggler,
			3,
			boardWithJugglers,
			allCards,
			cardsData,
			sharedState,
		);
	}
	const goldenJugglers = boardWithJugglers.filter(
		entity => entity.cardId === CardIds.NonCollectible.Neutral.SoulJugglerTavernBrawl,
	);
	console.log('golden jugglers in board', boardWithJugglers);
	for (const juggler of goldenJugglers) {
		[boardToAttack, boardWithJugglers] = dealDamageToRandomEnemy(
			boardToAttack,
			juggler,
			3,
			boardWithJugglers,
			allCards,
			cardsData,
			sharedState,
		);
		[boardToAttack, boardWithJugglers] = dealDamageToRandomEnemy(
			boardToAttack,
			juggler,
			3,
			boardWithJugglers,
			allCards,
			cardsData,
			sharedState,
		);
	}
	return processMinionDeath(boardWithJugglers, boardToAttack, allCards, cardsData, sharedState);
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

const applyJunkbotEffect = (board: readonly BoardEntity[]): readonly BoardEntity[] => {
	const copy = [...board];
	for (let i = 0; i < copy.length; i++) {
		if (copy[i].cardId === CardIds.Collectible.Neutral.Junkbot) {
			copy[i] = {
				...copy[i],
				attack: copy[i].attack + 2,
				health: copy[i].health + 2,
			};
		} else if (copy[i].cardId === CardIds.NonCollectible.Neutral.JunkbotTavernBrawl) {
			copy[i] = {
				...copy[i],
				attack: copy[i].attack + 4,
				health: copy[i].health + 4,
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
