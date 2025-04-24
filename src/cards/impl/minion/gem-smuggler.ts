import { CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { BattlecryInput } from '../../../simulation/battlecries';
import { playBloodGemsOn } from '../../../simulation/blood-gems';
import { BattlecryCard } from '../../card.interface';

export const GemSmuggler: BattlecryCard = {
	cardIds: [CardIds.GemSmuggler_BG25_155, CardIds.GemSmuggler_BG25_155_G],
	battlecry: (minion: BoardEntity, input: BattlecryInput) => {
		const gemSmugglerBloodGems = minion.cardId === CardIds.GemSmuggler_BG25_155 ? 1 : 2;
		input.board
			.filter((e) => e.entityId !== minion.entityId)
			.forEach((e) => playBloodGemsOn(minion, e, gemSmugglerBloodGems, input.board, input.hero, input.gameState));
		return true;
	},
};
