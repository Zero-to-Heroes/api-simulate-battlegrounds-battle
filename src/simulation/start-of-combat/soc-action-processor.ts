import { BgsPlayerEntity, BoardTrinket } from '../../bgs-player-entity';
import { BoardEntity } from '../../board-entity';
import { BoardSecret } from '../../board-secret';
import { hasStartOfCombat, StartOfCombatCard, StartOfCombatTiming } from '../../cards/card.interface';
import { cardMappings } from '../../cards/impl/_card-mappings';
import { AnomalousTwin } from '../../cards/impl/anomaly/anomalous-twin';
import { BlessedOrBlighted } from '../../cards/impl/anomaly/blessed-or-blighted';
import { BoonOfBeetles } from '../../cards/impl/bg-spell/boon-of-beetles';
import { ToxicTumbleweed } from '../../cards/impl/bg-spell/toxic-tumbleweed';
import { UpperHand } from '../../cards/impl/bg-spell/upper-hand';
import { AimHigh } from '../../cards/impl/hero-power/aim-high';
import { AimLeft } from '../../cards/impl/hero-power/aim-left';
import { AimLow } from '../../cards/impl/hero-power/aim-low';
import { AimRight } from '../../cards/impl/hero-power/aim-right';
import { AllWillBurn } from '../../cards/impl/hero-power/all-will-burn';
import { EarthInvocation } from '../../cards/impl/hero-power/earth-invocation';
import { EmbraceYourRage } from '../../cards/impl/hero-power/embrace-your-rage';
import { FireInvocation } from '../../cards/impl/hero-power/fire-invocation';
import { LightningInvocation } from '../../cards/impl/hero-power/lightning-invocation';
import { RapidReanimation } from '../../cards/impl/hero-power/rapid-reanimation';
import { RebornRites } from '../../cards/impl/hero-power/reborn-rites';
import { SwattingInsects } from '../../cards/impl/hero-power/swatting-insects';
import { Tentacular } from '../../cards/impl/hero-power/tentacular';
import { WaterInvocation } from '../../cards/impl/hero-power/water-invocation';
import { WaxWarband } from '../../cards/impl/hero-power/wax-warband';
import { AmberGuardian } from '../../cards/impl/minion/amber-guardian';
import { AudaciousAnchor } from '../../cards/impl/minion/audacious-anchor';
import { CarbonicCopy } from '../../cards/impl/minion/carbonic-copy';
import { CorruptedMyrmidon } from '../../cards/impl/minion/corrupted-myrmidon';
import { DiremuckForager } from '../../cards/impl/minion/diremuck-forager';
import { ElderTaggawag } from '../../cards/impl/minion/elder-taggawag';
import { HawkstriderHerald } from '../../cards/impl/minion/hawkstrider-herald';
import { IrateRooster } from '../../cards/impl/minion/irate-rooster';
import { MantidQueen } from '../../cards/impl/minion/mantid-queen';
import { Sandy } from '../../cards/impl/minion/sandy';
import { SunScreener } from '../../cards/impl/minion/sun-screener';
import { TheUninvitedGuest } from '../../cards/impl/minion/the-uninvited-guest';
import { ThousandthPaperDrake } from '../../cards/impl/minion/thousandth-paper-drake';
import { YulonFortuneGranter } from '../../cards/impl/minion/yulon-fortune-granter';
import { EvilTwin } from '../../cards/impl/quest-reward/evil-twin';
import { StaffOfOrigination } from '../../cards/impl/quest-reward/staff-of-origination';
import { StolenGold } from '../../cards/impl/quest-reward/stolen-gold';
import { FleetingVigor } from '../../cards/impl/spell/fleeting-vigor';
import { AutomatonPortrait } from '../../cards/impl/trinket/automaton-portrait';
import { BronzeTimepiece } from '../../cards/impl/trinket/bronze-timepiece';
import { EmeraldDreamcatcher } from '../../cards/impl/trinket/emerald-dreamcatcher';
import { EternalPortrait } from '../../cards/impl/trinket/eternal-portrait';
import { FishySticker } from '../../cards/impl/trinket/fishy-sticker';
import { HoggyBank } from '../../cards/impl/trinket/hoggy-bank';
import { HollyMallet } from '../../cards/impl/trinket/holly-mallet';
import { IronforgeAnvil } from '../../cards/impl/trinket/ironforge-anvil';
import { JarredFrostling } from '../../cards/impl/trinket/jarred-frostling';
import { KarazhanChessSet } from '../../cards/impl/trinket/karazhan-chess-set';
import { RivendarePortrait } from '../../cards/impl/trinket/rivendare-portrait';
import { RustyTrident } from '../../cards/impl/trinket/rusty-trident';
import { ShipInABottle } from '../../cards/impl/trinket/ship-in-a-bottle';
import { SummoningSphere } from '../../cards/impl/trinket/summoning-sphere';
import { TinyfinOnesie } from '../../cards/impl/trinket/tinyfin-onesie';
import { TrainingCertificate } from '../../cards/impl/trinket/training-certificate';
import { ValorousMedallion } from '../../cards/impl/trinket/valorous-medaillion';
import { CardIds } from '../../services/card-ids';
import { processMinionDeath } from '../attack';
import { SoCInput } from './start-of-combat-input';

