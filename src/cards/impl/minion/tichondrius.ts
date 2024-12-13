import { CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { AfterHeroDamagedInput } from '../../../simulation/damage-to-hero';
import { addStatsToBoard } from '../../../utils';
import { AfterHeroDamagedCard } from '../../card.interface';

export const Tichondrius: AfterHeroDamagedCard = {
	cardIds: [CardIds.Tichondrius_BG26_523, CardIds.Tichondrius_BG26_523_G],
	afterHeroDamaged: (minion: BoardEntity, input: AfterHeroDamagedInput) => {
		const mult = minion.cardId === CardIds.Tichondrius_BG26_523_G ? 2 : 1;
		addStatsToBoard(minion, input.board, input.hero, 1 * mult, 1 * mult, input.gameState);
	},
};
