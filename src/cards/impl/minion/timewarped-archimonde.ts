import { BoardEntity } from '../../../board-entity';
import { AfterHeroDamagedInput } from '../../../simulation/damage-to-hero';
import { TempCardIds } from '../../../temp-card-ids';
import { AfterHeroDamagedCard } from '../../card.interface';

export const TimewarpedArchimonde: AfterHeroDamagedCard = {
	cardIds: [TempCardIds.TimewarpedArchimonde, TempCardIds.TimewarpedArchimonde_G],
	afterHeroDamaged: (minion: BoardEntity, input: AfterHeroDamagedInput) => {
		input.hero.hpLeft = input.hero.hpLeft + input.damage;
	},
};
