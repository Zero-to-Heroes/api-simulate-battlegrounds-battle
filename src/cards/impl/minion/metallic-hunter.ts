import { CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { addCardsInHand } from '../../../simulation/cards-in-hand';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { DeathrattleEffectCard } from '../../card.interface';

export const MetallicHunter: DeathrattleEffectCard = {
	cardIds: [CardIds.MetallicHunter_BG32_170, CardIds.MetallicHunter_BG32_170_G],
	deathrattleEffect: (minion: BoardEntity, input: DeathrattleTriggeredInput) => {
		const mult = minion.cardId === CardIds.MetallicHunter_BG32_170_G ? 2 : 1;
		const cardsToAdd = Array(mult).fill(CardIds.PointyArrow_EBG_Spell_014);
		addCardsInHand(input.boardWithDeadEntityHero, input.boardWithDeadEntity, cardsToAdd, input.gameState);
	},
};
