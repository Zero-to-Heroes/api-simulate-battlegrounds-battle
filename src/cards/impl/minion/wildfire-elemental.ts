import { CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { dealDamageToMinion, OnMinionKilledInput } from '../../../simulation/attack';
import { OnMinionKilledCard } from '../../card.interface';

export const WildfireElemental: OnMinionKilledCard = {
	cardIds: [CardIds.WildfireElemental_BGS_126, CardIds.WildfireElemental_TB_BaconUps_166],
	onMinionKilled: (
		minion: BoardEntity,
		input: OnMinionKilledInput,
	): { dmgDoneByAttacker: number; dmgDoneByDefender: number } => {
		if (!minion.attacking) {
			return { dmgDoneByAttacker: 0, dmgDoneByDefender: 0 };
		}

		const excessDamage = -input.minionKilled.health;
		let damageDoneByAttacker = 0;
		// console.log('neighbours', stringifySimple(neighbours, allCards));
		if (input.defenderNeighbours.length > 0) {
			if (minion.cardId === CardIds.WildfireElemental_BGS_126) {
				const randomTarget =
					input.defenderNeighbours[Math.floor(Math.random() * input.defenderNeighbours.length)];
				damageDoneByAttacker += dealDamageToMinion(
					randomTarget,
					input.defendingBoard,
					input.defendingHero,
					input.minionKilled.lastAffectedByEntity,
					excessDamage,
					input.attackingBoard,
					input.attackingHero,
					input.gameState,
				);
			} else {
				damageDoneByAttacker += input.defenderNeighbours
					.map((neighbour) =>
						dealDamageToMinion(
							neighbour,
							input.defendingBoard,
							input.defendingHero,
							input.minionKilled.lastAffectedByEntity,
							excessDamage,
							input.attackingBoard,
							input.attackingHero,
							input.gameState,
						),
					)
					.reduce((a, b) => a + b, 0);
			}
		}
		return { dmgDoneByAttacker: damageDoneByAttacker, dmgDoneByDefender: 0 };
	},
};
