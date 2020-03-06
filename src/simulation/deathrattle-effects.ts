/* eslint-disable @typescript-eslint/no-use-before-define */
import { CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../board-entity';
import { AllCardsService } from '../cards/cards';
import { CardsData } from '../cards/cards-data';
import { bumpEntities, dealDamageToEnemy, dealDamageToRandomEnemy, processMinionDeath } from './attack';
import { spawnEntities } from './deathrattle-spawns';
import { SharedState } from './shared-state';

export const handleDeathrattleEffects = (
	boardWithDeadEntity: readonly BoardEntity[],
	deadEntity: BoardEntity,
	deadMinionIndex: number,
	otherBoard: readonly BoardEntity[],
	allCards: AllCardsService,
	cardsData: CardsData,
	sharedState: SharedState,
): [readonly BoardEntity[], readonly BoardEntity[]] => {
	[boardWithDeadEntity, otherBoard] = applyMinionDeathEffect(
		deadEntity,
		boardWithDeadEntity,
		otherBoard,
		allCards,
		cardsData,
		sharedState,
	);

	const rivendare = boardWithDeadEntity.find(entity => entity.cardId === CardIds.Collectible.Neutral.BaronRivendare);
	const goldenRivendare = boardWithDeadEntity.find(
		entity => entity.cardId === CardIds.NonCollectible.Neutral.BaronRivendareTavernBrawl,
	);
	const multiplier = goldenRivendare ? 3 : rivendare ? 2 : 1;
	// We do it on a case by case basis so that we deal all the damage in one go for instance
	// and avoid proccing deathrattle spawns between the times the damage triggers
	switch (deadEntity.cardId) {
		case CardIds.Collectible.Paladin.SelflessHero:
			for (let i = 0; i < multiplier; i++) {
				boardWithDeadEntity = grantRandomDivineShield(boardWithDeadEntity);
			}
			return [boardWithDeadEntity, otherBoard];
		case CardIds.NonCollectible.Paladin.SelflessHeroTavernBrawl:
			for (let i = 0; i < multiplier; i++) {
				boardWithDeadEntity = grantRandomDivineShield(boardWithDeadEntity);
				boardWithDeadEntity = grantRandomDivineShield(boardWithDeadEntity);
			}
			return [boardWithDeadEntity, otherBoard];
		case CardIds.NonCollectible.Neutral.NadinaTheRed:
			for (let i = 0; i < multiplier; i++) {
				boardWithDeadEntity = grantAllDivineShield(boardWithDeadEntity, 'DRAGON', allCards);
			}
			return [boardWithDeadEntity, otherBoard];
		case CardIds.Collectible.Neutral.SpawnOfNzoth:
			boardWithDeadEntity = addStatsToBoard(boardWithDeadEntity, multiplier * 1, multiplier * 1, allCards);
			return [boardWithDeadEntity, otherBoard];
		case CardIds.NonCollectible.Neutral.SpawnOfNzothTavernBrawl:
			boardWithDeadEntity = addStatsToBoard(boardWithDeadEntity, multiplier * 2, multiplier * 2, allCards);
			return [boardWithDeadEntity, otherBoard];
		case CardIds.NonCollectible.Neutral.GoldrinnTheGreatWolf:
			boardWithDeadEntity = addStatsToBoard(
				boardWithDeadEntity,
				multiplier * 4,
				multiplier * 4,
				allCards,
				'BEAST',
			);
			return [boardWithDeadEntity, otherBoard];
		case CardIds.NonCollectible.Neutral.GoldrinnTheGreatWolfTavernBrawl:
			boardWithDeadEntity = addStatsToBoard(
				boardWithDeadEntity,
				multiplier * 8,
				multiplier * 8,
				allCards,
				'BEAST',
			);
			return [boardWithDeadEntity, otherBoard];
		case CardIds.NonCollectible.Neutral.KingBagurgle:
			boardWithDeadEntity = addStatsToBoard(
				boardWithDeadEntity,
				multiplier * 2,
				multiplier * 2,
				allCards,
				'MURLOC',
			);
			return [boardWithDeadEntity, otherBoard];
		case CardIds.NonCollectible.Neutral.KingBagurgleTavernBrawl:
			boardWithDeadEntity = addStatsToBoard(
				boardWithDeadEntity,
				multiplier * 4,
				multiplier * 4,
				allCards,
				'MURLOC',
			);
			return [boardWithDeadEntity, otherBoard];
		case CardIds.Collectible.Warlock.FiendishServant:
			for (let i = 0; i < multiplier; i++) {
				boardWithDeadEntity = grantRandomAttack(boardWithDeadEntity, deadEntity.attack);
			}
			return [boardWithDeadEntity, otherBoard];
		case CardIds.NonCollectible.Warlock.FiendishServantTavernBrawl:
			for (let i = 0; i < multiplier; i++) {
				boardWithDeadEntity = grantRandomAttack(boardWithDeadEntity, deadEntity.attack);
				boardWithDeadEntity = grantRandomAttack(boardWithDeadEntity, deadEntity.attack);
			}
			return [boardWithDeadEntity, otherBoard];
		case CardIds.Collectible.Neutral.KaboomBot:
			// FIXME: I don't think this way of doing things is really accurate (as some deathrattles
			// could be spawned between the shots firing), but let's say it's good enough for now
			for (let i = 0; i < multiplier; i++) {
				[otherBoard, boardWithDeadEntity] = dealDamageToRandomEnemy(
					otherBoard,
					deadEntity,
					4,
					boardWithDeadEntity,
					allCards,
					cardsData,
					sharedState,
				);
			}
			// console.log('after damage from bot', opponentBoard, board);
			return [boardWithDeadEntity, otherBoard];
		case CardIds.NonCollectible.Neutral.KaboomBotTavernBrawl:
			for (let i = 0; i < multiplier; i++) {
				[otherBoard, boardWithDeadEntity] = dealDamageToRandomEnemy(
					otherBoard,
					deadEntity,
					4,
					boardWithDeadEntity,
					allCards,
					cardsData,
					sharedState,
				);
				[otherBoard, boardWithDeadEntity] = dealDamageToRandomEnemy(
					otherBoard,
					deadEntity,
					4,
					boardWithDeadEntity,
					allCards,
					cardsData,
					sharedState,
				);
			}
			return [boardWithDeadEntity, otherBoard];
	}
	return [boardWithDeadEntity, otherBoard];
};

const addStatsToBoard = (
	board: readonly BoardEntity[],
	attack: number,
	health: number,
	allCards: AllCardsService,
	tribe?: string,
): readonly BoardEntity[] => {
	return board.map(entity => {
		if (!tribe || allCards.getCard(entity.cardId).race === tribe) {
			return {
				...entity,
				attack: entity.attack + attack,
				health: entity.health + health,
			};
		}
		return entity;
	});
};

const applyMinionDeathEffect = (
	deadEntity: BoardEntity,
	boardWithDeadEntity: readonly BoardEntity[],
	otherBoard: readonly BoardEntity[],
	allCards: AllCardsService,
	cardsData: CardsData,
	sharedState: SharedState,
): [readonly BoardEntity[], readonly BoardEntity[]] => {
	if (allCards.getCard(deadEntity.cardId).race === 'BEAST') {
		boardWithDeadEntity = applyScavengingHyenaEffect(boardWithDeadEntity);
	}
	if (allCards.getCard(deadEntity.cardId).race === 'DEMON') {
		// console.log('will apply juggler effect', deadEntity, boardWithDeadEntity, otherBoard);
		[boardWithDeadEntity, otherBoard] = applySoulJugglerEffect(
			boardWithDeadEntity,
			otherBoard,
			allCards,
			cardsData,
			sharedState,
		);
	}
	if (allCards.getCard(deadEntity.cardId).race === 'MECH') {
		boardWithDeadEntity = applyJunkbotEffect(boardWithDeadEntity);
	}
	// Overkill
	// console.log('is there overkill?', deadEntity);
	if (deadEntity.health < 0 && deadEntity.lastAffectedByEntity.attacking) {
		// console.log('overkill', deadEntity);
		if (deadEntity.lastAffectedByEntity.cardId === CardIds.NonCollectible.Warrior.HeraldOfFlameBATTLEGROUNDS) {
			const targets = boardWithDeadEntity.filter(entity => entity.health > 0);
			if (targets.length > 0) {
				const target = targets[0];
				// console.log('hof target', target);
				[boardWithDeadEntity, otherBoard] = dealDamageToEnemy(
					target,
					boardWithDeadEntity,
					deadEntity.lastAffectedByEntity,
					3,
					otherBoard,
					allCards,
					cardsData,
					sharedState,
				);
				// console.log('board after overkill handling', boardWithDeadEntity);
			}
		} else if (deadEntity.lastAffectedByEntity.cardId === CardIds.NonCollectible.Warrior.HeraldOfFlameTavernBrawl) {
			const targets = boardWithDeadEntity.filter(entity => entity.health > 0);
			if (targets.length > 0) {
				const target = targets[0];
				[boardWithDeadEntity, otherBoard] = dealDamageToEnemy(
					target,
					boardWithDeadEntity,
					deadEntity.lastAffectedByEntity,
					6,
					otherBoard,
					allCards,
					cardsData,
					sharedState,
				);
			}
		} else if (deadEntity.lastAffectedByEntity.cardId === CardIds.Collectible.Druid.IronhideDirehorn) {
			// console.log('will apply direhorn overkill', deadEntity, otherBoard);
			const index = otherBoard.map(e => e.entityId).indexOf(deadEntity.entityId);
			const newEntities = spawnEntities(
				CardIds.NonCollectible.Druid.IronhideDirehorn_IronhideRuntToken,
				1,
				otherBoard,
				allCards,
				sharedState,
				true,
			);
			const updatedBoard = [...otherBoard];
			updatedBoard.splice(index, 0, ...newEntities);
			otherBoard = updatedBoard;
		} else if (
			deadEntity.lastAffectedByEntity.cardId === CardIds.NonCollectible.Druid.IronhideDirehornTavernBrawl
		) {
			const index = otherBoard.map(e => e.entityId).indexOf(deadEntity.entityId);
			const newEntities = spawnEntities(
				CardIds.NonCollectible.Druid.IronhideDirehorn_IronhideRuntTokenTavernBrawl,
				1,
				otherBoard,
				allCards,
				sharedState,
				true,
			);
			const updatedBoard = [...otherBoard];
			updatedBoard.splice(index, 0, ...newEntities);
			otherBoard = updatedBoard;
		}
	}

	const rivendare = boardWithDeadEntity.find(entity => entity.cardId === CardIds.Collectible.Neutral.BaronRivendare);
	const goldenRivendare = boardWithDeadEntity.find(
		entity => entity.cardId === CardIds.NonCollectible.Neutral.BaronRivendareTavernBrawl,
	);
	const multiplier = goldenRivendare ? 3 : rivendare ? 2 : 1;
	if (deadEntity.cardId === CardIds.Collectible.Neutral.UnstableGhoul) {
		[boardWithDeadEntity, otherBoard] = dealDamageToAllMinions(
			boardWithDeadEntity,
			otherBoard,
			deadEntity,
			multiplier * 1,
			allCards,
			cardsData,
			sharedState,
		);
	} else if (deadEntity.cardId === CardIds.NonCollectible.Neutral.UnstableGhoulTavernBrawl) {
		[boardWithDeadEntity, otherBoard] = dealDamageToAllMinions(
			boardWithDeadEntity,
			otherBoard,
			deadEntity,
			multiplier * 2,
			allCards,
			cardsData,
			sharedState,
		);
	}
	return [boardWithDeadEntity, otherBoard];
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
		attacking: true,
	} as BoardEntity;
	for (let i = 0; i < updatedBoard1.length; i++) {
		const [entity, boardResult] = bumpEntities(
			updatedBoard1[i],
			fakeAttacker,
			updatedBoard1,
			allCards,
			cardsData,
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
			cardsData,
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
	// console.log('jugglers in board', boardWithJugglers);
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
	// console.log('golden jugglers in board', boardWithJugglers);
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

const grantAllDivineShield = (
	board: readonly BoardEntity[],
	tribe: string,
	cards: AllCardsService,
): readonly BoardEntity[] => {
	const elligibleEntities = board
		.filter(entity => !entity.divineShield)
		.filter(entity => cards.getCard(entity.cardId).race === tribe)
		.map(entity => entity.entityId);
	if (elligibleEntities.length > 0) {
		board = board.map(entity =>
			elligibleEntities.indexOf(entity.entityId) !== -1
				? {
						...entity,
						divineShield: true,
				  }
				: entity,
		);
	}
	return board;
};
