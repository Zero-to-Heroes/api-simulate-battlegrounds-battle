import { BgsPlayerEntity, BgsQuestEntity, BoardTrinket } from '../bgs-player-entity';
import { BoardEntity } from '../board-entity';
import { BoardSecret } from '../board-secret';
import { OnDivineShieldUpdatedInput } from '../keywords/divine-shield';
import { OnRebornUpdatedInput } from '../keywords/reborn';
import { OnStealthUpdatedInput } from '../keywords/stealth';
import { OnTauntUpdatedInput } from '../keywords/taunt';
import { OnVenomousUpdatedInput } from '../keywords/venomous';
import { OnWindfuryUpdatedInput } from '../keywords/windfury';
import {
	OnDespawnInput,
	OnOtherSpawnAuraInput,
	OnOtherSpawnInput,
	OnSpawnInput,
} from '../simulation/add-minion-to-board';
import { OnDeathInput, OnMinionKilledInput } from '../simulation/attack';
import { AvengeInput } from '../simulation/avenge';
import { BattlecryInput, OnBattlecryTriggeredInput } from '../simulation/battlecries';
import { OnCardAddedToHandInput } from '../simulation/cards-in-hand';
import { AfterHeroDamagedInput } from '../simulation/damage-to-hero';
import { DeathrattleTriggeredInput } from '../simulation/deathrattle-on-trigger';
import { OnAttackInput } from '../simulation/on-attack';
import { OnMinionAttackedInput } from '../simulation/on-being-attacked';
import { RebornEffectInput } from '../simulation/reborn';
import { SoCInput } from '../simulation/start-of-combat/start-of-combat-input';
import { OnStatsChangedInput } from '../simulation/stats';

export interface Card {
	// Maybe should make this mandatory
	cardIds?: readonly string[];
	startOfCombat?: (
		trinket: BoardEntity | BoardTrinket | BgsPlayerEntity | BoardSecret,
		input: SoCInput,
	) => boolean | { hasTriggered: boolean; shouldRecomputeCurrentAttacker: boolean };
}

export interface DefaultChargesCard extends Card {
	defaultCharges: (entity: BoardEntity) => number;
}
export const hasDefaultCharges = (card: Card): card is DefaultChargesCard =>
	(card as DefaultChargesCard)?.defaultCharges !== undefined;

export interface StartOfCombatCard extends Card {
	startOfCombatTiming?: StartOfCombatTiming;
	startOfCombat: NonNullable<Card['startOfCombat']>;
}
export const hasStartOfCombat = (card: Card): card is StartOfCombatCard =>
	(card as StartOfCombatCard)?.startOfCombat !== undefined;
export type StartOfCombatTiming = 'start-of-combat' | 'pre-combat' | 'illidan';

// Whenever this attacks
export interface OnAttackCard extends Card {
	onAnyMinionAttack: (
		minion: BoardEntity,
		input: OnAttackInput,
	) => { dmgDoneByAttacker: number; dmgDoneByDefender: number };
}
export const hasOnAttack = (card: Card): card is OnAttackCard =>
	(card as OnAttackCard)?.onAnyMinionAttack !== undefined;

export interface OnMinionAttackedCard extends Card {
	onAttacked: (minion: BoardEntity, input: OnMinionAttackedInput) => void;
}
export const hasOnMinionAttacked = (card: Card): card is OnMinionAttackedCard =>
	(card as OnMinionAttackedCard)?.onAttacked !== undefined;

export interface OnSpawnedCard extends Card {
	onSpawned: (minion: BoardEntity, input: OnSpawnInput) => void;
}
export const hasOnSpawned = (card: Card): card is OnSpawnedCard => (card as OnSpawnedCard)?.onSpawned !== undefined;

export interface OnOtherSpawnedAuraCard extends Card {
	onOtherSpawnedAura: (minion: BoardEntity, input: OnOtherSpawnAuraInput) => void;
}
export const hasOnOtherAuraSpawned = (card: Card): card is OnOtherSpawnedAuraCard =>
	(card as OnOtherSpawnedAuraCard)?.onOtherSpawnedAura !== undefined;

export interface OnOtherSpawnedCard extends Card {
	onOtherSpawned: (minion: BoardEntity, input: OnOtherSpawnInput) => void;
}
export const hasOnOtherSpawned = (card: Card): card is OnOtherSpawnedCard =>
	(card as OnOtherSpawnedCard)?.onOtherSpawned !== undefined;

export interface AfterOtherSpawnedCard extends Card {
	afterOtherSpawned: (minion: BoardEntity, input: OnOtherSpawnInput) => void;
}
export const hasAfterOtherSpawned = (card: Card): card is AfterOtherSpawnedCard =>
	(card as AfterOtherSpawnedCard)?.afterOtherSpawned !== undefined;

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

