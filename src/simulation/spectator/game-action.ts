import { CardIds } from '@firestone-hs/reference-data';
import { BgsPlayerEntity, BoardTrinket } from '../../bgs-player-entity';
import { BoardEntity } from '../../board-entity';
import { BoardSecret } from '../../board-secret';

export interface GameAction {
	type:
		| 'damage'
		| 'attack'
		| 'spawn'
		| 'minion-death'
		| 'power-target'
		| 'start-of-combat'
		| 'player-attack'
		| 'opponent-attack';
	playerBoard: readonly BoardEntity[];
	playerHand: readonly BoardEntity[];
	playerSecrets: readonly BoardSecret[];
	playerTrinkets: readonly BoardTrinket[];
	opponentBoard: readonly BoardEntity[];
	opponentHand: readonly BoardEntity[];
	opponentSecrets: readonly BoardSecret[];
	opponentTrinkets: readonly BoardTrinket[];
	playerCardId: string;
	playerEntityId: number;
	playerHeroPowerCardId: string;
	playerHeroPowerEntityId: number;
	playerHeroPowerUsed: boolean;
	opponentCardId: string;
	opponentEntityId: number;
	opponentHeroPowerCardId: string;
	opponentHeroPowerEntityId: number;
	opponentHeroPowerUsed: boolean;
	playerRewardCardId: string;
	playerRewardEntityId: number;
	playerRewardData: number;
	opponentRewardCardId: string;
	opponentRewardEntityId: number;
	opponentRewardData: number;
	sourceEntityId?: number;
	/** @deprecated */
	targetEntityId?: number;
	targetEntityIds?: number[];

	damages?: Damage[];
	spawns?: readonly BoardEntity[];
	deaths?: readonly BoardEntity[];
	deadMinionsPositionsOnBoard?: readonly number[];
}

export interface Damage {
	readonly sourceEntityId?: number;
	readonly targetEntityId?: number;
	readonly damage?: number;
}

export const buildGameAction = (
	playerHero: BgsPlayerEntity,
	opponentHero: BgsPlayerEntity,
	action: Partial<GameAction>,
): GameAction => {
	const isPlayerSireD = playerHero?.cardId?.startsWith(CardIds.SireDenathrius_BG24_HERO_100);
	const isOpponentSireD = opponentHero?.cardId?.startsWith(CardIds.SireDenathrius_BG24_HERO_100);
	const result: GameAction = {
		...action,

		playerSecrets: (playerHero?.secrets ?? []).filter((s) => !s.triggered),
		playerCardId: playerHero?.cardId,
		playerEntityId: playerHero?.entityId,
		playerHeroPowerCardId:
			playerHero?.trinkets.find((t) => t.scriptDataNum6 === 3)?.cardId ??
			(isPlayerSireD ? playerHero.questRewardEntities?.[0]?.cardId : null) ??
			playerHero?.heroPowerId,
		playerHeroPowerEntityId: 100000002,
		playerHeroPowerUsed: playerHero?.heroPowerUsed,
		playerRewardCardId:
			isPlayerSireD && playerHero?.questRewardEntities?.length < 2
				? null
				: playerHero?.questRewardEntities?.[1]?.cardId ?? playerHero?.questRewards?.[0],
		playerRewardEntityId:
			isPlayerSireD && playerHero?.questRewardEntities?.length < 2
				? null
				: playerHero?.questRewardEntities?.[1]?.entityId,
		playerRewardData:
			isPlayerSireD && playerHero?.questRewardEntities?.length < 2
				? null
				: playerHero?.questRewardEntities?.[0]?.scriptDataNum1,
		playerTrinkets: playerHero?.trinkets,

		opponentSecrets: (opponentHero?.secrets ?? []).filter((s) => !s.triggered),
		opponentCardId: opponentHero?.cardId,
		opponentEntityId: opponentHero?.entityId,
		opponentHeroPowerCardId:
			opponentHero?.trinkets.find((t) => t.scriptDataNum6 === 3)?.cardId ??
			(isOpponentSireD ? opponentHero.questRewardEntities?.[0]?.cardId : null) ??
			opponentHero?.heroPowerId,
		opponentHeroPowerEntityId: 200000002,
		opponentHeroPowerUsed: opponentHero?.heroPowerUsed,
		opponentRewardCardId:
			isOpponentSireD && opponentHero?.questRewardEntities?.length < 2
				? null
				: opponentHero?.questRewardEntities?.[1]?.cardId ?? opponentHero?.questRewards?.[0],
		opponentRewardEntityId:
			isOpponentSireD && opponentHero?.questRewardEntities?.length < 2
				? null
				: opponentHero?.questRewardEntities?.[1]?.entityId,
		opponentRewardData:
			isOpponentSireD && opponentHero?.questRewardEntities?.length < 2
				? null
				: opponentHero?.questRewardEntities?.[0]?.scriptDataNum1,
		opponentTrinkets: opponentHero?.trinkets,
	} as GameAction;
	return result;
};
