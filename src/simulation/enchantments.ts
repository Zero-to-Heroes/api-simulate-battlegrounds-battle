import { AllCardsService, CardType } from '@firestone-hs/reference-data';
import { BoardEntity } from '../board-entity';

export const fixEnchantments = (entity: BoardEntity, allCards: AllCardsService): BoardEntity => {
	const newEnchantments = (entity.enchantments ?? [])
		.map((enchantment) =>
			isNaN(+enchantment.cardId)
				? enchantment
				: {
						...enchantment,
						cardId: getEnchantmentForDbfId(+enchantment.cardId, allCards),
				  },
		)
		.map((enchantment, index) => ({
			...enchantment,
			timing: enchantment.timing || entity.entityId + index + 1,
		}));
	return {
		...entity,
		enchantments: newEnchantments,
		pendingAttackBuffs: [],
	};
};

const getEnchantmentForDbfId = (dbfId: number, allCards: AllCardsService): string => {
	const refCard = allCards.getCard(dbfId);
	if (refCard.type?.toUpperCase() === CardType[CardType.ENCHANTMENT]) {
		return refCard.id;
	}

	// Otherwise, we need to figure out the root
	return allCards.getCard(refCard.enchantmentDbfId)?.id ?? allCards.getCard(dbfId)?.id;
};
