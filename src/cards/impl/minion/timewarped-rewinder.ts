import { Race } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { AfterHeroDamagedInput } from '../../../simulation/damage-to-hero';
import { TempCardIds } from '../../../temp-card-ids';
import { addStatsToBoard } from '../../../utils';
import { AfterHeroDamagedCard } from '../../card.interface';

export const TimewarpedRewinder: AfterHeroDamagedCard = {
	cardIds: [TempCardIds.TimewarpedRewinder, TempCardIds.TimewarpedRewinder_G],
	afterHeroDamaged: (minion: BoardEntity, input: AfterHeroDamagedInput) => {
		input.hero.hpLeft = input.hero.hpLeft + input.damage;
		const mult = minion.cardId === TempCardIds.TimewarpedRewinder_G ? 2 : 1;
		addStatsToBoard(minion, input.board, input.hero, 0, 1 * mult, input.gameState, Race[Race.DEMON]);
	},
};
