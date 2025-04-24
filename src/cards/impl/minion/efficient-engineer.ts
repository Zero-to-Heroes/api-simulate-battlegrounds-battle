import { AllCardsService, CardIds, GameTag } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { pickRandom } from '../../../services/utils';
import { BattlecryInput } from '../../../simulation/battlecries';
import { BattlecryCard, hasEndOfTurn } from '../../card.interface';
import { cardMappings } from '../_card-mappings';

export const EfficientEngineer: BattlecryCard = {
	cardIds: [CardIds.EfficientEngineer_BG31_301, CardIds.EfficientEngineer_BG31_301_G],
	battlecry: (minion: BoardEntity, input: BattlecryInput) => {
		const mult = minion.cardId === CardIds.EfficientEngineer_BG31_301_G ? 2 : 1;
		const allCards = input.gameState.allCards;
		for (let i = 0; i < mult; i++) {
			const candidates = input.board
				.filter(
					(e) =>
						![CardIds.YoungMurkEye_BG22_403, CardIds.YoungMurkEye_BG22_403_G].includes(e.cardId as CardIds),
				)
				.filter(
					(m) =>
						hasEndOfTurnMechanics(m.cardId, allCards) ||
						m.enchantments.some((e) => hasEndOfTurnMechanics(e.cardId, allCards)),
				);
			const target = pickRandom(candidates);
			if (target) {
				const endOfTurnCandidates = [target.cardId, ...target.enchantments.map((e) => e.cardId)].filter((e) =>
					hasEndOfTurnMechanics(e, allCards),
				);
				for (const cardId of endOfTurnCandidates) {
					const endOfTurnImpl = cardMappings[cardId];
					if (hasEndOfTurn(endOfTurnImpl)) {
						const numberOfLoops = input.board.some(
							(e) => e.cardId === CardIds.DrakkariEnchanter_BG26_ICC_901_G,
						)
							? 3
							: input.board.some((e) => e.cardId === CardIds.DrakkariEnchanter_BG26_ICC_901)
							? 2
							: 1;
						for (let i = 0; i < numberOfLoops; i++) {
							endOfTurnImpl.endOfTurn(target, input);
						}
					}
				}
			}
		}
		return true;
	},
};

const hasEndOfTurnMechanics = (cardId: string, allCards: AllCardsService): boolean => {
	return allCards.getCard(cardId).mechanics?.includes(GameTag[GameTag.END_OF_TURN]);
};
