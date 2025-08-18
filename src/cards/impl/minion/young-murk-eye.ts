import { CardIds, GameTag } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { pickRandom } from '../../../services/utils';
import { getNeighbours } from '../../../simulation/attack';
import { triggerBattlecry } from '../../../simulation/battlecries';
import { hasEntityMechanic } from '../../../utils';
import { EndOfTurnCard, EndOfTurnInput } from '../../card.interface';

export const YoungMurkEye: EndOfTurnCard = {
	cardIds: [CardIds.YoungMurkEye_BG22_403, CardIds.YoungMurkEye_BG22_403_G],
	endOfTurn: (minion: BoardEntity, input: EndOfTurnInput) => {
		const allNeighbours = getNeighbours(input.board, minion, input.board.indexOf(minion)).filter((e) =>
			hasEntityMechanic(e, GameTag.BATTLECRY, input.gameState.allCards),
		);
		const neighbours =
			minion.cardId === CardIds.YoungMurkEye_BG22_403_G
				? allNeighbours
				: [pickRandom(allNeighbours)].filter((e) => !!e);
		for (const neighbour of neighbours) {
			input.gameState.spectator.registerPowerTarget(minion, neighbour, input.board, input.hero, input.otherHero);
			triggerBattlecry(input.board, input.hero, neighbour, input.otherBoard, input.otherHero, input.gameState);
		}
	},
};
