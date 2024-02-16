import { BoardEntity } from './board-entity';
import { BoardSecret } from './board-secret';

export interface BgsPlayerEntity {
	readonly cardId: string;
	readonly nonGhostCardId?: string;
	readonly hpLeft: number;
	readonly tavernTier: number;
	readonly heroPowerId?: string | undefined | null;
	readonly heroPowerUsed: boolean;
	readonly heroPowerInfo?: number | string;
	readonly heroPowerInfo2?: number;
	friendly?: boolean;
	entityId?: number;
	questEntities: BgsQuestEntity[];
	questRewards?: string[];
	questRewardEntities?: {
		cardId: string;
		avengeDefault?: number;
		avengeCurrent?: number;
		scriptDataNum1: number;
	}[];
	hand?: BoardEntity[];
	secrets?: BoardSecret[];
	avengeCurrent?: number;
	avengeDefault?: number;
	globalInfo?: BgsPlayerGlobalInfo;

	deadEyeDamageDone?: number;
	rapidReanimationMinion?: BoardEntity;
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
}

export interface BgsQuestEntity {
	CardId: string;
	RewardDbfId: number;
	ProgressCurrent: number;
	ProgressTotal: number;
}
