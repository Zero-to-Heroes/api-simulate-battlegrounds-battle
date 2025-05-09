import { BoardEntity } from './board-entity';
import { BoardSecret } from './board-secret';

export interface BgsPlayerEntity {
	cardId: string;
	// readonly nonGhostCardId?: string;
	hpLeft: number;
	readonly tavernTier: number;
	heroPowers: readonly BgsHeroPower[];

	/** @deprecated */
	heroPowerId?: string | undefined | null;
	/** @deprecated */
	readonly heroPowerEntityId?: number;
	/** @deprecated */
	readonly heroPowerUsed: boolean;
	/** @deprecated */
	readonly heroPowerInfo?: number | string;
	/** @deprecated */
	heroPowerInfo2?: number;
	/** @deprecated */
	avengeCurrent?: number;
	/** @deprecated */
	avengeDefault?: number;
	// For Ozumat
	/** @deprecated */
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
	globalInfo?: BgsPlayerGlobalInfo;
	startOfCombatDone?: boolean;

	deadEyeDamageDone?: number;
	rapidReanimationMinion?: BoardEntity;
	rapidReanimationIndexFromLeft?: number;
	rapidReanimationIndexFromRight?: number;
}

export interface BgsHeroPower {
	cardId: string;
	entityId: number;
	used: boolean;
	info: number | string;
	info2: number;
	avengeCurrent?: number;
	avengeDefault?: number;
	// For Ozumat's Tentacular
	activated?: boolean;
}

export interface BgsPlayerGlobalInfo {
	EternalKnightsDeadThisGame?: number;
	SanlaynScribesDeadThisGame?: number;
	UndeadAttackBonus?: number;
	FrostlingBonus?: number;
	BloodGemAttackBonus?: number;
	BloodGemHealthBonus?: number;
	GoldrinnBuffAtk?: number;
	GoldrinnBuffHealth?: number;
	SpellsCastThisGame?: number;
	TavernSpellsCastThisGame?: number;
	PiratesPlayedThisGame?: number;
	BeastsSummonedThisGame?: number;
	MagnetizedThisGame?: number;
	PiratesSummonedThisGame?: number;
	PirateAttackBonus?: number;
	AstralAutomatonsSummonedThisGame?: number;
	ChoralAttackBuff?: number;
	ChoralHealthBuff?: number;
	BeetleAttackBuff?: number;
	BeetleHealthBuff?: number;
	ElementalAttackBuff?: number;
	ElementalHealthBuff?: number;
	TavernSpellHealthBuff?: number;
	TavernSpellAttackBuff?: number;
	MutatedLasherAttackBuff?: number;
	MutatedLasherHealthBuff?: number;
	BattlecriesTriggeredThisGame?: number;
	FriendlyMinionsDeadLastCombat?: number;
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
	scriptDataNum2?: number;
	scriptDataNum6?: number;
	rememberedMinion?: BoardEntity;
	avengeDefault?: number;
	avengeCurrent?: number;
}
