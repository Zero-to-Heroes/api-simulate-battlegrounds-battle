import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { pickRandomHighestHealth } from '../../../services/utils';
import { dealDamageToMinion } from '../../../simulation/attack';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { DeathrattleSpawnCard } from '../../card.interface';

export const Photobomber: DeathrattleSpawnCard = {
	cardIds: [CardIds.Photobomber_BG34_780, CardIds.Photobomber_BG34_780_G],
	deathrattleSpawn: (minion: BoardEntity, input: DeathrattleTriggeredInput) => {
		const loops = minion.cardId === CardIds.Photobomber_BG34_780_G ? 2 : 1;
		const damage = minion.scriptDataNum1 || 2 + input.boardWithDeadEntityHero.globalInfo.TavernSpellsCastThisGame;
		for (let i = 0; i < loops; i++) {
			const target = pickRandomHighestHealth(input.otherBoard);
			if (!!target) {
				dealDamageToMinion(
					target,
					input.otherBoard,
					input.otherBoardHero,
					minion,
					damage,
					input.boardWithDeadEntity,
					input.boardWithDeadEntityHero,
					input.gameState,
				);
			}
		}
		return [];
	},
};
