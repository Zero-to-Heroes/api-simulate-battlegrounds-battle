import { CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../board-entity';
import { VALID_DEATHRATTLE_ENCHANTMENTS } from '../simulate-bgs-battle';
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
				.some((enchantmentId) => VALID_DEATHRATTLE_ENCHANTMENTS.includes(enchantmentId as CardIds))
		) {
			return true;
		}
		return false;
	});
};
