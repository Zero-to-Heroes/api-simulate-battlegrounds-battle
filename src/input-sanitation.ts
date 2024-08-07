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
	} = buildFinalInputForPlayer(battleInput.playerBoard, true, cards, cardsData, entityIdContainer);
	const {
		board: playerTeammateBoard,
		hand: playerTeammateHand,
		player: playerTeammateEntity,
	} = buildFinalInputForPlayer(battleInput.playerTeammateBoard, true, cards, cardsData, entityIdContainer);

	const {
		board: opponentBoard,
		hand: opponentHand,
		player: opponentEntity,
	} = buildFinalInputForPlayer(battleInput.opponentBoard, false, cards, cardsData, entityIdContainer);
	const {
		board: opponentTeammateBoard,
		hand: opponentTeammateHand,
		player: opponentTeammateEntity,
	} = buildFinalInputForPlayer(battleInput.opponentTeammateBoard, false, cards, cardsData, entityIdContainer);

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
		playerTeammateBoard: !!playerTeammateEntity
			? {
					board: playerTeammateBoard,
					player: {
						...playerTeammateEntity,
						hand: playerTeammateHand,
					},
			  }
			: null,
		opponentBoard: {
			board: opponentBoard,
			player: {
				...opponentEntity,
				hand: opponentHand,
			},
		},
		opponentTeammateBoard: !!opponentTeammateEntity
			? {
					board: opponentTeammateBoard,
					player: {
						...opponentTeammateEntity,
						hand: opponentTeammateHand,
					},
			  }
			: null,
		gameState: battleInput.gameState,
	} as BgsBattleInfo;
	return inputReady;
};

const buildFinalInputForPlayer = (
	playerInfo: BgsBoardInfo,
	isPlayer: boolean,
	cards: AllCardsService,
	cardsData: CardsData,
	entityIdContainer: { entityId: number },
): { board: BoardEntity[]; hand: BoardEntity[]; player: BgsPlayerEntity } => {
	if (!playerInfo) {
		return { board: [], hand: [], player: null };
	}

	const { board, hand } = buildFinalInputBoard(playerInfo, isPlayer, cardsData, cards);
	playerInfo.player.secrets = playerInfo.secrets?.filter((e) => !!e?.cardId);
	playerInfo.player.friendly = isPlayer;
	// When using the simulator, the aura is not applied when receiving the board state.
	setMissingAuras(board, playerInfo.player, cards);
	// Avenge, maxHealth, etc.
	// setImplicitData(playerBoard, cardsData);
	// setImplicitData(opponentBoard, cardsData);
	// Avenge, globalInfo
	setImplicitDataHero(playerInfo.player, cardsData, isPlayer, entityIdContainer);
	return { board, hand, player: playerInfo.player };
};

const buildFinalInputBoard = (
	playerInfo: BgsBoardInfo,
	isPlayer: boolean,
	cardsData: CardsData,
	cards: AllCardsService,
): { board: BoardEntity[]; hand: BoardEntity[] } => {
	const board = playerInfo.board
		.map((entity) => fixEnchantments(entity, cards))
		.map((entity) => ({ ...entity, inInitialState: true }))
		.map((entity) => ({ ...addImpliedMechanics(entity, cardsData), friendly: isPlayer } as BoardEntity));
	const hand =
		playerInfo.player.hand
			?.map((entity) => ({ ...entity, inInitialState: true }))
			.map((entity) => ({ ...addImpliedMechanics(entity, cardsData), friendly: isPlayer } as BoardEntity)) ?? [];

	return { board, hand };
};
