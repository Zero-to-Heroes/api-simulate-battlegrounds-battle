import { CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { dealDamageToRandomEnemy } from '../../../simulation/attack';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { DeathrattleSpawnCard } from '../../card.interface';

export const Baneling: DeathrattleSpawnCard = {
	cardIds: [CardIds.KerriganQueenOfBlades_BanelingToken_BG31_HERO_811t5, CardIds.Baneling_BG31_HERO_811t5_G],
	deathrattleSpawn: (minion: BoardEntity, input: DeathrattleTriggeredInput) => {
		const loops = minion.cardId === CardIds.Baneling_BG31_HERO_811t5_G ? 2 : 1;
		for (let i = 0; i < loops; i++) {
			const damage = minion.attack;
			dealDamageToRandomEnemy(
				input.otherBoard,
				input.boardWithDeadEntityHero,
				minion,
				damage,
				input.boardWithDeadEntity,
				input.boardWithDeadEntityHero,
				input.gameState,
			);
		}
		return [];
	},
};
