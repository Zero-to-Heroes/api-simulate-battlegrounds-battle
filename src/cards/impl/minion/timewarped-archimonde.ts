import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { AfterHeroDamagedInput } from '../../../simulation/damage-to-hero';
import { AfterHeroDamagedCard } from '../../card.interface';

export const TimewarpedArchimonde: AfterHeroDamagedCard = {
	cardIds: [CardIds.TimewarpedArchimonde_BG34_Giant_596, CardIds.TimewarpedArchimonde_BG34_Giant_596_G],
	afterHeroDamaged: (minion: BoardEntity, input: AfterHeroDamagedInput) => {
		input.hero.hpLeft = input.hero.hpLeft + input.damage;
	},
};
