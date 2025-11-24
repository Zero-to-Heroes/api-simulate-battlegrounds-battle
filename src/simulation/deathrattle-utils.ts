import { GameTag } from '@firestone-hs/reference-data';
import { BgsPlayerEntity } from '../bgs-player-entity';
import { BoardEntity } from '../board-entity';
import { CardIds } from '../services/card-ids';
import { isValidDeathrattleEnchantment } from '../simulate-bgs-battle';
import { hasEntityMechanic } from '../utils';
import { FullGameState } from './internal-game-state';

export const getValidDeathrattles = (
	board: BoardEntity[],
	hero: BgsPlayerEntity,
	gameState: FullGameState,
): BoardEntity[] => {
	return board.filter((entity) => hasValidDeathrattle(entity, hero, gameState));
};

export const hasValidDeathrattle = (entity: BoardEntity, hero: BgsPlayerEntity, gameState: FullGameState): boolean => {
	if (hasEntityMechanic(entity, GameTag.DEATHRATTLE, gameState.allCards)) {
		return true;
	}
	if (
		hero.trinkets?.some((t) => t.cardId === CardIds.FelementalPortrait_BG32_MagicItem_830) &&
		(entity.cardId === CardIds.Felemental_BG25_041 || entity.cardId === CardIds.Felemental_BG25_041_G)
	) {
		return true;
	}
	if (entity.rememberedDeathrattles?.length) {
		return true;
	}
	if (
		entity.enchantments &&
		entity.enchantments
			.map((enchantment) => enchantment.cardId)
			.some((enchantmentId) => isValidDeathrattleEnchantment(enchantmentId))
	) {
		return true;
	}
	return false;
};
