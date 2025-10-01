import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { RebornEffectInput } from '../../../simulation/reborn';
import { RebornSelfEffectCard } from '../../card.interface';

export const Malorne: RebornSelfEffectCard = {
	cardIds: [CardIds.Malorne_BG32_HERO_001_Buddy, CardIds.Malorne_BG32_HERO_001_Buddy_G],
	rebornSelfEffect: (minion: BoardEntity, input: RebornEffectInput) => {
		const mult = minion.cardId === CardIds.Malorne_BG32_HERO_001_Buddy_G ? 2 : 1;
		const totalGoldSpent = input.boardWithKilledMinionHero.globalInfo.GoldSpentThisGame;
		const baseBuff = Math.floor(totalGoldSpent / 3);
		minion.attack += baseBuff * mult;
		minion.health += baseBuff * mult;
	},
};
