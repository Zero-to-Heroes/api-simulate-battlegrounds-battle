import { CardIds } from '@firestone-hs/reference-data';
import { BgsPlayerEntity } from '../bgs-player-entity';
import { BoardEntity } from '../board-entity';
import { isValidDeathrattleEnchantment } from '../simulate-bgs-battle';
import { TempCardIds } from '../temp-card-ids';
import { hasMechanic } from '../utils';
import { FullGameState } from './internal-game-state';

export const getValidDeathrattles = (
	board: BoardEntity[],
	hero: BgsPlayerEntity,
	gameState: FullGameState,
): BoardEntity[] => {
	return board.filter((entity) => {
		if (hasMechanic(gameState.allCards.getCard(entity.cardId), 'DEATHRATTLE')) {
			return true;
		}
		if (
			hero.trinkets?.some((t) => t.cardId === TempCardIds.FelementalPortrait) &&
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
	});
};
