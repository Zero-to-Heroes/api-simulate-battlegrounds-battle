import { CardIds, Race } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { AvengeInput } from '../../../simulation/avenge';
import { addCardsInHand } from '../../../simulation/cards-in-hand';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { simplifiedSpawnEntities } from '../../../simulation/deathrattle-spawns';
import { AvengeCard, DeathrattleSpawnCard } from '../../card.interface';

export const DeathlyStriker: AvengeCard & DeathrattleSpawnCard = {
	cardIds: [CardIds.DeathlyStriker_BG31_835, CardIds.DeathlyStriker_BG31_835_G],
	baseAvengeValue: (cardId: string) => 5,
	avenge: (minion: BoardEntity, input: AvengeInput) => {
		const mult = minion.cardId === CardIds.DeathlyStriker_BG31_835 ? 1 : 2;
		const cards: string[] = [];
		for (let i = 0; i < mult; i++) {
			cards.push(input.gameState.cardsData.getRandomMinionForTribe(Race.UNDEAD, input.hero.tavernTier));
		}
		const addedCards = addCardsInHand(input.hero, input.board, cards, input.gameState);
		for (const card of addedCards) {
			card.locked = false;
			card.lastAffectedByEntity = minion;
			input.gameState.spectator.registerPowerTarget(minion, card, input.board, input.hero, input.otherHero);
		}
	},
	deathrattleSpawn: (minion: BoardEntity, input: DeathrattleTriggeredInput): readonly BoardEntity[] => {
		const targets = input.boardWithDeadEntityHero.hand.filter(
			(e) => !e.locked && e.lastAffectedByEntity?.entityId === minion.entityId,
		);
		const spawned: BoardEntity[] = [];
		for (const target of targets) {
			spawned.push(...simplifiedSpawnEntities(target.cardId, 1, input));
			target.locked = true;
		}
		return spawned;
	},
};
