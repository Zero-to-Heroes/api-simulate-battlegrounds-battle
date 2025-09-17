import { CardIds } from '../../../services/card-ids';
import { Race } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { updateReborn } from '../../../keywords/reborn';
import { updateTaunt } from '../../../keywords/taunt';
import { updateWindfury } from '../../../keywords/windfury';
import { pickRandom } from '../../../services/utils';
import { SoCInput } from '../../../simulation/start-of-combat/start-of-combat-input';
import { modifyStats } from '../../../simulation/stats';

export const MantidQueen = {
	startOfCombat: (minion: BoardEntity, input: SoCInput) => {
		const multiplier = minion.cardId === CardIds.MantidQueen_BG22_402_G ? 2 : 1;
		const allRaces = input.playerBoardBefore
			.map((entity) => entity.cardId)
			.flatMap((cardId) => input.gameState.allCards.getCard(cardId).races)
			.filter((race) => !!race && race !== Race[Race.BLANK]);
		const totalRaces =
			[...new Set(allRaces.filter((race) => race !== Race[Race.ALL]))].length +
			allRaces.filter((race) => race === Race[Race.ALL]).length;
		for (let i = 0; i < multiplier; i++) {
			for (let j = 0; j < totalRaces; j++) {
				const buffType = getRandomMantidQueenBuffType(minion);
				switch (buffType) {
					case 'stats':
						modifyStats(minion, minion, 5, 5, input.playerBoard, input.playerEntity, input.gameState);
						break;
					case 'reborn':
						updateReborn(
							minion,
							true,
							input.playerBoard,
							input.playerEntity,
							input.opponentEntity,
							input.gameState,
						);
						break;
					case 'taunt':
						updateTaunt(
							minion,
							true,
							input.playerBoard,
							input.playerEntity,
							input.opponentEntity,
							input.gameState,
						);
						break;
					case 'windfury':
						updateWindfury(
							minion,
							true,
							input.playerBoard,
							input.playerEntity,
							input.opponentEntity,
							input.gameState,
						);
						break;
				}
				input.gameState.spectator.registerPowerTarget(
					minion,
					minion,
					input.playerBoard,
					input.playerEntity,
					input.opponentEntity,
				);
			}
		}
		return true;
	},
};

const getRandomMantidQueenBuffType = (entity: BoardEntity): 'stats' | 'reborn' | 'windfury' | 'taunt' => {
	const possibilities: ('stats' | 'reborn' | 'windfury' | 'taunt')[] = ['stats'];
	if (!entity.reborn) {
		possibilities.push('reborn');
	}
	if (!entity.windfury) {
		possibilities.push('windfury');
	}
	if (!entity.taunt) {
		possibilities.push('taunt');
	}
	return pickRandom(possibilities);
};
