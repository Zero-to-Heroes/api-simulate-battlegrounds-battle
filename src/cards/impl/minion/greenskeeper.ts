import { BoardEntity } from '../../../board-entity';
import { OnAfterAttackInput } from '../../../simulation/after-attack';
import { hasMinionBattlecry, triggerBattlecry } from '../../../simulation/battlecries';
import { TempCardIds } from '../../../temp-card-ids';
import { OnAfterAttackCard } from '../../card.interface';

export const Greenskeeper: OnAfterAttackCard = {
	cardIds: [TempCardIds.Greenskeeper, TempCardIds.Greenskeeper_G],
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
