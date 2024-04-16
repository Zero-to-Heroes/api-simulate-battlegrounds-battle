import { AllCardsService } from '@firestone-hs/reference-data';
import { BgsBattleInfo } from './bgs-battle-info';
import { BgsBoardInfo } from './bgs-board-info';
import { BgsPlayerEntity } from './bgs-player-entity';
import { BoardEntity } from './board-entity';
import { CardsData } from './cards/cards-data';
import { setImplicitDataHero, setMissingAuras } from './simulation/auras';
import { fixEnchantments } from './simulation/enchantments';
import { addImpliedMechanics } from './utils';

export const buildFinalInput = (
	battleInput: BgsBattleInfo,
	cards: AllCardsService,
	cardsData: CardsData,
): BgsBattleInfo => {
	const entityIdContainer = { entityId: 999_999_999 };

	const {
		board: playerBoard,
		hand: playerHand,
		player: playerEntity,
	} = buildFinalInputForPlayer(battleInput.playerBoard, cards, cardsData, entityIdContainer);

	const {
		board: opponentBoard,
		hand: opponentHand,
		player: opponentEntity,
	} = buildFinalInputForPlayer(battleInput.opponentBoard, cards, cardsData, entityIdContainer);

	// We do this so that we can have mutated objects inside the simulation and still
	// be able to start from a fresh copy for each simulation
	const inputReady: BgsBattleInfo = {
		playerBoard: {
			board: playerBoard,
			player: {
				...playerEntity,
				hand: playerHand,
			},
		},
		opponentBoard: {
			board: opponentBoard,
			player: {
				...opponentEntity,
				hand: opponentHand,
			},
		},
		gameState: battleInput.gameState,
	} as BgsBattleInfo;
	return inputReady;
};

const buildFinalInputForPlayer = (
	playerInfo: BgsBoardInfo,
	cards: AllCardsService,
	cardsData: CardsData,
	entityIdContainer: { entityId: number },
): { board: BoardEntity[]; hand: BoardEntity[]; player: BgsPlayerEntity } => {
	const { board, hand } = buildFinalInputBoard(playerInfo, cardsData, cards);
	playerInfo.player.secrets = playerInfo.secrets?.filter((e) => !!e?.cardId);
	playerInfo.player.friendly = true;
	// When using the simulator, the aura is not applied when receiving the board state.
	setMissingAuras(board, playerInfo.player, cards);
	// Avenge, maxHealth, etc.
	// setImplicitData(playerBoard, cardsData);
	// setImplicitData(opponentBoard, cardsData);
	// Avenge, globalInfo
	setImplicitDataHero(playerInfo.player, cardsData, true, entityIdContainer);
	return { board, hand, player: playerInfo.player };
};

const buildFinalInputBoard = (
	playerInfo: BgsBoardInfo,
	cardsData: CardsData,
	cards: AllCardsService,
): { board: BoardEntity[]; hand: BoardEntity[] } => {
	const board = playerInfo.board
		.map((entity) => fixEnchantments(entity, cards))
		.map((entity) => ({ ...entity, inInitialState: true }))
		.map((entity) => ({ ...addImpliedMechanics(entity, cardsData), friendly: true } as BoardEntity));
	const hand =
		playerInfo.player.hand
			?.map((entity) => ({ ...entity, inInitialState: true }))
			.map((entity) => ({ ...addImpliedMechanics(entity, cardsData), friendly: true } as BoardEntity)) ?? [];

	return { board, hand };
};
