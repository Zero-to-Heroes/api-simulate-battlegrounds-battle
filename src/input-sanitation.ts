import { CardIds } from './services/card-ids';
import { AllCardsService, normalizeHeroCardId } from '@firestone-hs/reference-data';
import { BgsBattleInfo } from './bgs-battle-info';
import { BgsBoardInfo } from './bgs-board-info';
import { BgsHeroPower, BgsPlayerEntity } from './bgs-player-entity';
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
	} = buildFinalInputForPlayer(
		battleInput.playerBoard,
		true,
		battleInput.gameState.anomalies,
		cards,
		cardsData,
		entityIdContainer,
	);
	const {
		board: playerTeammateBoard,
		hand: playerTeammateHand,
		player: playerTeammateEntity,
	} = buildFinalInputForPlayer(
		battleInput.playerTeammateBoard,
		true,
		battleInput.gameState.anomalies,
		cards,
		cardsData,
		entityIdContainer,
	);

	const {
		board: opponentBoard,
		hand: opponentHand,
		player: opponentEntity,
	} = buildFinalInputForPlayer(
		battleInput.opponentBoard,
		false,
		battleInput.gameState.anomalies,
		cards,
		cardsData,
		entityIdContainer,
	);
	const {
		board: opponentTeammateBoard,
		hand: opponentTeammateHand,
		player: opponentTeammateEntity,
	} = buildFinalInputForPlayer(
		battleInput.opponentTeammateBoard,
		false,
		battleInput.gameState.anomalies,
		cards,
		cardsData,
		entityIdContainer,
	);

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
	anomalies: readonly string[],
	cards: AllCardsService,
	cardsData: CardsData,
	entityIdContainer: { entityId: number },
): { board: BoardEntity[]; hand: BoardEntity[]; player: BgsPlayerEntity } => {
	if (!playerInfo) {
		return { board: [], hand: [], player: null };
	}

	const { board, hand } = buildFinalInputBoard(playerInfo, isPlayer, cardsData, cards);
	const isGhost = playerInfo.player?.hpLeft != null && playerInfo.player.hpLeft <= 0;
	playerInfo.player.secrets = (playerInfo.player.secrets ?? playerInfo.secrets)?.filter((e) => !!e?.cardId) ?? [];
	// Add the scriptDataNum1 only on the start of combat phase, so that it doesn't trigger too soon
	// Don't do this, as secrets like Fleeting Vigor use this info to tell how much buff it will apply
	// playerInfo.player.secrets.forEach((secret) => (secret.scriptDataNum1 = 0));
	// Trinkets don't seem to trigger when facing the ghost
	// http://replays.firestoneapp.com/?reviewId=4ad32e03-2620-4fb1-8b43-cad55afd30fc&turn=27&action=2
	// One of the trinkets is Blood Golem Sticker, and no Blood Golem is summoned
	// Looks like that's not always the case:
	// http://replays.firestoneapp.com/?reviewId=9958e8d3-4388-4e6f-9b36-35f3a08be2f6&turn=25&action=4
	// playerInfo.player.trinkets = isGhost ? [] : playerInfo.player.trinkets?.filter((e) => !!e?.cardId) ?? [];
	playerInfo.player.trinkets = (playerInfo.player.trinkets?.filter((e) => !!e?.cardId) ?? []).sort(
		(a, b) => a.entityId - b.entityId,
	);
	playerInfo.player.friendly = isPlayer;
	playerInfo.player.globalInfo = playerInfo.player.globalInfo ?? {};
	playerInfo.player.globalInfo.PirateAttackBonus = playerInfo.player.globalInfo.PirateAttackBonus ?? 0;
	playerInfo.player.heroPowers = playerInfo.player.heroPowers?.length
		? playerInfo.player.heroPowers.map((hp, index) => sanitizeHeroPower(hp, index, playerInfo.player, cards))
		: [
				{
					cardId: playerInfo.player.heroPowerId,
					entityId: playerInfo.player.heroPowerEntityId,
					used: playerInfo.player.heroPowerUsed,
					info: playerInfo.player.heroPowerInfo,
					info2: playerInfo.player.heroPowerInfo2,
				} as BgsHeroPower,
		  ];
	// playerInfo.player.heroPowerId =
	// 	playerInfo.player.trinkets.find((t) => t.scriptDataNum6 === 3)?.cardId ??
	// 	(normalizeHeroCardId(playerInfo.player.cardId, cards) === CardIds.SireDenathrius_BG24_HERO_100
	// 		? playerInfo.player.questRewardEntities?.[0]?.cardId
	// 		: null) ??
	// 	playerInfo.player.heroPowerId;
	playerInfo.player.cardId = isGhost ? CardIds.Kelthuzad_TB_BaconShop_HERO_KelThuzad : playerInfo.player.cardId;
	playerInfo.player.hpLeft = Math.max(1, playerInfo.player.hpLeft);
	// When using the simulator, the aura is not applied when receiving the board state.
	setMissingAuras(board, playerInfo.player, anomalies, cards);
	// Avenge, maxHealth, etc.
	// setImplicitData(playerBoard, cardsData);
	// setImplicitData(opponentBoard, cardsData);
	// Avenge, globalInfo
	setImplicitDataHero(playerInfo.player, cardsData, isPlayer, entityIdContainer);
	return { board, hand, player: playerInfo.player };
};

const sanitizeHeroPower = (
	hp: BgsHeroPower,
	index: number,
	player: BgsPlayerEntity,
	cards: AllCardsService,
): BgsHeroPower => {
	if (index !== 0) {
		return hp;
	}

	hp.cardId =
		player.trinkets.find((t) => t.scriptDataNum6 === 3)?.cardId ??
		(normalizeHeroCardId(player.cardId, cards) === CardIds.SireDenathrius_BG24_HERO_100
			? player.questRewardEntities?.[0]?.cardId
			: null) ??
		hp.cardId;
	return hp;
};

const buildFinalInputBoard = (
	playerInfo: BgsBoardInfo,
	isPlayer: boolean,
	cardsData: CardsData,
	cards: AllCardsService,
): { board: BoardEntity[]; hand: BoardEntity[] } => {
	const board = playerInfo.board
		.map((entity) => fixEnchantments(entity, cards))
		.map((entity) => ({
			...entity,
			inInitialState: true,
			scriptDataNum1: cardsData.defaultScriptDataNum(entity.cardId) || entity.scriptDataNum1,
		}))
		.map((entity) => ({ ...addImpliedMechanics(entity, cardsData), friendly: isPlayer } as BoardEntity));
	const hand =
		playerInfo.player.hand
			?.map((entity) => ({ ...entity, inInitialState: true }))
			.map((entity) => ({ ...addImpliedMechanics(entity, cardsData), friendly: isPlayer } as BoardEntity)) ?? [];

	return { board, hand };
};