export interface RebornEffectCard extends Card {
	rebornEffect: (minion: BoardEntity, input: RebornEffectInput) => void;
}
export const hasRebornEffect = (card: Card): card is RebornEffectCard =>
	(card as RebornEffectCard)?.rebornEffect !== undefined;

export interface OnBattlecryTriggeredCard extends Card {
	onBattlecryTriggered: (minion: BoardEntity, input: OnBattlecryTriggeredInput) => void;
}
export const hasOnBattlecryTriggered = (card: Card): card is OnBattlecryTriggeredCard =>
	(card as OnBattlecryTriggeredCard)?.onBattlecryTriggered !== undefined;

export interface AvengeCard extends Card {
	avenge: (minion: BoardEntity, input: AvengeInput) => void | readonly BoardEntity[];
	baseAvengeValue: (cardId: string) => number;
}
export const hasAvenge = (card: Card): card is AvengeCard => (card as AvengeCard)?.avenge !== undefined;

export interface DeathrattleEffectCard extends Card {
	deathrattleEffect: (minion: BoardEntity, input: DeathrattleTriggeredInput) => void;
}
export const hasDeathrattleEffect = (card: Card): card is DeathrattleEffectCard =>
	(card as DeathrattleEffectCard)?.deathrattleEffect !== undefined;

export interface DeathrattleEnchantmentEffectCard extends Card {
	deathrattleEffectEnchantmentEffect: (
		minion: { cardId: string; originEntityId?: number; repeats?: number },
		input: DeathrattleTriggeredInput,
	) => void;
	cardIds: readonly string[];
}
export const hasDeathrattleEnchantmentEffect = (card: Card): card is DeathrattleEnchantmentEffectCard =>
	(card as DeathrattleEnchantmentEffectCard)?.deathrattleEffectEnchantmentEffect !== undefined;

export interface DeathrattleSpawnEnchantmentCard extends Card {
	deathrattleSpawnEnchantmentEffect: (
		minion: { cardId: string; originEntityId?: number; repeats?: number },
		input: DeathrattleTriggeredInput,
	) => readonly BoardEntity[];
	cardIds: readonly string[];
}
export const hasDeathrattleSpawnEnchantment = (card: Card): card is DeathrattleSpawnEnchantmentCard =>
	(card as DeathrattleSpawnEnchantmentCard)?.deathrattleSpawnEnchantmentEffect !== undefined;

export interface OnCardAddedToHandCard extends Card {
	onCardAddedToHand: (entity: BoardEntity | BgsQuestEntity, input: OnCardAddedToHandInput) => void;
}
export const hasOnCardAddedToHand = (card: Card): card is OnCardAddedToHandCard =>
	(card as OnCardAddedToHandCard)?.onCardAddedToHand !== undefined;

export interface EndOfTurnCard extends Card {
	// Use BattlecryInput because it's the only way end of turn effects are triggered
	endOfTurn: (entity: BoardEntity, input: EndOfTurnInput) => void;
}
export const hasEndOfTurn = (card: Card): card is EndOfTurnCard => (card as EndOfTurnCard)?.endOfTurn !== undefined;
export type EndOfTurnInput = BattlecryInput;

export interface OnDivineShieldUpdatedCard extends Card {
	onDivineShieldUpdated: (entity: BoardEntity, input: OnDivineShieldUpdatedInput) => void;
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

export interface OnStatsChangedCard extends Card {
	onStatsChanged: (entity: BoardEntity, input: OnStatsChangedInput) => void;
}
export const hasOnStatsChanged = (card: Card): card is OnStatsChangedCard =>
	(card as OnStatsChangedCard)?.onStatsChanged !== undefined;

export interface AfterHeroDamagedCard extends Card {
	afterHeroDamaged: (entity: BoardEntity, input: AfterHeroDamagedInput) => void;
}
export const hasAfterHeroDamaged = (card: Card): card is AfterHeroDamagedCard =>
	(card as AfterHeroDamagedCard)?.afterHeroDamaged !== undefined;

export interface OnDeathCard extends Card {
	onDeath: (entity: BoardEntity, input: OnDeathInput) => void;
}
export const hasOnDeath = (card: Card): card is OnDeathCard => (card as OnDeathCard)?.onDeath !== undefined;

export interface OnMinionKilledCard extends Card {
	onMinionKilled: (
		entity: BoardEntity,
		input: OnMinionKilledInput,
	) => { dmgDoneByAttacker: number; dmgDoneByDefender: number };
}
export const hasOnMinionKilled = (card: Card): card is OnMinionKilledCard =>
	(card as OnMinionKilledCard)?.onMinionKilled !== undefined;
