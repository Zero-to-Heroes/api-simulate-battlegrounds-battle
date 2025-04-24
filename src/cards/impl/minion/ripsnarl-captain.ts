import { CardIds, Race } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { OnAttackInput } from '../../../simulation/on-attack';
import { modifyStats } from '../../../simulation/stats';
import { hasCorrectTribe } from '../../../utils';
import { OnAttackCard } from '../../card.interface';

export const RipsnarlCaptain: OnAttackCard = {
	cardIds: [CardIds.RipsnarlCaptain_BGS_056, CardIds.RipsnarlCaptain_TB_BaconUps_139],
	onAnyMinionAttack: (minion: BoardEntity, input: OnAttackInput) => {
		if (
			hasCorrectTribe(
				input.attacker,
				input.attackingHero,
				Race.PIRATE,
				input.gameState.anomalies,
				input.gameState.allCards,
			)
		) {
			const mult = minion.cardId === CardIds.RipsnarlCaptain_TB_BaconUps_139 ? 2 : 1;
			modifyStats(
				input.attacker,
				minion,
				3 * mult,
				0,
				input.attackingBoard,
				input.attackingHero,
				input.gameState,
			);
		}
		return { dmgDoneByAttacker: 0, dmgDoneByDefender: 0 };
	},
};
