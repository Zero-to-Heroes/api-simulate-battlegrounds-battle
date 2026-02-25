import { Race } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { dealDamageToMinion } from '../../../simulation/attack';
import { BattlecryInput } from '../../../simulation/battlecries';
import { modifyStats } from '../../../simulation/stats';
import { hasCorrectTribe } from '../../../utils';
import { BattlecryCard } from '../../card.interface';

export const Felhorn: BattlecryCard = {
	cardIds: [CardIds.Felhorn_BG34_781, CardIds.Felhorn_BG34_781_G],
	battlecry: (minion: BoardEntity, input: BattlecryInput) => {
		const loops = minion.cardId === CardIds.Felhorn_BG34_781_G ? 4 : 2;
		for (let i = 0; i < loops; i++) {
			const targets = input.board.filter(
				(e) =>
					e != minion &&
					(hasCorrectTribe(e, input.hero, Race.BEAST, input.gameState.anomalies, input.gameState.allCards) ||
						hasCorrectTribe(
							e,
							input.hero,
							Race.DEMON,
							input.gameState.anomalies,
							input.gameState.allCards,
						)),
			);
			for (const target of targets) {
				modifyStats(target, minion, 1, 2, input.board, input.hero, input.gameState);
				dealDamageToMinion(
					target,
					input.board,
					input.hero,
					minion,
					1,
					input.otherBoard,
					input.otherHero,
					input.gameState,
				);
			}
		}
		return true;
	},
};
