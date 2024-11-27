import { BoardEntity } from '../board-entity';
import { isValidDeathrattleEnchantment } from '../simulate-bgs-battle';
import { hasMechanic } from '../utils';
import { FullGameState } from './internal-game-state';

export const getValidDeathrattles = (board: BoardEntity[], gameState: FullGameState): BoardEntity[] => {
	return board.filter((entity) => {
		if (hasMechanic(gameState.allCards.getCard(entity.cardId), 'DEATHRATTLE')) {
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
