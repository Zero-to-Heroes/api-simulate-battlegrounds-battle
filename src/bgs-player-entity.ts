import { BoardEntity } from './board-entity';
import { BoardSecret } from './board-secret';

export interface BgsPlayerEntity {
	readonly cardId: string;
	readonly nonGhostCardId?: string;
	readonly hpLeft: number;
	readonly tavernTier: number;
	readonly heroPowerId?: string | undefined | null;
	readonly heroPowerEntityId?: number;
	readonly heroPowerUsed: boolean;
	readonly heroPowerInfo?: number | string;
	heroPowerInfo2?: number;
	friendly?: boolean;
	entityId?: number;
	questEntities: BgsQuestEntity[];
	questRewards?: string[];
	questRewardEntities?: {
		cardId: string;
		entityId: number;
		avengeDefault?: number;
		avengeCurrent?: number;
		scriptDataNum1: number;
	}[];
	hand?: BoardEntity[];
	secrets?: BoardSecret[];
	avengeCurrent?: number;
	avengeDefault?: number;
	globalInfo?: BgsPlayerGlobalInfo;
	startOfCombatDone?: boolean;

	deadEyeDamageDone?: number;
	rapidReanimationMinion?: BoardEntity;
	rapidReanimationIndexFromLeft?: number;
	rapidReanimationIndexFromRight?: number;
}

export interface BgsPlayerGlobalInfo {
	EternalKnightsDeadThisGame?: number;
	UndeadAttackBonus?: number;
	ChoralAttackBuff?: number;
	ChoralHealthBuff?: number;
	FrostlingBonus?: number;
	BloodGemAttackBonus?: number;
	BloodGemHealthBonus?: number;
	GoldrinnBuffAtk?: number;
	GoldrinnBuffHealth?: number;
	TavernSpellsCastThisGame?: number;
	PiratesPlayedThisGame?: number;
}

export interface BgsQuestEntity {
	CardId: string;
	RewardDbfId: number;
	ProgressCurrent: number;
	ProgressTotal: number;
}
