import { CardIds, Race } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { updateReborn } from '../../../keywords/reborn';
import { pickRandom } from '../../../services/utils';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { hasCorrectTribe } from '../../../utils';
import { DeathrattleEffectCard } from '../../card.interface';

export const Mummifier: DeathrattleEffectCard = {
	cardIds: [CardIds.Mummifier_BG28_309, CardIds.Mummifier_BG28_309_G],
	deathrattleEffect: (minion: BoardEntity, input: DeathrattleTriggeredInput) => {
		const mummifierBuff = minion.cardId === CardIds.Mummifier_BG28_309_G ? 2 : 1;
		for (let j = 0; j < mummifierBuff; j++) {
			const targets = input.boardWithDeadEntity
				.filter((e) => e.cardId !== CardIds.Mummifier_BG28_309 && e.cardId !== CardIds.Mummifier_BG28_309_G)
				.filter((e) => !e.reborn)
				.filter((e) =>
					hasCorrectTribe(
						e,
						input.boardWithDeadEntityHero,
						Race.UNDEAD,
						input.gameState.anomalies,
						input.gameState.allCards,
					),
				);
			const target = pickRandom(targets);
			if (target) {
				updateReborn(
					target,
					true,
					input.boardWithDeadEntity,
					input.boardWithDeadEntityHero,
					input.otherBoardHero,
					input.gameState,
				);
				input.gameState.spectator.registerPowerTarget(
					minion,
					target,
					input.boardWithDeadEntity,
					input.boardWithDeadEntityHero,
					input.otherBoardHero,
				);
			}
		}
	},
};
