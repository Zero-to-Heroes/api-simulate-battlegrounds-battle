import { Race } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { pickRandom } from '../../../services/utils';
import { BattlecryInput } from '../../../simulation/battlecries';
import { magnetizeToTarget } from '../../../simulation/magnetize';
import { hasCorrectTribe } from '../../../utils';
import { BattlecryCard } from '../../card.interface';

export const ClunkerJunker: BattlecryCard = {
	cardIds: [CardIds.ClunkerJunker_BG29_503, CardIds.ClunkerJunker_BG29_503_G],
	battlecry: (minion: BoardEntity, input: BattlecryInput) => {
		const boardWithMechs = input.board.filter((e) =>
			hasCorrectTribe(e, input.hero, Race.MECH, input.gameState.anomalies, input.gameState.allCards),
		);
		const junkerTarget = pickRandom(boardWithMechs);
		if (junkerTarget) {
			const numberOfMagnetizes = minion.cardId === CardIds.ClunkerJunker_BG29_503 ? 1 : 2;
			for (let i = 0; i < numberOfMagnetizes; i++) {
				const minionToMagnetize = input.gameState.cardsData.getRandomMechToMagnetize(
					input.hero.tavernTier ?? 1,
				);
				input.gameState.spectator.registerPowerTarget(minion, junkerTarget, input.board, null, null);
				magnetizeToTarget(
					[junkerTarget],
					minion,
					[minionToMagnetize],
					input.board,
					input.hero,
					input.otherBoard,
					input.otherHero,
					input.gameState,
				);
			}
		}
		return true;
	},
};
