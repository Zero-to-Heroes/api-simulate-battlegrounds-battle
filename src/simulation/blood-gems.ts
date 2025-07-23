import { CardIds } from '@firestone-hs/reference-data';
import { BgsPlayerEntity, BoardTrinket } from '../bgs-player-entity';
import { BoardEntity } from '../board-entity';
import { updateDivineShield } from '../keywords/divine-shield';
import { findLast, pickRandom } from '../services/utils';
import { getMinionsOfDifferentTypes } from '../utils';
import { FullGameState } from './internal-game-state';
import { modifyStats } from './stats';

export const playBloodGemsOn = (
	source: BoardEntity | BoardTrinket,
	target: BoardEntity,
	quantity: number,
	board: BoardEntity[],
	hero: BgsPlayerEntity,
	gameState: FullGameState,
	registerTarget = true,
) => {
	if (registerTarget) {
		gameState.spectator.registerPowerTarget(source, target, board, null, null);
	}

	const bloodGemBaseAttack =
		1 +
		(hero.globalInfo?.BloodGemAttackBonus ?? 0) +
		hero.trinkets.filter((t) => t.cardId === CardIds.GreatBoarSticker_BG30_MagicItem_988).length * 3 +
		hero.trinkets.filter((t) => t.cardId === CardIds.GreatBoarSticker_GreatBoarStickerToken_BG30_MagicItem_988t)
			.length *
			2;
	const bloodGemBaseHealth =
		1 +
		(hero.globalInfo?.BloodGemHealthBonus ?? 0) +
		hero.trinkets.filter((t) => t.cardId === CardIds.GreatBoarSticker_GreatBoarStickerToken_BG30_MagicItem_988t)
			.length *
			2;

	const crones = board.filter((e) => e.cardId === CardIds.NeedlingCrone_BG32_432).length;
	const goldenCrones = board.filter((e) => e.cardId === CardIds.NeedlingCrone_BG32_432_G).length;
	const cronesMult = goldenCrones > 0 ? 3 : crones > 0 ? 2 : 1;
	const bloodGemAttack = bloodGemBaseAttack * cronesMult;
	const bloodGemHealth = bloodGemBaseHealth * cronesMult;

	const applyBloodGemEnchantment = (enchantmentCardId: string) => {
		let enchantment = findLast(target.enchantments, (e) => e.cardId === enchantmentCardId);
		if (!enchantment) {
			enchantment = {
				cardId: enchantmentCardId,
				originEntityId: source.entityId,
				timing: 0,
				tagScriptDataNum1: 0,
				tagScriptDataNum2: 0,
			};
			target.enchantments = target.enchantments ?? [];
			target.enchantments.push(enchantment);
		}
		for (let i = 0; i < quantity; i++) {
			modifyStats(target, null, bloodGemAttack, bloodGemHealth, board, hero, gameState, false);
			enchantment.tagScriptDataNum1 += bloodGemAttack;
			enchantment.tagScriptDataNum2 += bloodGemHealth;
		}
	};

	applyBloodGemEnchantment(CardIds.BloodGem_BloodGemEnchantment);
	applyBloodGemEnchantment(CardIds.BloodGem_BloodGemsEnchantment);

	for (let i = 0; i < quantity; i++) {
		switch (target.cardId) {
			case CardIds.ToughTusk_BG20_102:
			case CardIds.ToughTusk_BG20_102_G:
				if (!target.divineShield) {
					updateDivineShield(target, board, hero, null, true, gameState);
					gameState.spectator.registerPowerTarget(target, target, board, null, null);
				}
				break;
			case CardIds.GeomagusRoogug_BG28_583:
			case CardIds.GeomagusRoogug_BG28_583_G:
				const roogugTargets = board.filter(
					(e) =>
						e.cardId !== CardIds.GeomagusRoogug_BG28_583 && e.cardId !== CardIds.GeomagusRoogug_BG28_583_G,
				);
				const roogugTarget = pickRandom(roogugTargets);
				if (roogugTarget) {
					const roogugBuff = target.cardId === CardIds.GeomagusRoogug_BG28_583_G ? 2 : 1;
					playBloodGemsOn(target, roogugTarget, roogugBuff, board, hero, gameState, false);
				}
				break;
			case CardIds.AggemThorncurse_BG20_302:
			case CardIds.AggemThorncurse_BG20_302_G:
				// console.debug('playing blood gem on Aggem Thorncurse', target.cardId);
				const aggemGemsToPlay = target.cardId === CardIds.AggemThorncurse_BG20_302_G ? 2 : 1;
				const candidates = getMinionsOfDifferentTypes(
					board.filter(
						(e) =>
							e.cardId !== CardIds.AggemThorncurse_BG20_302 &&
							e.cardId !== CardIds.AggemThorncurse_BG20_302_G,
					),
					hero,
					gameState,
				);
				for (const candidate of candidates) {
					playBloodGemsOn(target, candidate, aggemGemsToPlay, board, hero, gameState, false);
				}
				break;
		}
	}
};
