import { CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { OnAfterAttackInput } from '../../../simulation/after-attack';
import { hasMinionBattlecry, triggerBattlecry } from '../../../simulation/battlecries';
import { OnAfterAttackCard } from '../../card.interface';

export const Greenskeeper: OnAfterAttackCard = {
	cardIds: [CardIds.Greenskeeper_BG30_008, CardIds.Greenskeeper_BG30_008_G],
	onAnyMinionAfterAttack: (minion: BoardEntity, input: OnAfterAttackInput) => {
		if (minion !== input.attacker) {
			return;
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
	},
};
