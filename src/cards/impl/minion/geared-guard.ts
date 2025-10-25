import { CardIds } from '../../../services/card-ids';
import { BoardEntity } from '../../../board-entity';
import { updateDivineShield } from '../../../keywords/divine-shield';
import { pickRandom } from '../../../services/utils';
import { OnAttackInput } from '../../../simulation/on-attack';
import { RallyCard } from '../../card.interface';
import { cardMappings } from '../_card-mappings';

export const GearedGuard: RallyCard = {
	cardIds: [CardIds.GearedGuard_BG33_325, CardIds.GearedGuard_BG33_325_G],
	rally: (minion: BoardEntity, input: OnAttackInput) => {
		const mult = minion.cardId === CardIds.GearedGuard_BG33_325_G ? 2 : 1;
		// For when the Rally is triggered by another minion, eg Stoneshell Sentinel
		// 33.6.2 https://replays.firestoneapp.com/?reviewId=68d6082e-f592-4028-b191-9268e3e6d08f&turn=31&action=2
		const cardIds = cardMappings[input.attacker.cardId]?.cardIds ?? GearedGuard.cardIds;
		for (let i = 0; i < mult; i++) {
			const possibleTargets = input.attackingBoard.filter((e) => !cardIds.includes(e.cardId) && !e.divineShield);
			if (possibleTargets.length > 0) {
				const target = pickRandom(possibleTargets);
				updateDivineShield(
					target,
					input.attackingBoard,
					input.attackingHero,
					input.defendingHero,
					true,
					input.gameState,
				);
			}
		}
		return { dmgDoneByAttacker: 0, dmgDoneByDefender: 0 };
	},
};