export const performStartOfCombatAction = (
	cardId: string,
	entity: BoardEntity | BoardTrinket | BgsPlayerEntity | BoardSecret,
	input: SoCInput,
	processDeaths: boolean,
	timing?: StartOfCombatTiming,
): boolean => {
	let hasTriggered:
		| boolean
		| {
				hasTriggered: boolean;
				shouldRecomputeCurrentAttacker: boolean;
		  } = false;
	const promoPortraitCount = getPromoPortraitCount(input.playerEntity);
	for (let i = promoPortraitCount; i >= 0; i--) {
		const card = getStartOfCombatAction(cardId);
		if (!!timing && card?.startOfCombatTiming !== timing) {
			return false;
		}

		const action = card?.startOfCombat;
		if (!!action) {
			hasTriggered = action(entity, input);
			// Always proc it (for promo portrait), and use the hasTriggered for finer control
			onStartOfCombatTriggered(i, cardId, input.playerEntity);
			if (!!hasTriggered) {
				if (processDeaths) {
					processMinionDeath(
						input.playerBoard,
						input.playerEntity,
						input.opponentBoard,
						input.opponentEntity,
						input.gameState,
						// See https://replays.firestoneapp.com/?reviewId=2eacbbc2-7dfa-487b-951d-0fa6d31d175e&turn=25&action=1
						// It looks like it doesn't look for the "summons when space" between Stitched Salvager's SoC and
						// Hawkstrider Herald SoC
						true,
					);
				}
				if (typeof hasTriggered !== 'boolean' && hasTriggered.shouldRecomputeCurrentAttacker) {
					input.currentAttacker =
						input.playerBoard.length > input.opponentBoard.length
							? input.playerIsFriendly
								? 0
								: 1
							: input.opponentBoard.length > input.playerBoard.length
							? input.playerIsFriendly
								? 1
								: 0
							: Math.round(Math.random());
				}
			}
		}
	}
	return !!hasTriggered;
};

