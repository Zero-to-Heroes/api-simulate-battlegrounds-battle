import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { BattlecryInput } from '../../../simulation/battlecries';
import { addCardsInHand } from '../../../simulation/cards-in-hand';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { OnAttackInput } from '../../../simulation/on-attack';
import { BattlecryCard, DeathrattleSpawnCard, RallyCard } from '../../card.interface';

export const TimewarpedCalligrapher: RallyCard & BattlecryCard & DeathrattleSpawnCard = {
	cardIds: [
		CardIds.TimewarpedCalligrapher_BG34_PreMadeChamp_091,
		CardIds.TimewarpedCalligrapher_BG34_PreMadeChamp_091_G,
	],
	rally: (minion: BoardEntity, input: OnAttackInput) => {
		const mult = minion.cardId === CardIds.TimewarpedCalligrapher_BG34_PreMadeChamp_091_G ? 2 : 1;
		const cardsToAdd = Array.from({ length: mult }).map(() => input.gameState.cardsData.getRandomTavernSpell());
		addCardsInHand(input.attackingHero, input.attackingBoard, cardsToAdd, input.gameState);
		return { dmgDoneByAttacker: 0, dmgDoneByDefender: 0 };
	},
	battlecry: (minion: BoardEntity, input: BattlecryInput) => {
		const mult = minion.cardId === CardIds.TimewarpedCalligrapher_BG34_PreMadeChamp_091_G ? 2 : 1;
		const cardsToAdd = Array.from({ length: mult }).map(() => input.gameState.cardsData.getRandomTavernSpell());
		addCardsInHand(input.hero, input.board, cardsToAdd, input.gameState);
		return true;
	},
	deathrattleSpawn: (minion: BoardEntity, input: DeathrattleTriggeredInput) => {
		const mult = minion.cardId === CardIds.TimewarpedCalligrapher_BG34_PreMadeChamp_091_G ? 2 : 1;
		const cardsToAdd = Array.from({ length: mult }).map(() => input.gameState.cardsData.getRandomTavernSpell());
		addCardsInHand(input.boardWithDeadEntityHero, input.boardWithDeadEntity, cardsToAdd, input.gameState);
		return [];
	},
};
