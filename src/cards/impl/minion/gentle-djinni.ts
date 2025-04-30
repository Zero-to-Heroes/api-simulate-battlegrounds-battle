import { CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { pickRandom } from '../../../services/utils';
import { BattlecryInput } from '../../../simulation/battlecries';
import { addCardsInHand } from '../../../simulation/cards-in-hand';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { BattlecryCard, DeathrattleSpawnCard } from '../../card.interface';

export const GentleDjinni: BattlecryCard & DeathrattleSpawnCard = {
	cardIds: [CardIds.GentleDjinni_BGS_121, CardIds.GentleDjinni_TB_BaconUps_165],
	battlecry: (minion: BoardEntity, input: BattlecryInput) => {
		const cards = [];
		const numberOfCards = minion.cardId === CardIds.GentleDjinni_TB_BaconUps_165 ? 2 : 1;
		for (let i = 0; i < numberOfCards; i++) {
			cards.push(pickRandom(input.gameState.cardsData.gentleDjinniSpawns));
		}
		addCardsInHand(input.hero, input.board, cards, input.gameState);
		return true;
	},
	deathrattleSpawn: (minion: BoardEntity, input: DeathrattleTriggeredInput) => {
		const cards = [];
		const numberOfCards = minion.cardId === CardIds.GentleDjinni_TB_BaconUps_165 ? 2 : 1;
		for (let i = 0; i < numberOfCards; i++) {
			cards.push(pickRandom(input.gameState.cardsData.gentleDjinniSpawns));
		}
		addCardsInHand(input.boardWithDeadEntityHero, input.boardWithDeadEntity, cards, input.gameState);
		return [];
	},
};