// TODO: load all cards on start, then do some programmatic mapping
const getStartOfCombatAction = (cardId: string): StartOfCombatCard => {
	switch (cardId) {
		// Quest rewards
		case CardIds.EvilTwin:
			return EvilTwin;
		case CardIds.StaffOfOrigination_BG24_Reward_312:
			return StaffOfOrigination;
		case CardIds.StolenGold:
			return StolenGold;

		// Trinkets
		case CardIds.HolyMallet_BG30_MagicItem_902:
			return HollyMallet;
		case CardIds.TrainingCertificate_BG30_MagicItem_962:
			return TrainingCertificate;
		case CardIds.ValorousMedallion_BG30_MagicItem_970:
		case CardIds.ValorousMedallion_ValorousMedallionToken_BG30_MagicItem_970t:
			return ValorousMedallion;
		case CardIds.EmeraldDreamcatcher_BG30_MagicItem_542:
			return EmeraldDreamcatcher;
		case CardIds.JarredFrostling_BG30_MagicItem_952:
			return JarredFrostling;
		case CardIds.RustyTrident_BG30_MagicItem_917:
			return RustyTrident;
		case CardIds.HoggyBank_BG30_MagicItem_411:
			return HoggyBank;
		case CardIds.AutomatonPortrait_BG30_MagicItem_303:
			return AutomatonPortrait;
		case CardIds.ShipInABottle_BG30_MagicItem_407:
			return ShipInABottle;
		case CardIds.EternalPortrait_BG30_MagicItem_301:
			return EternalPortrait;
		case CardIds.RivendarePortrait_BG30_MagicItem_310:
			return RivendarePortrait;
		case CardIds.TinyfinOnesie_BG30_MagicItem_441:
			return TinyfinOnesie;
		case CardIds.BronzeTimepiece_BG30_MagicItem_995:
			return BronzeTimepiece;
		case CardIds.IronforgeAnvil_BG30_MagicItem_403:
			return IronforgeAnvil;
		case CardIds.KarazhanChessSet_BG30_MagicItem_972:
			return KarazhanChessSet;
		// case CardIds.FishySticker_BG30_MagicItem_821:
		case CardIds.FishySticker_FishyStickerToken_BG30_MagicItem_821t2:
			return FishySticker;
		case CardIds.SummoningSphere_BGDUO_MagicItem_003:
			return SummoningSphere;

		// Hero powers
		case CardIds.SwattingInsects:
			return SwattingInsects;
		case CardIds.EarthInvocationToken:
			return EarthInvocation;
		case CardIds.WaterInvocationToken:
			return WaterInvocation;
		case CardIds.FireInvocationToken:
			return FireInvocation;
		case CardIds.LightningInvocationToken:
			return LightningInvocation;
		case CardIds.AllWillBurn:
			return AllWillBurn;
		case CardIds.EmbraceYourRage:
			return EmbraceYourRage;
		case CardIds.Ozumat_Tentacular:
			return Tentacular;
		case CardIds.RebornRites:
			return RebornRites;
		case CardIds.TeronGorefiend_RapidReanimation:
			return RapidReanimation;
		case CardIds.WaxWarband:
			return WaxWarband;
		case CardIds.AimLeftToken:
			return AimLeft;
		case CardIds.AimRightToken:
			return AimRight;
		case CardIds.AimLowToken:
			return AimLow;
		case CardIds.AimHighToken:
			return AimHigh;

		// Anomalies
		case CardIds.BlessedOrBlighted_BG27_Anomaly_726:
			return BlessedOrBlighted;
		case CardIds.AnomalousTwin_BG27_Anomaly_560:
			return AnomalousTwin;
		case CardIds.BoonOfBeetles_BG28_603:
			return BoonOfBeetles;

		// Spells
		case CardIds.ToxicTumbleweed_BG28_641:
			return ToxicTumbleweed;
		case CardIds.UpperHand_BG28_573:
			return UpperHand;
		case CardIds.FleetingVigor_BG28_519:
			return FleetingVigor;

		// Minions
		case CardIds.AmberGuardian_BG24_500:
		case CardIds.AmberGuardian_BG24_500_G:
			return AmberGuardian;
		// case CardIds.SanctumRester_BG26_356:
		// case CardIds.SanctumRester_BG26_356_G:
		// 	return SanctumRester;
		case CardIds.CorruptedMyrmidon_BG23_012:
		case CardIds.CorruptedMyrmidon_BG23_012_G:
			return CorruptedMyrmidon;
		case CardIds.MantidQueen_BG22_402:
		case CardIds.MantidQueen_BG22_402_G:
			return MantidQueen;
		case CardIds.CarbonicCopy_BG27_503:
		case CardIds.CarbonicCopy_BG27_503_G:
			return CarbonicCopy;
		case CardIds.DiremuckForager_BG27_556:
		case CardIds.DiremuckForager_BG27_556_G:
			return DiremuckForager;
		case CardIds.HawkstriderHerald_BG27_079:
		case CardIds.HawkstriderHerald_BG27_079_G:
			return HawkstriderHerald;
		case CardIds.AudaciousAnchor_BG28_904:
		case CardIds.AudaciousAnchor_BG28_904_G:
			return AudaciousAnchor;
		case CardIds.IrateRooster_BG29_990:
		case CardIds.IrateRooster_BG29_990_G:
			return IrateRooster;
		case CardIds.ThousandthPaperDrake_BG29_810:
		case CardIds.ThousandthPaperDrake_BG29_810_G:
			return ThousandthPaperDrake;
		case CardIds.YulonFortuneGranter_BG29_811:
		case CardIds.YulonFortuneGranter_BG29_811_G:
			return YulonFortuneGranter;
		// case CardIds.HoardingHatespawn_BG29_872:
		// case CardIds.HoardingHatespawn_BG29_872_G:
		// 	return HoardingHatespawn;
		case CardIds.TheUninvitedGuest_BG29_875:
		case CardIds.TheUninvitedGuest_BG29_875_G:
			return TheUninvitedGuest;
		case CardIds.Sandy_BGDUO_125:
		case CardIds.Sandy_BGDUO_125_G:
			return Sandy;
		case CardIds.ElderTaggawag_TB_BaconShop_HERO_14_Buddy:
		case CardIds.ElderTaggawag_TB_BaconShop_HERO_14_Buddy_G:
			return ElderTaggawag;
		case CardIds.SunScreener_BG30_101:
		case CardIds.SunScreener_BG30_101_G:
			return SunScreener;

		default:
			const candidate = cardMappings[cardId];
			if (hasStartOfCombat(candidate)) {
				return candidate;
			}
			return null;
	}
};

const onStartOfCombatTriggered = (iteration: number, triggeredCardId: string, playerEntity: BgsPlayerEntity) => {
	// Some procs are iso-functional, and don't update the promo portrait
	const promoPortraits = playerEntity.trinkets.filter(
		(t) => t.cardId === CardIds.PromoPortrait_BG30_MagicItem_918 && t.scriptDataNum1 > 0,
	);
	if (promoPortraits.length === 0 || iteration === 0 || iteration > promoPortraits.length) {
		return;
	}

	switch (triggeredCardId) {
		case CardIds.StolenGold:
		case CardIds.HolyMallet_BG30_MagicItem_902:
		case CardIds.EmeraldDreamcatcher_BG30_MagicItem_542:
		case CardIds.EternalPortrait_BG30_MagicItem_301:
		case CardIds.BronzeTimepiece_BG30_MagicItem_995:
		case CardIds.SwattingInsects:
		case CardIds.RebornRites:
		case CardIds.BoonOfBeetles_BG28_603:
			return;
	}

	const promoPortrait = promoPortraits[iteration - 1];
	promoPortrait.scriptDataNum1--;
};

const getPromoPortraitCount = (playerEntity: BgsPlayerEntity) => {
	return playerEntity.trinkets.filter(
		(t) => t.cardId === CardIds.PromoPortrait_BG30_MagicItem_918 && t.scriptDataNum1 > 0,
	).length;
};
