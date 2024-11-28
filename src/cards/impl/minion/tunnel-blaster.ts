import { CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { dealDamageToMinion } from '../../../simulation/attack';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { DeathrattleEffectCard } from '../../card.interface';

export const TunnelBlaster: DeathrattleEffectCard = {
	cardIds: [CardIds.TunnelBlaster_BG_DAL_775, CardIds.TunnelBlaster_BG_DAL_775_G],
	deathrattleEffect: (minion: BoardEntity, input: DeathrattleTriggeredInput) => {
		const loops = minion.cardId === CardIds.TunnelBlaster_BG_DAL_775_G ? 2 : 1;
		// In case there are spawns, don't target them
		const minionsToDamage = [...input.boardWithDeadEntity, ...input.otherBoard];
		for (let j = 0; j < loops; j++) {
			for (const target of minionsToDamage) {
				const isSameSide = target.friendly === minion.friendly;
				const board = isSameSide ? input.boardWithDeadEntity : input.otherBoard;
				const hero = isSameSide ? input.boardWithDeadEntityHero : input.otherBoardHero;
				dealDamageToMinion(
					target,
					board,
					hero,
					minion,
					3,
					isSameSide ? input.otherBoard : input.boardWithDeadEntity,
					isSameSide ? input.otherBoardHero : input.boardWithDeadEntityHero,
					input.gameState,
				);
			}
		}
	},
};
