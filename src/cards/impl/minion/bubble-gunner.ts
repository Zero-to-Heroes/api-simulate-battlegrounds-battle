import { CardIds } from '../../../services/card-ids';
import { BoardEntity } from '../../../board-entity';
import { BattlecryInput } from '../../../simulation/battlecries';
import { BattlecryCard } from '../../card.interface';
import { grantRandomBonusKeywords } from './apprentice-of-sefin';

export const BubbleGunner: BattlecryCard = {
	cardIds: [CardIds.BubbleGunner_BG31_149, CardIds.BubbleGunner_BG31_149_G],
	battlecry: (minion: BoardEntity, input: BattlecryInput) => {
		const iterations = minion.cardId === CardIds.BubbleGunner_BG31_149_G ? 2 : 1;
		grantRandomBonusKeywords(minion, iterations, input.board, input.hero, input.otherHero, input.gameState);
		return true;
	},
};
