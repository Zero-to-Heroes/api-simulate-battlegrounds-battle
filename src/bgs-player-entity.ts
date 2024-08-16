import { BoardEntity } from './board-entity';
import { BoardSecret } from './board-secret';

export interface BgsPlayerEntity {
	readonly cardId: string;
	readonly nonGhostCardId?: string;
	hpLeft: number;
	readonly tavernTier: number;

	readonly heroPowerId?: string | undefined | null;
	readonly heroPowerEntityId?: number;
	readonly heroPowerUsed: boolean;
	readonly heroPowerInfo?: number | string;
	heroPowerInfo2?: number;
	// For Ozumat
	heroPowerActivated?: boolean;

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
	trinkets?: BoardTrinket[];
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
	PirateAttackBonus?: number;
	ChoralAttackBuff?: number;
	ChoralHealthBuff?: number;
	FrostlingBonus?: number;
	BloodGemAttackBonus?: number;
	BloodGemHealthBonus?: number;
	GoldrinnBuffAtk?: number;
	GoldrinnBuffHealth?: number;
	TavernSpellsCastThisGame?: number;
	PiratesPlayedThisGame?: number;
	AstralAutomatonsSummonedThisGame?: number;
}

export interface BgsQuestEntity {
	CardId: string;
	RewardDbfId: number;
	ProgressCurrent: number;
	ProgressTotal: number;
}

export interface BoardTrinket {
	cardId: string;
	entityId: number;
	scriptDataNum1: number;
	rememberedMinion?: BoardEntity;
	avengeDefault?: number;
	avengeCurrent?: number;
}
