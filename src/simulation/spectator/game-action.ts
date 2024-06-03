import { BgsPlayerEntity } from '../../bgs-player-entity';
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
	opponentBoard: readonly BoardEntity[];
	opponentHand: readonly BoardEntity[];
	opponentSecrets: readonly BoardSecret[];
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
	const result: GameAction = {
		...action,

		playerSecrets: (playerHero?.secrets ?? []).filter((s) => !s.triggered),
		playerCardId: playerHero?.cardId,
		playerEntityId: playerHero?.entityId,
		playerHeroPowerCardId: playerHero?.heroPowerId,
		playerHeroPowerEntityId: playerHero?.heroPowerEntityId,
		playerHeroPowerUsed: playerHero?.heroPowerUsed,
		playerRewardCardId: playerHero?.questRewardEntities?.[0]?.cardId ?? playerHero?.questRewards?.[0],
		playerRewardEntityId: playerHero?.questRewardEntities?.[0]?.entityId,
		playerRewardData: playerHero?.questRewardEntities?.[0]?.scriptDataNum1,

		opponentSecrets: (opponentHero?.secrets ?? []).filter((s) => !s.triggered),
		opponentCardId: opponentHero?.cardId,
		opponentEntityId: opponentHero?.entityId,
		opponentHeroPowerCardId: opponentHero?.heroPowerId,
		opponentHeroPowerEntityId: opponentHero?.heroPowerEntityId,
		opponentHeroPowerUsed: opponentHero?.heroPowerUsed,
		opponentRewardCardId: opponentHero?.questRewardEntities?.[0]?.cardId ?? opponentHero?.questRewards?.[0],
		opponentRewardEntityId: opponentHero?.questRewardEntities?.[0]?.entityId,
		opponentRewardData: opponentHero?.questRewardEntities?.[0]?.scriptDataNum1,
	} as GameAction;
	return result;
};
