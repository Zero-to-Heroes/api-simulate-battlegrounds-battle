import { BgsPlayerEntity, BoardTrinket } from '../bgs-player-entity';
import { BoardEntity } from '../board-entity';
import { BoardSecret } from '../board-secret';
import { OnDespawnInput, OnSpawnInput } from '../simulation/add-minion-to-board';
import { AvengeInput } from '../simulation/avenge';
import { BattlecryInput, OnBattlecryTriggeredInput } from '../simulation/battlecries';
import { DeathrattleTriggeredInput } from '../simulation/deathrattle-on-trigger';
import { OnAttackInput } from '../simulation/on-attack';
import { SoCInput } from '../simulation/start-of-combat/start-of-combat-input';

export interface Card {
	startOfCombat?: (
		trinket: BoardEntity | BoardTrinket | BgsPlayerEntity | BoardSecret,
		input: SoCInput,
	) => boolean | { hasTriggered: boolean; shouldRecomputeCurrentAttacker: boolean };
}

export interface StartOfCombatCard extends Card {
	startOfCombatTiming?: StartOfCombatTiming;
	startOfCombat: NonNullable<Card['startOfCombat']>;
}
export const hasStartOfCombat = (card: Card): card is StartOfCombatCard =>
	(card as StartOfCombatCard)?.startOfCombat !== undefined;
export type StartOfCombatTiming = 'start-of-combat' | 'pre-combat' | 'illidan';

export interface OnAttackCard extends Card {
	onAttack: (minion: BoardEntity, input: OnAttackInput) => void;
}
export const hasOnAttack = (card: Card): card is OnAttackCard => (card as OnAttackCard)?.onAttack !== undefined;

export interface OnSpawnedCard extends Card {
	onSpawned: (minion: BoardEntity, input: OnSpawnInput) => void;
}
export const hasOnSpawned = (card: Card): card is OnSpawnedCard => (card as OnSpawnedCard)?.onSpawned !== undefined;

export interface OnDespawnedCard extends Card {
	onDespawned: (minion: BoardEntity, input: OnDespawnInput) => void;
}
export const hasOnDespawned = (card: Card): card is OnDespawnedCard =>
	(card as OnDespawnedCard)?.onDespawned !== undefined;

export interface DeathrattleSpawnCard extends Card {
	deathrattleSpawn: (minion: BoardEntity, input: DeathrattleTriggeredInput) => readonly BoardEntity[];
}
export const hasDeathrattleSpawn = (card: Card): card is DeathrattleSpawnCard =>
	(card as DeathrattleSpawnCard)?.deathrattleSpawn !== undefined;

export interface BattlecryCard extends Card {
	battlecry: (minion: BoardEntity, input: BattlecryInput) => void;
}
export const hasBattlecry = (card: Card): card is BattlecryCard => (card as BattlecryCard)?.battlecry !== undefined;

export interface OnBattlecryTriggeredCard extends Card {
	onBattlecryTriggered: (minion: BoardEntity, input: OnBattlecryTriggeredInput) => void;
}
export const hasOnBattlecryTriggered = (card: Card): card is OnBattlecryTriggeredCard =>
	(card as OnBattlecryTriggeredCard)?.onBattlecryTriggered !== undefined;

export interface AvengeCard extends Card {
	avenge: (minion: BoardEntity, input: AvengeInput) => void;
	baseAvengeValue: (cardId: string) => number;
}
export const hasAvenge = (card: Card): card is AvengeCard => (card as AvengeCard)?.avenge !== undefined;

export interface DeathrattleEffectCard extends Card {
	deathrattleEffect: (minion: BoardEntity, input: DeathrattleTriggeredInput) => void;
}
export const hasDeathrattleEffect = (card: Card): card is DeathrattleEffectCard =>
	(card as DeathrattleEffectCard)?.deathrattleEffect !== undefined;

export interface EndOfTurnCard extends Card {
	// Use BattlecryInput because it's the only way end of turn effects are triggered
	endOfTurn: (entity: BoardEntity, input: EndOfTurnInput) => void;
}
export const hasEndOfTurn = (card: Card): card is EndOfTurnCard => (card as EndOfTurnCard)?.endOfTurn !== undefined;
export type EndOfTurnInput = BattlecryInput;
