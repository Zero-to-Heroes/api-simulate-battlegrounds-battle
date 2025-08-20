import { CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { hasMinionBattlecry, triggerBattlecry } from '../../../simulation/battlecries';
import { OnAttackInput } from '../../../simulation/on-attack';
import { isDead } from '../../../utils';
import { RallyCard } from '../../card.interface';

export const Greenskeeper: RallyCard = {
	cardIds: [CardIds.Greenskeeper_BG30_008, CardIds.Greenskeeper_BG30_008_G],
	rally: (minion: BoardEntity, input: OnAttackInput) => {
		const loops = minion.cardId === CardIds.Greenskeeper_BG30_008 ? 1 : 2;
		for (let i = 0; i < loops; i++) {
			const battlecries = input.attackingBoard.filter(
				(e) => !isDead(e) && hasMinionBattlecry(e, input.gameState),
			);
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
		}

		return { dmgDoneByAttacker: 0, dmgDoneByDefender: 0 };
	},
};
