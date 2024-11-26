import { BgsPlayerEntity, BoardTrinket } from '../bgs-player-entity';
import { BoardEntity } from '../board-entity';
import { BoardSecret } from '../board-secret';
import { OnDivineShieldUpdatedInput } from '../keywords/divine-shield';
import { OnRebornUpdatedInput } from '../keywords/reborn';
import { OnStealthUpdatedInput } from '../keywords/stealth';
import { OnTauntUpdatedInput } from '../keywords/taunt';
import { OnVenomousUpdatedInput } from '../keywords/venomous';
import { OnWindfuryUpdatedInput } from '../keywords/windfury';
import { OnDespawnInput, OnOtherSpawnInput, OnSpawnInput } from '../simulation/add-minion-to-board';
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

export interface OnOtherSpawnedCard extends Card {
	onOtherSpawned: (minion: BoardEntity, input: OnOtherSpawnInput) => void;
}
export const hasOnOtherSpawned = (card: Card): card is OnOtherSpawnedCard =>
	(card as OnOtherSpawnedCard)?.onOtherSpawned !== undefined;

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

export interface OnDivineShieldUpdatedCard extends Card {
	onDivineShieldUpdated: (
		entity: BoardEntity,
		impactedEntity: BoardEntity,
		previousValue: boolean,
		input: OnDivineShieldUpdatedInput,
	) => void;
}
export const hasOnDivineShieldUpdated = (card: Card): card is OnDivineShieldUpdatedCard =>
	(card as OnDivineShieldUpdatedCard)?.onDivineShieldUpdated !== undefined;

export interface OnTauntUpdatedCard extends Card {
	onTauntUpdated: (
		entity: BoardEntity,
		impactedEntity: BoardEntity,
		previousValue: boolean,
		input: OnTauntUpdatedInput,
	) => void;
}
export const hasOnTauntUpdated = (card: Card): card is OnTauntUpdatedCard =>
	(card as OnTauntUpdatedCard)?.onTauntUpdated !== undefined;

export interface OnRebornUpdatedCard extends Card {
	onRebornUpdated: (
		entity: BoardEntity,
		impactedEntity: BoardEntity,
		previousValue: boolean,
		input: OnRebornUpdatedInput,
	) => void;
}
export const hasOnRebornUpdated = (card: Card): card is OnRebornUpdatedCard =>
	(card as OnRebornUpdatedCard)?.onRebornUpdated !== undefined;

export interface OnStealthUpdatedCard extends Card {
	onStealthUpdated: (
		entity: BoardEntity,
		impactedEntity: BoardEntity,
		previousValue: boolean,
		input: OnStealthUpdatedInput,
	) => void;
}
export const hasOnStealthUpdated = (card: Card): card is OnStealthUpdatedCard =>
	(card as OnStealthUpdatedCard)?.onStealthUpdated !== undefined;

export interface OnVenomousUpdatedCard extends Card {
	onVenomousUpdated: (
		entity: BoardEntity,
		impactedEntity: BoardEntity,
		previousValue: boolean,
		input: OnVenomousUpdatedInput,
	) => void;
}
export const hasOnVenomousUpdated = (card: Card): card is OnVenomousUpdatedCard =>
	(card as OnVenomousUpdatedCard)?.onVenomousUpdated !== undefined;

export interface OnWindfuryUpdatedCard extends Card {
	onWindfuryUpdated: (
		entity: BoardEntity,
		impactedEntity: BoardEntity,
		previousValue: boolean,
		input: OnWindfuryUpdatedInput,
	) => void;
}
export const hasOnWindfuryUpdated = (card: Card): card is OnWindfuryUpdatedCard =>
	(card as OnWindfuryUpdatedCard)?.onWindfuryUpdated !== undefined;
