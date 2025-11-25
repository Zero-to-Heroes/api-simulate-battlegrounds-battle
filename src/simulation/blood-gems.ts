import { BgsPlayerEntity, BoardTrinket } from '../bgs-player-entity';
import { BoardEntity } from '../board-entity';
import { hasPlayedBloodGemsOnAny, hasPlayedBloodGemsOnMe } from '../cards/card.interface';
import { cardMappings } from '../cards/impl/_card-mappings';
import { updateDivineShield } from '../keywords/divine-shield';
import { CardIds } from '../services/card-ids';
import { findLast, pickRandom } from '../services/utils';
import { getMinionsOfDifferentTypes } from '../utils';
import { FullGameState } from './internal-game-state';
import { modifyStats } from './stats';

export const playBloodGemsOn = (
	source: BoardEntity | BoardTrinket | BgsPlayerEntity,
	target: BoardEntity,
	quantity: number,
	board: BoardEntity[],
	hero: BgsPlayerEntity,
	otherBoard: BoardEntity[],
	otherHero: BgsPlayerEntity,
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

	applyBloodGemEnchantment(
		CardIds.BloodGem_BloodGemEnchantment,
		target,
		source,
		quantity,
		bloodGemAttack,
		bloodGemHealth,
	);
	applyBloodGemEnchantment(
		CardIds.BloodGem_BloodGemsEnchantment,
		target,
		source,
		quantity,
		bloodGemAttack,
		bloodGemHealth,
	);

	// This seems to be a single "modifyStats" call
	// 33.6 https://replays.firestoneapp.com/?reviewId=51f93537-182d-4fb8-bf41-1b4429341e01&turn=19&action=3
	modifyStats(target, null, quantity * bloodGemAttack, quantity * bloodGemHealth, board, hero, gameState, false);
	// for (let i = 0; i < quantity; i++) {
	// }

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
					playBloodGemsOn(
						target,
						roogugTarget,
						roogugBuff,
						board,
						hero,
						otherBoard,
						otherHero,
						gameState,
						false,
					);
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
					playBloodGemsOn(
						target,
						candidate,
						aggemGemsToPlay,
						board,
						hero,
						otherBoard,
						otherHero,
						gameState,
						false,
					);
				}
				break;
			default:
				const playedBloodGemsOnMeImpl = cardMappings[target.cardId];
				if (hasPlayedBloodGemsOnMe(playedBloodGemsOnMeImpl)) {
					playedBloodGemsOnMeImpl.playedBloodGemsOnMe(target, {
						board: board,
						hero: hero,
						otherBoard: otherBoard,
						otherHero: otherHero,
						gameState: gameState,
					});
				}
		}

		for (const boardEntity of board) {
			const playedBloodGemsOnAnyImpl = cardMappings[boardEntity.cardId];
			if (hasPlayedBloodGemsOnAny(playedBloodGemsOnAnyImpl)) {
				playedBloodGemsOnAnyImpl.playedBloodGemsOnAny(boardEntity, {
					source: source,
					target: target,
					board: board,
					hero: hero,
					otherBoard: otherBoard,
					otherHero: otherHero,
					gameState: gameState,
				});
			}
		}
	}
};

export const applyBloodGemEnchantment = (
	enchantmentCardId: string,
	target: BoardEntity,
	source: BoardEntity | BoardTrinket | BgsPlayerEntity,
	quantity: number,
	bloodGemAttack: number,
	bloodGemHealth: number,
) => {
	let enchantment = findLast(target.enchantments, (e) => e.cardId === enchantmentCardId);
	if (!enchantment) {
		enchantment = {
			cardId: enchantmentCardId,
			originEntityId: source.entityId,
			timing: 0,
			tagScriptDataNum1: 0,
			tagScriptDataNum2: 0,
		};
		target.enchantments.push(enchantment);
	}
	for (let i = 0; i < quantity; i++) {
		enchantment.tagScriptDataNum1 += bloodGemAttack;
		enchantment.tagScriptDataNum2 += bloodGemHealth;
	}
};

export interface PlayedBloodGemsOnMeInput {
	board: BoardEntity[];
	hero: BgsPlayerEntity;
	otherBoard: BoardEntity[];
	otherHero: BgsPlayerEntity;
	gameState: FullGameState;
}

export interface PlayedBloodGemsOnAnyInput {
	source: BoardEntity | BoardTrinket | BgsPlayerEntity;
	target: BoardEntity;
	board: BoardEntity[];
	hero: BgsPlayerEntity;
	otherBoard: BoardEntity[];
	otherHero: BgsPlayerEntity;
	gameState: FullGameState;
}
