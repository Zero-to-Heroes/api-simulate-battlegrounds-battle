import { CardIds, Race } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { OnAttackInput } from '../../../simulation/on-attack';
import { modifyStats } from '../../../simulation/stats';
import { hasCorrectTribe } from '../../../utils';
import { OnWheneverAnotherMinionAttacksCard, RallyCard } from '../../card.interface';

export const RipsnarlCaptain: OnWheneverAnotherMinionAttacksCard & RallyCard = {
	cardIds: [CardIds.RipsnarlCaptain_BGS_056, CardIds.RipsnarlCaptain_TB_BaconUps_139],
	onWheneverAnotherMinionAttacks: (minion: BoardEntity, input: OnAttackInput) => {
		return process(minion, input);
	},
	rally: (minion: BoardEntity, input: OnAttackInput) => {
		return process(minion, input);
	},
};

const process = (minion: BoardEntity, input: OnAttackInput) => {
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
		modifyStats(input.attacker, minion, 3 * mult, 0, input.attackingBoard, input.attackingHero, input.gameState);
	}
	return { dmgDoneByAttacker: 0, dmgDoneByDefender: 0 };
};
