import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { BattlecryInput } from '../../../simulation/battlecries';
import { addCardsInHand } from '../../../simulation/cards-in-hand';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { BattlecryCard, DeathrattleSpawnCard } from '../../card.interface';

export const TimewarpedHunter: BattlecryCard & DeathrattleSpawnCard = {
	cardIds: [CardIds.TimewarpedHunter_BG34_Giant_588, CardIds.TimewarpedHunter_BG34_Giant_588_G],
	battlecry: (minion: BoardEntity, input: BattlecryInput) => {
		const mult = minion.cardId === CardIds.TimewarpedHunter_BG34_Giant_588_G ? 2 : 1;
		const cardsToAdd = Array(mult).fill(CardIds.PointyArrow_EBG_Spell_014);
		addCardsInHand(input.hero, input.board, cardsToAdd, input.gameState);
		return true;
	},
	deathrattleSpawn: (minion: BoardEntity, input: DeathrattleTriggeredInput) => {
		const mult = minion.cardId === CardIds.TimewarpedHunter_BG34_Giant_588_G ? 2 : 1;
		const cardsToAdd = Array(mult).fill(CardIds.PointyArrow_EBG_Spell_014);
		addCardsInHand(input.boardWithDeadEntityHero, input.boardWithDeadEntity, cardsToAdd, input.gameState);
		return [];
	},
};
