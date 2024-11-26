import { CardIds, GameTag } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { pickRandom } from '../../../services/utils';
import { BattlecryInput } from '../../../simulation/battlecries';
import { BattlecryCard, hasEndOfTurn } from '../../card.interface';
import { cardMappings } from '../_card-mappings';

export const EfficientEngineer: BattlecryCard = {
	battlecry: (minion: BoardEntity, input: BattlecryInput) => {
		const candidates = input.board
			.filter((e) => input.gameState.allCards.getCard(e.cardId).mechanics?.includes(GameTag[GameTag.END_OF_TURN]))
			.filter(
				(e) => ![CardIds.YoungMurkEye_BG22_403, CardIds.YoungMurkEye_BG22_403_G].includes(e.cardId as CardIds),
			);
		const target = pickRandom(candidates);
		const endOfTurnImpl = cardMappings[target.cardId];
		if (hasEndOfTurn(endOfTurnImpl)) {
			endOfTurnImpl.endOfTurn(target, input);
		}
	},
};
