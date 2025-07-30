import { CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { hasMinionBattlecry, triggerBattlecry } from '../../../simulation/battlecries';
import { OnAttackInput } from '../../../simulation/on-attack';
import { OnAttackCard } from '../../card.interface';

export const Greenskeeper: OnAttackCard = {
	cardIds: [CardIds.Greenskeeper_BG30_008, CardIds.Greenskeeper_BG30_008_G],
	onAnyMinionAttack: (minion: BoardEntity, input: OnAttackInput) => {
		if (minion !== input.attacker) {
			return { dmgDoneByAttacker: 0, dmgDoneByDefender: 0 };
		}

		const battlecries = input.attackingBoard.filter((e) => hasMinionBattlecry(e, input.gameState));
		const candidate = battlecries[battlecries.length - 1];
		if (!!candidate) {
			triggerBattlecry(
				input.attackingBoard,
				input.attackingHero,
				candidate,
				input.defendingBoard,
				input.defendingHero,
				input.gameState,
			);
		}

		return { dmgDoneByAttacker: 0, dmgDoneByDefender: 0 };
	},
};
