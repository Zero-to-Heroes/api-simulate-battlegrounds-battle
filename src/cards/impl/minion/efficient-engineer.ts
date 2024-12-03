import { CardIds, GameTag } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { pickRandom } from '../../../services/utils';
import { BattlecryInput } from '../../../simulation/battlecries';
import { BattlecryCard, hasEndOfTurn } from '../../card.interface';
import { cardMappings } from '../_card-mappings';

export const EfficientEngineer: BattlecryCard = {
	cardIds: [CardIds.EfficientEngineer_BG31_301, CardIds.EfficientEngineer_BG31_301_G],
	battlecry: (minion: BoardEntity, input: BattlecryInput) => {
		const mult = minion.cardId === CardIds.EfficientEngineer_BG31_301_G ? 2 : 1;
		for (let i = 0; i < mult; i++) {
			const candidates = input.board
				.filter((e) =>
					input.gameState.allCards.getCard(e.cardId).mechanics?.includes(GameTag[GameTag.END_OF_TURN]),
				)
				.filter(
					(e) =>
						![CardIds.YoungMurkEye_BG22_403, CardIds.YoungMurkEye_BG22_403_G].includes(e.cardId as CardIds),
				);
			const target = pickRandom(candidates);
			if (target) {
				const endOfTurnImpl = cardMappings[target.cardId];
				if (hasEndOfTurn(endOfTurnImpl)) {
					const numberOfLoops = input.board.some((e) => e.cardId === CardIds.DrakkariEnchanter_BG26_ICC_901_G)
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
	},
};
