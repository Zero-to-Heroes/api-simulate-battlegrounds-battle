import { CardIds } from '@firestone-hs/reference-data';
import { BgsPlayerEntity, BoardTrinket } from '../bgs-player-entity';
import { BoardEntity } from '../board-entity';
import { updateDivineShield } from '../keywords/divine-shield';
import { pickRandom } from '../services/utils';
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

	const bloodGemAttack =
		1 +
		(hero.globalInfo?.BloodGemAttackBonus ?? 0) +
		hero.trinkets.filter((t) => t.cardId === CardIds.GreatBoarSticker_BG30_MagicItem_988).length * 3 +
		hero.trinkets.filter((t) => t.cardId === CardIds.GreatBoarSticker_GreatBoarStickerToken_BG30_MagicItem_988t)
			.length *
			2;
	const bloodGemHealth =
		1 +
		(hero.globalInfo?.BloodGemHealthBonus ?? 0) +
		hero.trinkets.filter((t) => t.cardId === CardIds.GreatBoarSticker_GreatBoarStickerToken_BG30_MagicItem_988t)
			.length *
			2;

	let bloodGemEnchantment =
		target.enchantments?.find((e) => e.cardId === CardIds.BloodGem_BloodGemEnchantment) ??
		target.enchantments?.find((e) => e.cardId === CardIds.BloodGem_BloodGemsEnchantment);
	if (!bloodGemEnchantment) {
		bloodGemEnchantment = {
			cardId: CardIds.BloodGem_BloodGemEnchantment,
			originEntityId: source.entityId,
			timing: 0,
			tagScriptDataNum1: 0,
			tagScriptDataNum2: 0,
		};
		target.enchantments = target.enchantments ?? [];
		target.enchantments.push(bloodGemEnchantment);
	}

	for (let i = 0; i < quantity; i++) {
		modifyStats(target, null, bloodGemAttack, bloodGemHealth, board, hero, gameState, false);
		bloodGemEnchantment.tagScriptDataNum1 += bloodGemAttack;
		bloodGemEnchantment.tagScriptDataNum2 += bloodGemHealth;
	}

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
