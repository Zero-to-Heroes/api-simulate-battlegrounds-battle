import { CardIds, Race } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { pickRandom } from '../../../services/utils';
import { BattlecryInput } from '../../../simulation/battlecries';
import { addCardsInHand } from '../../../simulation/cards-in-hand';
import { afterDiscover } from '../../../simulation/discover';
import { BattlecryCard } from '../../card.interface';

export const PrimalfinLookout: BattlecryCard = {
	cardIds: [CardIds.PrimalfinLookout_BGS_020, CardIds.PrimalfinLookout_TB_BaconUps_089],
	battlecry: (minion: BoardEntity, input: BattlecryInput) => {
		const primalfinLoops = minion.cardId === CardIds.PrimalfinLookout_BGS_020 ? 1 : 2;
		for (let i = 0; i < primalfinLoops; i++) {
			const discoverOptions = [
				input.gameState.cardsData.getRandomMinionForTribe(Race.MURLOC, input.hero.tavernTier ?? 1),
				input.gameState.cardsData.getRandomMinionForTribe(Race.MURLOC, input.hero.tavernTier ?? 1),
				input.gameState.cardsData.getRandomMinionForTribe(Race.MURLOC, input.hero.tavernTier ?? 1),
			];
			const picked = pickRandom(discoverOptions);
			const others = discoverOptions.filter((e) => e !== picked);
			addCardsInHand(input.hero, input.board, [picked], input.gameState);
			afterDiscover(input.hero, input.board, picked, others, input.gameState);
			input.gameState.spectator.registerPowerTarget(minion, input.hero, input.board, input.hero, input.otherHero);
		}
		return true;
	},
};
