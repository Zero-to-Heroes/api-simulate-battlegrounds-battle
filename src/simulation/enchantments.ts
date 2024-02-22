import { AllCardsService } from '@firestone-hs/reference-data';
import { BoardEntity } from '../board-entity';

export const fixEnchantments = (entity: BoardEntity, allCards: AllCardsService): BoardEntity => {
	const newEnchantments = (entity.enchantments ?? []).map((enchantment) =>
		isNaN(+enchantment.cardId)
			? enchantment
			: { ...enchantment, cardId: allCards.getCard(+enchantment.cardId)?.id },
	);
	return {
		...entity,
		enchantments: newEnchantments,
	};
};
